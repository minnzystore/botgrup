module.exports = {
    name: "sticker",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { m } = ctx

        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quoted) {
            return safeSend(sock, from, {
                text: "❌ Reply gambar/video untuk dijadikan sticker!"
            })
        }

        try {

            let mime = Object.keys(quoted)[0]

            if (mime === "imageMessage") {

                const buffer = await sock.downloadMediaMessage({
                    message: quoted
                })

                await sock.sendMessage(from, {
                    sticker: buffer
                })

            } else if (mime === "videoMessage") {

                const buffer = await sock.downloadMediaMessage({
                    message: quoted
                })

                await sock.sendMessage(from, {
                    sticker: buffer
                })

            } else {
                return safeSend(sock, from, {
                    text: "❌ Hanya gambar/video!"
                })
            }

        } catch (e) {
            console.log("STICKER ERROR:", e)

            await safeSend(sock, from, {
                text: "❌ Gagal buat sticker 😭"
            })
        }
    }
}