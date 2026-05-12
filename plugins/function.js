const { cmd } = require("../lib/command");
const { get } = require("../lib/database");
const axios = require("axios");

const JSON_URL = "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/owner_react.json";

/*
cmd({
    on: "body"
},
async (conn, mek, m, { from, isOwner, isSudo, isMe, isGroup }) => {
    try {

        const AUTO_REACT = await get("AUTO_REACT");

        const emojis = ["❤️","🩷","🧡","💛","💚","💙","🩵","💜","🤎","🖤","🩶","🤍"];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        });

    } catch (e) {
        console.log("AutoReact Error:", e);
    }

});
*/
//-------------- OWNER REACTION -----------------//
let reactData = {};

// Load JSON from URL at startup
async function loadReactData() {
    try {
        const res = await axios.get(JSON_URL);
        reactData = res.data;
        console.log("AutoReact JSON loaded ✅");
    } catch (e) {
        console.log("Failed to load AutoReact JSON:", e.message);
    }
}

// Initial load
loadReactData();

// Optional: Reload every 5 mins
setInterval(loadReactData, 5 * 60 * 1000);

cmd({
    on: "body"
},
async (conn, mek, m, { from }) => {
    try {
        if (!mek.key.participant) return;

        const sender = mek.key.participant.split("@")[0];
        const emoji = reactData[sender];
        if (!emoji) return;

        await conn.sendMessage(from, {
            react: { text: emoji, key: mek.key }
        });

    } catch (e) {
        console.log("AutoReact Error:", e);
    }
});
