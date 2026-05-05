/**
 * ════════════════════════════════════════════════
 *   SinhalaSub.LK Movie Downloader Plugin
 *   Bot: Shala-Mini
 *   Commands: .movie | .moviedl
 * ════════════════════════════════════════════════
 */

const axios = require("axios");
const { cmd } = require("../lib/command");
const config = require("../settings");

// ─── Pixeldrain ID regex ─────────────────────────────────────────────────────
const PIXELDRAIN_REGEX = /pixeldrain\.com\/(?:u\/|api\/file\/)([A-Za-z0-9]+)/;

// ─── sinhalasub.lk link redirect resolver ────────────────────────────────────
async function resolvePixeldrainId(sinhalasubLinkUrl) {
    try {
        const res = await axios.get(sinhalasubLinkUrl, {
            maxRedirects: 10,
            timeout: 15000,
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        // Try from final URL
        const finalUrl = res.request?.res?.responseUrl || res.config?.url || "";
        const match = finalUrl.match(PIXELDRAIN_REGEX);
        if (match) return match[1];

        // Try from response body
        const bodyMatch = (res.data || "").toString().match(PIXELDRAIN_REGEX);
        if (bodyMatch) return bodyMatch[1];

        return null;
    } catch (err) {
        // On redirect, axios might throw — check error response URL
        const redirectUrl = err?.request?.res?.responseUrl || err?.config?.url || "";
        const match = redirectUrl.match(PIXELDRAIN_REGEX);
        if (match) return match[1];
        return null;
    }
}

// ─── Scrape movie info + links from sinhalasub.lk ────────────────────────────
async function getSinhalaSubInfo(movieUrl) {
    try {
        const res = await axios.get(movieUrl, {
            timeout: 20000,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        const html = res.data;

        // Title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(" – SinhalaSub.LK", "").trim() : "Unknown";

        // Poster image
        const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
        const poster = imgMatch ? imgMatch[1] : null;

        // IMDb rating
        const imdbMatch = html.match(/IMDb\s*[\s\S]*?([\d.]+)\s*\/\s*10/i) ||
                          html.match(/imdb[^>]*>[\s\S]*?([\d.]+)</i);
        const imdb = imdbMatch ? imdbMatch[1] : "N/A";

        // Year
        const yearMatch = html.match(/\((\d{4})\)/);
        const year = yearMatch ? yearMatch[1] : "";

        // Download links with quality + size
        // sinhalasub.lk uses <a href="https://sinhalasub.lk/links/XXXXX/">Quality – Size</a>
        const linkPattern = /<a\s+[^>]*href="(https:\/\/sinhalasub\.lk\/links\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        const links = [];
        let m;
        while ((m = linkPattern.exec(html)) !== null) {
            const href = m[1];
            const label = m[2].replace(/<[^>]+>/g, "").trim();
            if (label && href) {
                links.push({ label, href });
            }
        }

        return { title, poster, imdb, year, links };
    } catch (e) {
        return null;
    }
}

// ─── Scrape search results from sinhalasub.lk ────────────────────────────────
async function searchSinhalaSubMovies(query) {
    try {
        const url = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            timeout: 20000,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        const html = res.data;

        const results = [];
        // Article cards typically have class "post-title" or inside <article>
        const articlePattern = /<article[\s\S]*?<\/article>/gi;
        const hrefPattern = /href="(https:\/\/sinhalasub\.lk\/movies\/[^"]+)"/i;
        const titlePattern = /<h2[^>]*class="[^"]*post-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i;
        const imgPattern = /<img[^>]+src="([^"]+)"[^>]*>/i;
        const yearPattern = /\((\d{4})\)/;
        const ratingPattern = /IMDb\s+([\d.]+)/i;

        let artMatch;
        while ((artMatch = articlePattern.exec(html)) !== null) {
            const art = artMatch[0];
            const hrefM = art.match(hrefPattern);
            const titleM = art.match(titlePattern) || art.match(/title="([^"]+)"/i);
            const imgM = art.match(imgPattern);
            const yearM = art.match(yearPattern);
            const ratingM = art.match(ratingPattern);

            if (hrefM && titleM) {
                results.push({
                    title: (titleM[1] || titleM[0]).replace(/<[^>]+>/g, "").trim(),
                    link: hrefM[1],
                    img: imgM ? imgM[1] : null,
                    year: yearM ? yearM[1] : "",
                    rating: ratingM ? ratingM[1] : ""
                });
            }
            if (results.length >= 8) break;
        }

        return results;
    } catch (e) {
        return [];
    }
}

