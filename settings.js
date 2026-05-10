const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {

    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://ishanccntxpr_db_user:k1gvugvb5l0ONP88@cluster0.ltwn3yv.mongodb.net/',
    MONGO_DB: process.env.MONGO_DB || 'kavyalove',
    
    PREFIX: process.env.PREFIX || '.',
    BUTTON: process.env.BUTTON || 'true',
    MAX_RETRIES: process.env.MAX_RETRIES || '5',
    ADMIN_LIST_PATH: process.env.ADMIN_LIST_PATH || '94781332957',

    OWNER_REACT:process.env.OWNER_REACT || 'true',
    AUTO_REPLY:process.env.AUTO_REPLY || 'true',
    AUTO_AI: process.env.AUTO_AI || 'true',
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'false',
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'false',
    AUTO_RECORDING: process.env.AUTO_RECORDING || 'false',
    WORK_TYPE: process.env.WORK_TYPE || 'private',
    LANG: process.env.LANG || 'EN',

    NEWSLETTER_MESSAGE_ID: process.env.NEWSLETTER_MESSAGE_ID || '428',
    NEWSLETTER_JID: process.env.NEWSLETTER_JID || '120363425696893542@newsletter',
    
    AUTO_LIKE_EMOJI: process.env.AUTO_LIKE_EMOJI ? JSON.parse(process.env.AUTO_LIKE_EMOJI) : ['❤️','🩷','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','💗'],

    IMAGE_PATH: process.env.IMAGE_PATH || 'https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/image/Alive.jpg',
    CHANNEL_LINK: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VagCogPGufJ3kZWjsW3A',
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/HZTNVop0ACP1o7876bUH1g',

    OTP_EXPIRY: process.env.OTP_EXPIRY || '300000',

    BOT_NAME: process.env.BOT_NAME || '*Sʜᴀʟᴀ Mᴅ ᴮᴱᵀᴬ*',
    OWNER_NAME: process.env.OWNER_NAME || 'ɴᴇᴛʜᴍɪᴋᴀ ᴋᴀᴜꜱʜᴀʟʏᴀ',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '94781332957',
    OWNER_NUMBERS: process.env.OWNER_NUMBERS || '94781332957,94787072548',
    SUDO_NUMBERS: process.env.SUDO_NUMBERS || '94741245331',
    BOT_VERSION: process.env.BOT_VERSION || '1.0.0 Pro',
    BOT_FOOTER: process.env.FOOTER || '*● ꜱʜᴀʟᴀ-ᴍᴅ ʙᴇᴛᴀ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ᴄʀᴇᴀᴛᴇᴅ ʙʏ ɴᴇᴛʜᴍɪᴋᴀ ᴋᴀᴜꜱʜᴀʟʏᴀ ●*',
};





    
