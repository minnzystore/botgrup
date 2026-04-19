module.exports = {
    name: "profile",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m } = ctx

        const user = db[sender] || { exp: 0, level: 1 }
        const username = m.pushName || "User"

        const teks = `
╭━━━〔 👤 PROFILE 〕━━━⬣
┃ Nama : ${username}
┃ Nomor : @${sender.split("@")[0]}
┃ Level : ${user.level}
┃ EXP : ${user.exp}
╰━━━━━━━━━━━━━━━━━━⬣
`

        await sock.sendMessage(from, {
            text: teks,
            mentions: [sender]
        })
    }
}