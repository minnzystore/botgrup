const axios = require("axios")

module.exports = {
    name: "sticktext",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const query = text.replace(".sticktext", "").trim()

        if (!query) {
            return safeSend(sock, from, {
                text: "❌ Contoh:\n.sticktext Halo dunia"
            })
        }

        try {
            const url = `https://api.xteam.xyz/attp?file&text=${encodeURIComponent(query)}`

            await sock.sendMessage(from, {
                sticker: { url }
            })

        } catch (e) {
            await safeSend(sock, from, {
                text: "❌ Gagal buat sticker text"
            })
        }
    }
}