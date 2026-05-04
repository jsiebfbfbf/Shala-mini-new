/**
 * 🎬 Movie Download Plugin — Shala-mini Bot
 * Source: sinhalasub.lk | Category: DOWNLOAD
 * Adapted for Shala-mini-main command system
 */

const { cmd } = require("../lib/command");
const puppeteer = require("puppeteer");

// ─── Pending State Maps ────────────────────────────────────────────────────────
const pendingSearch  = {};
const pendingQuality = {};

// ─── Puppeteer Launch Options (Server-safe) ───────────────────────────────────
const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",
  "--single-process",
  "--disable-gpu",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Scrapers ─────────────────────────────────────────────────────────────────

async function searchMovies(query) {
  const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
  const browser   = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
  const page      = await browser.newPage();
  try {
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
          title:    a?.title?.trim()  || "",
          movieUrl: a?.href           || "",
          thumb:    img?.src          || "",
          language: lang.trim(),
          quality:  quality.trim(),
          qty:      qty.trim(),
        };
      }).filter(m => m.title && m.movieUrl)
    );
    return results;
  } finally {
    await browser.close();
  }
}

async function getMovieMetadata(url) {
  const browser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
  const page    = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const metadata = await page.evaluate(() => {
      const getText = el => el?.textContent.trim() || "";
      const title   = getText(document.querySelector(".info-details .details-title h3"));
      let language = "", directors = [], stars = [];
      document.querySelectorAll(".info-col p").forEach(p => {
        const strong = p.querySelector("strong");
        if (!strong) return;
        const txt = strong.textContent.trim();
        if (txt.includes("Language:")) language  = strong.nextSibling?.textContent?.trim() || "";
        if (txt.includes("Director:")) directors = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
        if (txt.includes("Stars:"))    stars     = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
      });
      const duration  = getText(document.querySelector(".info-details .data-views[itemprop='duration']"));
      const imdb      = getText(document.querySelector(".info-details .data-imdb"))?.replace("IMDb:", "").trim();
      const genres    = Array.from(document.querySelectorAll(".details-genre a")).map(el => el.textContent.trim());
      const thumbnail = document.querySelector(".splash-bg img")?.src || "";
      return { title, language, duration, imdb, genres, directors, stars, thumbnail };
    });
    return metadata;
  } finally {
    await browser.close();
  }
}

async function getPixeldrainLinks(movieUrl) {
  const browser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
  const page    = await browser.newPage();
  try {
    await page.goto(movieUrl, { waitUntil: "networkidle2", timeout: 30000 });
    const linksData = await page.$$eval(".link-pixeldrain tbody tr", rows =>
      rows.map(row => ({
        pageLink: row.querySelector(".link-opt a")?.href                       || "",
        quality:  row.querySelector(".quality")?.textContent.trim()            || "",
        size:     row.querySelector("td:nth-child(3) span")?.textContent.trim() || "",
      }))
    );
    const directLinks = [];
    for (const l of linksData) {
      if (!l.pageLink) continue;
      try {
        const subPage = await browser.newPage();
        await subPage.goto(l.pageLink, { waitUntil: "networkidle2", timeout: 30000 });
        await new Promise(r => setTimeout(r, 12000));
        const finalUrl = await subPage
          .$eval(".wait-done a[href^='https://pixeldrain.com/']", el => el.href)
          .catch(() => null);
        if (finalUrl) {
          const sizeText = l.size.toUpperCase();
          let sizeMB = 0;
          if (sizeText.includes("GB"))      sizeMB = parseFloat(sizeText) * 1024;
          else if (sizeText.includes("MB")) sizeMB = parseFloat(sizeText);
          if (sizeMB <= 2048) {
            directLinks.push({ link: finalUrl, quality: normalizeQuality(l.quality), size: l.size });
          }
        }
        await subPage.close();
      } catch { continue; }
    }
    return directLinks;
  } finally {
    await browser.close();
  }
}

// ─── Command 1 : .movie <query> ───────────────────────────────────────────────

cmd({
  pattern:  "movie",
  alias:    ["sinhalasub", "films", "mv"],
  react:    "🎞️",
  desc:     "Sinhalasub.lk වෙතින් චිත්‍රපට සොයයි / Download movies from Sinhalasub.lk",
  category: "DOWNLOAD",
  filename: __filename,
}, async (conn, mek, _m, { from, q, sender, reply }) => {

  if (!q) return reply(
    `*🎥 Movie Search Plugin*\n` +
    `භාවිතය : ${require("../settings").PREFIX}movie <movie name>\n` +
    `උදාහරණ: ${require("../settings").PREFIX}movie avengers`
  );

  reply("🔍 *𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝚈𝙾𝚄𝚁 𝙼𝙾𝚅𝙸𝙴...*");

  // ✅ FIX: try/catch add කළා
  try {
    const searchResults = await searchMovies(q);
    if (!searchResults.length) return reply("*❌ චිත්‍රපට සොයාගත නොහැකි විය! / No movies found!*");

    pendingSearch[sender] = { results: searchResults, timestamp: Date.now() };

    let text = "*🎥 සෙවුම් ප්‍රතිඵල / Search Results:*\n\n";
    searchResults.forEach((mov, i) => {
      text += `*${i + 1}.* ${mov.title}\n`;
      text += `   📝 Language : ${mov.language}\n`;
      text += `   📊 Quality  : ${mov.quality}\n`;
      text += `   🎞️ Format   : ${mov.qty}\n\n`;
    });
    text += `*Reply with movie number (1–${searchResults.length})*`;
    reply(text);

  } catch (err) {
    console.error("[movie] searchMovies error:", err);
    reply(`*❌ සොයීමේ දෝෂයක් ඇති විය / Search failed:*\n\`${err.message || "Unknown error"}\`\n\n_කරුණාකර නැවත උත්සාහ කරන්න / Please try again._`);
  }
});

