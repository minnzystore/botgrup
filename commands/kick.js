module.exports = {
    name: "kick",
    execute: async (sock, from, text, db, safeSend, owner, m) => {

        const sender = m.key.participant
        const metadata = await sock.groupMetadata(from)
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id)

        if (!admins.includes(sender)) {
            return safeSend(sock, from, { text: "❌ Admin only" })
        }

        const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid

        if (!mentioned) return safeSend(sock, from, { text: "Tag orangnya!" })

        await sock.groupParticipantsUpdate(from, mentioned, "remove")
    }
}