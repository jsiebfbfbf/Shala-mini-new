const os = require("os");
const moment = require("moment-timezone");
const axios = require("axios");
const { activeSockets } = require('../lib/sessionStore');
const config = require('../settings');
const fs = require('fs');
const { cmd, commands } = require('../lib/command')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, jsonformat} = require('../lib/functions')

var amsg =''
if(config.LANG === 'SI') amsg = 'බොට් ආරක්ෂිතව සජීවිකර ඇතිද නැද්ද පරීක්‍ෂා කරන්න.'
else amsg = "Check bot online or no."

var pmsg =''
if(config.LANG === 'SI') pmsg = 'එය Bot වේගය පරීක්ශාකරයි.'
else pmsg = "Check bot's speed."

var mmsg =''
if(config.LANG === 'SI') mmsg = 'එය Bot විදාන ලැයිස්තුව ලබාදෙයි.'
else mmsg = "Get bot's command list."
;
var smsg =''
if(config.LANG === 'SI') smsg = 'එය Bot link ලබා දෙයි.'
else smsg = "It gives bot link."

var nmsg =''
if(config.LANG === 'SI') nmsg = 'එය Bot ගැන කෙටි විස්තරයක් ලබා දෙයි.'
else nmsg = "It gives bot shot information."


var ssmsg =''
if(config.LANG === 'SI') ssmsg = 'එය Bot පද්දතියේ විස්තර ලබා දෙයි.'
else ssmsg = "Get bot's system information."

var omsg =''
if(config.LANG === 'SI') omsg = 'එය Bot නිර්මාතෘන්ගේ නම්බර් ලබා දෙයි.'
else omsg = "Get bot's owners number."

var cmsg =''
if(config.LANG === 'SI') cmsg = 'එය Bot ප්‍රදාන සමූහය ලබා දෙයි.'
else cmsg = "Get bot official channel."

var bmsg =''
if(config.LANG === 'SI') bmsg = 'එකම Message එක ශාල ප්‍රමානයක් යැවීමට.'
else bmsg = "Send a message multiple times."

var vvmsg =''
if(config.LANG === 'SI') vvmsg = 'එක පාරක් බලන Message ගන්න.'
else vvmsg = "Get View One Message."

var aamsg =''
if(config.LANG === 'SI') aamsg = 'ක්‍රියාකාරි Session ගනන ලබා දෙයි.'
else aamsg = "Get Active Session Count."

var sudesc =''
if(config.LANG === 'SI') sudesc = 'බොට්ගේ යාවත්කාලීන කිරීම් නැරබීමට.'
else sudesc = "Show bot updates."




var vrepmsg =''
if(config.LANG === 'SI') vrepmsg = '*📛 View One Message එකකට Reply කරන්න.*'
else vrepmsg = "*📛 Reply View One Message.*"

var repmsg =''
if(config.LANG === 'SI') repmsg = '*📛 ඔබ හිමිකරුවකු නොවේ.*'
else repmsg = "*📛 You are not the owners.*"

var brormsg =''
if(config.LANG === 'SI') brormsg = '*📛 කරුනාකර වචනයක් දෙන්න.*'
else brormsg = "*📛 Please Give me a text.*"

