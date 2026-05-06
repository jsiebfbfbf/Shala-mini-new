const config = require('../settings')
const { cmd } = require('../lib/command')
const { input, get, updb, updfb } = require("../lib/database")

// ========================================================
//              SETTING PANEL - BUTTON BASED
// ========================================================

// Helper: send button message (supports both BUTTON modes)
async function sendSettingMsg(conn, from, mek, caption, footer, buttons) {
    if (config.BUTTON === 'true') {
        await conn.sendMessage(from, {
            text: caption,
            footer: footer,
            buttons: buttons,
            headerType: 1
        }, { quoted: mek });
    } else {
        await conn.buttonMessage2(from, {
            text: caption,
            footer: footer,
            buttons: buttons,
            headerType: 1
        }, mek);
    }
}

// ─────────────────────────────────────────────────────────
// .setting  ➜  Main Settings Panel
// ─────────────────────────────────────────────────────────
cmd({
    pattern: "setting",
    alias: ["settings", "set"],
    desc: "Bot Settings Panel",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, prefix, reply }) => {
    
    try {
        const caption = `╔══════════════════════╗
║   ⚙️  *BOT SETTINGS PANEL*   ║
╚══════════════════════╝

👇 *Choose a setting to configure:*

🔘 *AUTO Features* - Auto Reply, AI, Status
🔘 *BOT Mode* - Work Type & Language  
🔘 *Prefix & Button* - Command prefix, Reply type
🔘 *Current Status* - See all settings

_Use buttons below to navigate_ 👇`

        const footer = `${config.BOT_NAME} | Settings`
        const buttons = [
            { buttonId: `${prefix}setauto`,   buttonText: { displayText: '🤖 Auto Features'       }, type: 1 },
            { buttonId: `${prefix}setmode`,   buttonText: { displayText: '🌐 Bot Mode & Language'  }, type: 1 },
            { buttonId: `${prefix}setprefix`, buttonText: { displayText: '🔑 Prefix & Button Type' }, type: 1 },
            { buttonId: `${prefix}setstatus`, buttonText: { displayText: '📊 Current Status'       }, type: 1 },
        ]
        await sendSettingMsg(conn, from, mek, caption, footer, buttons)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// ─────────────────────────────────────────────────────────
// .setauto  ➜  Auto Features Panel
// ─────────────────────────────────────────────────────────
cmd({
    pattern: "setauto",
    dontAddCommandList: true,
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, prefix, reply }) => {
    
    try {
        const on = (v) => (v === 'true') ? '✅ ON' : '❌ OFF'
        const caption = `╔══════════════════════╗
║   🤖  *AUTO FEATURES SETTINGS*   ║
╚══════════════════════╝

💬 *Auto Reply* ........... ${on(config.AUTO_REPLY)}
🧠 *Auto AI* .............. ${on(config.AUTO_AI)}
👁️ *Auto View Status* ..... ${on(config.AUTO_VIEW_STATUS)}
❤️ *Auto Like Status* ..... ${on(config.AUTO_LIKE_STATUS)}
🎙️ *Auto Recording* ....... ${on(config.AUTO_RECORDING)}
😊 *Owner React* .......... ${on(config.OWNER_REACT)}

👇 *Press a button to toggle:*`

        const footer = `${config.BOT_NAME} | Auto Settings`
        const buttons = [
            { buttonId: `${prefix}toggleautoreply`,   buttonText: { displayText: `💬 Auto Reply [ ${on(config.AUTO_REPLY)} ]`           }, type: 1 },
            { buttonId: `${prefix}toggleautoai`,      buttonText: { displayText: `🧠 Auto AI [ ${on(config.AUTO_AI)} ]`                  }, type: 1 },
            { buttonId: `${prefix}toggleautoview`,    buttonText: { displayText: `👁️ Auto View Status [ ${on(config.AUTO_VIEW_STATUS)} ]`  }, type: 1 },
            { buttonId: `${prefix}toggleautolike`,    buttonText: { displayText: `❤️ Auto Like Status [ ${on(config.AUTO_LIKE_STATUS)} ]` }, type: 1 },
            { buttonId: `${prefix}toggleautorec`,     buttonText: { displayText: `🎙️ Auto Recording [ ${on(config.AUTO_RECORDING)} ]`    }, type: 1 },
            { buttonId: `${prefix}toggleownerreact`,  buttonText: { displayText: `😊 Owner React [ ${on(config.OWNER_REACT)} ]`          }, type: 1 },
            { buttonId: `${prefix}setting`,           buttonText: { displayText: '🔙 Back to Settings'                                  }, type: 1 },
        ]
        await sendSettingMsg(conn, from, mek, caption, footer, buttons)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// ─────────────────────────────────────────────────────────
// .setmode  ➜  Work Type & Language Panel
// ─────────────────────────────────────────────────────────
cmd({
    pattern: "setmode",
    dontAddCommandList: true,
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, prefix, reply }) => {
    
    try {
        const workType = config.WORK_TYPE || 'private'
        const lang     = config.LANG      || 'EN'
        const mk = (val, cur) => cur === val ? ' ✅' : ''

        const caption = `╔══════════════════════╗
║  🌐  *BOT MODE & LANGUAGE*  ║
╚══════════════════════╝

🔄 *Work Type* .... ${workType.toUpperCase()}
🗣️ *Language* ..... ${lang}

👇 *Select Work Type or Language:*`

        const footer = `${config.BOT_NAME} | Mode Settings`
        const buttons = [
            { buttonId: `${prefix}wt_private`, buttonText: { displayText: `🔒 Private Mode${mk('private',workType)}` }, type: 1 },
            { buttonId: `${prefix}wt_public`,  buttonText: { displayText: `🌍 Public Mode${mk('public',workType)}`   }, type: 1 },
            { buttonId: `${prefix}wt_group`,   buttonText: { displayText: `👥 Group Mode${mk('group',workType)}`     }, type: 1 },
            { buttonId: `${prefix}lang_EN`,    buttonText: { displayText: `🇬🇧 English${mk('EN',lang)}`              }, type: 1 },
            { buttonId: `${prefix}lang_SI`,    buttonText: { displayText: `🇱🇰 සිංහල${mk('SI',lang)}`               }, type: 1 },
            { buttonId: `${prefix}setting`,    buttonText: { displayText: '🔙 Back to Settings'                     }, type: 1 },
        ]
        await sendSettingMsg(conn, from, mek, caption, footer, buttons)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// ─────────────────────────────────────────────────────────
// .setprefix  ➜  Prefix & Button Type Panel
// ─────────────────────────────────────────────────────────
cmd({
    pattern: "setprefix",
    dontAddCommandList: true,
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, prefix, q, reply }) => {
    
    try {
        // Custom prefix: .setprefix !
        if (q && q.trim().length > 0) {
            const newPrefix = q.trim()
            await input("PREFIX", newPrefix)
            await updb()
            return reply(`*✅ Prefix updated to:* \`${newPrefix}\``)
        }

        const currentPrefix = config.PREFIX || '.'
        const buttonMode    = config.BUTTON  || 'false'
        const on = (v) => v === 'true' ? '✅ ON' : '❌ OFF'
        const mk = (val, cur) => cur === val ? ' ✅' : ''

        const caption = `╔══════════════════════╗
║  🔑  *PREFIX & BUTTON SETTINGS*  ║
╚══════════════════════╝

🔣 *Current Prefix* ....... \`${currentPrefix}\`
🖱️ *Button Mode* .......... ${on(buttonMode)}

👇 *Choose quick prefix or toggle Button Mode:*
_(Custom prefix: type_ \`.setprefix <symbol>\`_)_`

        const footer = `${config.BOT_NAME} | Prefix Settings`
        const buttons = [
            { buttonId: `${prefix}pfx_.`,       buttonText: { displayText: `Set Prefix: . ${mk('.',currentPrefix)}`         }, type: 1 },
            { buttonId: `${prefix}pfx_!`,       buttonText: { displayText: `Set Prefix: ! ${mk('!',currentPrefix)}`         }, type: 1 },
            { buttonId: `${prefix}pfx_/`,       buttonText: { displayText: `Set Prefix: / ${mk('/',currentPrefix)}`         }, type: 1 },
            { buttonId: `${prefix}pfx_#`,       buttonText: { displayText: `Set Prefix: # ${mk('#',currentPrefix)}`         }, type: 1 },
            { buttonId: `${prefix}togglebutton`,buttonText: { displayText: `🖱️ Button Mode [ ${on(buttonMode)} ]`           }, type: 1 },
            { buttonId: `${prefix}setting`,     buttonText: { displayText: '🔙 Back to Settings'                            }, type: 1 },
        ]
        await sendSettingMsg(conn, from, mek, caption, footer, buttons)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// ─────────────────────────────────────────────────────────
// .setstatus  ➜  Show all current settings
// ─────────────────────────────────────────────────────────
cmd({
    pattern: "setstatus",
    alias: ["botstatus"],
    dontAddCommandList: true,
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, prefix, reply }) => {
    
    try {
        const on = (v) => (v === 'true' || v === true) ? '✅ ON' : '❌ OFF'
        const caption = `╔══════════════════════╗
║  📊  *CURRENT BOT STATUS*  ║
╚══════════════════════╝

🔣 *Prefix* ............... \`${config.PREFIX || '.'}\`
🖱️ *Button Mode* .......... ${on(config.BUTTON)}
🔄 *Work Type* ............ ${(config.WORK_TYPE || 'private').toUpperCase()}
🗣️ *Language* ............. ${config.LANG || 'EN'}

🤖 *AUTO FEATURES*
  💬 Auto Reply .......... ${on(config.AUTO_REPLY)}
  🧠 Auto AI ............. ${on(config.AUTO_AI)}
  👁️ Auto View Status .... ${on(config.AUTO_VIEW_STATUS)}
  ❤️ Auto Like Status .... ${on(config.AUTO_LIKE_STATUS)}
  🎙️ Auto Recording ...... ${on(config.AUTO_RECORDING)}
  😊 Owner React ......... ${on(config.OWNER_REACT)}`

        const footer = `${config.BOT_NAME} | Live Status`
        const buttons = [
            { buttonId: `${prefix}setauto`, buttonText: { displayText: '🤖 Auto Features'  }, type: 1 },
            { buttonId: `${prefix}setmode`, buttonText: { displayText: '🌐 Mode & Language' }, type: 1 },
            { buttonId: `${prefix}setting`, buttonText: { displayText: '⚙️ Main Settings'  }, type: 1 },
        ]
        await sendSettingMsg(conn, from, mek, caption, footer, buttons)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// ═══════════════════════════════════════════════════════
//              TOGGLE HANDLERS
// ═══════════════════════════════════════════════════════

async function toggleSetting(key, label, reply) {
    try {
        const current = config[key] || 'false'
        const newVal  = current === 'true' ? 'false' : 'true'
        await input(key, newVal)
        await updb()
        const status = newVal === 'true' ? '✅ ON' : '❌ OFF'
        reply(`*${label} turned ${status}*`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
}

cmd({ pattern: "toggleautoreply",  dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("AUTO_REPLY", "💬 Auto Reply", reply)
})

cmd({ pattern: "toggleautoai",     dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("AUTO_AI", "🧠 Auto AI", reply)
})

cmd({ pattern: "toggleautoview",   dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("AUTO_VIEW_STATUS", "👁️ Auto View Status", reply)
})

cmd({ pattern: "toggleautolike",   dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("AUTO_LIKE_STATUS", "❤️ Auto Like Status", reply)
})

cmd({ pattern: "toggleautorec",    dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("AUTO_RECORDING", "🎙️ Auto Recording", reply)
})

cmd({ pattern: "toggleownerreact", dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("OWNER_REACT", "😊 Owner React", reply)
})

cmd({ pattern: "togglebutton",     dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await toggleSetting("BUTTON", "🖱️ Button Mode", reply)
})

// ═══════════════════════════════════════════════════════
//              WORK TYPE HANDLERS
// ═══════════════════════════════════════════════════════

async function setWorkType(type, reply) {
    try {
        await input("WORK_TYPE", type)
        await updb()
        reply(`*✅ Work Mode set to:* \`${type.toUpperCase()}\``)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
}

cmd({ pattern: "wt_private", dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setWorkType("private", reply)
})

cmd({ pattern: "wt_public",  dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setWorkType("public", reply)
})

cmd({ pattern: "wt_group",   dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setWorkType("group", reply)
})

// ═══════════════════════════════════════════════════════
//              LANGUAGE HANDLERS
// ═══════════════════════════════════════════════════════

cmd({ pattern: "lang_EN", dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    try {
        await input("LANG", "EN")
        await updb()
        reply("*✅ Language set to: English 🇬🇧*")
    } catch (e) { reply("*Error ❌*") }
})

cmd({ pattern: "lang_SI",   dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    try {
        await input("LANG", "SI")
        await updb()
        reply("*✅ භාෂාව වෙනස් කරන ලදි: සිංහල 🇱🇰*")
    } catch (e) { reply("*Error ❌*") }
})

// ═══════════════════════════════════════════════════════
//              PREFIX QUICK-SET HANDLERS
// ═══════════════════════════════════════════════════════

async function setPrefix(pfx, reply) {
    try {
        await input("PREFIX", pfx)
        await updb()
        reply(`*✅ Prefix updated to:* \`${pfx}\``)
    } catch (e) { reply("*Error ❌*") }
}

cmd({ pattern: "pfx_.",  dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setPrefix(".", reply)
})

cmd({ pattern: "pfx_!",  dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setPrefix("!", reply)
})

cmd({ pattern: "pfx_/",  dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setPrefix("/", reply)
})

cmd({ pattern: "pfx_#",  dontAddCommandList: true, category: "owner", filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    
    await setPrefix("#", reply)
})

// ================= RESET DATABASE =================
cmd({
    pattern: "resetdb",
    desc: "Reset Database",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {
    try {
        await updfb()
        await updb()
        return reply("*Database reseted & reloaded ✅*")
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})
