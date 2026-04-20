const axios = require("axios")

module.exports = {
    name: "ytmp4",
    execute: async (sock, from, text, db, safeSend) => {
        const url = text.split(" ")[1]
        if (!url) return safeSend(sock, from, { text: "❌ Masukkan link YouTube!" })

        try {
            const res = await axios.get(`https://api.agatz.xyz/api/ytmp4?url=${url}`)
            const data = res.data.data

            await sock.sendMessage(from, {
                video: { url: data.download }
            })
        } catch {
            safeSend(sock, from, { text: "❌ Gagal download video" })
        }
    }
}