//--------------- BOT' S ALIVE ------------------//
cmd({
  pattern: "alive",
  alias: ["info", "online"],
  desc: amsg,
  category: "main",
  react: "👋",
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
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

   let hostname;
    const hostLen = os.hostname().length;
    if (hostLen === 12) hostname = "Replit";
    else if (hostLen === 36) hostname = "Heroku";
    else if (hostLen === 8) hostname = "Koyeb";
    else hostname = os.hostname();

    
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const uptime = runtime(process.uptime());

    
    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");
    const hour = moment().tz("Asia/Colombo").hour();
    const greetings =
      hour < 12 ? '*`සුභ උදෑසනක්` 🌄*' :
      hour < 17 ? '*`සුභ දහවලක්` 🏞️*' :
      hour < 20 ? '*`සුභ හැන්දෑවක්` 🌅*' :
                  '*`සුභ රාත්‍රියක්` 🌌*';

    
    let monospace = '```';
    const aliveMessage = `👋 ${greetings} ${monospace}${pushname}${monospace}

*╭──『 BOT'S INFO 』─◉◉➤*
*│👤 \`User\` : -* ${pushname}
*│🤖 \`Bot Name\` : -* ${botname}
*│🎡 \`Prefix\` : -* ${config.PREFIX}
*│🧬 \`Version\` : -* ${version}
*│💼 \`Work Type\` : -* ${config.WORK_TYPE}
*╰──────────────◉◉➤*

${alivemsg}`;

    
    const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "COMMAND MENU" }, type: 1 },
      { buttonId: `${prefix}ping`, buttonText: { displayText: "BOT\S SPEED" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}ping`, buttonText: { displayText: "PING CMD" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

    /*
    await conn.sendMessage(from, { 
      video: { url: alivevideo },
      mimetype: "video/mp4",
      ptv: true
    }, { quoted: mek });
*/

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: aliveimg },
            caption: aliveMessage,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

await conn.buttonMessage2(from, {
   text: aliveMessage,
   footer: footer,
   image: { url: aliveimg },
   buttons: buttons,
   headerType: 4,
}, mek);
}

  } catch (e) {
    console.error(e);
    reply(`*🚩 Alive Error :-*\n${e.message}`);
  }
});


//--------------- BOT' S ACTIVE SESSION  ------------------//
cmd({
    pattern: "active",
    react: "🟢",
    alias: ["activebot", "onlinebot"],
    desc: aamsg,
    category: "main",
    use: '.active',
    filename: __filename
},
async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

	const activeCount = activeSockets?.size || 0;
	  
    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
   
const shala = {
      key: {
        remoteJid: "status@broadcast",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "META_AI_SYSTEM"
      },
      message: {
        contactMessage: {
           displayName: botname,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:${botname};;;;
FN:${botname}
ORG:Meta Platforms
TEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002
END:VCARD`
        }
      }
    };
  

let ping = await conn.sendMessage(from , { text: '*_Chacke Your Active Session Count_* ❗'  }, { quoted: shala });
await conn.sendMessage(from, { text : '《 █▒▒▒▒▒▒▒▒▒▒▒》10%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ████▒▒▒▒▒▒▒▒》30%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ███████▒▒▒▒▒》50%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ██████████▒▒》80%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ████████████》100%' , edit : ping.key })
return await conn.sendMessage(from, { text : `*🟢 \`Active Session\` : - ${activeCount}*` , edit : ping.key })

} catch (e) {
reply('*🚩 Active Error!!*')
l(e)
}
});

