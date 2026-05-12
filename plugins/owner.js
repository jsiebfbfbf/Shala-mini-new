const axios = require("axios");
const config = require("../settings");
const { cmd, commands } = require("../lib/command");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, Func, fetchJson, } = require("../lib/functions");


var jidmsg =''
if(config.LANG === 'SI') jidmsg = 'Bot මගින් පුද්ගලික සහ සමූහ සබැදි ලබාගනි.'
else jidmsg = "Get personal and group links through the bot.."

var gjidmsg =''
if(config.LANG === 'SI') gjidmsg = 'Bot මගින් සියලු සමූහවල සබැදි ලබාගනි.'
else gjidmsg = "Get all group links through the bot.."

var chr1k =''
if(config.LANG === 'SI') chr1k = 'Bot මගින් Message එකකට React 1000 ක් යවන්න.'
else chr1k = "Send 1K reacts to a message."

var chr =''
if(config.LANG === 'SI') chr = 'Bot මගින් Channel message එකකට React කරන්න.'
else chr = "React to a message in a WhatsApp Channel."

var bromsg =''
if(config.LANG === 'SI') bromsg = 'සෑම සමූහයකටම එකවර පනිවිඩයක් යැවීමට.'
else bromsg = "Broadcast a message to all groups."

var iddesc =''
if(config.LANG === 'SI') iddesc = 'Bot මගින් Reply කරපු message එකේ ID එක ගන්න.'
else iddesc = "Bots Get message ID."

var fdesc =''
if(config.LANG === 'SI') fdesc = 'Bot මගින් Newsletter ID එකෙන් channel follow කරන්න.'
else fdesc = "Bots Follow Channel in Newsletter ID."

var acinvitedesc =''
if(config.LANG === 'SI') acinvitedesc = 'Bot මගින් Channel invite link accept කරන්න.'
else acinvitedesc = "Bots Channel invite link accept."

var bromsg =''
if(config.LANG === 'SI') bromsg = 'සෑම සමූහයකටම එකවර පනිවිඩයක් යැවීමට.'
else bromsg = "Broadcast a message to all groups."





var shutmsg =''
if(config.LANG === 'SI') shutmsg = 'Bot ක්‍රියා විරහිත කිරීමට.'
else shutmsg = "Shutdown the bot."

var blomsg =''
if(config.LANG === 'SI') blomsg = 'පාරිශීලකයකු Block කිරීමට.'
else blomsg = "Block a user."

var unblomsg =''
if(config.LANG === 'SI') unblomsg = 'පාරිශීලකයකු Unblock කිරීමට.'
else unblomsg = "Unblock a user."

var clearmsg =''
if(config.LANG === 'SI') clearmsg = 'Bot ගේ සම්පූර්න සකච්චා මැකීමට.'
else clearmsg = "Clear all chats from the bot."

var sppmsg =''
if(config.LANG === 'SI') sppmsg = 'Bot ගේ Whatsapp චායාරූපය වෙනස් කිරීමට.'
else sppmsg = "Set bot profile picture."

var repmsg =''
if(config.LANG === 'SI') repmsg = '*🚫 ඔබ හිමිකරු නොවේ*'
else repmsg = "*🚫 You are not the owner*"

var brormsg =''
if(config.LANG === 'SI') brormsg = '*🚫 කරුනාකර වචනයක් දෙන්න*'
else brormsg = "*🚫 Please Give me a text*"


//--------------- Get Jid ----------------//
cmd({
    pattern: "jid",
    desc: jidmsg,
    category: "owner",
    react: "🆔",
    use: ".jid",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(repmsg);
    
    reply(`*🆔 \`Chat JID\` : -* ${from}`);
});

//--------------- Get All Group Jids ----------------//
cmd({
    pattern: "gjid",
    desc: gjidmsg,
    category: "owner",
    react: "🆔",
    use: ".gjid",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply(repmsg);

    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups).join('\n');
    reply(`*○ \`Group JIDs\` : -*\n\n${groupJids}`);
});