// ═══════════════════════════════════════════════════════════
//  COMMAND: .movie <query>  →  Search & list results
// ═══════════════════════════════════════════════════════════
const movieSearchDesc = config.LANG === "SI"
    ? "SinhalaSub.LK එකෙන් සිංහල උපසිරසි සහිත චිත්‍රපට සොයා ගනී."
    : "Search movies with Sinhala subtitles from SinhalaSub.LK.";

cmd({
    pattern: "movie",
    use: ".movie <movie name>",
    react: "🎬",
    desc: movieSearchDesc,
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, prefix }) => {
    try {
        if (!q) {
            return reply(
                config.LANG === "SI"
                    ? "*📛 කරුණාකර චිත්‍රපටයේ නම ලියන්න*\n*උදා:* `.movie Avengers`"
                    : "*📛 Please enter a movie name*\n*Ex:* `.movie Avengers`"
            );
        }

        await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        const results = await searchSinhalaSubMovies(q);

        if (!results || results.length === 0) {
            return reply(
                config.LANG === "SI"
                    ? `*📛 "${q}" සඳහා ප්‍රතිඵල හමු නොවීය.*\nනිවැරදි නමක් සොයා බලන්න.`
                    : `*📛 No results found for "${q}".*\nTry a different search term.`
            );
        }

        // ── Fetch owner data for footer ──────────────────────────
        let footer = "*● SinhalaSub.LK Movie Bot ●*";
        try {
            const ownerdata = (await axios.get(
                "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json",
                { timeout: 8000 }
            )).data;
            footer = ownerdata.footer || footer;
        } catch (_) {}

        // ── Build list sections ──────────────────────────────────
        const sections = [
            {
                title: "🎬 Movie Results",
                rows: results.map((r, i) => ({
                    title: `${i + 1}. ${r.title}`,
                    description: [r.year && `📅 ${r.year}`, r.rating && `⭐ IMDb ${r.rating}`].filter(Boolean).join("  |  ") || "Tap to get download links",
                    id: `${prefix}moviedl ${r.link}`
                }))
            }
        ];

        const caption =
            `*🎬 SINHALASUB.LK MOVIE SEARCH*\n\n` +
            `*🔎 Query:* ${q}\n` +
            `*📊 Results:* ${results.length} found\n\n` +
            `_Select a movie to get download links 👇_`;

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                text: caption,
                footer: footer,
                buttons: [
                    {
                        buttonId: "action",
                        buttonText: { displayText: "🎬 Select Movie" },
                        type: 4,
                        nativeFlowInfo: {
                            name: "single_select",
                            paramsJson: JSON.stringify({ title: "Select Movie ❏", sections })
                        }
                    }
                ],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.listMessage2(from, {
                text: caption,
                footer: footer,
                title: "",
                buttonText: "`Reply Below Number` 🔢",
                sections: sections
            }, mek);
        }

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key } });

    } catch (e) {
        console.error("[sinhalasub.js] .movie error:", e);
        reply("*❌ Error occurred while searching. Please try again.*");
    }
});

// ═══════════════════════════════════════════════════════════
//  COMMAND: .moviedl <movie-url>  →  Show download quality options
// ═══════════════════════════════════════════════════════════
const movieDlDesc = config.LANG === "SI"
    ? "SinhalaSub.LK URL එකෙන් movie download links ලබා ගනී."
    : "Get Pixeldrain download links from a SinhalaSub.LK movie page.";

