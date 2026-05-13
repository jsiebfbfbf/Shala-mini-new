const axios = require("axios");
const { cmd,commands } = require("../lib/command");
const config = require("../settings");
const {fetchJson} = require('../lib/functions');

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

var desc =''
if(config.LANG === 'SI') desc = "Ringtones සෙවීම සහ බගත කරයි."
else desc = "Search and download ringtones."

var twdesc =''
if(config.LANG === 'SI') twdesc = "Twitter මගින් විඩියෝ බගත කරයි."
else twdesc = "Download Twitter Video."



var imgmsg =''
if(config.LANG === 'SI') imgmsg = "*📛 කරුණාකර වචන කිහිපයක් ලියන්න*"
else imgmsg = "*📛 Please give me a text*"

var urlneed =''
if(config.LANG === 'SI') urlneed = "*📛 කරුණාකර url එකක් ලබා දෙන්න*"
else urlneed = "*📛 Please give me a url*"

var N_FOUND =''
if(config.LANG === 'SI') N_FOUND = "*📛 මට කිසිවක් සොයාගත නොහැකි විය :(*"
else N_FOUND = "*📛 I couldn't find anything :(*"

//--------------- Get Ringtones ----------------//
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

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        if (!q) return reply(imgmsg);

        const api = `https://www.movanest.xyz/v2/ringtone?title=${encodeURIComponent(q)}`;
        const res = (await axios.get(api)).data;

        if (!res.status || !res.results.length) {
            return reply(N_FOUND);
        }

        const results = res.results.slice(0, 10);

        const sections = [
            {
                title: "🎧 Ringtone List",
                rows: results.map((r, i) => ({
                    title: r.title,
                    description: "Tap to send ringtone",
                    id: `${prefix}getringtone ${r.audio}`
                }))
            }
        ];

        const selectionParams = {
            title: 'Select Ringtone ❏',
            sections: [
                {
                    title: "Available Ringtones",
                    rows: results.map((r, i) => ({
                        title: r.title,
                        description: r.audio.substring(0, 40),
                        id: `${prefix}getringtone ${r.audio}`
                    }))
                }
            ]
        };

        const caption = `*乂 YOUTUBE VIDEO DOWNLOADER*

*○ \`Title\` : -* ${q}
*○ \`Title\` : -* ${results.length}`;

        if (config.BUTTON === 'true') {

            await conn.sendMessage(from, {
                text: caption,
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
                        buttonText: { displayText: 'Select Ringtone ❏' },
                        type: 4,
                        nativeFlowInfo: {
                            name: 'single_select',
                            paramsJson: JSON.stringify(selectionParams)
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

        const audioUrl = args[0];

        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg"
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("*❌ Error*");
    }
});

//--------------- Get Twitter video ----------------//
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

        const {
            footer
        } = ownerdata;

        if (!q) return reply(urlneed);

        const apiUrl = `https://www.movanest.xyz/v2/ssstwitter?url=${encodeURIComponent(q)}`;

        const json = await fetchJson(apiUrl);

        if (!json.status || !json.results?.url) {
            return reply(N_FOUND);
        }

        const videoUrl = json.results.url;

        const caption = `*乂 TWITTER VIDEO DOWNLOADER*\n\n○ \`Url\` : -* ${q}`;
      
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `🎥 *Twitter Video Downloader*\n\n🔗 ${q}`,
            footer: footer || "Twitter Bot"
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✔", key: mek.key }
        });

    } catch (err) {
        console.log(err);
        reply("*📛 Video Error*");
    }
});
