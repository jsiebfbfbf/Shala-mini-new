// plugins/anime.js  —  SinhalaSub.lk Anime / Movie downloader
// Compatible with Shala-mini bot (baileyz, lib/command, lib/context)

const { cmd } = require("../lib/command");
const axios = require("axios");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const https = require("https");
const cheerio = require("cheerio");
const { fetchThumbnailProxy } = require("../lib/functions");
const { pipeline } = require("stream/promises");
const context = require("../lib/context");

// isLidUser helper — baileyz may or may not export it; fall back safely
let isLidUser;
try {
    ({ isLidUser } = require("baileyz"));
} catch (_) {
    isLidUser = (jid) => typeof jid === "string" && jid.includes("@lid");
}

const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

// ================================================================
// CONFIG
// ================================================================
const SINHALASUB_BASE = "https://sinhalasub.lk";
const PIXELDRAIN_API  = "https://pixeldrain.com/api/file";

const FALLBACK_IMAGE    = "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/image/Alive.jpg";
const FALLBACK_BOT_NAME = "*Sʜᴀʟᴀ Mᴅ ᴮᴱᵀᴬ*";
const FALLBACK_FOOTER   = "*● ꜱʜᴀʟᴀ-ᴍᴅ ʙᴇᴛᴀ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ●*";

const THEME = {
    WAIT_MSG : "⏳ *Searching SinhalaSub.lk... Please wait!*",
    ERROR_MSG: "❌ *Oops! System error or no results found.*",
    DIVIDER  : "────────────────────"
};

global.activeAnimeDownloads = global.activeAnimeDownloads || new Set();

const numEmoji   = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
const toNumEmoji = (num) => num <= 10 && num > 0 ? numEmoji[num - 1] : `*${num}.*`;

// Auto-clear download locks every hour
setInterval(() => setImmediate(() => global.activeAnimeDownloads.clear()), 60 * 60 * 1000);

// ================================================================
// SCRAPER HELPERS — SinhalaSub.lk
// ================================================================

