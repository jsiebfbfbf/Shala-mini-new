const axios = require("axios");
const { cmd, commands } = require("../lib/command");
const config = require("../settings");
const { fetchJson } = require('../lib/functions');
const puppeteer = require("puppeteer");

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const sharp = require('sharp');

async function resizeImage(inputBuffer, width, height) {
    try {
        return await sharp(inputBuffer).resize(width, height).toBuffer();
    } catch (error) {
        console.error('Error resizing image:', error);
        return inputBuffer;
    }
}

// ─── Language strings ──────────────────────────────────────────────────────────
var desc    = config.LANG === 'SI' ? "Ringtones සෙවීම සහ බගත කරයි."  : "Search and download ringtones.";
var twdesc  = config.LANG === 'SI' ? "Twitter මගින් විඩියෝ බගත කරයි." : "Download Twitter Video.";
var imgmsg  = config.LANG === 'SI' ? "*📛 කරුණාකර වචන කිහිපයක් ලියන්න*" : "*📛 Please give me a text*";
var urlneed = config.LANG === 'SI' ? "*📛 කරුණාකර url එකක් ලබා දෙන්න*" : "*📛 Please give me a url*";
var N_FOUND = config.LANG === 'SI' ? "*📛 මට කිසිවක් සොයාගත නොහැකි විය :(*" : "*📛 I couldn't find anything :(*";

