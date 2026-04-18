module.exports = {
    name: "demote",
    execute: async (sock, from, text, db, safeSend, owner, m) => {

        const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid
        if (!mentioned) return safeSend(sock, from, { text: "Tag user!" })

        await sock.groupParticipantsUpdate(from, mentioned, "demote")
    }
}