//--------------- Forverd Message  ----------------//
cmd({
    pattern: "forward",
    react: "⏩",
    alias: ["f"],
    desc: "forwerd film and msg",
    use: ".f jid",
    category: "owner",
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, isSudo, isOwner, isMe, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isIsuru, isTharu,  isSupporters, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

if (!isOwner) return reply(repmsg);

	if (!q || !m.quoted) {
return reply("*Please give me a Jid and Quote a Message to continue.*");
}
  let jidList = q.split(',').map(jid => jid.trim());
  if (jidList.length === 0) {
    return reply("*Provide at least one Valid Jid. ⁉️*");
  }

  let Opts = {
    key: mek.quoted?.["fakeObj"]?.["key"]
  };
  
  if (mek.quoted.documentWithCaptionMessage?.message?.documentMessage) {
    let docMessage = mek.quoted.documentWithCaptionMessage.message.documentMessage;
    const mimeTypes = require("mime-types");
    let ext = mimeTypes.extension(docMessage.mimetype) || "file";
    docMessage.fileName = docMessage.fileName || `file.${ext}`;
  }
  
  Opts.message = mek.quoted;
  let successfulJIDs = [];
  for (let i of jidList) {
try {
await conn.forwardMessage(i, Opts, false);
successfulJIDs.push(i);
} catch (error) {
console.log(e);
}
}

if (successfulJIDs.length > 0) {
return reply(`*✅ Message Forwarded*\n\n` + successfulJIDs.join("\n"))
} else {
console.log(e)
}
});





cmd({
  pattern: "rename",
  alias: ["r"],
  desc: "Forward media/messages with optional rename and caption",
  use: ".r jid1,jid2 | filename (without ext) | new caption (quote a message)",
  category: "main",
  filename: __filename
},
async (conn, mek, m, {
  reply, isSudo, isOwner, isMe, q
}) => {
	if (!isOwner) return reply(repmsg);

	if (!q || !m.quoted) {
    return reply("*Please provide JIDs and quote a message to forward.*");
  }

  const mime = require("mime-types");

  // Split into jid list, optional filename, and optional caption
  const parts = q.split('|').map(part => part.trim());
  const jidPart = parts[0];
  const newFileName = parts[1]; // only name without extension
  const newCaption = parts[2];  // optional

  const jidList = jidPart.split(',').map(j => j.trim()).filter(j => j);
  if (jidList.length === 0) {
    return reply("*Provide at least one valid JID.*");
  }

  const quotedMsg = mek.quoted;
  let messageContent = quotedMsg?.message || quotedMsg;

  const opts = {
    key: quotedMsg?.fakeObj?.key,
    message: JSON.parse(JSON.stringify(messageContent)) // clone safely
  };

  // If it's a document, rename the file
  if (opts.message?.documentMessage) {
    const docMsg = opts.message.documentMessage;
    const ext = mime.extension(docMsg.mimetype) || "file"; // get correct extension
    if (newFileName) {
      docMsg.fileName = `${newFileName}.${ext}`; // filename + original mimetype ext
    } else {
      docMsg.fileName = `Forwarded_File_${Date.now()}.${ext}`; // default if no name given
    }
  }

  // If it's a media with caption, replace caption
  if (newCaption) {
    const typesWithCaption = ["imageMessage", "videoMessage", "documentMessage", "audioMessage"];
    for (const type of typesWithCaption) {
      if (opts.message[type]) {
        opts.message[type].caption = newCaption;
      }
    }
  }

  const successful = [];

  for (let jid of jidList) {
    try {
      await conn.forwardMessage(jid, opts, false);
      successful.push(jid);
    } catch (err) {
      console.log(`❌ Failed to forward to ${jid}:`, err);
    }
  }

  if (successful.length > 0) {
    return reply(`✅ *Message forwarded to:*\n${successful.join("\n")}`);
  } else {
    return reply("❌ *Failed to forward message to any JID.*");
  }
});

//--------------- Get Jid ----------------//
cmd({
    pattern: "broadcast",
    desc: bromsg,
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply(repmsg);

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
  
    if (args.length === 0) return reply(brormsg);

    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());

    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: shala });
    }

    return reply("📢 Message broadcasted to all groups.");
});

