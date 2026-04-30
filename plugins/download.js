const axios = require("axios");
const { cmd,commands } = require("../lib/command");
const config = require("../settings");
const {fetchJson} = require('../lib/functions');
const yts = require("ytsearch-venom")
const ytsv = require("yt-search");
const fs = require('fs');
const { exec } = require("child_process");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const sharp = require('sharp');
async function resizeImage(inputBuffer, width, height) {
    try {
        return await sharp(inputBuffer).resize(width, height).toBuffer();
    } catch (error) {
        console.error('Error resizing image:', error);
        return inputBuffer; 
    }
}

const API = "https://sadiya-tech-apis.vercel.app";
const APIKEY = "b5c9d311-2e66-4d06-8cb9-e8618271962b";
const apkapi = `http://ws75.aptoide.com`;

var apkdesc =''
if(config.LANG === 'SI') apkdesc = "Playstory වෙතින් Apk බාගත කරයි."
else apkdesc = "Download Apk from Playstory."

var ytvdesc =''
if(config.LANG === 'SI') ytvdesc = "Youtube වෙතින් වීඩියෝ බාගත කරයි."
else ytvdesc = "Download Video from Youtube."

var ytdesc =''
if(config.LANG === 'SI') ytdesc = "Youtube වෙතින් සින්දු බාගත කරයි."
else ytdesc = "Download Song from Youtube."

var fbdesc =''
if(config.LANG === 'SI') fbdesc = "Facebook වෙතින් Video බාගත කරයි."
else fbdesc = "Download Video from Facebook."

var ttdesc =''
if(config.LANG === 'SI') ttdesc = "Tiktok වෙතින් Video බාගත කරයි."
else ttdesc = "Download Video from Tiktok."

var mfdesc =''
if(config.LANG === 'SI') mfdesc = "Mediafire වෙතින් ගොනු බාගත කරයි."
else mfdesc = "Download Mediafire Files."




var imgmsg =''
if(config.LANG === 'SI') imgmsg = "*📛 කරුණාකර වචන කිහිපයක් ලියන්න*"
else imgmsg = "*📛 Please give me a text*"

var urlneed =''
if(config.LANG === 'SI') urlneed = "*📛 කරුණාකර url එකක් ලබා දෙන්න*"
else urlneed = "*📛 Please give me a url*"

var N_FOUND =''
if(config.LANG === 'SI') N_FOUND = "*📛 මට කිසිවක් සොයාගත නොහැකි විය :(*"
else N_FOUND = "*📛 I couldn't find anything :(*"

//---------------- BOT' S SCRAPE ------------------//
async function getYouTubeMp3(youtubeUrl) {
try {
const headers = {
'Content-Type': 'application/json',
'Origin': 'https://ytmp3.gg',
'Referer': 'https://ytmp3.gg/',
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};
        
const downloadResponse = await axios.post('https://hub.ytconvert.org/api/download', {
url: youtubeUrl,
os: "windows",
audio: { bitrate: "128k" },
output: { type: "audio", format: "mp3" }
}, { headers });
        
let statusUrl = downloadResponse.data.statusUrl;
        
let isReady = false;
let finalDownloadUrl = "";
        
while (!isReady) {
const statusCheck = await axios.get(statusUrl, { headers });
                    
if (statusCheck.data.status === 'finished' || statusCheck.data.downloadUrl) {
finalDownloadUrl = statusCheck.data.downloadUrl;
isReady = true;
} else {
await new Promise(resolve => setTimeout(resolve, 2000)); 
}
}
        
 return finalDownloadUrl;
        
} catch (error) {
console.error("err:", error.response ? error.response.data : error.message);
}
}

function ytreg(url) {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
    return ytIdRegex.test(url);
}


//--------------- BOT' S SONG DOWNLOAD ------------------//
cmd({
    pattern: "song",
    alias: ["ytsong", "youtubesong"],
    use: '.song <query or url>',
    react: "🎧",
    desc: ytdesc,
    category: "download",
    filename: __filename
},

async (conn, mek, m, { from, prefix, q, reply }) => {
    try {

		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;
		
        if (!q) return await reply(imgmsg);

        const url = q.replace(/\?si=[^&]*/, '');
        const results = await yts(url);
        if (!results || !results.videos || results.videos.length === 0) return await reply(N_FOUND);

        const result = results.videos[0];

        const caption = `*乂 SONG DOWNLOADER*

*○ \`Title\` : -* ${result.title}
*○ \`Views\` : -* ${result.views}
*○ \`Duration\` : -* ${result.duration}
*○ \`Ago\` : -* ${result.ago}
*○ \`Url\` : -* ${result.url}`;

        const buttons = [
            { buttonId: `${prefix}ytaa ${result.url}`, buttonText: { displayText: '🎶 Audio Format' }, type: 1 },
            { buttonId: `${prefix}ytad ${result.url}±${result.thumbnail}±${result.title}`, buttonText: { displayText: '📂 Document Format' }, type: 1 },
            { buttonId: `${prefix}ytaap ${result.url}`, buttonText: { displayText: '🎤 Voice Format' }, type: 1 }
        ];


if (config.BUTTON === 'true') {
const buttonMessage1 = {
            image: { url: result.thumbnail },
            caption: caption,
            footer: footer,
            buttons: buttons,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage1, { quoted: mek });

} else {

        const buttonMessage = {
            image: { url: result.thumbnail },
            caption: caption,
            footer: footer,
            buttons: buttons,
            headerType: 4
        };

        await conn.buttonMessage2(from, buttonMessage, mek);
}

    } catch (e) {
        console.error(e);
        reply('*🚩 Song Error!!*');
    }
});