// ─── Event handler : movie selection & quality selection ──────────────────────

cmd({
  on: "body",
  dontAddCommandList: true,
  filename: __filename,
}, async (conn, mek, _m, { from, body, sender }) => {

  const reply = (text, opt = {}) =>
    conn.sendMessage(from, { text, ...opt }, { quoted: mek });

  const num = parseInt(body?.trim());

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  if (pendingSearch[sender] && !isNaN(num) && num >= 1 && num <= pendingSearch[sender].results.length) {
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    const selected = pendingSearch[sender].results[num - 1];
    delete pendingSearch[sender];

    try {
      const metadata = await getMovieMetadata(selected.movieUrl);

      let msg = `*🎞️ ${metadata.title}*\n\n`;
      msg += `*📝 Language  :* ${metadata.language}\n`;
      msg += `*⏱️ Duration  :* ${metadata.duration}\n`;
      msg += `*⭐ IMDb      :* ${metadata.imdb}\n`;
      msg += `*🎭 Genres    :* ${metadata.genres.join(", ")}\n`;
      msg += `*🎥 Directors :* ${metadata.directors.join(", ")}\n`;
      msg += `*🌟 Stars     :* ${metadata.stars.slice(0, 5).join(", ")}${metadata.stars.length > 5 ? "..." : ""}\n\n`;
      msg += "*🔗 Download links සොයමින්, රැඳී සිටින්න...*";

      if (metadata.thumbnail) {
        await conn.sendMessage(from, { image: { url: metadata.thumbnail }, caption: msg }, { quoted: mek });
      } else {
        await conn.sendMessage(from, { text: msg }, { quoted: mek });
      }

      const downloadLinks = await getPixeldrainLinks(selected.movieUrl);
      if (!downloadLinks.length) return reply("*❌ Download links සොයාගත නොහැකි (<2GB)!*");

      pendingQuality[sender] = { movie: { metadata, downloadLinks }, timestamp: Date.now() };

      let qualityMsg = "*📥 Available Qualities (Max 2GB):*\n\n";
      downloadLinks.forEach((d, i) => {
        qualityMsg += `*${i + 1}.* ${d.quality} — ${d.size}\n`;
      });
      qualityMsg += `\n*Quality number reply කරන්න / Reply with quality number.*`;
      await conn.sendMessage(from, { text: qualityMsg }, { quoted: mek });

    } catch (err) {
      console.error("[movie] metadata/links error:", err);
      reply(`*❌ Movie info ගැනීමේ දෝෂයක් / Failed to get movie info:*\n\`${err.message || "Unknown error"}\``);
    }
    return;
  }

  // ── Step 3 ──────────────────────────────────────────────────────────────────
  if (pendingQuality[sender] && !isNaN(num) && num >= 1 && num <= pendingQuality[sender].movie.downloadLinks.length) {
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    const { movie } = pendingQuality[sender];
    delete pendingQuality[sender];

    const selectedLink = movie.downloadLinks[num - 1];

    reply(
      `🚀 *${selectedLink.quality} Movie Download ආරම්භ වෙනවා!* 🎥\n\n` +
      `⏳ කරුණාකර රැඳී සිටින්න...\n` +
      `📦 File document ලෙස සකසමින්...`
    );

    try {
      const directUrl = getDirectPixeldrainUrl(selectedLink.link);
      const safeName  = `${movie.metadata.title.substring(0, 50)} - ${selectedLink.quality}.mp4`
        .replace(/[^\w\s.-]/gi, "");

      await conn.sendMessage(from, {
        document: { url: directUrl },
        mimetype: "video/mp4",
        fileName: safeName,
        caption:
          `🎞️ *${movie.metadata.title}*\n\n` +
          `📊 *Quality* : ${selectedLink.quality}\n` +
          `💾 *Size*    : ${selectedLink.size}\n\n` +
          `🍿 Enjoy your Movie!\n\n` +
          `> ©𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚍 𝚋𝚢 𝙸𝚂𝙷𝙰𝙽-𝕏`,
      }, { quoted: mek });

    } catch (error) {
      console.error("Movie send error:", error);
      reply(`*❌ Movie යැවීම අසාර්ථකයි / Failed to send movie:* ${error.message || "Unknown error"}`);
    }
  }
});

// ─── Auto-cleanup stale pending state ─────────────────────────────────────────
setInterval(() => {
  const now     = Date.now();
  const timeout = 10 * 60 * 1000;
  for (const s in pendingSearch)  if (now - pendingSearch[s].timestamp  > timeout) delete pendingSearch[s];
  for (const s in pendingQuality) if (now - pendingQuality[s].timestamp > timeout) delete pendingQuality[s];
}, 5 * 60 * 1000);

module.exports = { pendingSearch, pendingQuality };