async function sinhalaSubSearch(query) {
    const url = `${SINHALASUB_BASE}/?s=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get(url, {
        httpsAgent,
        timeout: 15000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36" }
    });

    const $ = cheerio.load(html);
    const results = [];

    $("article.TPost").each((_, el) => {
        const $el   = $(el);
        const title = $el.find(".Title").text().trim() || $el.find("h2.Title").text().trim();
        const link  = $el.find("a").first().attr("href") || "";
        const image = $el.find("img").first().attr("src") ||
                      $el.find("img").first().attr("data-src") || "";
        const year  = $el.find(".Year").text().trim() || "";
        const type  = $el.find(".Type").text().trim() || "Movie";
        if (title && link) results.push({ title, link, image, year, type });
    });

    if (!results.length) {
        $(".result-item article, .movies-list .ml-item").each((_, el) => {
            const $el   = $(el);
            const title = $el.find("h2, .h-title").text().trim();
            const link  = $el.find("a").first().attr("href") || "";
            const image = $el.find("img").first().attr("src") ||
                          $el.find("img").first().attr("data-src") || "";
            if (title && link) results.push({ title, link, image, year: "", type: "Movie" });
        });
    }

    return results;
}

async function sinhalaSubDetails(pageUrl) {
    const { data: html } = await axios.get(pageUrl, {
        httpsAgent,
        timeout: 20000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36" }
    });

    const $      = cheerio.load(html);
    const title  = $(".TPost .Title, h1.TPost, h1.title, .in-title h1").first().text().trim()
                || $("title").text().split("–")[0].trim();
    const image  = $(".TPost img, .wp-post-image, .TPost .Rig img").first().attr("src")
                || $(".TPost img").first().attr("data-src") || "";
    const rating = $(".dt-sc-rating span, .imdb_rat span").first().text().trim() || "N/A";

    const episodes = [];
    $(".episodios li, .Eps li, ul.episodios li").each((_, el) => {
        const $ep   = $(el);
        const epUrl = $ep.find("a").attr("href") || "";
        const epTit = $ep.find(".episodiotitle, .epidata .eplist, a").text().trim();
        if (epUrl) episodes.push({ title: epTit || epUrl, url: epUrl });
    });

    const downloadLinks = extractPixelDrainLinks($, html);
    const isMovie = episodes.length === 0;

    return { title, image, rating, isMovie, episodes, downloadLinks };
}

function extractPixelDrainLinks($, html) {
    const links  = [];
    const seen   = new Set();

    const pdRegex = /pixeldrain\.com\/(?:u|api\/file)\/([A-Za-z0-9]{8})/g;
    let match;
    while ((match = pdRegex.exec(html)) !== null) {
        const id  = match[1];
        const url = `${PIXELDRAIN_API}/${id}?download`;
        if (!seen.has(id)) {
            seen.add(id);
            const $anchor = $(`a[href*="${id}"]`).first();
            const quality = $anchor.closest("tr, .dlink, .DLINK, li").find(".Qlty, .quality, td:nth-child(2)").text().trim()
                         || $anchor.text().trim()
                         || "HD";
            const size    = $anchor.closest("tr, .dlink, li").find(".Size, .size, td:last-child").text().trim() || "N/A";
            links.push({ serverName: "PixelDrain", quality: quality || "HD", size, pixeldrainId: id, url });
        }
    }

    $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        const m2   = href.match(/pixeldrain\.com\/(?:u|api\/file)\/([A-Za-z0-9]{8})/);
        if (m2) {
            const id  = m2[1];
            const url = `${PIXELDRAIN_API}/${id}?download`;
            if (!seen.has(id)) {
                seen.add(id);
                const quality = $(el).text().trim() || "HD";
                links.push({ serverName: "PixelDrain", quality, size: "N/A", pixeldrainId: id, url });
            }
        }
    });

    return links;
}

// ================================================================
// STEP 1 — SEARCH COMMAND
// ================================================================
cmd({
    pattern : "anime",
    alias   : ["ac", "ani", "animeclub", "animemovie", "movie2"],
    desc    : "Search & download from SinhalaSub.lk (PixelDrain)",
    category: "download",
    react   : "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender, config: cfg, botNumber }) => {

    if (!q) return reply(`*⚠️ Please provide a movie or anime name!*\nExample: \`.anime Jujutsu Kaisen\``);

    await reply(THEME.WAIT_MSG);

    try {
        const results = await sinhalaSubSearch(q);
        if (!results.length) return reply(THEME.ERROR_MSG);

        const botImg     = (cfg && cfg.IMAGE_PATH)  || FALLBACK_IMAGE;
        const botName    = (cfg && cfg.BOT_NAME)     || FALLBACK_BOT_NAME;
        const footerText = (cfg && cfg.BOT_FOOTER)   || FALLBACK_FOOTER;

        let text = `╭─🎬 *${botName} 𝐒𝐈𝐍𝐇𝐀𝐋𝐀𝐒𝐔𝐁 𝐙𝐎𝐍𝐄* 🎬─\n│\n│ 🔍 *Search:* "${q}"\n│ 🎌 *Results:* ${results.length} Found\n╰━━━━━━━━━━━━━━━━━━━━━━┈\n\n`;

        results.slice(0, 15).forEach((item, i) => {
            const numStr   = (i + 1).toString().padStart(2, '0');
            const typeIcon = (item.type || "").toLowerCase().includes("movie") ? "🎬" : "📺";
            text += `*${numStr}* ➜ ${typeIcon} *${item.title}*\n     ➥ 📅 ${item.year || "N/A"} | 🌟 ${item.type || "Movie"}\n\n`;
        });

        text += `👉 *Reply with a number to select!*\n\n${footerText}`;

        const safeMentions = (isLidUser(sender) || sender.includes('@lid')) ? [] : [sender];

        const sentMsg = await conn.sendMessage(from, {
            image  : { url: results[0].image || botImg },
            caption: text.trim(),
            contextInfo: { mentionedJid: safeMentions }
        }, { quoted: mek });

        context.set(sentMsg.key.id, {
            type     : "ANIMETV_SEARCH",
            results,
            botNumber,
            sender
        });

    } catch (e) {
        console.error("SinhalaSub Search Error:", e.message);
        reply(THEME.ERROR_MSG);
    }
});