//--------------- BOT' S SPEED ------------------//
cmd({
    pattern: "ping",
    react: "📍",
    alias: ["speed","sonic"],
    desc: pmsg,
    category: "main",
    use: '.ping',
    filename: __filename
},
async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

      const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header
    } = ownerdata;
      
  const shala = {
      key: {
        remoteJid: "status@broadcast",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "META_AI_SYSTEM"
      },
      message: {
        contactMessage: {
           displayName: botname,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:${botname};;;;
FN:${botname}
ORG:Meta Platforms
TEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002
END:VCARD`
        }
      }
    };
  
var inital = new Date().getTime();
let ping = await conn.sendMessage(from , { text: '*_Pinging to Loku Module..._* ❗'  }, { quoted: shala });
var final = new Date().getTime();
await conn.sendMessage(from, { text : '《 █▒▒▒▒▒▒▒▒▒▒▒》10%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ████▒▒▒▒▒▒▒▒》30%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ███████▒▒▒▒▒》50%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ██████████▒▒》80%' , edit : ping.key })
await conn.sendMessage(from, { text : '《 ████████████》100%' , edit : ping.key })
return await conn.sendMessage(from, { text : '*Pong '+ (final - inital) + ' Ms ⚡*' , edit : ping.key })
} catch (e) {
reply('*🚩 Ping Error!!*')
l(e)
}
});

//--------------- BOT' S MENU ------------------//
cmd({
  pattern: "menu",
  alias: ["list", "commands"],
  react: "🗃️",
  desc: mmsg,
  category: "main",
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {
    
    let ping = await conn.sendMessage(from, { text: '`LOADING`' }, { quoted: mek });
    await conn.sendMessage(from, { text: '`BOT/S MENU` ✅', edit: ping.key });

    let hostname;
    const hostLen = os.hostname().length;
    if (hostLen === 12) hostname = "Replit";
    else if (hostLen === 36) hostname = "Heroku";
    else if (hostLen === 8) hostname = "Koyeb";
    else hostname = os.hostname();
   
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const uptime = runtime(process.uptime());

    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");

    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, platform
    } = ownerdata;

    const buttons = [
      { buttonId: prefix + 'aimenu', buttonText: { displayText: 'AI COMMAND' }, type: 1 },
      { buttonId: prefix + 'downloadmenu', buttonText: { displayText: 'DOWNLOAD COMMAND' }, type: 1 },
      { buttonId: prefix + 'groupmenu', buttonText: { displayText: 'GROUP COMMAND' }, type: 1 },
      { buttonId: prefix + 'funmenu', buttonText: { displayText: 'FUN COMMAND' }, type: 1 },
      { buttonId: prefix + 'mainmenu', buttonText: { displayText: 'MAIN COMMAND' }, type: 1 },
      { buttonId: prefix + 'ownermenu', buttonText: { displayText: 'OWNER COMMAND' }, type: 1 },
      { buttonId: prefix + 'othermenu', buttonText: { displayText: 'OTHER COMMAND' }, type: 1 },
      { buttonId: prefix + 'searchmenu', buttonText: { displayText: 'SEARCH COMMAND' }, type: 1 }
  ]

    let monospace = '```';
const menuMessage = `*_👋 Hello,_* ${monospace}@${pushname}${monospace}

*╭──『 BOT'S INFO 』─◉◉➤*
*│👤 \`User\` : -* ${pushname}
*│🤖 \`Bot Name\` : -* ${botname}
*│🎡 \`Prefix\` : -* ${config.PREFIX}
*│🧬 \`Version\` : -* ${version}
*│💼 \`Work Type\` : -* ${config.WORK_TYPE}
*│🖥️ \`Platform\` : -* ${platform}
*│⏱️ \`Runtime\` : -* ${runtime(process.uptime())}
*│💾 \`Memory\` : -* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
*╰──────────────◉◉➤*

🥏 _Your fast and reliable all-in-one WhatsApp assistant — Shala MD BETA._`;
	  
let sections = [{
            title: "🔖 select your category",
            highlight_label: "SHALA-MD",
            rows: [
                { 
                    header: "Download",
                    title: "Download", 
                    description: "View download command", 
                    id: `${config.PREFIX}downloadmenu` 
                },
                { 
                    header: "Fun",
                    title: "Fun", 
                    description: "View fun command", 
                    id: `${config.PREFIX}funmenu` 
                },
                { 
                    header: "Search",
                    title: "Search", 
                    description: "View search command", 
                    id: `${config.PREFIX}searchmenu` 
                },
                { 
                    header: "Group",
                    title: "Group", 
                    description: "View group command", 
                    id: `${config.PREFIX}groupmenu` 
                },
                { 
                    header: "Owner",
                    title: "Owner", 
                    description: "View owner command", 
                    id: `${config.PREFIX}ownermenu` 
                },
                 { 
                    header: "Ai",
                    title: "Ai", 
                    description: "View ai command", 
                    id: `${config.PREFIX}aimenu` 
                },
                { 
                    header: "Other",
                    title: "Other", 
                    description: "View other command", 
                    id: `${config.PREFIX}othermenu` 
                },
                { 
                    header: "Main",
                    title: "Main", 
                    description: "View owner command", 
                    id: `${config.PREFIX}mainmenu` 
                },
                { 
                    header: "News",
                    title: "News", 
                    description: "View news command", 
                    id: `${config.PREFIX}newsmenu` 
                }
            ]
        }];

let buttons1 = [
            {
                buttonId: "action",
                buttonText: { displayText: "Click Here ❏" },
                type: 4,
                nativeFlowInfo: {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "Select Category ❏",
                        sections: sections
                    })
                }
            },
            { buttonId: `${config.PREFIX}ping`, buttonText: { displayText: 'PING CMD' }, type: 1 },
            { buttonId: `${config.PREFIX}system`, buttonText: { displayText: 'SYSTEM CMD' }, type: 1 }
        ];

if (config.BUTTON === 'true') {
const buttonMessage1 = {
            image: { url: imageurl },
            caption: menuMessage,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage1, { quoted: mek });

} else {

    const buttonMessage = {
      image: { url: imageurl },
      caption: menuMessage,
      footer: footer,
      buttons: buttons,
      headerType: 4
    };

    await conn.buttonMessage2(from, buttonMessage, mek);
    }

  } catch (e) {
    console.error(e);
    reply(`*🚩 Menu Error :-*\n${e.message}`);
  }
});

