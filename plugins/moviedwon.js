const { cmd } = require("../lib/command");
const puppeteer = require("puppeteer");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const https = require("https");
const { fetchThumbnailProxy } = require("../lib/functions");
const { pipeline } = require("stream/promises");
const context = require("../lib/context");
const { isLidUser } = require("baileyz");
const axios = require("axios");

// ===============================================================
// ⚙️ CONSTANTS & THEME
// ===============================================================
const FALLBACK_IMAGE = "https://raw.githubusercontent.com/ransara-devnath-ofc/-Bot-Accent-/refs/heads/main/King%20RANUX%20PRO%20Bot%20Images/king-ranux-pro-main-logo.png";
const FALLBACK_BOT_NAME = "⚡👑 𝐊̴𝐈̴𝐍̴𝐆̴ 𝐑̴𝐀̴𝐍̴𝐔̴𝐗̴ 𝐏̴𝐑̴𝐎̴ 👑⚡";
const FALLBACK_FOOTER = "> © 𝐊̴𝐈̴𝐍̴𝐆̴ 𝐑̴𝐀̴𝐍̴𝐔̴𝐗̴ 𝐏̴𝐑̴𝐎̴ 𝐎̴𝐅̴𝐂̴";

const THEME = {
    WAIT_MSG: "🔍 *𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐘𝐎𝐔𝐑 𝐌𝐎𝐕𝐈𝐄... 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓!* ⏳",
    ERROR_MSG: "❌ *Oops! No results found or system error.*",
    DIVIDER: "────────────────────"
};

// Number Emojis
const numEmoji = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
const toNumEmoji = (num) => num <= 10 && num > 0 ? numEmoji[num - 1] : `*${num}.*`;

// Active download lock (prevent duplicate downloads)
global.activeMovieDownloads = global.activeMovieDownloads || new Set();

// Auto clear locks every hour
setInterval(() => {
    setImmediate(() => { global.activeMovieDownloads.clear(); });
}, 60 * 60 * 1000);

// ===============================================================
// 🔧 HELPER FUNCTIONS
// ===============================================================
function normalizeQuality(text) {
    if (!text) return "N/A";
    text = text.toUpperCase();
    if (/1080|FHD/.test(text)) return "1080p";
    if (/720|HD/.test(text)) return "720p";
    if (/480|SD/.test(text)) return "480p";
    return text;
}

function getDirectPixeldrainUrl(url) {
    const match = url.match(/pixeldrain\.com\/u\/(\w+)/);
    if (!match) return null;
    return `https://pixeldrain.com/api/file/${match[1]}?download`;
}

async function launchBrowser() {
    return puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
}

async function searchMovies(query) {
    const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
    const browser = await launchBrowser();
    try {
        const page = await browser.newPage();
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
        const results = await page.$$eval(".display-item .item-box", boxes =>
            boxes.slice(0, 15).map((box, index) => {
                const a = box.querySelector("a");
                const img = box.querySelector(".thumb");
                const lang = box.querySelector(".item-desc-giha .language")?.textContent || "";
                const quality = box.querySelector(".item-desc-giha .quality")?.textContent || "";
                const qty = box.querySelector(".item-desc-giha .qty")?.textContent || "";
                return {
                    id: index + 1,
                    title: a?.title?.trim() || "",
                    movieUrl: a?.href || "",
                    thumb: img?.src || "",
                    language: lang.trim(),
                    quality: quality.trim(),
                    qty: qty.trim(),
                };
            }).filter(m => m.title && m.movieUrl)
        );
        return results;
    } finally {
        await browser.close();
    }
}