// ================================================================
// SMART INTERACTION HANDLER
// ================================================================
cmd({
    pattern           : "animetv_interaction",
    isInteraction     : true,
    dontAddCommandList: true,
    filename          : __filename
}, async (conn, mek, m, { body, sender, reply, from, ctx, config: cfg }) => {

    const text     = body.trim();
    const isNumber = /^\d+$/.test(text);
    if (!isNumber) return;

    const botImg     = (cfg && cfg.IMAGE_PATH)  || FALLBACK_IMAGE;
    const footerText = (cfg && cfg.BOT_FOOTER)   || FALLBACK_FOOTER;
    const safeMentions = (isLidUser(sender) || sender.includes('@lid')) ? [] : [sender];

    try {
        // ── STEP 2: SELECT TITLE ──────────────────────────────────
        if (ctx.type === "ANIMETV_SEARCH") {
            const index = parseInt(text) - 1;
            if (index < 0 || index >= ctx.results.length) return reply("❌ *Invalid Number!*");

            const selected = ctx.results[index];
            conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

            const details = await sinhalaSubDetails(selected.link);

            // PATH A — MOVIE: direct download links available
            if (details.isMovie && details.downloadLinks.length > 0) {
                let msg = `🎬 *𝐐𝐔𝐀𝐋𝐈𝐓𝐘 𝐒𝐄𝐋𝐄𝐂𝐓 (𝐌𝐎𝐕𝐈𝐄)*\n${THEME.DIVIDER}\n\n🎬 *Title:* ${details.title}\n⭐ *Rating:* ${details.rating}\n\n📥 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐋𝐈𝐍𝐊𝐒:*\n\n`;

                details.downloadLinks.forEach((link, i) => {
                    msg += `${toNumEmoji(i + 1)} *[${link.quality}]* 💿 ${link.serverName} (${link.size})\n`;
                });

                msg += `\n${THEME.DIVIDER}\n👉 *Reply with a number to download!*\n\n${footerText}`;

                const sentQ = await conn.sendMessage(from, {
                    image  : { url: details.image || botImg },
                    caption: msg.trim(),
                    contextInfo: { mentionedJid: safeMentions }
                }, { quoted: mek });

                context.set(sentQ.key.id, {
                    type     : "ANIMETV_QUALITY",
                    links    : details.downloadLinks,
                    epName   : details.title,
                    poster   : details.image,
                    botNumber: ctx.botNumber,
                    sender
                });
                return;
            }

            // PATH B — SERIES: show episode list
            if (!details.isMovie && details.episodes.length > 0) {
                let msg = `⛩️ *𝐒𝐄𝐑𝐈𝐄𝐒 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃*\n${THEME.DIVIDER}\n\n📌 *Title:* ${details.title}\n📺 *Episodes:* ${details.episodes.length}\n\n📥 *𝐄𝐏𝐈𝐒𝐎𝐃𝐄 𝐋𝐈𝐒𝐓:*\n\n`;

                const maxEp = 40;
                details.episodes.slice(0, maxEp).forEach((ep, i) => {
                    msg += `*${(i + 1).toString().padStart(2, '0')}* ➜ ${ep.title}\n`;
                });
                if (details.episodes.length > maxEp)
                    msg += `\n📌 *...and ${details.episodes.length - maxEp} more episodes.*\n`;

                msg += `\n👉 *Reply with an episode number!*\n\n${footerText}`;

                const sentEp = await conn.sendMessage(from, {
                    image  : { url: details.image || botImg },
                    caption: msg.trim(),
                    contextInfo: { mentionedJid: safeMentions }
                }, { quoted: mek });

                context.set(sentEp.key.id, {
                    type     : "ANIMETV_EPISODE",
                    details,
                    episodes : details.episodes,
                    botNumber: ctx.botNumber,
                    sender
                });
                return;
            }

            return reply("❌ *No episodes or download links found for this title!*");
        }

        // ── STEP 3: SELECT EPISODE ────────────────────────────────
        else if (ctx.type === "ANIMETV_EPISODE") {
            const index = parseInt(text) - 1;
            if (index < 0 || index >= ctx.episodes.length) return reply("❌ *Invalid episode number!*");

            conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
            const selectedEp = ctx.episodes[index];

            const epDetails = await sinhalaSubDetails(selectedEp.url);

            if (!epDetails.downloadLinks.length)
                return reply("❌ *No PixelDrain links found for this episode!*");

            let msg = `🌸 *𝐐𝐔𝐀𝐋𝐈𝐓𝐘 𝐒𝐄𝐋𝐄𝐂𝐓*\n${THEME.DIVIDER}\n\n🎬 *Episode:* ${selectedEp.title}\n\n📥 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐋𝐈𝐍𝐊𝐒:*\n\n`;

            epDetails.downloadLinks.forEach((link, i) => {
                msg += `${toNumEmoji(i + 1)} *[${link.quality}]* 💿 ${link.serverName} (${link.size})\n`;
            });

            msg += `\n${THEME.DIVIDER}\n👉 *Reply with a number to download!*\n\n${footerText}`;

            const sentQ = await conn.sendMessage(from, {
                image  : { url: ctx.details.image || botImg },
                caption: msg.trim(),
                contextInfo: { mentionedJid: safeMentions }
            }, { quoted: mek });

            context.set(sentQ.key.id, {
                type     : "ANIMETV_QUALITY",
                links    : epDetails.downloadLinks,
                epName   : selectedEp.title,
                poster   : ctx.details.image,
                botNumber: ctx.botNumber,
                sender
            });
        }

        // ── STEP 4: SELECT QUALITY → DOWNLOAD VIA PIXELDRAIN ─────
        else if (ctx.type === "ANIMETV_QUALITY") {
            const index = parseInt(text) - 1;
            if (index < 0 || index >= ctx.links.length) return reply("❌ *Invalid Selection!*");

            if (global.activeAnimeDownloads.has(sender))
                return reply("⚠️ *Please wait! You already have a download in progress.*");

            const selectedLink  = ctx.links[index];
            const pixelDrainUrl = `${PIXELDRAIN_API}/${selectedLink.pixeldrainId}?download`;

            global.activeAnimeDownloads.add(sender);
            conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });
            await reply(`*⬇️ Downloading from PixelDrain... Please wait!*`);

            let destPath = null;

            try {
                let thumbBuffer = null;
                if (ctx.poster) thumbBuffer = await fetchThumbnailProxy(ctx.poster).catch(() => null);

                const fileName = `${ctx.epName} - ${selectedLink.quality}.mp4`.replace(/[^\w\s.-]/gi, '_');
                const tempDir  = path.join(__dirname, "../temp");
                await fsPromises.mkdir(tempDir, { recursive: true }).catch(() => {});
                destPath = path.join(tempDir, fileName);

                const response = await axios({
                    url         : pixelDrainUrl,
                    method      : "GET",
                    responseType: "stream",
                    httpsAgent,
                    timeout     : 0,
                    headers     : {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                        "Referer"   : "https://pixeldrain.com/"
                    }
                });

                const writer = fs.createWriteStream(destPath);
                await pipeline(response.data, writer);

                const stats        = await fsPromises.stat(destPath);
                const actualSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

                if (parseFloat(actualSizeMB) > 2000)
                    throw new Error("SizeExceedsLimit");

                conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

                const caption = `${ctx.epName}\n\`( ${selectedLink.quality} | ${actualSizeMB} MB )\`\n\n━━━━━━━━━━━━━━━━━━\n${footerText}\n━━━━━━━━━━━━━━━━━━`;

                await conn.sendMessage(from, {
                    document: { url: destPath },
                    mimetype: "video/mp4",
                    fileName,
                    caption : caption.trim(),
                    ...(thumbBuffer ? { jpegThumbnail: thumbBuffer } : {}),
                    contextInfo: { mentionedJid: safeMentions }
                }, { quoted: mek });

                conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

            } catch (e) {
                if (e.message === "SizeExceedsLimit") {
                    reply(`❌ *File too large (>2GB) to send via WhatsApp!*\n\n🔗 Direct Link:\n${pixelDrainUrl}\n\n${footerText}`);
                } else {
                    console.error("PixelDrain Download Error:", e.message);
                    reply(`❌ *Download failed. The file may be unavailable on PixelDrain.*\n\n🔗 Try manually:\n${pixelDrainUrl}\n\n${footerText}`);
                }
            } finally {
                global.activeAnimeDownloads.delete(sender);
                if (destPath) fsPromises.unlink(destPath).catch(() => {});
            }
        }

    } catch (err) {
        console.error("SinhalaSub Interaction Error:", err.message);
        reply(THEME.ERROR_MSG);
    }
});