//--------------- BOT' S OWNER ------------------//
cmd({
    pattern: "owner",
    desc: omsg,
    category: "main",
	react: "👨‍💻",
    use: '.owner',
    alias: ["head"],
    filename: __filename,
}, 

async (conn, mek, m, { from, quoted, reply }) => {
    try {

		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, platform
    } = ownerdata;

		const shala = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: botname,
                    vcard: 
`BEGIN:VCARD
VERSION:3.0
N:;${botname};;;
FN:${botname}
TEL;waid=94704227534:+94704227534
END:VCARD`
                }
            }
        };
		
        const vcard1 = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + 'FN:ꜱʟ ɴᴇᴛʜᴜ ᴍᴀx\n'
            + 'ORG:ꜱʟ ɴᴇᴛʜᴜ ᴍᴀx\n'
            + 'TEL;type=CELL;type=VOICE;waid=94704227534:+94 70 422 7534\n'
            + 'EMAIL:nethumd65@gmail.com\n'
            + 'END:VCARD';

        const vcard2 = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + 'FN:ɴᴇᴛʜᴍɪᴋᴀ ᴋᴀᴜꜱʜᴀʟʏᴀ\n'
            + 'ORG:ɴᴇᴛʜᴍɪᴋᴀ ᴋᴀᴜꜱʜᴀʟʏᴀ\n'
            + 'TEL;type=CELL;type=VOICE;waid=94741245331:+94 74 124 5331\n'
            + 'EMAIL:nethmikakaushalya10@gmail.com\n'
            + 'END:VCARD';

        const vcard3 = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + 'FN:ɴᴇᴛʜᴍɪᴋᴀ ᴋᴀᴜꜱʜᴀʟʏᴀ\n'
            + 'ORG:ɴᴇᴛʜᴍɪᴋᴀ ᴋᴀᴜꜱʜᴀʟʏᴀ\n'
            + 'TEL;type=CELL;type=VOICE;waid=94787072548:+94 78 707 2548\n'
            + 'EMAIL:imalkahansamal@gmail.com\n'
            + 'END:VCARD';


        await conn.sendMessage(from, {
            contacts: {
                displayName: "BOT/S HELPERS",
                contacts: [
                    { vcard: vcard1 },
                    { vcard: vcard2 },
                    { vcard: vcard3 }
                ]
            }
        }, { quoted: shala });        

    } catch (e) {
        console.log(e);
        reply(`*🚩 Owner Error :-*\n${e}`);
    }
});