//--------------- Channel 1K React ----------------//
cmd({
    pattern: "1kreact",
    alias: ["chr1k"],
    react: "📕",
    use: ".channelreact <link>,<emoji1> <emoji2> ...",
    desc: chr1k,
    category: "main",
    filename: __filename,
}, 
async (conn, mek, m, { q, isOwner, isSudo, isMe, reply }) => {
    try {
        if (!isOwner) return reply(repmsg);

        if (!q || !q.includes(',')) 
            return reply("*📛 \`Format\` - :* .channelreact <link>,<emoji1> <emoji2>");

        const [link, emojisRaw] = q.split(',');
        const emojis = emojisRaw.trim().split(/\s+/);

        if (!emojis.length) return reply("*📛 Provide at least one emoji.*");

        const parts = link.split('/');
        const channelId = parts[4];
        const messageId = parts[5];

        if (!channelId || !messageId)
            return reply("*📛 Could not detect channel/message ID.*");

        const meta = await conn.newsletterMetadata("invite", channelId);
        const reactsPerEmoji = Math.floor(1000 / emojis.length);

        reply(`*⏳ Sending 1K reacts using - :* ${emojis.join(" ")} ...`);

        for (const emoji of emojis) {
            for (let i = 0; i < reactsPerEmoji; i++) {
                try {
                    await conn.newsletterReactMessage(meta.id, messageId, emoji.trim());
                    await new Promise(r => setTimeout(r, 50));
                } catch (e) {
                    console.log("*🚩 React failed - :*", e.message);
                }
            }
        }

        reply(`*✅ 1K reacts completed using - :* ${emojis.join(" ")}`);
    } catch (err) {
        console.log(err);
        reply("*🚩 Error - :* " + err.message);
    }
});

//--------------- Channel React ----------------//
cmd({
    pattern: "channelreact",
    alias: ["chr"],
    react: "📕",
    use: ".channelreact <link>,<emoji>",
    desc: chr,
    category: "main",
    filename: __filename,
},
async (conn, mek, m, { q, isSudo, isOwner, isMe, reply }) => {
    try {
        if (!isOwner) return reply(repmsg);
        
        if (!q || typeof q !== 'string' || !q.includes(',')) {
            return reply('*📛 \`Format\` - :* .channelreact <link>,<emoji>');
        }

        let [link, react] = q.split(',');
        if (!link || !react) return reply('*📛 Missing link or emoji.*');
        if (!link.startsWith('https://whatsapp.com/channel/')) {
            return reply('*📛 Invalid channel link.*');
        }

        const parts = link.split('/');
        const channelId = parts[4];
        const messageId = parts[5];

        const res = await conn.newsletterMetadata("invite", channelId);
        await conn.newsletterReactMessage(res.id, messageId, react.trim());

        reply(`*✅ Reacted with ${react.trim()} to the message.*`);
    } catch (e) {
        console.log(e);
        reply('*🚩 Error - :* ' + e.message);
    }
});


//--------------- Get ID ----------------//
cmd({
    pattern: "id",
    react: "⚜",
    alias: ["getdeviceid"],
    desc: iddesc,
    category: "main",
    use: '.id',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, isSudo, body, isCmd, msr, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
if (!isOwner) return reply(repmsg);
if ( !m.quoted ) return reply('*📛 Please reply a Message.*')
reply(m.quoted.id)
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
});

//--------------- Channel Follow  ----------------//
cmd({
    pattern: "follow",
    react: "ℹ️",
    alias: ["fl"],
    desc: fdesc,
    category: "main",
    use: ".follow",
    filename: __filename
}, async (conn, mek, m, {
    from, l, quoted, isSudo, body, isCmd, msr, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
    isMe, groupMetadata, groupName, participants, groupAdmins,
    isBotAdmins, isCreator, isDev,isOwner, isAdmins, reply
}) => {
    try {
        if (!isOwner) return reply(repmsg);
        if (!q) {
            return await reply('*📛 Please provide a newsletter ID to follow.*');
        }

        await conn.newsletterFollow(q);
        reply(`*✅ Successfully followed newsletter:* *${q}*`);
        
    } catch (e) {
        console.error(e);
        reply(`❌ *Error occurred!*\n\n${e.message || e}`);
    }
});

//--------------- ACINVITE ----------------//
cmd({
    pattern: "acinvite",
    react: "📡",
    alias: ["fl", "ac"],
    desc: acinvitedesc,
    category: "owner",
    use: ".acinvite <channel-id or invite-link>",
    filename: __filename
}, async (conn, mek, m, {
    isMe, isOwner, isSudo, reply, q
}) => {
    try {
        if (!isOwner) return reply(repmsg);

        if (!q) {
            return await reply('*📛 Please provide a channel ID or invite link*');
        }

        // Try to accept invite if it's an invite link
        if (q.startsWith('https://whatsapp.com/channel/')) {
            await conn.acceptInvite(q.split('/').pop());
            return await reply(`*✅ Successfully accepted channel invitation*`);
        }



    } catch (e) {
        console.error(e);
        return reply(`❌ *Error occurred!*\n\n${e.message || e}`);
    }
});
