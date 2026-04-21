const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const ffmpeg = require("fluent-ffmpeg")
const fs = require("fs")
const path = require("path")

module.exports = {
    name: "sticker",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx
        if (!m) return

        try {
            let message = m.message
            let type = Object.keys(message)[0]

            // 🔥 HANDLE REPLY
            if (type === "extendedTextMessage") {
                const quoted = message.extendedTextMessage?.contextInfo?.quotedMessage
                if (quoted) {
                    message = quoted
                    type = Object.keys(message)[0]
                }
            }

            // 🔥 VALIDASI MEDIA
            if (!/imageMessage|videoMessage/.test(type)) {
                return safeSend(sock, from, {
                    text: "❌ Kirim / reply gambar atau video dengan caption .sticker"
                })
            }

            // 🔥 DOWNLOAD MEDIA
            const stream = await downloadContentFromMessage(
                message[type],
                type.replace("Message", "")
            )

            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            // 📁 TEMP FILE
            const input = path.join(__dirname, "../temp/input")
            const output = path.join(__dirname, "../temp/output.webp")

            if (!fs.existsSync(path.join(__dirname, "../temp"))) {
                fs.mkdirSync(path.join(__dirname, "../temp"))
            }

            fs.writeFileSync(input, buffer)

            // 🔥 CONVERT KE WEBP HD (ANTI GEPENG)
            await new Promise((resolve, reject) => {
    ffmpeg(input)
        .outputOptions([
            "-vcodec", "libwebp",
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease",
            "-lossless", "1",
            "-qscale", "100",
            "-preset", "default",
            "-loop", "0",
            "-an",
            "-vsync", "0"
        ])
        .save(output)
        .on("end", resolve)
        .on("error", reject)
})

            const sticker = fs.readFileSync(output)

            // 🔥 KIRIM STICKER
            await sock.sendMessage(from, {
                sticker: sticker
            })

            // 🧹 HAPUS FILE TEMP
            fs.unlinkSync(input)
            fs.unlinkSync(output)

        } catch (e) {
            console.log("STICKER ERROR:", e)
            safeSend(sock, from, {
                text: "❌ Gagal membuat sticker"
            })
        }
    }
}