//--------------- BOT' S SYSTEM ------------------//
cmd({
    pattern: "system",
    react: "🧬",
    alias: ["status", "os"],
    desc: ssmsg,
    category: "main",
    use: '.system',
    filename: __filename
},
async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

        const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
        const time = moment().tz("Asia/Colombo").format("HH:mm:ss");

        let hostname;
    const hostLen = os.hostname().length;
    if (hostLen === 12) hostname = "Replit";
    else if (hostLen === 36) hostname = "Heroku";
    else if (hostLen === 8) hostname = "Koyeb";
    else hostname = os.hostname();
    
    const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());

    
    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
   
const systemMessage = `
*╭──『 SYSTEM INFO 』─◉◉➤*
*│ 📌 \`CREATOR\` : -* ${ownername}
*│ 📞 \`Hotline\` : -* ${ownernumber}
*│ 📅 \`Date\` : -* ${date}
*│ ⌚ \`Time\` : -* ${time}
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*│ 🖥️ \`Platform\` : -* ${platform}
*│ 🧬 \`Version\` : -* ${version}
*╰──────────────◉◉➤*

${footer}`;

        await conn.sendMessage(from, {
            image: { url: imageurl },
            caption: systemMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: false
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`*🚩 System Error :-*\n${e.message}`);
    }
});

//--------------- BOT' S BOOM MG ------------------//
cmd({
    pattern: "boom",
    desc: bmsg,
    react: "📨",
    category: "main",
    use: '.boom',
    filename: __filename
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    
    if (!isOwner) {
        return await conn.sendMessage(from, { text: repmsg });
    }

    if (args.length < 2) {
        return await conn.sendMessage(from, { text: "*📌 \`Usage\` :-* .boom <count> <message>\n*Example :-* .boom 500 Hello!" });
    }
    const count = parseInt(args[0]);
    if (isNaN(count) || count <= 0 || count > 500) {
        return await conn.sendMessage(from, { text: "*📛 Please provide a valid count (1-500).*" });
    }
    const message = args.slice(1).join(" ");
    for (let i = 0; i < count; i++) {
        await conn.sendMessage(from, { text: message });
        await new Promise(resolve => setTimeout(resolve, 500)); 
    }
});

