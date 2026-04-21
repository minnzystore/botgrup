const axios = require("axios")

module.exports = {
    name: "stickermeme",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        try {
            const res = await axios.get("https://meme-api.com/gimme")

            await sock.sendMessage(from, {
                sticker: { url: res.data.url }
            })

        } catch (e) {
            await safeSend(sock, from, {
                text: "❌ Gagal ambil sticker meme"
            })
        }
    }
}