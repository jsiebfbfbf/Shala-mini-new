// ============================================================
//  movie.js  –  Shala-mini Plugin
//  Sinhalasub.lk movie search & download via Pixeldrain
//  Fixed v2: Axios stream download → temp file → WA send
// ============================================================

const axios   = require("axios");
const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");
const os      = require("os");
const { cmd } = require("../lib/command");

// ──────────── In-memory state stores ────────────
const pendingSearch  = {};
const pendingQuality = {};

// ──────────── HTTP Headers ───────────────────────
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Referer": "https://sinhalasub.lk/"
};

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

async function fetchHtml(url, extraHeaders = {}) {
  const res = await axios.get(url, {
    headers: { ...HEADERS, ...extraHeaders },
    timeout: 25000,
    maxRedirects: 5
  });
  return res.data;
}

// ──────────── Stream download to temp file ───────
// Pixeldrain blocks Baileys' internal URL fetch.
// We manually download with proper headers + stream.
async function downloadToTempFile(directUrl, safeFileName, progressCb) {
  const tmpPath = path.join(os.tmpdir(), safeFileName);

  const response = await axios({
    method: "GET",
    url: directUrl,
    responseType: "stream",
    timeout: 0,                // no timeout for large files
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Referer": "https://pixeldrain.com/"
    }
  });

  const totalBytes = parseInt(response.headers["content-length"] || "0", 10);
  let downloaded   = 0;
  let lastReported = 0;

  const writer = fs.createWriteStream(tmpPath);
  response.data.on("data", chunk => {
    downloaded += chunk.length;
    if (totalBytes && progressCb) {
      const pct = Math.floor((downloaded / totalBytes) * 100);
      if (pct - lastReported >= 20) {       // report every 20%
        lastReported = pct;
        progressCb(pct, downloaded, totalBytes);
      }
    }
  });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error",  reject);
    response.data.on("error", reject);
  });

  return tmpPath;
}

// ──────────── Scrapers ────────────────────────────