function tolow(youtubeUrl) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(regex);

    if (match && match[1]) {
        const videoId = match[1];
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        return thumbnailUrl
    } else {
        console.log('Invalid YouTube URL');
    }
}

cmd({
  pattern: "ytaa",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    
    if (!q) return reply(urlneed);
    const mp3 = await getYouTubeMp3(q);

    await conn.sendMessage(from, {
      audio: { url: mp3 },
      mimetype: "audio/mpeg"
    }, { quoted: mek });

    await conn.sendMessage(from, {
      react: { text: "✔️", key: mek.key }
    });

  } catch (e) {
    console.error("*🚩 Song Dl Error : -*", e.message);
    reply("*🚩 Song Dl Error*");
  }
});

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

cmd({
  pattern: "ytaap",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

  if (!q) return await reply(urlneed);

  try {
    
    const mp3Url = await getYouTubeMp3(q);

    const mp3File = path.join(__dirname, "ytaap.mp3");
    const oggFile = path.join(__dirname, "ytaap.ogg");

    // ⬇️ Download MP3
    const dl = await axios.get(mp3Url, { responseType: "arraybuffer" });
    fs.writeFileSync(mp3File, dl.data);

    await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

    // 🔄 Convert MP3 → OGG (Opus PTT)
    await new Promise((resolve, reject) => {
      ffmpeg(mp3File)
        .audioCodec("libopus")
        .audioBitrate("64k")
        .format("ogg")
        .save(oggFile)
        .on("end", resolve)
        .on("error", reject);
    });

    // 🎙️ Send as voice note
    await conn.sendMessage(
      from,
      {
        audio: fs.readFileSync(oggFile),
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      },
      { quoted: mek }
    );

    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    // 🧹 Cleanup
    fs.unlinkSync(mp3File);
    fs.unlinkSync(oggFile);

  } catch (e) {
    console.error(e);
    await reply("*🚩 Song Dl Error*");
  }
});


cmd({
  pattern: "ytad",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

	  const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;
	  
    if (!q) return reply(urlneed);

    const hansa = await getYouTubeMp3(q);
    const datas = q.split("±")[2]
    // 🔹 thumbnail URL
    const thumbUrl = tolow(q);

    let resizedBotImg;
    if (thumbUrl) {
      const res = await fetch(thumbUrl);
      const buffer = await res.buffer();
      resizedBotImg = await resizeImage(buffer, 200, 200);
    }

    await conn.sendMessage(from, {
      react: { text: "⬆️", key: mek.key }
    });

    await conn.sendMessage(from, {
      document: { url: hansa },
      mimetype: "audio/mpeg",
      caption: `\`${datas}\`\n\n${footer}`,
      jpegThumbnail: resizedBotImg, 
      fileName: `${datas}.mp3`
    }, { quoted: mek });

    await conn.sendMessage(from, {
      react: { text: "✔️", key: mek.key }
    });

  } catch (e) {
    console.error(e);
    reply("*🚩 Song Dl Error*");
  }
});

