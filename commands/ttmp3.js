const axios = require("axios")

module.exports = {
    name: "ttmp3",
    execute: async (sock, from, text, db, safeSend) => {

        const url = text.split(" ")[1]
        if (!url)
            return safeSend(sock, from, { text: "❌ Masukkan link TikTok!" })

        try {
            const res = await axios.get(`https://api.agatz.xyz/api/tiktok?url=${url}`)
            const data = res.data.data

            // ambil audio
            const audioUrl = data.music

            if (!audioUrl)
                return safeSend(sock, from, { text: "❌ Audio tidak ditemukan!" })

            await sock.sendMessage(from, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg"
            })

        } catch (e) {
            console.log(e)
            safeSend(sock, from, { text: "❌ Gagal download audio TikTok" })
        }
    }
}