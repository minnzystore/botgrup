module.exports = {
    name: "tagall",
    execute: async (sock, from, text, db, safeSend, owner, m) => {

        const metadata = await sock.groupMetadata(from)
        const participants = metadata.participants

        let teks = "📢 Tag All:\n\n"
        let mentions = []

        for (let p of participants) {
            teks += `@${p.id.split("@")[0]}\n`
            mentions.push(p.id)
        }

        await sock.sendMessage(from, {
            text: teks,
            mentions
        })
    }
}