//--------------- BOT' S AUTO CSONG ------------------//
cmd({
    pattern: "csong",
    desc: "Send song to channel as voice note",
    category: "downloader",
    use: ".csong <channelJid> <song name>",
    filename: __filename
},
async (conn, mek, m,  q, { from, prefix, pushname, reply }) => {
  try {

        await socket.sendMessage(m.chat, { react: { text: '🎵', key: msg.key } });

        if (!text) return reply("❗ Example: .csong <channelJid> <song name>");

        let args = text.split(" ");
        let channelJid = args[0];
        let query = args.slice(1).join(" ");

        if (!channelJid.includes("@")) return reply("❗ Please provide a valid channel JID.");
        if (!query) return reply("❗ Please enter the song name.");

       
        const search = await yts(query);
        if (!search.videos.length) return reply("❌ No results found on YouTube.");

        const video = search.videos[0];
        const videoUrl = video.url;
        const duration = video.timestamp;

     
        const apiUrl = `https://www.movanest.xyz/v2/ytdl2?input=${encodeURIComponent(videoUrl)}&format=audio`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json?.status || !json?.results?.success || !json?.results?.recommended?.dlurl) {
            return reply('❌ API did not return a valid download link');
        }

        const dlUrl = json.results.recommended.dlurl;
        const title = json.results.title || video.title || "Unknown Title";
        let thumb = json.results.thumb || video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

        
        const mp3Response = await axios.get(dlUrl, { responseType: 'arraybuffer' });
        const tempMp3 = path.join(os.tmpdir(), `${Date.now()}_input.mp3`);
        fs.writeFileSync(tempMp3, Buffer.from(mp3Response.data));

       
        const tempOpus = path.join(os.tmpdir(), `${Date.now()}_output.opus`);
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${tempMp3}" -c:a libopus -b:a 128k -vbr on -compression_level 10 "${tempOpus}"`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const opusBuffer = fs.readFileSync(tempOpus);

        
        let thumbBuffer = null;
        try {
            const thumbRes = await axios.get(thumb, { responseType: 'arraybuffer' });
            thumbBuffer = Buffer.from(thumbRes.data);
        } catch {}

       
        const caption = `*🪸 Simple Wa - Bot!!*

> _*🧃Title*_ : \`${title}\`
> _*🪺 Duration*_ : \`${duration}\`
> _*Thnk For Check Our Bot!! 😌✨*_`;

        
        await conn.sendMessage(channelJid, {
            image: thumbBuffer || { url: thumb },
            caption: caption,
            jpegThumbnail: thumbBuffer || undefined
        });

        
        await conn.sendMessage(channelJid, {
            audio: opusBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            fileName: `${title}.opus`
        });

        
        if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
        if (fs.existsSync(tempOpus)) fs.unlinkSync(tempOpus);

        reply("✅ Sent to channel successfully!");

    } catch (error) {
        console.error(error);
        reply("⚠️ Error: " + (error.message || "unknown error"));
    }
});

//--------------- BOT' S YOUTUBE DOWNLOADER ------------------//
cmd({
    pattern: "video",
    use: '.video <query>',
    react: "🎥",
    desc: ytvdesc,
    category: "download",
    filename: __filename
},  async (conn, mek, m, { from, q, reply, prefix }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;
		
        if (!q) return await conn.sendMessage(from, { text: imgmsg }, { quoted: mek });

        const searchResults = await ytsv(q);
        if (!searchResults.videos.length) return reply(N_FOUND);

        let video = searchResults.videos[0];

        const caption = `*乂 YOUTUBE VIDEO DOWNLOADER*
        
*○ \`Title\` : -* ${video.title}
*○ \`Views\` : -* ${video.views}
*○ \`Duration\` : -* ${video.timestamp}
*○ \`URL\` : -* ${video.url}`;


 const sections = [
    {
      title: "🎥 Normal Tipe",
      rows: [
        { title: "360p Quality Video", rowId: `${prefix}down_360 ${video.url}` },
        { title: "480p Quality Video", rowId: `${prefix}down_480 ${video.url}` },
        { title: "720p Quality Video", rowId: `${prefix}down_720 ${video.url}` },
        { title: "1080p Quality Video", rowId: `${prefix}down_1080 ${video.url}` },
      //  { title: "2160p Quality Video", rowId: `${prefix}down_2160 ${video.url}` },
      ],
    },
    {
      title: "📂 Document Tipe",
      rows: [
        { title: "360p Quality Video", rowId: `${prefix}down_360d ${video.url}` },
        { title: "480p Quality Video", rowId: `${prefix}down_480d ${video.url}` },
        { title: "720p Quality Video", rowId: `${prefix}down_720d ${video.url}` },
        { title: "1080p Quality Video", rowId: `${prefix}down_1080d ${video.url}` },
      //  { title: "2160p Quality Video", rowId: `${prefix}down_2160d ${video.url}` },
      ],
    }
  ];

    const selectionParams = {
        title: 'Download Format ❏',
        sections: [
            {
                title: '🎥 Video Format',
                rows: [
                    { title: '360p Quality Video', description: '360p quality video download', id: `${prefix}down_360 ${video.url}` },
                    { title: '480p Quality Video', description: '480p quality video download', id: `${prefix}down_480 ${video.url}` },
					{ title: '720p Quality Video', description: '720p quality video download', id: `${prefix}down_720 ${video.url}` },
                    { title: '1080p Quality Video', description: '1080p quality video download', id: `${prefix}down_1080 ${video.url}` }
                ]
            },
            {
                title: '📂 Document Format',
                rows: [
                    { title: '360p Quality Video', description: '360p quality video download', id: `${prefix}down_360d ${video.url}` },
                    { title: '480p Quality Video', description: '480p quality video download', id: `${prefix}down_480d ${video.url}` },
					{ title: '720p Quality Video', description: '720p quality video download', id: `${prefix}down_720d ${video.url}` },
                    { title: '1080p Quality Video', description: '1080p quality video download', id: `${prefix}down_1080d ${video.url}` }
                ]
            }
        ]
    };
        
if (config.BUTTON === 'true') {
    await conn.sendMessage(from, {
        image: { url: video.thumbnail },
        caption,
        footer: footer,
        buttons: [
            {
                buttonId: `${prefix}ping`,
                buttonText: { displayText: 'PING CMD' },
                type: 1
            },
            {
                buttonId: `${prefix}menu`,
                buttonText: { displayText: 'MENU CMD' },
                type: 1
            },
            {
                buttonId: 'action',
                buttonText: { displayText: 'Download Option ❏' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify(selectionParams)
                }
            }
        ],
        headerType: 4,
    }, { quoted: mek });

} else {

    await conn.listMessage2(from, {
      image: { url: video.thumbnail },
      caption,
      footer: footer,
      title: "",
      buttonText: "\`Reply Below Number\` 🔢",
      sections,
      }, mek);
	}

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { text: '🚩 *Youtube Error*' }, { quoted: mek });
    }
});
//------ Video Foment---------
cmd({
    pattern: "down_144",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=144`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});


cmd({
    pattern: "down_240",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=240`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});


