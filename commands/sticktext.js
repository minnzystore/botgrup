const axios = require("axios")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")

module.exports = {
    name: "sticktext",
    execute: async (sock, from, text, db, safeSend) => {

        const query = text.replace(".sticktext", "").trim()

        if (!query) {
            return safeSend(sock, from, {
                text: "❌ Contoh:\n.sticktext Halo dunia"
            })
        }

        try {
            // pakai dummy image text generator
            const url = `https://dummyimage.com/512x512/000/fff.png&text=${encodeURIComponent(query)}`

            const input = path.join(__dirname, "../temp/text.png")
            const output = path.join(__dirname, "../temp/text.webp")

            const res = await axios({
                url,
                method: "GET",
                responseType: "arraybuffer"
            })

            fs.writeFileSync(input, res.data)

            await new Promise((resolve, reject) => {
                ffmpeg(input)
                    .outputOptions([
                        "-vcodec libwebp",
                        "-vf scale=512:512",
                        "-lossless 1",
                        "-q:v 100"
                    ])
                    .toFormat("webp")
                    .save(output)
                    .on("end", resolve)
                    .on("error", reject)
            })

            const buffer = fs.readFileSync(output)

            await sock.sendMessage(from, {
                sticker: buffer
            })

            fs.unlinkSync(input)
            fs.unlinkSync(output)

        } catch (e) {
            console.log("STICKTEXT ERROR:", e)

            await safeSend(sock, from, {
                text: "❌ Gagal buat sticker text 😭"
            })
        }
    }
}