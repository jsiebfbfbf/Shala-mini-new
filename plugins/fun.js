
const config = require('../settings')
const { cmd } = require('../lib/command')
const axios = require('axios');
//--------------- Get Sexy joke ----------------//
cmd({
    pattern: "gaychack",
    react: "🌈",
    desc: "Check gay percentage (mention / reply / number)",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {

    try {

        let user;

        // ✅ mention
        if (m.mentionedJid && m.mentionedJid[0]) {
            user = m.mentionedJid[0];
        }

        // ✅ reply
        else if (m.msg && m.msg.contextInfo && m.msg.contextInfo.participant) {
            user = m.msg.contextInfo.participant;
        }

        // ✅ number input
        else if (text) {
            let num = text.replace(/[^0-9]/g, "");
            if (num) user = num + "@s.whatsapp.net";
        }

        if (!user) {
            return reply("❌ Please mention, reply or give a number!\nExample:\n.gaychack @user\n.gaychack 947XXXXXXXX");
        }

        const percent = Math.floor(Math.random() * 101);

        let name = user.split("@")[0];

        let msg = `🌈 *ඔයා කොච්චර Gay ද බලමු.*\n\n`;
        msg += `👤 User: @${name}\n`;
        msg += `📊 Result: *${percent}%*\n\n`;

        if (percent < 30) {
            msg += "😎 Low vibes\n\n*ඔයානම් Gay නෙමෙයි වගේ.☺️🩷*";
        } else if (percent < 70) {
            msg += "😰 Medium vibes\n\n*ඔයා දැයාට දැන්ම ප්‍රතිකාර අවශ්‍යයි.තව ටික දවසක් ගියොත් ඔයා හොදටම Gay වෙයි 😂*";
        } else {
            msg += "🤣 High vibes\n\nකතා කරලා වැඩක් නෑ උබනම් Gay පුතෙක්.🤣😂*";
        }

        await conn.sendMessage(m.chat, {
            text: msg,
            mentions: [user]
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error occurred!");
    }
});

//--------------- Random Dog ----------------//
cmd({
    pattern: "dog",
    react: "🐶",
    desc: "Random dog image",
    category: "fun",
    filename: __filename
},
async (conn, mek, m) => {
    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

    const res = await axios.get("https://dog.ceo/api/breeds/image/random");

    await conn.sendMessage(m.chat, {
        image: { url: res.data.message },
        caption: `*🐶 \`Random Dog\`*\n\n${footer}`
    });
});

//--------------- Random Joke ----------------//
cmd({
    pattern: "joke",
    react: "😂",
    desc: "Get random joke",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
        const joke = `${res.data.setup}\n\n🤣 ${res.data.punchline}`;
        reply(joke);
    } catch {
        reply("❌ Joke load error!");
    }
});

//--------------- EMOJI PACKS ----------------//
cmd({
    pattern: "emenu",
    react: "🎭",
    desc: "Emoji animation menu",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { from, prefix, reply }) => {
    try {
        const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;

        const emojiCommands = [
            { title: "❤️ Love", cmd: "elove" },
            { title: "😢 Sad", cmd: "esad" },
            { title: "🔥 Fire", cmd: "efire" },
            { title: "😄 Happy", cmd: "ehappy" },
            { title: "😡 Angry", cmd: "eangry" },
            { title: "😎 Cool", cmd: "ecool" },
            { title: "🌧️ Rain", cmd: "erain" },
            { title: "⭐ Star", cmd: "estar" },
            { title: "🍔 Food", cmd: "efood" },
            { title: "🐶 Animal", cmd: "eanimal" }
        ];

        const sections = [
            {
                title: "🎭 Emoji Packs",
                rows: emojiCommands.map(e => ({
                    title: e.title,
                    description: "Tap to run animation",
                    id: `${prefix}${e.cmd}`
                }))
            }
        ];

        const selectionParams = {
            title: "Select Emoji ❏",
            sections: [
                {
                    title: "Available Packs",
                    rows: emojiCommands.map(e => ({
                        title: e.title,
                        description: e.cmd,
                        id: `${prefix}${e.cmd}`
                    }))
                }
            ]
        };

        const caption = `*乂 FUN EMOJI PACK*

*○ \`Total Packs\` : -* ${emojiCommands.length}

│ ❤️ .elove
│ 😢 .esad
│ 🔥 .efire
│ 😄 .ehappy
│ 😡 .eangry
│ 😎 .ecool
│ 🌧️ .erain
│ ⭐ .estar
│ 🍔 .efood
│ 🐶 .eanimal`;

        if (config.BUTTON === 'true') {

            await conn.sendMessage(from, {
                text: caption,
                footer: footer,
                buttons: [
                    {
                        buttonId: `${prefix}menu`,
                        buttonText: { displayText: 'MENU CMD' },
                        type: 1
                    },
                    {
                        buttonId: `${prefix}ping`,
                        buttonText: { displayText: 'PING CMD' },
                        type: 1
                    },
                    {
                        buttonId: 'action',
                        buttonText: { displayText: 'Select Emoji ❏' },
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
        reply("❌ Error loading emoji menu!");
    }
});

cmd({
    pattern: "elove",
    react: "❤️",
    desc: "Love emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["❤️","💖","💘","💝","💞","💕","💓","💗","🩷","💙"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "esad",
    react: "😢",
    desc: "Sad emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["😢","😭","🥺","😞","😔","😟","😿","💔","☹️","😩"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "efire",
    react: "🔥",
    desc: "Fire emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["🔥","💥","⚡","☄️","🚀","🌋","✨","💣","🔥","⚡"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "ehappy",
    react: "😄",
    desc: "Happy emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["😀","😃","😄","😁","😆","😊","🙂","😇","🥳","😎"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "eangry",
    react: "😡",
    desc: "Angry emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["😡","😠","🤬","😤","👿","💢","😾","🗯️","😒","😑"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "ecool",
    react: "😎",
    desc: "Cool emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["😎","🕶️","🔥","💯","⚡","🎧","🧢","😏","🤙","🚀"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "erain",
    react: "🌧️",
    desc: "Rain emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["🌧️","☔","🌦️","⛈️","💧","🌊","🌫️","❄️","🌨️","💦"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "estar",
    react: "⭐",
    desc: "Star emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["⭐","🌟","✨","💫","🌠","⭐","✨","🌟","💫","⭐"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "efood",
    react: "🍔",
    desc: "Food emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["🍕","🍔","🍟","🌭","🍗","🍩","🍪","🍫","🍿","🥤"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});

cmd({
    pattern: "eanimal",
    react: "🐶",
    desc: "Animal emoji animation",
    category: "fun",
    filename: __filename,
},
async (conn, mek, m) => {

    const emojis = ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯"];
    const sent = await conn.sendMessage(m.chat, { text: emojis[0] });

    for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(m.chat, { edit: sent.key, text: emojis[i] });
    }
});
