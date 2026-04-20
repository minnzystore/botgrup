const axios = require("axios")

module.exports = {
    name: "ttmp4",
    execute: async (sock, from, text, db, safeSend) => {
        const url = text.split(" ")[1]
        if (!url) return safeSend(sock, from, { text: "❌ Masukkan link TikTok!" })

        try {
            const res = await axios.get(`https://api.agatz.xyz/api/tiktok?url=${url}`)
            const data = res.data.data

            await sock.sendMessage(from, {
                video: { url: data.play }
            })
        } catch {
            safeSend(sock, from, { text: "❌ Gagal download TikTok" })
        }
    }
}