cmd({
    pattern: "down_360",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=360`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_480",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=360`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_720",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=360`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_1080",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=360`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_best",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=best`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

        await conn.sendMessage(from, {
            video: { url: link },
            mimetype: "video/mp4",
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});
//--------- Document Fomat -------
cmd({
    pattern: "down_144d",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=144`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});
		
		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});


cmd({
    pattern: "down_240d",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=240`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});
		
		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_360d",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=360`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});
		
		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_480d",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=480`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_720d",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=720`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_1080d",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=best`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});

		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

cmd({
    pattern: "down_bestd",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ytdown?url=${encodeURIComponent(q)}&quality=best`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.download?.link) {
            return reply(N_FOUND);
        }

        const link = json.download.link;
        const title = json.title;
		const thumbnail = json.thumbnail;
        const quality = json.download.label;

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key }});
		
		const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);

        await conn.sendMessage(from, {
			document: { url: link },
            mimetype: "video/mp4",
			fileName: `${title}.mp4`,
	        jpegThumbnail: resizedBotImg,
            caption: `🎥 *${title}*\n\n\`${quality}\`\n\n${footer}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✔", key: mek.key }});

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});

//--------------- BOT' S FACEBOOK DOWNLOAD ------------------//
cmd({
    pattern: "fb",
    alias: ["facebook"],
    use: ".fb <facebook url>",
    react: "📘",
    desc: "Download Facebook Videos",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, prefix, q, reply }) => {
    try {

		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const { footer, imageurl } = ownerdata;

        if (!q || !q.includes("facebook.com")) {
            return reply(urlneed);
        }

        const api = `https://api-site-pi.vercel.app/download/fbdown?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const data = res.data;

        if (!data.status || !data.result) {
            return reply(N_FOUND);
        }

        const fb = data.result;

        const title = fb.title || "Facebook Video";
        const desc = fb.description || "No description";
        const thumb = fb.thumbnail;

        const hasHD = fb.links?.hd ? true : false;
        const hasSD = fb.links?.sd ? true : false;
        const hasAudio = fb.links?.audio ? true : false;

        const caption = `*乂 FACEBOOK DOWNLOADER*

*○ \`Title\` : -* ${title}
*○ \`Description\` : -* ${desc}
*○ \`Duration\` : -* ${fb.duration || "No Duration" }
*○ \`Available\` : -* ${hasHD ? "HD " : ""}${hasSD ? "SD" : ""}
*○ \`Url\` : -* ${q}`;

        const sections = [
            {
                title: "🎥 Normal Type",
                rows: [...(hasHD ? [{
                        title: "🔋 HD Quality Video",
                        rowId: `${prefix}fbhd ${q}`
                    }] : []),
                    ...(hasSD ? [{
                        title: "🪫 SD Quality Video",
                        rowId: `${prefix}fbsd ${q}`
                    }] : [])
                ]
            },
            {
                title: "📂 Document Type",
                rows: [
                    ...(hasHD ? [{
                        title: "📂 HD Quality Document",
                        rowId: `${prefix}fbhd_doc ${q}`
                    }] : []),
                    ...(hasSD ? [{
                        title: "📂 SD Quality Document",
                        rowId: `${prefix}fbsd_doc ${q}`
                    }] : [])
                ]
            },
            {
  title: "🎵 Audio Type",
  rows: [
    ...(hasAudio ? [{
      title: "🎧 Audio File",
      rowId: `${prefix}fbaudio ${q}`
    }] : []),
    ...(hasAudio ? [{
      title: "🎤 Voice Note",
      rowId: `${prefix}fbvn ${q}`
    }] : [])
  ]
}
        ];

const selectionParams = {
        title: 'Download Format ❏',
        sections: [
            {
                title: '🎥 Video Format',
                rows: [
                    { title: 'HD Quality Video', description: 'HD quality video download', id: `${prefix}fbhd ${q}` },
                    { title: 'SD Quality Video', description: 'SD quality video download', id: `${prefix}fbsd ${q}` }
                ]
            },
            {
                title: '📂 Document Format',
                rows: [
                    { title: 'HD Quality Video', description: 'HD quality video download', id: `${prefix}fbhd_doc ${q}` },
                    { title: 'SD Quality Video', description: 'SD quality video download', id: `${prefix}fbsd_doc ${q}` }
                ]
            },
            {
                title: '🎧 Audio Format',
                rows: [
                    { title: 'Audio File', description: 'Audio file download', id: `${prefix}fbaudio ${q}` },
                    { title: 'Voice Note', description: 'Voice note download', id: `${prefix}fbvn ${q}` }
                ]
            }
        ]
    };
        
if (config.BUTTON === 'true') {
    await conn.sendMessage(from, {
        image: { url: thumb },
        caption,
        footer: footer,
        buttons: [
            {
                buttonId: `${prefix}ping`,
                buttonText: { displayText: 'PING CMD' },
                type: 1
            },
            {
                buttonId: `${prefix}menu`,
                buttonText: { displayText: 'MENU CMD' },
                type: 1
            },
            {
                buttonId: 'action',
                buttonText: { displayText: 'Download Option ❏' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify(selectionParams)
                }
            }
        ],
        headerType: 4,
    }, { quoted: mek });

} else {

        await conn.listMessage2(from, {
            image: { url: thumb },
            caption,
            footer: footer,
            buttonText: "\`Reply Below Number\` 🔢",
            sections
        }, mek);
}

    } catch (e) {
        console.log(e);
        reply("🚩 Facebook Download Error");
    }
});
                    
