// movie.js - Sinhalasub.lk Movie Downloader Plugin
// Compatible with Shala-mini bot (Shala-mini-main)

const { cmd } = require("../lib/command");
const puppeteer = require("puppeteer");
const axios = require("axios");

const pendingSearch  = {};
const pendingQuality = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeQuality(text) {
  if (!text) return "Unknown";
  text = text.toUpperCase();
  if (/1080|FHD/.test(text)) return "1080p";
  if (/720|HD/.test(text))   return "720p";
  if (/480|SD/.test(text))   return "480p";
  return text;
}

/**
 * Convert any pixeldrain share/api URL → direct download API URL
 */
function getDirectPixeldrainUrl(url) {
  if (!url) return null;
  const apiMatch   = url.match(/pixeldrain\.com\/api\/file\/(\w+)/);
  if (apiMatch)   return `https://pixeldrain.com/api/file/${apiMatch[1]}?download`;
  const shareMatch = url.match(/pixeldrain\.com\/u\/(\w+)/);
  if (shareMatch) return `https://pixeldrain.com/api/file/${shareMatch[1]}?download`;
  return url;
}

/**
 * Download file and return Buffer (handles redirects, browser-like headers)
 */
async function downloadBuffer(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 180000,
    maxRedirects: 15,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
    },
  });
  return Buffer.from(response.data);
}

// ─── Puppeteer launch ────────────────────────────────────────────────────────

function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
    ],
  });
}

// ─── Scraping Functions ───────────────────────────────────────────────────────

async function searchMovies(query) {
  const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
  const browser   = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    return await page.$$eval(".display-item .item-box", boxes =>
      boxes.slice(0, 10).map((box, index) => {
        const a       = box.querySelector("a");
        const img     = box.querySelector(".thumb");
        const lang    = box.querySelector(".item-desc-giha .language")?.textContent || "";
        const quality = box.querySelector(".item-desc-giha .quality")?.textContent  || "";
        const qty     = box.querySelector(".item-desc-giha .qty")?.textContent      || "";
        return {
          id:       index + 1,
          title:    a?.title?.trim() || "",
          movieUrl: a?.href          || "",
          thumb:    img?.src         || "",
          language: lang.trim(),
          quality:  quality.trim(),
          qty:      qty.trim(),
        };
      }).filter(m => m.title && m.movieUrl)
    );
  } finally {
    await browser.close();
  }
}

async function getMovieMetadata(url) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    return await page.evaluate(() => {
      const getText = el => el?.textContent.trim() || "";
      const getList = sel => Array.from(document.querySelectorAll(sel)).map(e => e.textContent.trim());
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
      const genres    = getList(".details-genre a");
      const thumbnail = document.querySelector(".splash-bg img")?.src || "";
      return { title, language, duration, imdb, genres, directors, stars, thumbnail };
    });
  } finally {
    await browser.close();
  }
}

async function getPixeldrainLinks(movieUrl) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(movieUrl, { waitUntil: "networkidle2", timeout: 30000 });

    const linksData = await page.$$eval(".link-pixeldrain tbody tr", rows =>
      rows.map(row => {
        const a       = row.querySelector(".link-opt a");
        const quality = row.querySelector(".quality")?.textContent.trim()             || "";
        const size    = row.querySelector("td:nth-child(3) span")?.textContent.trim() || "";
        return { pageLink: a?.href || "", quality, size };
      }).filter(r => r.pageLink)
    );

    console.log(`[Movie] Found ${linksData.length} link row(s)`);

    const directLinks = [];

    for (const l of linksData) {
      let subPage;
      try {
        subPage = await browser.newPage();
        await subPage.goto(l.pageLink, { waitUntil: "networkidle2", timeout: 30000 });

        // Poll every 5s up to 20s for the final pixeldrain link
        let finalUrl = null;
        for (let attempt = 0; attempt < 4 && !finalUrl; attempt++) {
          await new Promise(r => setTimeout(r, 5000));
          finalUrl = await subPage.$eval(
            ".wait-done a[href*='pixeldrain.com']",
            el => el.href
          ).catch(() => null);
          if (!finalUrl) {
            finalUrl = await subPage.$eval(
              "a[href*='pixeldrain.com/u/'], a[href*='pixeldrain.com/api/file/']",
              el => el.href
            ).catch(() => null);
          }
        }

        console.log(`[Movie] "${l.quality}" → ${finalUrl}`);

        if (finalUrl) {
          let sizeMB = 0;
          const sizeText = l.size.toUpperCase();
          if (sizeText.includes("GB"))      sizeMB = parseFloat(sizeText) * 1024;
          else if (sizeText.includes("MB")) sizeMB = parseFloat(sizeText);

          if (sizeMB <= 2048) {
            directLinks.push({
              link:    finalUrl,
              quality: normalizeQuality(l.quality),
              size:    l.size,
            });
          }
        }
      } catch (e) {
        console.error(`[Movie] Link page error:`, e.message);
      } finally {
        if (subPage) await subPage.close().catch(() => {});
      }
    }

    return directLinks;
  } finally {
    await browser.close();
  }
}