// ════════════════════════════════════════════════════════════
//                   🎵 RINGTONE COMMAND
// ════════════════════════════════════════════════════════════
cmd({
    pattern: "ringtone",
    use: '.ringtone <query>',
    react: "🎵",
    desc: desc,
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, prefix }) => {
    try {
        const ownerdata = (await axios.get(
            "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
        )).data;

        const { footer } = ownerdata;

        if (!q) return reply(imgmsg);

        const api = `https://www.movanest.xyz/v2/ringtone?title=${encodeURIComponent(q)}`;
        const res = (await axios.get(api)).data;

        if (!res.status || !res.results.length) return reply(N_FOUND);

        const results = res.results.slice(0, 10);

        const sections = [{
            title: "🎧 Ringtone List",
            rows: results.map((r) => ({
                title: r.title,
                description: "Tap to send ringtone",
                id: `${prefix}getringtone ${r.audio}`
            }))
        }];

        const selectionParams = {
            title: 'Select Ringtone ❏',
            sections: [{
                title: "Available Ringtones",
                rows: results.map((r) => ({
                    title: r.title,
                    description: r.audio.substring(0, 40),
                    id: `${prefix}getringtone ${r.audio}`
                }))
            }]
        };

        const caption = `*乂 RINGTONE DOWNLOADER*\n\n*○ \`Title\` : -* ${q}\n*○ \`Results\` : -* ${results.length}`;

        if (config.BUTTON === 'true') {
            await conn.sendMessage(from, {
                text: caption,
                footer: footer,
                buttons: [
                    { buttonId: `${prefix}ping`, buttonText: { displayText: 'PING CMD' }, type: 1 },
                    { buttonId: `${prefix}menu`, buttonText: { displayText: 'MENU CMD' }, type: 1 },
                    {
                        buttonId: 'action',
                        buttonText: { displayText: 'Select Ringtone ❏' },
                        type: 4,
                        nativeFlowInfo: { name: 'single_select', paramsJson: JSON.stringify(selectionParams) }
                    }
                ],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.listMessage2(from, {
                text: caption,
                footer: footer,
                title: "",
                buttonText: "\`Reply Below Number\` 🔢",
                sections: sections
            }, mek);
        }
    } catch (e) {
        console.log(e);
        reply("*❌ Error occurred*");
    }
});

cmd({
    pattern: "getringtone",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply(urlneed);
        await conn.sendMessage(from, { audio: { url: args[0] }, mimetype: "audio/mpeg" }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply("*❌ Error*");
    }
});

// ════════════════════════════════════════════════════════════
//                   🐦 TWITTER COMMAND
// ════════════════════════════════════════════════════════════
cmd({
    pattern: "twitter",
    use: '.twitter <url>',
    react: "🎥",
    desc: twdesc,
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const ownerdata = (await axios.get(
            "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
        )).data;
        const { footer } = ownerdata;

        if (!q) return reply(urlneed);

        const json = await fetchJson(`https://www.movanest.xyz/v2/ssstwitter?url=${encodeURIComponent(q)}`);

        if (!json.status || !json.results?.url) return reply(N_FOUND);

        await conn.sendMessage(from, {
            video: { url: json.results.url },
            caption: `🎥 *Twitter Video Downloader*\n\n🔗 ${q}`,
            footer: footer || "Twitter Bot"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key } });

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

// ════════════════════════════════════════════════════════════
//            🎬 MOVIE PLUGIN  –  sinhalasub.lk
// ════════════════════════════════════════════════════════════

// ── State stores ──────────────────────────────────────────────
const pendingSearch  = {};   // sender → { results, timestamp }
const pendingQuality = {};   // sender → { movie,   timestamp }

// ── Helpers ───────────────────────────────────────────────────
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

// ── Puppeteer scrapers ────────────────────────────────────────
async function searchMovies(query) {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.goto(`https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`, { waitUntil: "networkidle2", timeout: 30000 });

    const results = await page.$$eval(".display-item .item-box", boxes =>
        boxes.slice(0, 10).map((box, index) => {
            const a = box.querySelector("a");
            const img = box.querySelector(".thumb");
            return {
                id:       index + 1,
                title:    a?.title?.trim() || "",
                movieUrl: a?.href || "",
                thumb:    img?.src || "",
                language: box.querySelector(".item-desc-giha .language")?.textContent?.trim() || "",
                quality:  box.querySelector(".item-desc-giha .quality")?.textContent?.trim() || "",
                qty:      box.querySelector(".item-desc-giha .qty")?.textContent?.trim() || ""
            };
        }).filter(m => m.title && m.movieUrl)
    );

    await browser.close();
    return results;
}

async function getMovieMetadata(url) {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const metadata = await page.evaluate(() => {
        const getText = el => el?.textContent.trim() || "";
        const getList = sel => Array.from(document.querySelectorAll(sel)).map(el => el.textContent.trim());

        const title = getText(document.querySelector(".info-details .details-title h3"));
        let language = "", directors = [], stars = [];

        document.querySelectorAll(".info-col p").forEach(p => {
            const s = p.querySelector("strong");
            if (!s) return;
            const t = s.textContent.trim();
            if (t.includes("Language:")) language   = s.nextSibling?.textContent?.trim() || "";
            if (t.includes("Director:")) directors  = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
            if (t.includes("Stars:"))    stars       = Array.from(p.querySelectorAll("a")).map(a => a.textContent.trim());
        });

        return {
            title,
            language,
            duration:  getText(document.querySelector(".info-details .data-views[itemprop='duration']")),
            imdb:      getText(document.querySelector(".info-details .data-imdb")).replace("IMDb:", "").trim(),
            genres:    getList(".details-genre a"),
            directors,
            stars,
            thumbnail: document.querySelector(".splash-bg img")?.src || ""
        };
    });

    await browser.close();
    return metadata;
}

async function getPixeldrainLinks(movieUrl) {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.goto(movieUrl, { waitUntil: "networkidle2", timeout: 30000 });

    const linksData = await page.$$eval(".link-pixeldrain tbody tr", rows =>
        rows.map(row => ({
            pageLink: row.querySelector(".link-opt a")?.href || "",
            quality:  row.querySelector(".quality")?.textContent.trim() || "",
            size:     row.querySelector("td:nth-child(3) span")?.textContent.trim() || ""
        }))
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
                const sizeText = l.size.toUpperCase();
                let sizeMB = sizeText.includes("GB") ? parseFloat(sizeText) * 1024
                           : sizeText.includes("MB") ? parseFloat(sizeText) : 0;
                if (sizeMB <= 2048)
                    directLinks.push({ link: finalUrl, quality: normalizeQuality(l.quality), size: l.size });
            }
            await subPage.close();
        } catch (e) { continue; }
    }

    await browser.close();
    return directLinks;
}

// ── Auto-cleanup expired sessions (10 min) ────────────────────
setInterval(() => {
    const now = Date.now(), timeout = 10 * 60 * 1000;
    for (const s in pendingSearch)  if (now - pendingSearch[s].timestamp  > timeout) delete pendingSearch[s];
    for (const s in pendingQuality) if (now - pendingQuality[s].timestamp > timeout) delete pendingQuality[s];
}, 5 * 60 * 1000);

