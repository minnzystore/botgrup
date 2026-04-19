module.exports = {
    name: "kick",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { isAdmin, isOwner, m, isOwnerJid } = ctx

        if (!isAdmin && !isOwner)
            return safeSend(sock, from, { text: "❌ Khusus admin!" })

        let target = null

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid

        if (mentioned && mentioned.length > 0) {
            target = mentioned[0]
        } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            target = m.message.extendedTextMessage.contextInfo.participant
        }

        if (!target)
            return safeSend(sock, from, { text: "❌ Tag atau reply user!" })

        const targetJid = String(target).trim()

        // 🔥 PROTECT OWNER GLOBAL
        if (isOwnerJid(targetJid)) {
            return safeSend(sock, from, {
                text: "🚫 Owner tidak bisa di kick!"
            })
        }

        await sock.groupParticipantsUpdate(from, [targetJid], "remove")

        await safeSend(sock, from, { text: "✅ Berhasil kick" })
    }
}