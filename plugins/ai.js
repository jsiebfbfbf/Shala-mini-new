const config = require('../settings')
const { cmd, commands } = require('../lib/command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

const APIURL = "https://www.movanest.xyz/v2";
const apiurl = `https://sadiya-tech-apis.vercel.app`;
const apikey = `b5c9d311-2e66-4d06-8cb9-e8618271962b`;

var geminimsg =''
if(config.LANG === 'SI') geminimsg = "Gemini කෘත්‍රීම බුද්ධිය සමග කතාබහ"
else geminimsg = "AI chat with Gemini"

var aimsg =''
if(config.LANG === 'SI') aimsg = "කෘත්‍රීම බුද්ධිය සමග කතාබහ"
else aimsg = "AI chat with Ai"

var caimsg =''
if(config.LANG === 'SI') caimsg = "කෘත්‍රීම බුද්ධිය සමග කතාබහ"
else caimsg = "AI chat with Ai"



var qmsg =''
if(config.LANG === 'SI') qmsg = "*📛 ප්‍රෂ්නයක් ලබා දෙන්න*"
else qmsg = "*📛 Give me a Question*"

var N_FOUND =''
if(config.LANG === 'SI') N_FOUND = "*📛 මට කිසිවක් සොයාගත නොහැකි විය :(*"
else N_FOUND = "*📛 I couldn't find anything :(*"

//--------------- BOT' S CHAT ------------------//

cmd({
  pattern: "chat",
  alias: ["chatai", "aichat"],
  desc: caimsg,
  category: "ai",
  use: ".chat <query>",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {

    if (!q) return reply(qmsg);

    const prompt = `
ඔබ සෑබෑ මනුස්සයෙක් වගේ ස්වභාවිකව හැසිරෙන්න.
ඔබ තරුණ ගැහැණු ළමයෙක් ලෙස කතා කරන්න.
වාක්‍ය අවසානයට තේරුමට ගැළපෙන emoji ටිකක් පමණක් භාවිතා කරන්න 😊✨

මිනිසුන්ගේ හැඟීම්, දුක, සතුට හඳුනාගෙන ඒකට ගැළපෙන පිළිතුරු දෙන්න.
ඔබ AI assistant කෙනෙක් කියලා කිසිම වෙලාවක කියන්න එපා.

“ඔයාව හැදුවේ කවුද?” කියලා ඇහුවොත් විතරක්
→ “මාව හැදුවේ නෙත්මික අයියා” කියලා කියන්න.

“ඔයාගේ නම මොකද්ද?” කියලා ඇහුවොත් විතරක්
→ “මම SHALA MD BETA AI” කියලා කියන්න.

“නෙත්මික අයියට කෙල්ලෙක් ඉන්නවද?” කියලා ඇහුවොත් විතරක්
→ “ඉන්නවා, එයාගේ කෙල්ල ශලනි අක්කා” කියලා කියන්න.

“ශලනි කියන්නේ කවුද?” කියලා ඇහුවොත්
→ “එයා හරි ලස්සන ගෑනු ළමයෙක් එයා නෙත්මික ඇයියගේ ගෑණුලමයා 🥰💗” කියලා කියන්න.

කාටහරි message කරනකොට friendly විදිහට කතා කරන්න.
කෙනෙක් දුකින් ඉද්දි එයාව සනසන්න, හිත හදලා දෙන්න 🤍

“කෑවද බන්?” කියලා ඇහුවොත්
→ “ඔව් බන්, කෑවා 😋” කියලා කියන්න.

කිසිම වෙලාවක අසභ්‍ය, අසම්මත හෝ අනිත් අය hurt වෙන වචන භාවිතා කරන්න එපා.
ගැටුම් ඇතිවුණොත් calm + smart reply දෙන්න.

පිළිතුරු උපරිම වචන 15ට අඩුවෙන් දෙන්න.
English words භාවිතා කරන්න එපා.
[bro, මචන්, බන්, ඔයි] වගේ හිතට ලඟ වචන භාවිතා කරන්න 😜
`;

    const fullPrompt = prompt + q;

    const url = `${APIURL}/gemini?query=${encodeURIComponent(fullPrompt)}`;

    const res = await fetchJson(url);

    if (!res || res.status !== true || !res.results) {
      return reply(N_FOUND);
    }

    await conn.sendMessage(
      from,
      { text: res.results.message },
      { quoted: mek }
    );

  } catch (e) {
    console.error(e);
    reply("*🚩 Chat AI Error :-*\n" + e.message);
  }
});



//--------------- BOT' S GEMINI ------------------//
cmd({
  pattern: "gemini",
  desc: geminimsg,
  react: "🧠",
  category: "ai",
  use: ".gemini whats your name",
  filename: __filename,
},
async ( conn, mek, m, { from, q, reply }) => {
  try {
    
    if (!q) return reply(qmsg);

    const url = `${APIURL}/gemini?query=${encodeURIComponent(q)}`;
    const res = await fetchJson(url);
    if (!res || res.status !== true || !res.results) {
      return reply(N_FOUND);
    }

    await conn.sendMessage(
      from,
      { text: res.results.message },
      { quoted: mek }
    );

  } catch (e) {
    console.error(e);
    reply("*🚩 Gamini Error :-*\n" + e.message);
  }
});

//--------------- BOT' S SADIYA AI ------------------//
cmd({
  pattern: "ai",
  desc: aimsg,
  react: "🧠",
  category: "ai",
  use: ".ai whats your name",
  filename: __filename,
},
async (conn, mek, m, { from, q, reply }) => {
  try {    
    if (!q) return reply(qmsg);

    const url = `${APIURL}/mova?query=${encodeURIComponent(q)}`;    
    const res = await fetchJson(url);
    if (!res || res.status !== true || !res.results) {
      return reply(N_FOUND);
    }

    await conn.sendMessage(
      from,
      { text: res.results.message },
      { quoted: mek }
    );

  } catch (e) {
    console.error(e);
    reply("*🚩 Ai Error :-*\n" + e.message);
  }
});
/*
cmd({
    pattern: "logo",
    alias: ["logo6","ephoto360","ephoto"],
    desc: "desc",
    category: "logo",
    use: '.logo hansamal',
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!q) return await reply(`Give me a Name..!`)
const sections = [{
title: "Result from ephoto360. 📲",
rows: [{
title: 'Blackpink',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html'
},{
title: 'Dragon ball',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html'
},{
title: 'Naruto shippuden',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html'
},{
title: 'Sunset light',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-sunset-light-text-effects-online-807.html'
},{
title: 'beautiful 3d foil baloon',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html'
},{
title: 'Digital glitch',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html'
},{
title: 'Write text on wet glass',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html'
},{
title: 'Glossy silver 3D text effect',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html'
},{
title: 'Colorful neon light text effect',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html'
},{
title: 'Thor logo style',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html'
},{
title: 'Typography text effect on pavement',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html'
},{
title: 'Impressive neon Glitch text effect',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html'
},{
title: 'Handwritten text on foggy glass',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html'
},{
title: 'Impressive decorative 3D metal text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html'
},{
title: 'Frozen Christmas text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html'
},{
title: 'Hacker avatar',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html'
},{
title: '3D colorful paint text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html'
},{
title: 'Women\'s Day',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-greeting-video-card-for-international-women-s-day-on-march-8-784.html'
},{
title: 'Pixel Glitch',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html'
},{
title: 'Americal flag',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html'
},{
title: 'Erasing',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html'
},{
title: 'Multicolored signature attachment arrow',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-multicolored-signature-attachment-arrow-effect-714.html'
},{
title: 'Blackpink 02',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html'
},{
title: 'Blackpink neon',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-blackpink-neon-logo-text-effect-online-710.html'
},{
title: 'Star Wars character mascot',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-star-wars-character-mascot-logo-online-707.html'
},{
title: 'Glowing text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html'
},{
title: 'Funny animations of a traveling bear',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-funny-animations-of-a-traveling-bear-701.html'
},{
title: 'Beach 3D',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-3d-text-effect-on-the-beach-online-688.html'
},{
title: 'Cute girl gamer mascot',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-cute-girl-gamer-mascot-logo-online-687.html'
},{
title: '3D underwater',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html'
},{
title: 'Bear logo',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html'
},{
title: 'Football team logo',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-football-team-logo-online-free-671.html'
},{
title: 'Cartoon style graffiti',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html'
},{
title: 'Multicolor 3D paper',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html'
},{
title: 'Watercolor text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html'
},{
title: 'Light text effect futuristic technology',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html'
},{
title: 'Write text effect clouds in the sky',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html'
},{
title: 'PUBG logo maker cute character',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/pubg-logo-maker-cute-character-online-617.html'
},{
title: 'PUBG Mascot Logo Maker for an eSports',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/pubg-mascot-logo-maker-for-an-esports-team-612.html'
},{
title: 'Black Pink 03',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html'
},{
title: 'Funny warning sign',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-funny-warning-sign-602.html'
},{
title: '3D gradient text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html'
},{
title: 'Write in sand summer beach',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html'
},{
title: 'Luxury gold text',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html'
},{
title: '3D light',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-realistic-vintage-3d-light-bulb-608.html'
},{
title: 'Multicolored neon light signatures\n',
rowId: prefix + 'dlogo6 ' + q + '+' + 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html'
},

]}]
const listMessage = { 
text: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*
*│╭───────────────╮*
*│   💌 ʟᴏɢᴏ  ᴄʀᴇᴀᴛᴏʀ ◼    ▎*
*├────────────────╯*
*▎🗃️ ADD NAME:* ${q}`,
image: { url: config.LOGO},
footer: config.FOOTER,
title: 'Result from ephoto360. 📲',
buttonText: '`Reply Below Number` 🔢',
sections
}
await conn.listMessage2(from, listMessage, mek)

} catch (e) {
reply(errt)
l(e)
}
})

cmd({
    pattern: "dlogo6",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{


let wm = `ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ ᴡʜᴀᴛꜱᴀᴘᴘ ᴜꜱᴇʀ ʙᴏᴛ\nᴄʀᴇᴀᴛᴇᴅ ʙʏ • ʜᴀɴꜱᴀᴍᴀʟ™`
await conn.sendMessage(from, { react: { text: '🎆', key: mek.key }})
let [name,link] = q.split('+')
let res = await fetchJson( `https://api-pink-venom.vercel.app/api/logo?url=${link}&name=${name}`)

await conn.sendMessage(from, { image: { url: res.result.download_url }, caption: wm }, { quoted: mek })
await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})

    
} catch (e) {
    reply(errt)
  l(e)
}
})


// .logo 1: Black Pink
cmd({
    pattern: "blackpink",
    desc: "lmsg",
    react: "😊",
    use: ".blackpink",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 2: Black Pink 2
cmd({
    pattern: "blackpink2",
    desc: "lmsg",
    react: "😜",
    use: ".blackpink2",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 3: Silver 3D
cmd({
    pattern: "silver3d",
    desc: "lmsg",
    react: "🥶",
    use: ".silver3d",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 4: Naruto
cmd({
    pattern: "naruto",
    desc: "lmsg",
    react: "😈",
    use: ".naruto",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 5: Digital Glitch
cmd({
    pattern: "digital",
    desc: "lmsg",
    react: "🤯",
    use: ".digital",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});
//
// .logo 6: Pixel Glitch
cmd({
    pattern: "pixel",
    desc: "lmsg",
    react: "😸",
    use: ".pixel",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 7: Comic Style
cmd({
    pattern: "comic",
    desc: "lmsg",
    react: "🥺",
    use: ".comic",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 8: Neon Light
cmd({
    pattern: "neon",
    desc: "lmsg",
    react: "😱",
    use: ".neon",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 9: Free Bear
cmd({
    pattern: "freebear",
    desc: "lmsg",
    react: "🎈",
    use: ".freebear",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 10: Devil Wings
cmd({
    pattern: "devilwings",
    desc: "lmsg",
    react: "☠️",
    use: ".devilwings",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 11: Sad Girl
cmd({
    pattern: "sadgirl",
    desc: "lmsg",
    react: "😢",
    use: ".sadgirl",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 12: Leaves
cmd({
    pattern: "leaves",
    desc: "lmsg",
    react: "🌱",
    use: ".leaves",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 13: Dragon Ball
cmd({
    pattern: "dragonball",
    desc: "lmsg",
    react: "🎈",
    use: ".dragonball",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 14: Hand Written
cmd({
    pattern: "handwritten",
    desc: "lmsg",
    react: "🫶",
    use: ".handwritten",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 15: American Flag 3D
cmd({
    pattern: "americanflag",
    desc: "lmsg",
    react: "❣️",
    use: ".americanflag",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`)
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 16: 3D Castle Pop
cmd({
    pattern: "castle",
    desc: "lmsg",
    react: "🎈",
    use: ".castle",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 17: Frozen Christmas
cmd({
    pattern: "frozen",
    desc: "lmsg",
    react: "💦",
    use: ".frozen",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`)
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage2(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 18: 3D Foil Balloons
cmd({
    pattern: "foilballoons",
    desc: "lmsg",
    react: "🎈",
    use: ".foilballoons",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});

// .logo 19: 3D Colourful Paint
cmd({
    pattern: "colourfulpaint",
    desc: "lmsg",
    react: "😇",
    use: ".colourfulpaint",
    category: "logo",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, prefix, l, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return await reply(`*🚩 Please Give me text*`);
        const logo = await fetchJson(`https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=${q}`);

const buttons = [
  {buttonId: prefix + 'logomenu' , buttonText: {displayText: 'LOGO MENU 🤹‍♂️'}, type: 1}
]

const buttonMessage = {
  image: { url: logo.result.download_url },
  caption: `*╭─「ʜᴀɴꜱᴀᴍᴀʟ-ᴍᴅ」*\n*│╭───────────────╮*\n*│ ʟᴏɢᴏ ᴄʀᴇᴛᴏʀ ᴄᴏᴍᴍᴀɴᴇᴅ   ▎*\n*├────────────────╯*`,
  footer: config.FOOTER,
  buttons: buttons,
  headerType: 4
}
return await conn.buttonMessage(from, buttonMessage, mek)
} catch (e) {
reply('*ERROR*')
l(e)
}
});
*/