cmd({
    pattern: "moviedl",
    use: ".moviedl <sinhalasub.lk movie url>",
    react: "📥",
    desc: movieDlDesc,
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, prefix }) => {
    try {
        if (!q) {
            return reply(
                config.LANG === "SI"
                    ? "*📛 කරුණාකර SinhalaSub.LK movie URL එකක් ලබා දෙන්න*\n*උදා:* `.moviedl https://sinhalasub.lk/movies/avengers-2012/`"
                    : "*📛 Please give a SinhalaSub.LK movie URL*\n*Ex:* `.moviedl https://sinhalasub.lk/movies/avengers-2012/`"
            );
        }

        // Validate URL
        if (!q.includes("sinhalasub.lk")) {
            return reply(
                config.LANG === "SI"
                    ? "*📛 කරුණාකර වලංගු SinhalaSub.LK URL එකක් ලබා දෙන්න.*"
                    : "*📛 Please provide a valid SinhalaSub.LK URL.*"
            );
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const info = await getSinhalaSubInfo(q);
        if (!info) {
            return reply(
                config.LANG === "SI"
                    ? "*📛 Movie page load කරන්නට නොහැකි විය. URL නිවැරදිදැයි පරීක්ෂා කරන්න.*"
                    : "*📛 Could not load movie page. Please check the URL.*"
            );
        }

        if (!info.links || info.links.length === 0) {
            return reply(
                config.LANG === "SI"
                    ? `*📛 "${info.title}" සඳහා download links නොමැත.*`
                    : `*📛 No download links found for "${info.title}".*`
            );
        }

        // ── Fetch owner data ──────────────────────────────────────
        let footer = "*● SinhalaSub.LK Movie Bot ●*";
        try {
            const ownerdata = (await axios.get(
                "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json",
                { timeout: 8000 }
            )).data;
            footer = ownerdata.footer || footer;
        } catch (_) {}

        // ── Build quality selection list ──────────────────────────
        const sections = [
            {
                title: "📥 Download Quality",
                rows: info.links.map((lnk, i) => ({
                    title: lnk.label || `Option ${i + 1}`,
                    description: "Tap to download via Pixeldrain",
                    id: `${prefix}getmovie ${lnk.href}`
                }))
            }
        ];

        const caption =
            `*🎬 SINHALASUB.LK DOWNLOADER*\n\n` +
            `*🎞️ Title:* ${info.title}\n` +
            `${info.year ? `*📅 Year:* ${info.year}\n` : ""}` +
            `${info.imdb !== "N/A" ? `*⭐ IMDb:* ${info.imdb}\n` : ""}` +
            `*🔗 Source:* sinhalasub.lk\n\n` +
            `*📥 ${info.links.length} download option(s) available*\n` +
            `_Select your preferred quality 👇_`;

        // Send poster if available
        if (info.poster) {
            try {
                await conn.sendMessage(from, {
                    image: { url: info.poster },
                    caption: caption
                }, { quoted: mek });
            } catch (_) {
                await reply(caption);
            }
        } else {
            await reply(caption);
        }

        // Send quality selector
        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                text: `*📥 Choose download quality for:*\n_${info.title}_`,
                footer: footer,
                buttons: [
                    {
                        buttonId: "action",
                        buttonText: { displayText: "📥 Select Quality" },
                        type: 4,
                        nativeFlowInfo: {
                            name: "single_select",
                            paramsJson: JSON.stringify({ title: "Download Quality ❏", sections })
                        }
                    }
                ],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.listMessage2(from, {
                text: `*📥 Choose download quality for:*\n_${info.title}_`,
                footer: footer,
                title: "",
                buttonText: "`Reply Below Number` 🔢",
                sections: sections
            }, mek);
        }

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key } });

    } catch (e) {
        console.error("[sinhalasub.js] .moviedl error:", e);
        reply("*❌ Error occurred. Please try again.*");
    }
});

// ═══════════════════════════════════════════════════════════
//  COMMAND: .getmovie <sinhalasub-link-url>
//  Internal: Resolves sinhalasub redirect → Pixeldrain ID → download URL
// ═══════════════════════════════════════════════════════════
cmd({
    pattern: "getmovie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("*📛 No link provided.*");

        const sinhalasubLinkUrl = args[0];

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Resolve sinhalasub.lk/links/XXXXX/ → Pixeldrain file ID
        const pixeldrainId = await resolvePixeldrainId(sinhalasubLinkUrl);

        if (!pixeldrainId) {
            return reply(
                config.LANG === "SI"
                    ? "*📛 Pixeldrain link resolve කරන්නට නොහැකි විය.*\nLink expired නොහොත් valid නොවේ."
                    : "*📛 Could not resolve Pixeldrain link.*\nThe link may be expired or invalid."
            );
        }

        const downloadUrl = `https://pixeldrain.com/api/file/${pixeldrainId}?download`;
        const viewUrl = `https://pixeldrain.com/u/${pixeldrainId}`;

        // ── Fetch owner data ──────────────────────────────────────
        let footer = "*● SinhalaSub.LK Movie Bot ●*";
        try {
            const ownerdata = (await axios.get(
                "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json",
                { timeout: 8000 }
            )).data;
            footer = ownerdata.footer || footer;
        } catch (_) {}

        const msg =
            `*✅ DOWNLOAD READY!*\n\n` +
            `*🔗 Pixeldrain ID:* \`${pixeldrainId}\`\n\n` +
            `*📥 Direct Download:*\n${downloadUrl}\n\n` +
            `*🌐 View Online:*\n${viewUrl}\n\n` +
            `_Copy the link above to download your movie_ 🎬`;

        await conn.sendMessage(from, {
            text: msg,
            footer: footer
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("[sinhalasub.js] .getmovie error:", e);
        reply("*❌ Error occurred while fetching download link.*");
    }
});