cmd({
  pattern: "fbhd",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const { footer, imageurl } = ownerdata;

    if (!q) return reply(urlneed);

    const res = await axios.get("https://api-site-pi.vercel.app/download/fbdown?url=" + encodeURIComponent(q));
    const data = res.data;

    if (!data?.status || !data?.result?.links?.hd) {
      return reply("*📛 HD not available*");
    }

    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

    await conn.sendMessage(from, {
      video: { url: data.result.links.hd },
      mimetype: "video/mp4",
      caption: `\`720p (SD)\`\n\n${footer}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("*🚩 HD Error*");
  }
});

cmd({
  pattern: "fbsd",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const { footer, imageurl } = ownerdata;

    if (!q) return reply(urlneed);

    const res = await axios.get("https://api-site-pi.vercel.app/download/fbdown?url=" + encodeURIComponent(q));
    const data = res.data;

    if (!data?.status || !data?.result?.links?.sd) {
      return reply("*📛 SD not available*");
    }

    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

    await conn.sendMessage(from, {
      video: { url: data.result.links.sd },
      mimetype: "video/mp4",
      caption: `\`360p (SD)\`\n\n${footer}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("*🚩 SD Error*");
  }
});

cmd({
  pattern: "fbhd_doc",
  react: "📂",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const { footer, imageurl } = ownerdata;

    if (!q) return reply(urlneed);

    const res = await axios.get("https://api-site-pi.vercel.app/download/fbdown?url=" + encodeURIComponent(q));
    const data = res.data;

    if (!data?.status || !data?.result?.links?.hd) {
      return reply("*📛 HD not available*");
    }

	  const thumbUrl = data.result.thumbnail;
	  const title = data.result.title;

    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

const imgRes = await axios.get(thumbUrl, { responseType: "arraybuffer" });
const resizedBotImg = await resizeImage(imgRes.data, 200, 200);
	  
    await conn.sendMessage(from, {
      document: { url: data.result.links.hd },
      mimetype: "video/mp4",
      fileName: `${title}.mp4`,
      jpegThumbnail: resizedBotImg,
     caption: `\`720p (HD)\`\n\n${footer}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("*🚩 HD DOC Error*");
  }
});

cmd({
  pattern: "fbsd_doc",
  react: "📂",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const { footer, imageurl } = ownerdata;

    if (!q) return reply(urlneed);

    const res = await axios.get("https://api-site-pi.vercel.app/download/fbdown?url=" + encodeURIComponent(q));
    const data = res.data;

    if (!data?.status || !data?.result?.links?.sd) {
      return reply("*📛 SD not available*");
    }

	  const thumbUrl = data.result.thumbnail;
	  const title = data.result.title;

    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

const imgRes = await axios.get(thumbUrl, { responseType: "arraybuffer" });
const resizedBotImg = await resizeImage(imgRes.data, 200, 200);
	  
    await conn.sendMessage(from, {
      document: { url: data.result.links.sd },
      mimetype: "video/mp4",
      fileName: `${title}.mp4`,
      jpegThumbnail: resizedBotImg,
     caption: `\`360p (HD)\`\n\n${footer}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("*🚩 SD DOC Error*");
  }
});

cmd({
  pattern: "fbaudio",
  react: "🎧",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

    if (!q) return reply(urlneed);

    const res = await axios.get("https://api-site-pi.vercel.app/download/fbdown?url=" + encodeURIComponent(q));
    const data = res.data;

    if (!data?.status || !data?.result?.links?.audio) {
      return reply("*📛 Audio not available*");
    }

    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

    await conn.sendMessage(from, {
      audio: { url: data.result.links.audio },
      mimetype: "audio/mpeg"
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("*🚩 Audio Error*");
  }
});

cmd({
  pattern: "fbvn",
  react: "📂",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {

    if (!q) return reply(urlneed);

    const res = await axios.get("https://api-site-pi.vercel.app/download/fbdown?url=" + encodeURIComponent(q));
    const data = res.data;

    if (!data?.status || !data?.result?.links?.audio) {
      return reply("*📛 Audio not available*");
    }

    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });
	  
    await conn.sendMessage(from, {
      audio: { url: data.result.links.audio },
      mimetype: "audio/mpeg",
      ptt: true
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("*🚩 Audio DOC Error*");
  }
});

//--------------- BOT' S TIKTOK DOWNLOADER ------------------//
cmd({
    pattern: "tiktok",    
  alias: ["tt","ttdl","tiktokdl"],
    react: '🎩',
    desc: ttdesc,
    category: "download",
    use: '.tiktok < tiktok url >',
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

	const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );

let caption = `*乂 TIK TOK DOWNLODER*

*○ \`Title\` : -* ${mov.title}
*○ \`Region\` : -* ${mov.regions}
*○ \`Duration\` : -* ${mov.runtime}
*○ \`Url\` : -* ${q}`;
	
const sections = [
    {
      title: "Normal Tipe",
      rows: [
        { title: "📼 Video No Watermark", rowId: `${prefix}ttdl1 ${q}` },
        { title: "📼 Video Watermark", rowId: `${prefix}ttdl2 ${q}` },
      ],
    },
    {
      title: "Document Tipe",
      rows: [
        { title: "📂 Video No Watermark", rowId: `${prefix}ttdl1d ${q}` },
        { title: "📂 Video Watermark", rowId: `${prefix}ttdl2d ${q}` },
      ]
    },
    {
      title: "Audio Tipe",
      rows: [
        { title: "🎧 Audio", rowId: `${prefix}ttdl3 ${q}` },
        { title: "🎤 Audio", rowId: `${prefix}ttdl3d ${q}` },
      ],
    }
  ];

const selectionParams = {
        title: 'Download Format ❏',
        sections: [
            {
                title: '🎥 Video Format',
                rows: [
                    { title: 'Video No Watermark', description: 'Video no watermark video download', id: `${prefix}ttdl1 ${q}` },
                    { title: 'Video Watermark', description: 'Video no watermark video download', id: `${prefix}ttdl2 ${q}` }
                     ]
            },
            {
                title: '📂 Document Format',
                rows: [
                    { title: 'Video No Watermark', description: 'Video no watermark video download', id: `${prefix}ttdl1d ${q}` },
                    { title: 'Video Watermark', description: 'Video no watermark video download', id: `${prefix}ttdl2d ${q}` }
                     ]
            },
            {
                title: '🎧 Audio Format',
                rows: [
                    { title: 'Audio File', description: 'Audio file download', id: `${prefix}ttdl3 ${q}` },
                    { title: 'Voice Note', description: 'Voice note download', id: `${prefix}ttdl3d ${q}` }
                ]
            }
        ]
    };
        
if (config.BUTTON === 'true') {
    await conn.sendMessage(from, {
        image: {url: mov.thumbnail},
        caption,
        footer: footer,
        buttons: [
            {
                buttonId: `${prefix}ping`,
                buttonText: { displayText: 'PING CMD' },
                type: 1
            },
            {
                buttonId: `${prefix}menu`,
                buttonText: { displayText: 'MENU CMD' },
                type: 1
            },
            {
                buttonId: 'action',
                buttonText: { displayText: 'Download Option ❏' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify(selectionParams)
                }
            }
        ],
        headerType: 4,
    }, { quoted: mek });

} else {

	await conn.listMessage2(from, {
      image: {url: mov.thumbnail},
      caption,
      footer: footer,
      title: "",
      buttonText: "\`Reply Below Number\` 🔢",
      sections,
      }, mek);
}

} catch (e) {
  reply(`Error !!\n\n*${e}*`)
  console.log(e)
}
})


cmd({
    pattern: "ttdl1",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
  
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );

await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });	

