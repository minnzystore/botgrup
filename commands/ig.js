const axios = require("axios")

module.exports = {
    name: "ig",
    execute: async (sock, from, text, db, safeSend) => {
        const url = text.split(" ")[1]
        if (!url) return safeSend(sock, from, { text: "❌ Masukkan link Instagram!" })

        try {
            const res = await axios.get(`https://api.agatz.xyz/api/igdl?url=${url}`)
            const data = res.data.data

            for (let media of data) {
                await sock.sendMessage(from, {
                    video: { url: media.url }
                })
            }
        } catch {
            safeSend(sock, from, { text: "❌ Gagal download IG" })
        }
    }
}