async function getMovieMetadata(url) {
    const browser = await launchBrowser();
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        const metadata = await page.evaluate(() => {
            const getText = el => el?.textContent.trim() || "";
            const getList = selector => Array.from(document.querySelectorAll(selector)).map(el => el.textContent.trim());
            const title = getText(document.querySelector(".info-details .details-title h3"));
            let language = "", directors = [], stars = [];
            document.querySelectorAll(".info-col p").forEach(p => {
                const strong = p.querySelector("strong");
                if (!strong) return;
                const txt = strong.textContent.trim();
                if (txt.includes("Language:")) language = strong.nextSibling?.textContent?.trim() || "";
                if (txt.includes("Director:")) directors = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
                if (txt.includes("Stars:")) stars = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
            });
            const duration = getText(document.querySelector(".info-details .data-views[itemprop='duration']"));
            const imdb = getText(document.querySelector(".info-details .data-imdb"))?.replace("IMDb:", "").trim();
            const genres = getList(".details-genre a");
            const thumbnail = document.querySelector(".splash-bg img")?.src || "";
            return { title, language, duration, imdb, genres, directors, stars, thumbnail };
        });
        return metadata;
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
                const a = row.querySelector(".link-opt a");
                const quality = row.querySelector(".quality")?.textContent.trim() || "";
                const size = row.querySelector("td:nth-child(3) span")?.textContent.trim() || "";
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
                    ".wait-done a[href^='https://pixeldrain.com/']",
                    el => el.href
                ).catch(() => null);
                if (finalUrl) {
                    let sizeMB = 0;
                    const sizeText = l.size.toUpperCase();
                    if (sizeText.includes("GB")) sizeMB = parseFloat(sizeText) * 1024;
                    else if (sizeText.includes("MB")) sizeMB = parseFloat(sizeText);
                    if (sizeMB <= 2048) {
                        directLinks.push({
                            link: finalUrl,
                            quality: normalizeQuality(l.quality),
                            size: l.size
                        });
                    }
                }
                await subPage.close();
            } catch (e) { continue; }
        }
        return directLinks;
    } finally {
        await browser.close();
    }
}

// ===============================================================
// 1️⃣ STEP 1: SEARCH MOVIE
// ===============================================================
cmd({
    pattern: "movie",
    alias: ["sinhalasub", "films", "mv"],
    react: "🎬",
    desc: "Search and Download Movies from Sinhalasub.lk (Premium UI)",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, settings }) => {

    if (!q) return reply(
        `╭─🎬 *𝐌𝐎𝐕𝐈𝐄 𝐒𝐄𝐀𝐑𝐂𝐇* 🎬─\n│\n│ ⚠️ Please provide a movie name!\n│\n│ 📌 *Usage:* \`.movie <name>\`\n│ 📌 *Example:* \`.movie Avengers\`\n╰━━━━━━━━━━━━━━━━━━━━━━┈`
    );

    await reply(THEME.WAIT_MSG);

    try {
        const safeSettings = settings || {};
        const botImg = safeSettings.botImage || FALLBACK_IMAGE;
        const botName = safeSettings.botName || FALLBACK_BOT_NAME;
        const footerText = safeSettings.movieFooter || FALLBACK_FOOTER;

        const searchResults = await searchMovies(q);
        if (!searchResults.length) return reply(THEME.ERROR_MSG);

        let text = `╭─🎬 *${botName} 𝐌𝐎𝐕𝐈𝐄 𝐙𝐎𝐍𝐄* 🎬─\n│\n│ 🔍 *Search:* "${q}"\n│ 🎥 *Results:* ${searchResults.length} Found\n╰━━━━━━━━━━━━━━━━━━━━━━┈\n\n`;

        searchResults.forEach((item, i) => {
            let numStr = (i + 1).toString().padStart(2, '0');
            text += `*${numStr}* ➜ 🎬 *${item.title}*\n     ➥ 📝 ${item.language || "N/A"} | 📊 ${item.quality || "N/A"} | 🎞️ ${item.qty || "N/A"}\n\n`;
        });

        text += `👉 *Reply with a number to select!*\n\n${footerText}`;

        const safeMentions = isLidUser(sender) || sender.includes('@lid') ? [] : [sender];

        const sentMsg = await conn.sendMessage(from, {
            image: { url: searchResults[0].thumb || botImg },
            caption: text.trim(),
            contextInfo: { mentionedJid: safeMentions }
        }, { quoted: mek });

        // Save context: type prefix 'MOVIE' → handled by 'movie' interaction handler
        context.set(sentMsg.key.id, {
            type: "MOVIE_SEARCH",
            results: searchResults,
            sender,
            botImg,
            footerText,
            botName
        });

    } catch (e) {
        console.error("Movie Search Error:", e.message);
        reply(THEME.ERROR_MSG);
    }
});