conn.sendMessage(from, { video: { url: mov.no_watermark }, mimetype: "video/mp4", caption: `📼 \`Video No Watermark\`\n\n${footer}` }, { quoted: mek })

  await conn.sendMessage(from, { react: { text: `✔️`, key: mek.key } })

} catch (e) {
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})

cmd({
    pattern: "ttdl2",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
  
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );

await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });	
conn.sendMessage(from, { video: { url: mov.watermark }, mimetype: "video/mp4", caption: `📼 \`Video Watermark\`\n\n${footer}` }, { quoted: mek })
  await conn.sendMessage(from, { react: { text: `✔️`, key: mek.key } })
} catch (e) {
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})

cmd({
    pattern: "ttdl3",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
  
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );


	await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
conn.sendMessage(from, { audio: { url: mov.music }, mimetype: "audio/mpeg" }, { quoted: mek })
 await conn.sendMessage(from, { react: { text: `✔️`, key: mek.key } })
} catch (e) {
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})

cmd({
    pattern: "ttdl1d",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
  
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );

const thumbUrl = mov.thumbnail;

await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });	

	const imgRes = await axios.get(thumbUrl, { responseType: "arraybuffer" });
const resizedBotImg = await resizeImage(imgRes.data, 200, 200);
	
	conn.sendMessage(from, {
	document: { url: mov.no_watermark },
    mimetype: "video/mp4",
    fileName: `${mov.title}.mp4`,
	jpegThumbnail: resizedBotImg,
    caption: `📼 \`Video No Watermark\`\n\n${footer}`
}, { quoted: mek })
	
	await conn.sendMessage(from, { react: { text: `✔️`, key: mek.key } })
} catch (e) {
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})

