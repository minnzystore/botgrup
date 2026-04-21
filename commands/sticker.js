const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")

module.exports = {
    name: "sticker",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx

        try {
            const quoted = m.quoted ? m.quoted : m
            const mime = quoted.mtype || ""

            if (!/image|video/.test(mime)) {
                return safeSend(sock, from, {
                    text: "❌ Reply gambar/video!"
                })
            }

            // ambil media
            const stream = await downloadContentFromMessage(
                quoted.message[mime],
                mime.replace("Message", "")
            )

            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            const inputPath = path.join(__dirname, "../temp/input")
            const outputPath = path.join(__dirname, "../temp/output.webp")

            fs.writeFileSync(inputPath, buffer)

            // convert ke WEBP HD
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        "-vcodec libwebp",
                        "-vf scale=512:512:force_original_aspect_ratio=decrease",
                        "-lossless 1",
                        "-compression_level 6",
                        "-q:v 100"
                    ])
                    .toFormat("webp")
                    .save(outputPath)
                    .on("end", resolve)
                    .on("error", reject)
            })

            const stickerBuffer = fs.readFileSync(outputPath)

            await sock.sendMessage(from, {
                sticker: stickerBuffer
            })

            // hapus file temp
            fs.unlinkSync(inputPath)
            fs.unlinkSync(outputPath)

        } catch (e) {
            console.log("STICKER HD ERROR:", e)

            await safeSend(sock, from, {
                text: "❌ Gagal buat sticker HD 😭"
            })
        }
    }
}