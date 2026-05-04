// ============================================================
//  movie.js  –  Sinhalasub.lk Movie Downloader
//  Adapted for Shala-mini bot by ISHAN-X
// ============================================================

const puppeteer = require("puppeteer");
const { cmd } = require("../lib/command");

// ────────────────────────────────────────────────────────────
//  In-memory state stores  (auto-cleared after 10 min)
// ────────────────────────────────────────────────────────────
const pendingSearch  = {};   // sender → { results, timestamp }
const pendingQuality = {};   // sender → { movie, timestamp }

// ────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────
function normalizeQuality(text) {
  if (!text) return null;
  text = text.toUpperCase();
  if (/1080|FHD/.test(text)) return "1080p";
  if (/720|HD/.test(text))   return "720p";
  if (/480|SD/.test(text))   return "480p";
  return text;
}

function getDirectPixeldrainUrl(url) {
  const match = url.match(/pixeldrain\.com\/u\/(\w+)/);
  if (!match) return null;
  return `https://pixeldrain.com/api/file/${match[1]}?download`;
}

// ────────────────────────────────────────────────────────────
//  Scrapers
// ────────────────────────────────────────────────────────────
async function searchMovies(query) {
  const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page    = await browser.newPage();
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

  const results = await page.$$eval(".display-item .item-box", boxes =>
    boxes.slice(0, 10).map((box, index) => {
      const a       = box.querySelector("a");
      const img     = box.querySelector(".thumb");
      const lang    = box.querySelector(".item-desc-giha .language")?.textContent  || "";
      const quality = box.querySelector(".item-desc-giha .quality")?.textContent   || "";
      const qty     = box.querySelector(".item-desc-giha .qty")?.textContent       || "";
      return {
        id:       index + 1,
        title:    a?.title?.trim() || "",
        movieUrl: a?.href         || "",
        thumb:    img?.src        || "",
        language: lang.trim(),
        quality:  quality.trim(),
        qty:      qty.trim(),
      };
    }).filter(m => m.title && m.movieUrl)
  );

  await browser.close();
  return results;
}

async function getMovieMetadata(url) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page    = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  const metadata = await page.evaluate(() => {
    const getText = el => el?.textContent.trim() || "";
    const title   = getText(document.querySelector(".info-details .details-title h3"));
    let language = "", directors = [], stars = [];

    document.querySelectorAll(".info-col p").forEach(p => {
      const strong = p.querySelector("strong");
      if (!strong) return;
      const txt = strong.textContent.trim();
      if (txt.includes("Language:")) language   = strong.nextSibling?.textContent?.trim() || "";
      if (txt.includes("Director:")) directors  = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
      if (txt.includes("Stars:"))    stars       = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
    });

    const duration  = getText(document.querySelector(".info-details .data-views[itemprop='duration']"));
    const imdb      = getText(document.querySelector(".info-details .data-imdb"))?.replace("IMDb:", "").trim();
    const genres    = Array.from(document.querySelectorAll(".details-genre a")).map(a => a.textContent.trim());
    const thumbnail = document.querySelector(".splash-bg img")?.src || "";

    return { title, language, duration, imdb, genres, directors, stars, thumbnail };
  });

  await browser.close();
  return metadata;
}

async function getPixeldrainLinks(movieUrl) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page    = await browser.newPage();
  await page.goto(movieUrl, { waitUntil: "networkidle2", timeout: 30000 });

  const linksData = await page.$$eval(".link-pixeldrain tbody tr", rows =>
    rows.map(row => {
      const a       = row.querySelector(".link-opt a");
      const quality = row.querySelector(".quality")?.textContent.trim()             || "";
      const size    = row.querySelector("td:nth-child(3) span")?.textContent.trim() || "";
      return { pageLink: a?.href || "", quality, size };
    })
  );

  const directLinks = [];
  for (const l of linksData) {
    try {
      const subPage = await browser.newPage();
      await subPage.goto(l.pageLink, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise(r => setTimeout(r, 12000));

      const finalUrl = await subPage
        .$eval(".wait-done a[href^='https://pixeldrain.com/']", el => el.href)
        .catch(() => null);

      if (finalUrl) {
        let sizeMB    = 0;
        const sizeText = l.size.toUpperCase();
        if (sizeText.includes("GB"))      sizeMB = parseFloat(sizeText) * 1024;
        else if (sizeText.includes("MB")) sizeMB = parseFloat(sizeText);

        if (sizeMB <= 2048) {
          directLinks.push({ link: finalUrl, quality: normalizeQuality(l.quality), size: l.size });
        }
      }
      await subPage.close();
    } catch (e) { continue; }
  }

  await browser.close();
  return directLinks;
}