// ─── Cleanup (10 min idle timeout) ───────────────────────────────────────────

setInterval(() => {
  const now     = Date.now();
  const timeout = 10 * 60 * 1000;
  for (const s in pendingSearch)  if (now - pendingSearch[s].timestamp  > timeout) delete pendingSearch[s];
  for (const s in pendingQuality) if (now - pendingQuality[s].timestamp > timeout) delete pendingQuality[s];
}, 5 * 60 * 1000);

// ─── Command 1: .movie <query> ────────────────────────────────────────────────

cmd({
  pattern:  "movie",
  alias:    ["sinhalasub", "films", "mv"],
  react:    "🎞️",
  desc:     "Search and download movies from Sinhalasub.lk",
  category: "MOVIE",
  filename: __filename,
}, async (conn, mek, m, { from, q, sender, reply }) => {
  if (!q) return reply(
    `*🎥 Movie Search Plugin*\n` +
    `Usage: .movie <movie name>\n` +
    `Example: .movie avengers`
  );

  reply("🔍 *𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝚈𝙾𝚄𝚁 𝙼𝙾𝚅𝙸𝙴...*");

  try {
    const searchResults = await searchMovies(q);
    if (!searchResults.length) return reply("*❌ No movies found!*");

    pendingSearch[sender] = { results: searchResults, timestamp: Date.now() };

    let text = "*🎥 Search Results:*\n\n";
    searchResults.forEach((mov, i) => {
      text += `*${i + 1}.* ${mov.title}\n`;
      text += `   📝 Language: ${mov.language}\n`;
      text += `   📊 Quality: ${mov.quality}\n`;
      text += `   🎞️ Format: ${mov.qty}\n\n`;
    });
    text += `*Reply with movie number (1-${searchResults.length})*`;
    reply(text);
  } catch (err) {
    console.error("[Movie] Search error:", err);
    reply("*❌ Search failed. Please try again.*");
  }
});

// ─── Command 2: on:body — handles number replies ──────────────────────────────