cmd({
    pattern: "ttdl2d",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
  
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	
const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );

const thumbUrl = mov.thumbnail;

await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });	

const imgRes = await axios.get(thumbUrl, { responseType: "arraybuffer" });
const resizedBotImg = await resizeImage(imgRes.data, 200, 200);
	
conn.sendMessage(from, {
	document: { url: mov.watermark },
    mimetype: "video/mp4",
    fileName: `${mov.title}.mp4`,
	jpegThumbnail: resizedBotImg,
    caption: `📼 \`Video Watermark\`\n\n${footer}`
}, { quoted: mek })
	
  await conn.sendMessage(from, { react: { text: `✔️`, key: mek.key } })
} catch (e) {
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})

cmd({
    pattern: "ttdl3d",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
  
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
  
  if (!q) return await reply(urlneed) 
      if (!q.includes('tiktok')) return await reply(urlneed) 

const mov = await fetchJson(
        `https://darksadasyt-tiktokdl.vercel.app/api/tiktok?q=${q}`
      );

	await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
	conn.sendMessage(from, { audio: { url: mov.music }, mimetype: "audio/mpeg", ptt: true, }, { quoted: mek })	
	await conn.sendMessage(from, { react: { text: `✔️`, key: mek.key } })
} catch (e) {
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})
    
//--------------- BOT' S APK DOWNLOADER ------------------//
cmd({
  pattern: "apk",
  react: '📦',
  desc: apkdesc,
  use: ".apkdl <apk search link>",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, prefix }) => {
  try {
    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, platform, aliveimg, jid,
	  jidname, channel, title
    } = ownerdata;
    
    if (!q) return reply(imgmsg);

    const apiUrl = `${apkapi}/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
      return reply(N_FOUND);
    }

    const apk = data.datalist.list[0];
    const apkSizeMB = (apk.size / (1024 * 1024)).toFixed(2); 

const caption = `*乂 APK DOWNLOADER*

*○ \`Name\` : -* ${apk.name} 
*○ \`Size\` : -* ${apkSizeMB} MB  
*○ \`Package\` : -* ${apk.package}  
*○ \`Last Update\` : -* ${apk.updated}  
*○ \`Developer\` : -* ${apk.developer.name}`;

    const buttons = [
      { buttonId: prefix + 'apkdl ' + apk.package, buttonText: { displayText: '📂 Download Apk' }, type: 1 },
      { buttonId: prefix + 'apkdtl ' + apk.package, buttonText: { displayText: '📑 Details Apk' }, type: 1 }
    ];

    
if (config.BUTTON === 'true') {
const buttonMessage1 = {
            image: { url: apk.icon },
            caption: caption,
            footer: footer,
            buttons: buttons,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage1, { quoted: mek });

} else {

    const buttonMessage = {
      image: { url: apk.icon },
      caption: caption,
      footer: footer,
      buttons: buttons,
      headerType: 4
    };
    return await conn.buttonMessage2(from, buttonMessage, mek);
}

  } catch (e) {
    console.error(e);
    reply(`*📛 APK Error : -* ${e.message || e.toString()}`);
  }
});

