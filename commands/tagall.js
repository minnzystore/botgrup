module.exports = {
    name: "tagall",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { metadata } = ctx

        const members = metadata.participants
        const mentions = members.map(p => p.id)

        await sock.sendMessage(from, {
            text: "minasang",
            mentions
        })
    }
}