//--------------- Get Show bots update  ----------------//
cmd({
    pattern: "update",
    react: "♻️",
    desc: sudesc,
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, pushname, prefix }) => {
    try {
    
    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");
    const hour = moment().tz("Asia/Colombo").hour();
    const greetings =
      hour < 12 ? '*`සුභ උදෑසනක්` 🌄*' :
      hour < 17 ? '*`සුභ දහවලක්` 🏞️*' :
      hour < 20 ? '*`සුභ හැන්දෑවක්` 🌅*' :
                  '*`සුභ රාත්‍රියක්` 🌌*';

const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform, bots_update
    } = ownerdata;

const shala = {
      key: {
        remoteJid: "status@broadcast",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "META_AI_SYSTEM"
      },
      message: {
        contactMessage: {
           displayName: botname,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:${botname};;;;
FN:${botname}
ORG:Meta Platforms
TEL;type=CELL;type=VOICE;waid=13135550002:+1 313 555 0002
END:VCARD`
        }
      }
    };
  
        const name = pushname || "User";

        const msg = `*👋 _Hello_ ${name}* ${greetings}

${bots_update }

${footer}`;

       
        await conn.sendMessage(from, {
            image: { url: imageurl },
            caption: caption
        }, { quoted: shala });

    } catch (e) {
        console.log(e);
    }
});

//--------------- BOT' S VIEW ONE MESSAGE ------------------//
cmd({
    pattern: "vv",
    react: "👁️",
    alias: ["retrive", "viewonce"],
    desc: vvmsg,
    category: "main",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {

		const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      aliveimg, footer
    } = ownerdata;

        const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return reply(vrepmsg);
        }

        let message = quotedMsg;

        if (message.viewOnceMessage) {
            message = message.viewOnceMessage.message;
        }

        if (message.viewOnceMessageV2) {
            message = message.viewOnceMessageV2.message;
        }

        const type = Object.keys(message)[0];
        if (!type) return reply("*📛 Invalid message.*");

        const msgData = message[type];

        if (!["imageMessage", "videoMessage", "audioMessage"].includes(type)) {
            return reply("*📛 Not Support This Media Type*");
        }

        const stream = await downloadContentFromMessage(
            msgData,
            type.replace("Message", "").toLowerCase()
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        let sendObj = {};

        if (type === "imageMessage") {
            sendObj.image = buffer;
            sendObj.caption = `${msgData.caption || "\`Dane\` ✅"}\n\n${footer}`;
        } 
        else if (type === "videoMessage") {
            sendObj.video = buffer;
            sendObj.caption = `${msgData.caption || "\`Dane\` ✅"}\n\n${footer}`;
        } 
        else if (type === "audioMessage") {
            sendObj.audio = buffer;
            sendObj.mimetype = msgData.mimetype;
            sendObj.ptt = msgData.ptt || false;
        }

        await conn.sendMessage(mek.key.remoteJid, sendObj, { quoted: mek });

    } catch (e) {
        console.log("*🚩 VV Error : -*", e);
        reply("*🚩 VV Error*");
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "mainmenu",
    react: "🏡",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Mᴀɪɴ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'main'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S OWNER MENU ------------------//
cmd({
    pattern: "ownermenu",
    react: "🔰",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Oᴡɴᴇʀ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'owner'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "othermenu",
    react: "🧾",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Oᴛʜᴇʀ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'other'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];
const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "aimenu",
    react: "🧠",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Aɪ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'ai'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "downloadmenu",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Dᴏᴡɴʟᴏᴀᴅ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'download'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "groupmenu",
    react: "👥",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Gʀᴏᴜᴘ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'group'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "convertmenu",
    react: "🔄",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Cᴏɴᴠᴇʀᴛ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'convert'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Help Menu Error : -*\n${e.message}`);
    }
});

//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "funmenu",
    react: "📚",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Fᴜɴ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'fun'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Fun Menu Error : -*\n${e.message}`);
    }
});


//--------------- BOT' S MAIN MENU ------------------//
cmd({
    pattern: "newsmenu",
    react: "📰",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
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

	const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotalMB = Math.round(os.totalmem() / 1024 / 1024);
    const ram = `${ramUsedMB} MB / ${ramTotalMB} MB`;
    const rtime = await runtime(process.uptime());
    
let menuc = `*_🥏 ${botname} Nᴇᴡꜱ Mᴇɴᴜ_* 

*╭──────────────◉◉➤*
*│ 🕒 \`Uptime\` : -* ${rtime}
*│ 💾 \`RAM Usage\` : -* ${ram}
*╰──────────────◉◉➤*

`
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'news'){
  if(!commands[i].dontAddCommandList){
menuc += `*│ 📍 Command :* \`${commands[i].pattern}\`
*│ 📃 Usage :* *${commands[i].desc}*\n\n`}}};

	const buttons = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU COMMAND" }, type: 1 },
	  { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CENTER" }, type: 1 }
    ];

const buttons1 = [
      { buttonId: `${prefix}menu`, buttonText: { displayText: "MENU CMD" }, type: 1 },
      { buttonId: `${prefix}help`, buttonText: { displayText: "HELP CMD" }, type: 1 }
    ];

if (config.BUTTON === 'true') {

const buttonMessage = {
            image: { url: imageurl },
            caption: menuc,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

	await conn.buttonMessage2(from, {
      text: menuc,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

    } catch (e) {
        console.error(e);
        reply(`*🚩 Fun Menu Error : -*\n${e.message}`);
    }
});