// ===============================================================
// 🔄 SMART INTERACTION HANDLER
// ===============================================================
cmd({
    name: "movie",         // prefix must match ctx.type prefix ('MOVIE')
    isInteraction: true,
    dontAddCommandList: true
}, async (conn, mek, m, { body, sender, reply, from, ctx, settings }) => {

    const text = body.trim();
    if (!/^\d+$/.test(text)) return; // only handle number replies

    const safeSettings = settings || {};
    const botImg = ctx.botImg || safeSettings.botImage || FALLBACK_IMAGE;
    const footerText = ctx.footerText || safeSettings.movieFooter || FALLBACK_FOOTER;
    const safeMentions = isLidUser(sender) || sender.includes('@lid') ? [] : [sender];

    try {
        // ── STEP 2: User selected a movie from search results ──
        if (ctx.type === "MOVIE_SEARCH") {
            const index = parseInt(text) - 1;
            if (index < 0 || index >= ctx.results.length) return reply("❌ *Invalid Number! Please try again.*");

            const selected = ctx.results[index];
            conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

            // Fetch metadata & download links simultaneously
            const [metadata, downloadLinks] = await Promise.all([
                getMovieMetadata(selected.movieUrl),
                getPixeldrainLinks(selected.movieUrl)
            ]);

            // Show movie details card
            let detailMsg = `╭─🎬 *𝐌𝐎𝐕𝐈𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒*─\n`;
            detailMsg += `│\n│ 🎞️ *${metadata.title || selected.title}*\n│\n`;
            if (metadata.language) detailMsg += `│ 📝 *Language:* ${metadata.language}\n`;
            if (metadata.duration) detailMsg += `│ ⏱️ *Duration:* ${metadata.duration}\n`;
            if (metadata.imdb)     detailMsg += `│ ⭐ *IMDb:* ${metadata.imdb}\n`;
            if (metadata.genres?.length) detailMsg += `│ 🎭 *Genres:* ${metadata.genres.join(", ")}\n`;
            if (metadata.directors?.length) detailMsg += `│ 🎥 *Director:* ${metadata.directors.join(", ")}\n`;
            if (metadata.stars?.length) detailMsg += `│ 🌟 *Stars:* ${metadata.stars.slice(0, 5).join(", ")}${metadata.stars.length > 5 ? "..." : ""}\n`;
            detailMsg += `╰━━━━━━━━━━━━━━━━━━━━━━┈`;

            await conn.sendMessage(from, {
                image: { url: metadata.thumbnail || botImg },
                caption: detailMsg.trim(),
                contextInfo: { mentionedJid: safeMentions }
            }, { quoted: mek });

            if (!downloadLinks.length) return reply("❌ *No download links found (≤2GB)!*");

            // Show quality selection
            let qualityMsg = `🌸 *𝐐𝐔𝐀𝐋𝐈𝐓𝐘 𝐒𝐄𝐋𝐄𝐂𝐓*\n${THEME.DIVIDER}\n\n🎬 *Title:* ${metadata.title || selected.title}\n\n📥 *𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐐𝐔𝐀𝐋𝐈𝐓𝐈𝐄𝐒:*\n\n`;

            downloadLinks.forEach((d, i) => {
                qualityMsg += `${toNumEmoji(i + 1)} *[${d.quality}]* 💿 Pixeldrain *(${d.size || "N/A"})*\n`;
            });

            qualityMsg += `\n${THEME.DIVIDER}\n👉 *Reply with a number to download!*\n\n${footerText}`;

            const sentQuality = await conn.sendMessage(from, {
                image: { url: metadata.thumbnail || botImg },
                caption: qualityMsg.trim(),
                contextInfo: { mentionedJid: safeMentions }
            }, { quoted: mek });

            context.set(sentQuality.key.id, {
                type: "MOVIE_QUALITY",
                metadata,
                downloadLinks,
                poster: metadata.thumbnail,
                botImg,
                footerText,
                sender
            });
        }

        // ── STEP 3: User selected quality → Download & Upload ──
        else if (ctx.type === "MOVIE_QUALITY") {
            const index = parseInt(text) - 1;
            if (index < 0 || index >= ctx.downloadLinks.length) return reply("❌ *Invalid Selection!*");

            if (global.activeMovieDownloads.has(sender)) {
                return reply("⚠️ *Please wait! You already have a download in progress.*");
            }

            const selectedLink = ctx.downloadLinks[index];
            global.activeMovieDownloads.add(sender);

            await reply(`*🚀 Processing your download... Please wait!*\n\n🎬 *${ctx.metadata.title}*\n📊 *Quality:* ${selectedLink.quality}\n💾 *Size:* ${selectedLink.size}`);

            let destPath = null;

            try {
                const directUrl = getDirectPixeldrainUrl(selectedLink.link);
                if (!directUrl) throw new Error("Invalid Pixeldrain URL");

                // Compress thumbnail for WA document cover
                let thumbBuffer = null;
                if (ctx.poster) thumbBuffer = await fetchThumbnailProxy(ctx.poster).catch(() => null);

                const fileName = `${(ctx.metadata.title || "Movie").substring(0, 50)} - ${selectedLink.quality}.mp4`
                    .replace(/[^\w\s.-]/gi, '_');

                const tempDir = path.join(__dirname, "../temp");
                await fsPromises.mkdir(tempDir, { recursive: true }).catch(() => {});
                destPath = path.join(tempDir, fileName);

                conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

                // Stream download to disk
                const response = await axios({ url: directUrl, responseType: 'stream' });
                const writer = fs.createWriteStream(destPath);
                await pipeline(response.data, writer);

                const stats = await fsPromises.stat(destPath);
                const actualSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

                if (parseFloat(actualSizeMB) > 2000) throw new Error("SizeExceedsLimit");

                conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

                const caption =
                    `🎬 *${ctx.metadata.title}*\n\n` +
                    `📊 *Quality:* ${selectedLink.quality}\n` +
                    `💾 *Size:* ${selectedLink.size}\n` +
                    (ctx.metadata.imdb ? `⭐ *IMDb:* ${ctx.metadata.imdb}\n` : "") +
                    `\n━━━━━━━━━━━━━━━━━━\n${footerText}\n━━━━━━━━━━━━━━━━━━`;

                await conn.sendMessage(from, {
                    document: { url: destPath },
                    mimetype: "video/mp4",
                    fileName: fileName,
                    caption: caption.trim(),
                    ...(thumbBuffer ? { jpegThumbnail: thumbBuffer } : {}),
                    contextInfo: { mentionedJid: safeMentions }
                }, { quoted: mek });

                conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

            } catch (e) {
                const errStr = e.message || "";
                if (errStr.includes("SizeExceedsLimit")) {
                    reply(`❌ *File is too large (Over 2GB) to send via WhatsApp!*\n\n${footerText}`);
                } else {
                    console.error("Movie Download Error:", e.message);
                    reply(`❌ *Failed to download the file. The link might be expired or restricted.*\n\n${footerText}`);
                }
            } finally {
                global.activeMovieDownloads.delete(sender);
                if (destPath) fsPromises.unlink(destPath).catch(() => {});
            }
        }

    } catch (err) {
        console.error("Movie Interaction Error:", err.message);
    }
});