// ────────────────────────────────────────────────────────────
//  COMMAND 1 – .movie <query>
// ────────────────────────────────────────────────────────────
cmd({
  pattern:  "movie",
  alias:    ["sinhalasub", "films", "mv"],
  react:    "🎞️",
  use:      ".movie <movie name>",
  desc:     "Search and Download movies from Sinhalasub.lk",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply(`*🎥 Movie Search Plugin*\nUsage: .movie <movie name>\nExample: .movie avengers`);

    reply("🔍 *𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙼𝙾𝚅𝙸𝙴...*");

    const searchResults = await searchMovies(q);
    if (!searchResults.length) return reply("*❌ No movies found!*");

    pendingSearch[from] = { results: searchResults, timestamp: Date.now() };

    let text = "*🎥 Search Results:*\n\n";
    searchResults.forEach((movie, i) => {
      text += `*${i + 1}.* ${movie.title}\n`;
      text += `   📝 Language : ${movie.language}\n`;
      text += `   📊 Quality  : ${movie.quality}\n`;
      text += `   🎞️ Format   : ${movie.qty}\n\n`;
    });
    text += `*Reply with movie number (1-${searchResults.length})*`;

    reply(text);
  } catch (err) {
    console.error("movie search error:", err);
    reply("*❌ Error occurred while searching. Please try again.*");
  }
});

// ────────────────────────────────────────────────────────────
//  EVENT – body listener (handles step-2 & step-3 replies)
// ────────────────────────────────────────────────────────────
cmd({
  on:       "body",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, body, sender }) => {
  const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek });
  const num   = parseInt(body?.trim());

  // ── STEP 2: User chose a movie from search results ──────
  if (pendingSearch[from] && !isNaN(num) && num >= 1 && num <= pendingSearch[from].results.length) {
    const selected = pendingSearch[from].results[num - 1];
    delete pendingSearch[from];

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    try {
      const metadata = await getMovieMetadata(selected.movieUrl);

      let msg = `*🎞️ ${metadata.title}*\n\n`;
      msg += `*📝 Language :* ${metadata.language}\n`;
      msg += `*⏱️ Duration :* ${metadata.duration}\n`;
      msg += `*⭐ IMDb     :* ${metadata.imdb}\n`;
      msg += `*🎭 Genres   :* ${metadata.genres.join(", ")}\n`;
      msg += `*🎥 Director :* ${metadata.directors.join(", ")}\n`;
      msg += `*🌟 Stars    :* ${metadata.stars.slice(0, 5).join(", ")}${metadata.stars.length > 5 ? "..." : ""}\n\n`;
      msg += `*🔗 Fetching download links, please wait...*`;

      if (metadata.thumbnail) {
        await conn.sendMessage(from, { image: { url: metadata.thumbnail }, caption: msg }, { quoted: mek });
      } else {
        await conn.sendMessage(from, { text: msg }, { quoted: mek });
      }

      const downloadLinks = await getPixeldrainLinks(selected.movieUrl);
      if (!downloadLinks.length) return reply("*❌ No download links found (max 2GB)!*");

      pendingQuality[from] = { movie: { metadata, downloadLinks }, timestamp: Date.now() };

      let qualityMsg = "*📥 Available Qualities (Max 2GB):*\n\n";
      downloadLinks.forEach((d, i) => {
        qualityMsg += `*${i + 1}.* ${d.quality} - ${d.size}\n`;
      });
      qualityMsg += `\n*Reply with quality number to receive the movie as a document.*`;

      await conn.sendMessage(from, { text: qualityMsg }, { quoted: mek });

    } catch (err) {
      console.error("movie metadata error:", err);
      reply("*❌ Error fetching movie details. Please try again.*");
    }
    return;
  }

  // ── STEP 3: User chose a download quality ───────────────
  if (pendingQuality[from] && !isNaN(num) && num >= 1 && num <= pendingQuality[from].movie.downloadLinks.length) {
    const { movie } = pendingQuality[from];
    const selectedLink = movie.downloadLinks[num - 1];
    delete pendingQuality[from];

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    reply(
      `🚀 *${selectedLink.quality} Movie Download Started!* 🎥\n\n` +
      `⏳ Please wait a moment…\n` +
      `📦 File is being prepared as a document.`
    );

    try {
      const directUrl = getDirectPixeldrainUrl(selectedLink.link);
      const fileName  = `${movie.metadata.title.substring(0, 50)} - ${selectedLink.quality}.mp4`
        .replace(/[^\w\s.-]/gi, '');

      const caption =
        `🎞️ *${movie.metadata.title}*\n\n` +
        `📊 *Quality* : ${selectedLink.quality}\n` +
        `💾 *Size*    : ${selectedLink.size}\n\n` +
        `🍿 Enjoy your Movie\n\n` +
        `> ©𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚛 𝚋𝚢 𝙸𝚂𝙷𝙰𝙽-𝕏`;

      await conn.sendMessage(from, {
        document: { url: directUrl },
        mimetype: "video/mp4",
        fileName,
        caption
      }, { quoted: mek });

    } catch (err) {
      console.error("movie send error:", err);
      reply(`*❌ Failed to send movie:* ${err.message || "Unknown error"}`);
    }
  }
});

// ────────────────────────────────────────────────────────────
//  Auto-cleanup stale state (every 5 min, expire after 10 min)
// ────────────────────────────────────────────────────────────
setInterval(() => {
  const now     = Date.now();
  const timeout = 10 * 60 * 1000;
  for (const key in pendingSearch)  if (now - pendingSearch[key].timestamp  > timeout) delete pendingSearch[key];
  for (const key in pendingQuality) if (now - pendingQuality[key].timestamp > timeout) delete pendingQuality[key];
}, 5 * 60 * 1000);

module.exports = { pendingSearch, pendingQuality };