async function searchMovies(query) {
  const searchUrl =
    `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
  const html = await fetchHtml(searchUrl);
  const $    = cheerio.load(html);
  const results = [];

  $(".display-item .item-box").each((index, box) => {
    if (index >= 10) return false;
    const $box    = $(box);
    const a       = $box.find("a").first();
    const img     = $box.find(".thumb").first();
    const lang    = $box.find(".item-desc-giha .language").text().trim();
    const quality = $box.find(".item-desc-giha .quality").text().trim();
    const qty     = $box.find(".item-desc-giha .qty").text().trim();
    const title   = a.attr("title")?.trim() || a.text().trim();
    const movieUrl = a.attr("href") || "";

    if (title && movieUrl) {
      results.push({ id: index + 1, title, movieUrl,
        thumb: img.attr("src") || "", language: lang, quality, qty });
    }
  });

  return results;
}

async function getMovieMetadata(url) {
  const html = await fetchHtml(url);
  const $    = cheerio.load(html);

  const title = $(".info-details .details-title h3").text().trim();
  let language = "", directors = [], stars = [];

  $(".info-col p").each((_, p) => {
    const $p     = $(p);
    const strong = $p.find("strong").first().text().trim();
    if (strong.includes("Language:"))
      language  = $p.find("strong").first()[0]?.nextSibling?.data?.trim() || "";
    if (strong.includes("Director:"))
      directors = $p.find("a").map((_, a) => $(a).text().trim()).get();
    if (strong.includes("Stars:"))
      stars     = $p.find("a").map((_, a) => $(a).text().trim()).get();
  });

  const duration  = $(".info-details .data-views[itemprop='duration']").text().trim();
  const imdb      = $(".info-details .data-imdb").text().replace("IMDb:", "").trim();
  const genres    = $(".details-genre a").map((_, el) => $(el).text().trim()).get();
  const thumbnail = $(".splash-bg img").attr("src") || "";

  return { title, language, duration, imdb, genres, directors, stars, thumbnail };
}

async function resolvePixeldrainLink(pageLink) {
  try {
    const html = await fetchHtml(pageLink);

    // Strategy 1: direct URL in HTML source
    const pdMatch = html.match(/https?:\/\/pixeldrain\.com\/u\/[\w]+/);
    if (pdMatch) return pdMatch[0];

    // Strategy 2: JS variable
    const jsMatch = html.match(
      /(?:var\s+\w+|url|href)\s*=\s*["'](https?:\/\/[^"']+pixeldrain[^"']+)["']/i
    );
    if (jsMatch) return jsMatch[1];

    // Strategy 3: anchor tag
    const $ = cheerio.load(html);
    const anchor = $("a[href*='pixeldrain.com']").first().attr("href");
    if (anchor) return anchor;

    return null;
  } catch {
    return null;
  }
}

async function getPixeldrainLinks(movieUrl) {
  const html = await fetchHtml(movieUrl);
  const $    = cheerio.load(html);
  const linksData = [];

  $(".link-pixeldrain tbody tr").each((_, row) => {
    const $row    = $(row);
    const a       = $row.find(".link-opt a").first();
    const quality = $row.find(".quality").text().trim();
    const size    = $row.find("td:nth-child(3) span").text().trim();
    const pageLink = a.attr("href") || "";
    if (pageLink) linksData.push({ pageLink, quality, size });
  });

  const directLinks = [];
  for (const l of linksData) {
    try {
      const finalUrl = await resolvePixeldrainLink(l.pageLink);
      if (!finalUrl) continue;

      let sizeMB = 0;
      const sizeText = l.size.toUpperCase();
      if (sizeText.includes("GB"))       sizeMB = parseFloat(sizeText) * 1024;
      else if (sizeText.includes("MB"))  sizeMB = parseFloat(sizeText);

      if (sizeMB <= 2048) {
        directLinks.push({
          link:    finalUrl,
          quality: normalizeQuality(l.quality),
          size:    l.size
        });
      }
    } catch { continue; }
  }
  return directLinks;
}

// ──────────── Command: .movie <query> ─────────

cmd({
  pattern:  "movie",
  alias:    ["sinhalasub", "films", "mv"],
  react:    "🎞️",
  desc:     "Sinhalasub.lk වෙතින් චිත්‍රපට සොයා බාගත කරන්න",
  category: "download",
  use:      ".movie <name>",
  filename: __filename
}, async (conn, mek, _m, { from, q, reply }) => {
  if (!q)
    return reply(`*🎥 Movie Search Plugin*\nUsage: .movie <movie name>\nExample: .movie avengers`);

  reply("🔍 *𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙼𝙾𝚅𝙸𝙴...*");

  let searchResults;
  try {
    searchResults = await searchMovies(q);
  } catch (err) {
    console.error("Movie search error:", err.message);
    return reply("*❌ Search failed. Please try again later.*");
  }

  if (!searchResults.length) return reply("*❌ No movies found!*");

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

// ──────────── Event: number / quality selection ──

cmd({
  on:       "body",
  desc:     "Movie number selection handler",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, _m, { from, body, sender }) => {

  // ── Step 1: user chose a movie ──
  if (pendingSearch[sender]) {
    const num = parseInt(body.trim(), 10);
    const { results } = pendingSearch[sender];
    if (!isNaN(num) && num >= 1 && num <= results.length) {
      delete pendingSearch[sender];
      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

      const selected = results[num - 1];
      const reply    = (text, opt = {}) =>
        conn.sendMessage(from, { text, ...opt }, { quoted: mek });

      let metadata;
      try {
        metadata = await getMovieMetadata(selected.movieUrl);
      } catch (err) {
        console.error("Metadata fetch error:", err.message);
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
        await conn.sendMessage(
          from, { image: { url: metadata.thumbnail }, caption: msg }, { quoted: mek }
        );
      } else {
        await conn.sendMessage(from, { text: msg }, { quoted: mek });
      }

      let downloadLinks;
      try {
        downloadLinks = await getPixeldrainLinks(selected.movieUrl);
      } catch (err) {
        console.error("Pixeldrain fetch error:", err.message);
        return reply("*❌ Could not fetch download links.*");
      }

      if (!downloadLinks.length)
        return reply("*❌ No download links found (under 2GB)!*");

      pendingQuality[sender] = {
        movie: { metadata, downloadLinks },
        timestamp: Date.now()
      };

      let qualityMsg = "*📥 Available Qualities (Max 2GB):*\n\n";
      downloadLinks.forEach((d, i) => {
        qualityMsg += `*${i + 1}.* ${d.quality} — ${d.size}\n`;
      });
      qualityMsg += `\n*Reply with quality number to receive the movie.*`;
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
      const directUrl    = getDirectPixeldrainUrl(selectedLink.link);

      if (!directUrl) return reply("*❌ Invalid download link. Try another quality.*");

      // Safe filename for temp file
      const safeFileName = (
        movie.metadata.title.substring(0, 40).replace(/[^\w\s-]/gi, "") +
        ` - ${selectedLink.quality}.mp4`
      ).trim();

      await reply(
        `🚀 *${selectedLink.quality} Download Started!* 🎥\n\n` +
        `📦 *File:* ${safeFileName}\n` +
        `💾 *Size:* ${selectedLink.size}\n\n` +
        `⏳ Downloading... This may take a few minutes.`
      );

      let tmpPath = null;
      try {
        // Progress messages
        let lastPct = 0;
        tmpPath = await downloadToTempFile(
          directUrl,
          safeFileName,
          async (pct, done, total) => {
            if (pct > lastPct) {
              lastPct = pct;
              const doneMB  = (done  / 1024 / 1024).toFixed(1);
              const totalMB = (total / 1024 / 1024).toFixed(1);
              const bar = "█".repeat(Math.floor(pct / 10)) +
                          "░".repeat(10 - Math.floor(pct / 10));
              await conn.sendMessage(
                from,
                { text: `📥 *Downloading...*\n${bar} ${pct}%\n${doneMB}MB / ${totalMB}MB` },
                { quoted: mek }
              ).catch(() => {});
            }
          }
        );

        // Read buffer and send
        const fileBuffer = fs.readFileSync(tmpPath);

        await conn.sendMessage(from, {
          document: fileBuffer,
          mimetype: "video/mp4",
          fileName: safeFileName,
          caption:
            `🎞️ *${movie.metadata.title}*\n\n` +
            `📊 *Quality* : ${selectedLink.quality}\n` +
            `💾 *Size*    : ${selectedLink.size}\n\n` +
            `🍿 Enjoy your Movie!\n\n` +
            `> © Shala-mini Bot`
        }, { quoted: mek });

      } catch (error) {
        console.error("Download/Send error:", error.message);
        await reply(
          `*❌ Failed to send movie.*\n\n` +
          `_Error: ${error.message}_\n\n` +
          `Try again or choose a different quality.`
        );
      } finally {
        // Always clean up temp file
        if (tmpPath && fs.existsSync(tmpPath)) {
          try { fs.unlinkSync(tmpPath); } catch {}
        }
      }
      return;
    }
  }
});

// ──────────── Cleanup stale sessions every 5 min ─

setInterval(() => {
  const now     = Date.now();
  const timeout = 10 * 60 * 1000;
  for (const s in pendingSearch)
    if (now - pendingSearch[s].timestamp > timeout) delete pendingSearch[s];
  for (const s in pendingQuality)
    if (now - pendingQuality[s].timestamp > timeout) delete pendingQuality[s];
}, 5 * 60 * 1000);

module.exports = { pendingSearch, pendingQuality };