// ── 1) Movie search command ───────────────────────────────────
cmd({
    pattern:  "movie",
    alias:    ["sinhalasub", "films", "mv"],
    react:    "🎞️",
    desc:     "Search and Download movies from Sinhalasub.lk",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, sender, reply }) => {
    if (!q) return reply(`*🎥 Movie Search Plugin*\nUsage: .movie <movie name>\nExample: .movie avengers`);

    reply("🔍 *𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝚈𝙾𝚄𝚁 𝙼𝙾𝚅𝙸𝙴...*");

    try {
        const searchResults = await searchMovies(q);
        if (!searchResults.length) return reply("*❌ No movies found!*");

        pendingSearch[sender] = { results: searchResults, timestamp: Date.now() };

        let text = "*🎥 Search Results:*\n\n";
        searchResults.forEach((mv, i) => {
            text += `*${i + 1}.* ${mv.title}\n   📝 Language: ${mv.language}\n   📊 Quality: ${mv.quality}\n   🎞️ Format: ${mv.qty}\n\n`;
        });
        text += `*Reply with the movie number (1-${searchResults.length})*`;

        reply(text);
    } catch (err) {
        console.error("Movie search error:", err);
        reply("*❌ Search failed. Please try again.*");
    }
});

// ── 2) Interactive reply handler (on: "body") ─────────────────
//    Handles both movie selection AND quality selection
cmd({
    on: "body",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, body, sender }) => {

    const makeReply = (text, opt = {}) =>
        conn.sendMessage(from, { text, ...opt }, { quoted: mek });

    const num = parseInt(body.trim());
    if (isNaN(num) || num < 1) return;

    // ─ Step A: User selected a movie from search results ─────
    if (pendingSearch[sender] && num <= pendingSearch[sender].results.length) {
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        const selected = pendingSearch[sender].results[num - 1];
        delete pendingSearch[sender];

        try {
            const metadata = await getMovieMetadata(selected.movieUrl);

            let msg = `*🎞️ ${metadata.title}*\n\n`;
            msg += `*📝 Language:*  ${metadata.language}\n`;
            msg += `*⏱️ Duration:*  ${metadata.duration}\n`;
            msg += `*⭐ IMDb:*      ${metadata.imdb}\n`;
            msg += `*🎭 Genres:*    ${metadata.genres.join(", ")}\n`;
            msg += `*🎥 Directors:* ${metadata.directors.join(", ")}\n`;
            msg += `*🌟 Stars:*     ${metadata.stars.slice(0, 5).join(", ")}${metadata.stars.length > 5 ? "..." : ""}\n\n`;
            msg += "*🔗 Fetching download links, please wait...*";

            if (metadata.thumbnail) {
                await conn.sendMessage(from, { image: { url: metadata.thumbnail }, caption: msg }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { text: msg }, { quoted: mek });
            }

            const downloadLinks = await getPixeldrainLinks(selected.movieUrl);
            if (!downloadLinks.length) return makeReply("*❌ No download links found (max 2 GB)!*");

            pendingQuality[sender] = { movie: { metadata, downloadLinks }, timestamp: Date.now() };

            let qualityMsg = "*📥 Available Qualities (Max 2 GB):*\n\n";
            downloadLinks.forEach((d, i) => { qualityMsg += `*${i + 1}.* ${d.quality} — ${d.size}\n`; });
            qualityMsg += `\n*Reply with the quality number to receive the movie as a document.*`;

            await conn.sendMessage(from, { text: qualityMsg }, { quoted: mek });

        } catch (err) {
            console.error("Movie metadata error:", err);
            makeReply("*❌ Failed to fetch movie details. Please try again.*");
        }
        return;
    }

    // ─ Step B: User selected a quality / download link ────────
    if (pendingQuality[sender] && num <= pendingQuality[sender].movie.downloadLinks.length) {
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        const { movie } = pendingQuality[sender];
        delete pendingQuality[sender];

        const selectedLink = movie.downloadLinks[num - 1];

        makeReply(
            `🚀 *${selectedLink.quality} Movie Download Started!* 🎥\n\n` +
            `⏳ Please wait a moment…\n📦 File is being prepared as a document.`
        );

        try {
            const directUrl = getDirectPixeldrainUrl(selectedLink.link);

            await conn.sendMessage(from, {
                document: { url: directUrl },
                mimetype: "video/mp4",
                fileName: `${movie.metadata.title.substring(0, 50)} - ${selectedLink.quality}.mp4`.replace(/[^\w\s.-]/gi, ''),
                caption:
                    `🎞️ *${movie.metadata.title}*\n\n` +
                    `📊 *Quality* : ${selectedLink.quality}\n` +
                    `💾 *Size*    : ${selectedLink.size}\n\n` +
                    `🍿 Enjoy your movie!\n\n` +
                    `> ©𝚂𝙷𝙰𝙻𝙰-𝙼𝙳`
            }, { quoted: mek });

        } catch (error) {
            console.error("Send document error:", error);
            makeReply(`*❌ Failed to send movie:* ${error.message || "Unknown error"}`);
        }
        return;
    }
});

module.exports = { pendingSearch, pendingQuality };