cmd({
  on:                 "body",
  pattern:            null,
  desc:               "Internal: handle movie/quality number replies",
  dontAddCommandList: true,
  filename:           __filename,
}, async (conn, mek, m, { from, body, sender, reply }) => {

  const trimmed = body.trim();
  const num     = parseInt(trimmed, 10);
  if (isNaN(num) || !/^\d+$/.test(trimmed)) return;

  // ── Step A: user picked a movie number ──────────────────────────────────────
  if (pendingSearch[sender] && num >= 1 && num <= pendingSearch[sender].results.length) {
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    const selected = pendingSearch[sender].results[num - 1];
    delete pendingSearch[sender];

    try {
      const metadata = await getMovieMetadata(selected.movieUrl);

      let msg = `*🎞️ ${metadata.title}*\n\n`;
      msg += `*📝 Language:* ${metadata.language}\n`;
      msg += `*⏱️ Duration:* ${metadata.duration}\n`;
      msg += `*⭐ IMDb:* ${metadata.imdb}\n`;
      msg += `*🎭 Genres:* ${metadata.genres.join(", ")}\n`;
      msg += `*🎥 Directors:* ${metadata.directors.join(", ")}\n`;
      msg += `*🌟 Stars:* ${metadata.stars.slice(0, 5).join(", ")}${metadata.stars.length > 5 ? "..." : ""}\n\n`;
      msg += "*🔗 Fetching download links, please wait...*";

      if (metadata.thumbnail) {
        await conn.sendMessage(from, { image: { url: metadata.thumbnail }, caption: msg }, { quoted: mek });
      } else {
        await conn.sendMessage(from, { text: msg }, { quoted: mek });
      }

      const downloadLinks = await getPixeldrainLinks(selected.movieUrl);

      if (!downloadLinks.length) {
        return reply(
          "*❌ No download links found (max 2GB)!*\n" +
          "_Site may have updated or links are unavailable._"
        );
      }

      pendingQuality[sender] = { movie: { metadata, downloadLinks }, timestamp: Date.now() };

      let qualityMsg = "*📥 Available Qualities (Max 2GB):*\n\n";
      downloadLinks.forEach((d, i) => {
        qualityMsg += `*${i + 1}.* ${d.quality}  ─  ${d.size}\n`;
      });
      qualityMsg += `\n*Reply with quality number to receive the movie.*`;
      await conn.sendMessage(from, { text: qualityMsg }, { quoted: mek });

    } catch (err) {
      console.error("[Movie] Metadata/links error:", err);
      reply("*❌ Failed to fetch movie details. Please try again.*");
    }
    return;
  }

  // ── Step B: user picked a quality number ────────────────────────────────────
  if (pendingQuality[sender] && num >= 1 && num <= pendingQuality[sender].movie.downloadLinks.length) {
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    const { movie }    = pendingQuality[sender];
    const selectedLink = movie.downloadLinks[num - 1];
    delete pendingQuality[sender];

    const safeTitle = (movie.metadata.title || "Movie")
      .substring(0, 50)
      .replace(/[^\w\s.-]/gi, "")
      .trim();
    const fileName = `${safeTitle} - ${selectedLink.quality}.mp4`;

    await reply(
      `🚀 *${selectedLink.quality} Movie Download Started!* 🎥\n\n` +
      `⏳ Please wait, downloading...\n` +
      `📦 File size: *${selectedLink.size}*\n` +
      `_This may take a few minutes._`
    );

    try {
      const directUrl = getDirectPixeldrainUrl(selectedLink.link);
      console.log(`[Movie] Final URL: ${directUrl}`);

      if (!directUrl) {
        return reply("*❌ Could not resolve download URL. Please try again.*");
      }

      const caption =
        `🎞️ *${movie.metadata.title}*\n\n` +
        `📊 *Quality* : ${selectedLink.quality}\n` +
        `💾 *Size*    : ${selectedLink.size}\n\n` +
        `🍿 Enjoy your movie!\n\n` +
        `> ©𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚍 𝚋𝚢 𝚂𝙷𝙰𝙻𝙰-𝙼𝙳`;

      // ── Try 1: download buffer then send ──
      try {
        const fileBuffer = await downloadBuffer(directUrl);
        console.log(`[Movie] Buffer size: ${fileBuffer.length} bytes`);

        await conn.sendMessage(from, {
          document: fileBuffer,
          mimetype: "video/mp4",
          fileName,
          caption,
        }, { quoted: mek });

        console.log(`[Movie] ✅ Sent via buffer: ${fileName}`);
        return;
      } catch (bufErr) {
        console.warn("[Movie] Buffer method failed, trying URL fallback:", bufErr.message);
      }

      // ── Try 2: send via URL directly (Baileys fallback) ──
      await conn.sendMessage(from, {
        document: { url: directUrl },
        mimetype: "video/mp4",
        fileName,
        caption,
      }, { quoted: mek });

      console.log(`[Movie] ✅ Sent via URL fallback: ${fileName}`);

    } catch (error) {
      console.error("[Movie] ❌ Send error:", error);
      reply(
        `*❌ Failed to send movie.*\n` +
        `_Error: ${error.message || "Unknown error"}_\n\n` +
        `Please try a different quality or try again later.`
      );
    }
  }
});

module.exports = { pendingSearch, pendingQuality };