cmd({
  pattern: "apkdl",
  react: '⬇️',
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, prefix }) => {
  try {
    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, platform, aliveimg, jid,
	  jidname, channel, title
    } = ownerdata;
    
    if (!q) return reply(urlneed);

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
      return reply(N_FOUND);
    }

    const apk = data.datalist.list[0];
    const apkSizeMB = (apk.size / (1024 * 1024)).toFixed(2); 
	const thumbnail = apk.icon;

    await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key }})
    
    const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
        const resizedBotImg = await resizeImage(imgRes.data, 200, 200);
	
    await conn.sendMessage(from, {
      document: { url: apk.file.path_alt },
      fileName: `${apk.name}.apk`,
      mimetype: 'application/vnd.android.package-archive',
      jpegThumbnail: resizedBotImg,
      caption: `\`${apk.name}\`\n\n${footer}`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
    
  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message || e.toString()}`);
  }
});

cmd({
  pattern: "apkdtl",
  react: '⬇️',
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, prefix }) => {
  try {

    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, platform, aliveimg, jid,
	  jidname, channel, title
    } = ownerdata;
    
    if (!q) return reply(urlneed);

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
      return reply(N_FOUND);
    }

    const apk = data.datalist.list[0];
    const apkSizeMB = (apk.size / (1024 * 1024)).toFixed(2); 

    await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key }})
    
    await conn.sendMessage(from, {
      text: `*乂 APK DETAILS*

*○ \`Name\` : -* ${apk.name} 
*○ \`Size\` : -* ${apkSizeMB} MB  
*○ \`Package\` : -* ${apk.package}  
*○ \`Last Update\` : -* ${apk.updated}  
*○ \`Developer\` : -* ${apk.developer.name}

${footer}`,
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
    
  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message || e.toString()}`);
  }
});

//--------------- BOT' S MEDIAFIRE ------------------//
cmd({
  pattern: "mediafire",
  alias: ["mfire", "mf"],
  react: "📦",
  desc: mfdesc,
  category: "download",
  use: ".mediafire <mediafire url>",
  filename: __filename
},
async (conn, mek, m, { from, prefix, q, reply }) => {
  try {
      const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;
      
    if (!q || !q.includes("mediafire.com")) {
      return reply(urlneed)
    }

    const api = `https://hansamalofficial.vercel.app/download/mfire?url=${encodeURIComponent(q)}`
    const res = await axios.get(api)
    const data = res.data

    if (!data.status || !data.result) {
      return reply(N_FOUND)
    }

    const file = data.result

    const caption = `*乂 MEDIAFIRE DOWNLOADER*

*○ File Name : -* ${file.fileName}
*○ File Type : -* ${file.fileType}
*○ Size : -* ${file.size}
*○ Date : -* ${file.date}
*○ Url : -* ${q}`

    const buttons = [
      {
        buttonId: `${prefix}mfdl ${file.dl_link}`,
        buttonText: { displayText: "📂 Download File" },
        type: 1
      }
    ]

const buttons1 = [
      { buttonId: `${prefix}mfdl ${file.dl_link}`,  buttonText: { displayText: '📂 Download File' }, type: 1 },
      { buttonId: `${prefix}menu`, buttonText: { displayText: 'MENU CMD' }, type: 1 },
      { buttonId: `${prefix}ping`, buttonText: { displayText: 'PING CMD' }, type: 1 }
    ];

if (config.BUTTON === 'true') {
const buttonMessage1 = {
            image: { url: imageurl },
           caption,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage1, { quoted: mek });

} else {

    const buttonMessage = {
      image: { url: imageurl },
      caption,
      footer: footer,
      buttons,
      headerType: 4
    }

    await conn.buttonMessage2(from, buttonMessage, mek)
}

  } catch (e) {
    console.log(e)
    reply("*📛 MediaFire download error*")
  }
})

cmd({
  pattern: "mfdl",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
      const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;
      
    if (!q || !q.startsWith("http")) {
      return reply(N_FOUND)
    }

    await conn.sendMessage(from, {
      react: { text: "⬆️", key: mek.key }
    })

    const imgRes = await axios.get(imageurl, { responseType: "arraybuffer" });
    const resizedBotImg = await resizeImage(imgRes.data, 200, 200);
	  
    await conn.sendMessage(from, {
        document: { url: q },
        mimetype: "application/octet-stream",
        fileName: q.split("/").pop().replace(/\+/g, " "),
        jpegThumbnail: resizedBotImg,
        caption: `\`Mediafire\`\n\n${footer}`
      },
      { quoted: mek }
    )

    await conn.sendMessage(from, {
      react: { text: "✔️", key: mek.key }
    })

  } catch (e) {
    console.log(e)
    reply("*📛 Failed to download file*")
  }
})
