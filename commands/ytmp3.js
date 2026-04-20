const axios = require("axios")

module.exports = {
    name: "ytmp3",
    execute: async (sock, from, text, db, safeSend) => {
        const url = text.split(" ")[1]
        if (!url) return safeSend(sock, from, { text: "❌ Masukkan link YouTube!" })

        try {
            const res = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${url}`)
            const data = res.data.data

            await sock.sendMessage(from, {
                audio: { url: data.download },
                mimetype: "audio/mpeg"
            })
        } catch {
            safeSend(sock, from, { text: "❌ Gagal download MP3" })
        }
    }
}