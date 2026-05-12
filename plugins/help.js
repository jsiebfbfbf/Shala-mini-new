const axios = require('axios');
const { cmd } = require('../lib/command');
const config = require('../settings');


var hmsg =''
if(config.LANG === 'SI') hmsg = 'උපකාර මධ්‍යස්ථානය'
else hmsg = "Open Help Center"

var hsimsg =''
if(config.LANG === 'SI') hsimsg = 'Shala MD උපකාර මධ්‍යස්ථානය විවෘත්ත කරන්න'
else hsimsg = "Open Shala MD Help Center"

cmd({
  pattern: "help",
  alias: ["h", "bothelp"],
  react: "🆘",
  desc: hmsg,
  category: "main",
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

	  const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;

    const buttons = [
      { buttonId: prefix + 'helpen', buttonText: { displayText: 'English 🇬🇧' }, type: 1 },
      { buttonId: prefix + 'helpsi', buttonText: { displayText: 'සිංහල 🇱🇰' }, type: 1 }
    ];

    const caption = `_👋 Welcome to SHALA MD Help Center!_ 💬

🚩 [  Help Center / උපකාර මධ්‍යස්ථානය ] 🚩

➤ කරුණාකර භාෂාවක් තෝරන්න :
➤ Please select a language to continue :`;


if (config.BUTTON === 'true') {
const buttonMessage = {
            image: { url: imageurl },
            caption: caption,
            footer: footer,
            buttons: buttons,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

 await conn.buttonMessage2(from, {
      text: caption,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

  } catch (e) {
    console.error(e);
    reply(`🚩 *Help Error :*\n${e.message}`);
  }
});

cmd({
  pattern: "helpsi",
  react: "🆘",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
    
    const step1 = `👋 Shala MD Help Center වෙත සාදරයෙන් පිළිගනිමු! 💬

🚩 Shala MD Beta Help 🚩

━━━━━━━━━━━━━━━➤  
❶ 🌐 බොට් වෙබ් පිටුව → ${pairlink}
━━━━━━━━━━━━━━━➤
❷ 📢 අපගේ නාලිකාව → ${channel}
━━━━━━━━━━━━━━━➤`;

    const buttons = [
      { buttonId: prefix + 'generalhelpsi', buttonText: { displayText: 'සාමාන්‍ය උපකාර ❓' }, type: 1 },
      { buttonId: prefix + 'owner', buttonText: { displayText: 'අපහා සම්බන්ද වන්න 📞' }, type: 1 },
      { buttonId: prefix + 'menu', buttonText: { displayText: 'විධාන ලැයිස්තුව 📜' }, type: 1 }
    ];


if (config.BUTTON === 'true') {
const buttonMessage = {
            image: { url: imageurl },
            caption: step1,
            footer: footer,
            buttons: buttons,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

    await conn.buttonMessage2(from, {
      text: step1,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
}

  } catch (e) {
    console.error(e);
    reply(`🚩 *Help Error :*\n${e.message}`);
  }
});

cmd({
  pattern: "helpen",
  react: "🆘",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
    
    const step1 = `👋 Welcome to the Shala MD Help Center! 💬
	
🚩 Shala MD Beta Help 🚩

━━━━━━━━━━━━━━━➤
❶ 🌐 Bot Website → ${pairlink}
━━━━━━━━━━━━━━━➤
❷ 📢 Our Channel → ${channel}
━━━━━━━━━━━━━━━➤`;

    const buttons = [
      { buttonId: prefix + 'generalhelpen', buttonText: { displayText: 'General Help ❓' }, type: 1 },
      { buttonId: prefix + 'owner', buttonText: { displayText: 'Contact Us 📞' }, type: 1 },
      { buttonId: prefix + 'menu', buttonText: { displayText: 'Command Menu 📜' }, type: 1 }
    ];


if (config.BUTTON === 'true') {
const buttonMessage = {
            image: { url: imageurl },
            caption: step1,
            footer: footer,
            buttons: buttons,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

    await conn.buttonMessage2(from, {
      text: step1,
      footer: footer,
      image: { url: imageurl },
      buttons: buttons,
      headerType: 4
    }, mek);
    }

  } catch (e) {
    console.error(e);
    reply(`🚩 *Help Error :*\n${e.message}`);
  }
});

cmd({
  pattern: "generalhelpsi",
  react: "🆘",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
    
    const step1 = `📋 නිති පැන

🚩 [  Shala MD Beta Bot - නිතර අසන ප්‍රශ්න ] 🚩

*➤ 1️⃣ Shala MD Beta Bot යනු කුමක්ද?*
Shala MD Beta BOT යනු කෙනෙක් වන නෙත්මික විසින් නිර්මාණය WhatsApp බොට් එකකි.

*➤ 2️⃣ විධාන භාවිතා කරන්නේ කෙසේද?*
ඩොට් එකකින් ආරම්භ වන විධාන ටයිප් කරන්න. උදා : - .alive හෝ .menu.

*➤ 3️⃣ මම මෙය ලබාගන්නේ කෙසේද?*
මෙය 100% නොමිලේ ලබාගත හැකි සේවාවකි. ඔබට ඇත්තේ Whatsapp සදහා Link කරගැනීම පමණි.

*➤ 4️⃣ බොට් මන් හදාගන්නේ කෙසේද?*
බොට්ගේ වෙබ් අඩවියට ගොස් “Pair” බොත්තම ක්ලික් කරන්න. එවිට නව පිටුවකට යයි,
94 සමග ඔබගේ WhatsApp අංකය ඇතුලත් කර Submit කරන්න. ලැබෙන කෝඩ් එක copy කර
WhatsApp සමග link කරන්න.

*➤ 5️⃣ දෝෂ වාර්තා කරන්නේ කෙසේද?*
.owner භාවිතා කර සෘජුවම Developer කෙනෙක්ට සමග සම්බන්ධ වන්න.

*💡 ඉදිරියේදි මෙම Bot ඔබට ඔබේම නමකට සාදාගත හැක. එම යාවත් කාලීන කිරීම බලාපොරොත්තුවෙන් සිටින්න.*`;

    const buttons1 = [
      { buttonId: prefix + 'helpsi', buttonText: { displayText: 'උපකාර මධ්‍යස්ථානය 🔙' }, type: 1 }
      ];


if (config.BUTTON === 'true') {
const buttonMessage = {
            image: { url: imageurl },
            caption: step1,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

    const buttonMessage1 = {
	  image: { url: imageurl },
      caption: step1,
      footer: footer,
      buttons: buttons,
      headerType: 1
    };

    await conn.buttonMessage2(from, buttonMessage1, mek);
}

  } catch (e) {
    console.error(e);
    reply(`🚩 *Help Error :*\n${e.message}`);
  }
});

cmd({
  pattern: "generalhelpen",
  react: "🆘",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, q, { from, prefix, pushname, reply }) => {
  try {

    const ownerdata = (await axios.get(
      "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/Ditelse.json"
    )).data;

    const {
      alivemsg, footer, imageurl, alivevideo,
      version, botname, ownername, ownernumber,
      pairlink, header, channel, jid, jidname, 
	  platform
    } = ownerdata;
    
    const step1 = `📋 General Help 

🚩 [ Shala MD Beta Bot – Frequently Asked Questions ] 🚩

*➤ 1️⃣ What is Shala MD Beta Bot?*
Shala MD Beta Bot is a WhatsApp bot created by a developer named Nethmika.

*➤ 2️⃣ How do I use commands?*
Type commands starting with a dot.
Example: .alive or .menu.

*➤ 3️⃣ How can I get this bot?*
This is a 100% free service. You only need to link it with WhatsApp.

*➤ 4️⃣ How do I create my own bot?*
Go to the bot’s website and click the “Pair” button.
You will be redirected to a new page.
Enter your WhatsApp number with 94 at the beginning and click Submit.
Copy the code you receive and link it with WhatsApp.

*➤ 5️⃣ How do I report errors?*
Use the .owner command to directly contact a developer.

*💡 In the future, you will be able to create this bot with your own name. Please stay tuned for upcoming updates.*`;
    
	  const buttons1 = [
      { buttonId: prefix + 'helpsi', buttonText: { displayText: 'Help Center 🔙' }, type: 1 }
      ];


if (config.BUTTON === 'true') {
const buttonMessage = {
            image: { url: imageurl },
            caption: step1,
            footer: footer,
            buttons: buttons1,
            headerType: 4 
        };

await conn.sendMessage(from, buttonMessage, { quoted: mek });

} else {

    const buttonMessage1 = {
	  image: { url: imageurl },
      caption: step1,
      footer: footer,
      buttons: buttons1,
      headerType: 1
    };

    await conn.buttonMessage2(from, buttonMessage1, mek);
}

  } catch (e) {
    console.error(e);
    reply(`🚩 *Help Error :*\n${e.message}`);
  }
});
