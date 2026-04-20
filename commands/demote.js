module.exports = {
    name: "demote",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { isAdmin, isOwner, m, isOwnerJid, metadata } = ctx

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

        // 🚫 PROTECT OWNER
        if (isOwnerJid(targetJid)) {
            return safeSend(sock, from, {
                text: "🚫 Owner tidak bisa di demote!"
            })
        }

        // 🔍 CEK ADMIN TARGET
        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => p.id)

        const targetIsAdmin = admins.includes(targetJid)

        // 🚫 Admin tidak bisa demote admin lain (kecuali owner)
        if (targetIsAdmin && !isOwner) {
            return safeSend(sock, from, {
                text: "🚫 Tidak bisa demote sesama admin!"
            })
        }

        await sock.groupParticipantsUpdate(from, [targetJid], "demote")

        await safeSend(sock, from, { text: "✅ Berhasil demote" })
    }
}