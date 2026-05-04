// ============================================================
//  movie.js  –  Shala-mini Plugin
//  Sinhalasub.lk movie search & download via Pixeldrain
// ============================================================

const puppeteer = require("puppeteer");
const { cmd } = require("../lib/command");

// ──────────── In-memory state stores ────────────
const pendingSearch  = {};   // sender → { results, timestamp }
const pendingQuality = {};   // sender → { movie: { metadata, downloadLinks }, timestamp }

// ──────────── Helpers ────────────────────────────

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

// ──────────── Scrapers ────────────────────────────

async function searchMovies(query) {
  const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

  const results = await page.$$eval(".display-item .item-box", boxes =>
    boxes.slice(0, 10).map((box, index) => {
      const a       = box.querySelector("a");
      const img     = box.querySelector(".thumb");
      const lang    = box.querySelector(".item-desc-giha .language")?.textContent || "";
      const quality = box.querySelector(".item-desc-giha .quality")?.textContent  || "";
      const qty     = box.querySelector(".item-desc-giha .qty")?.textContent      || "";
      return {
        id: index + 1,
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
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  const metadata = await page.evaluate(() => {
    const getText = el => el?.textContent.trim() || "";
    const title = getText(document.querySelector(".info-details .details-title h3"));
    let language = "", directors = [], stars = [];

    document.querySelectorAll(".info-col p").forEach(p => {
      const strong = p.querySelector("strong");
      if (!strong) return;
      const txt = strong.textContent.trim();
      if (txt.includes("Language:")) language  = strong.nextSibling?.textContent?.trim() || "";
      if (txt.includes("Director:")) directors = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
      if (txt.includes("Stars:"))    stars      = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
    });

    const duration  = getText(document.querySelector(".info-details .data-views[itemprop='duration']"));
    const imdb      = getText(document.querySelector(".info-details .data-imdb"))?.replace("IMDb:", "").trim();
    const genres    = Array.from(document.querySelectorAll(".details-genre a")).map(el => el.textContent.trim());
    const thumbnail = document.querySelector(".splash-bg img")?.src || "";
    return { title, language, duration, imdb, genres, directors, stars, thumbnail };
  });

  await browser.close();
  return metadata;
}

async function getPixeldrainLinks(movieUrl) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(movieUrl, { waitUntil: "networkidle2", timeout: 30000 });

  const linksData = await page.$$eval(".link-pixeldrain tbody tr", rows =>
    rows.map(row => {
      const a       = row.querySelector(".link-opt a");
      const quality = row.querySelector(".quality")?.textContent.trim()           || "";
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
      const finalUrl = await subPage.$eval(
        ".wait-done a[href^='https://pixeldrain.com/']", el => el.href
      ).catch(() => null);

      if (finalUrl) {
        let sizeMB = 0;
        const sizeText = l.size.toUpperCase();
        if (sizeText.includes("GB")) sizeMB = parseFloat(sizeText) * 1024;
        else if (sizeText.includes("MB")) sizeMB = parseFloat(sizeText);

        if (sizeMB <= 2048) {
          directLinks.push({
            link:    finalUrl,
            quality: normalizeQuality(l.quality),
            size:    l.size
          });
        }
      }
      await subPage.close();
    } catch (e) { continue; }
  }

  await browser.close();
  return directLinks;
}

// ──────────── Command 1 : .movie <query> ─────────

cmd({
  pattern:  "movie",
  alias:    ["sinhalasub", "films", "mv"],
  react:    "🎞️",
  desc:     "Sinhalasub.lk වෙතින් චිත්‍රපට සොයා බාගත කරන්න",
  category: "DOWNLOAD",
  use:      ".movie <name>",
  filename: __filename
}, async (conn, mek, _m, { from, q, reply }) => {
  if (!q) return reply(`*🎥 Movie Search Plugin*\nUsage: .movie <movie name>\nExample: .movie avengers`);

  reply("🔍 *𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙼𝙾𝚅𝙸𝙴...*");

  let searchResults;
  try {
    searchResults = await searchMovies(q);
  } catch (err) {
    console.error("Movie search error:", err);
    return reply("*❌ Search failed. Please try again later.*");
  }

  if (!searchResults.length) return reply("*❌ No movies found!*");

  // Save sender state
  const sender = mek.key.participant || from;
  pendingSearch[sender] = { results: searchResults, timestamp: Date.now() };

  let text = "*🎥 Search Results:*\n\n";
  searchResults.forEach((m, i) => {
    text += `*${i + 1}.* ${m.title}\n`;
    text += `   📝 Language : ${m.language}\n`;
    text += `   📊 Quality  : ${m.quality}\n`;
    text += `   🎞️ Format   : ${m.qty}\n\n`;
  });
  text += `*Reply with the movie number (1–${searchResults.length})*`;

  reply(text);
});

// ──────────── Event : movie number selection ──────

cmd({
  on:       "body",
  desc:     "Movie number selection handler",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, _m, { from, body, sender }) => {
  // ── Step 1: user chose a movie from search list ──
  if (pendingSearch[sender]) {
    const num = parseInt(body.trim(), 10);
    const { results } = pendingSearch[sender];
    if (!isNaN(num) && num >= 1 && num <= results.length) {
      delete pendingSearch[sender];

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

      const selected = results[num - 1];
      const reply = (text, opt = {}) =>
        conn.sendMessage(from, { text, ...opt }, { quoted: mek });

      let metadata;
      try {
        metadata = await getMovieMetadata(selected.movieUrl);
      } catch (err) {
        console.error("Metadata fetch error:", err);
        return reply("*❌ Could not fetch movie details. Try again.*");
      }

      let msg = `*🎞️ ${metadata.title}*\n\n`;
      msg += `*📝 Language  :* ${metadata.language}\n`;
      msg += `*⏱️ Duration  :* ${metadata.duration}\n`;
      msg += `*⭐ IMDb      :* ${metadata.imdb}\n`;
      msg += `*🎭 Genres    :* ${metadata.genres.join(", ")}\n`;
      msg += `*🎥 Directors :* ${metadata.directors.join(", ")}\n`;
      msg += `*🌟 Stars     :* ${metadata.stars.slice(0, 5).join(", ")}${metadata.stars.length > 5 ? "..." : ""}\n\n`;
      msg += "*🔗 Fetching download links, please wait...*";

      if (metadata.thumbnail) {
        await conn.sendMessage(from, { image: { url: metadata.thumbnail }, caption: msg }, { quoted: mek });
      } else {
        await conn.sendMessage(from, { text: msg }, { quoted: mek });
      }

      let downloadLinks;
      try {
        downloadLinks = await getPixeldrainLinks(selected.movieUrl);
      } catch (err) {
        console.error("Pixeldrain fetch error:", err);
        return reply("*❌ Could not fetch download links.*");
      }

      if (!downloadLinks.length) return reply("*❌ No download links found (under 2GB)!*");

      pendingQuality[sender] = {
        movie: { metadata, downloadLinks },
        timestamp: Date.now()
      };

      let qualityMsg = "*📥 Available Qualities (Max 2GB):*\n\n";
      downloadLinks.forEach((d, i) => {
        qualityMsg += `*${i + 1}.* ${d.quality} — ${d.size}\n`;
      });
      qualityMsg += `\n*Reply with quality number to receive the movie as a document.*`;

      await conn.sendMessage(from, { text: qualityMsg }, { quoted: mek });
      return;
    }
  }

  // ── Step 2: user chose a quality ──
  if (pendingQuality[sender]) {
    const num = parseInt(body.trim(), 10);
    const { movie } = pendingQuality[sender];
    if (!isNaN(num) && num >= 1 && num <= movie.downloadLinks.length) {
      delete pendingQuality[sender];

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

      const reply = (text, opt = {}) =>
        conn.sendMessage(from, { text, ...opt }, { quoted: mek });

      const selectedLink = movie.downloadLinks[num - 1];

      reply(`🚀 *${selectedLink.quality} Movie Download Started!* 🎥\n\n⏳ Please wait a moment…\n📦 File is being prepared as a document.`);

      try {
        const directUrl = getDirectPixeldrainUrl(selectedLink.link);
        const fileName  = `${movie.metadata.title.substring(0, 50)} - ${selectedLink.quality}.mp4`
                            .replace(/[^\w\s.-]/gi, "");

        await conn.sendMessage(from, {
          document: { url: directUrl },
          mimetype: "video/mp4",
          fileName,
          caption:
            `🎞️ *${movie.metadata.title}*\n\n` +
            `📊 *Quality* : ${selectedLink.quality}\n` +
            `💾 *Size*    : ${selectedLink.size}\n\n` +
            `🍿 Enjoy your Movie!\n\n` +
            `> © Shala-mini Bot`
        }, { quoted: mek });
      } catch (error) {
        console.error("Send document error:", error);
        reply(`*❌ Failed to send movie:* ${error.message || "Unknown error"}`);
      }
      return;
    }
  }
});

// ──────────── Cleanup stale sessions every 5 min ─

setInterval(() => {
  const now     = Date.now();
  const timeout = 10 * 60 * 1000; // 10 minutes
  for (const s in pendingSearch)  if (now - pendingSearch[s].timestamp  > timeout) delete pendingSearch[s];
  for (const s in pendingQuality) if (now - pendingQuality[s].timestamp > timeout) delete pendingQuality[s];
}, 5 * 60 * 1000);

module.exports = { pendingSearch, pendingQuality };
