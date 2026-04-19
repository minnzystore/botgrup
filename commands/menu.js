module.exports = {
    name: "menu",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m } = ctx

        // ambil nama user
        const username = m.pushName || "User"

        // WIB time
        const now = new Date()
        const formatter = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            dateStyle: "full",
            timeStyle: "medium"
        })

        const wibTime = formatter.format(now)

        const menu = `
╭━━━〔 🤖 MINNZY BOT 〕━━━⬣
┃ 👤 User : ${username}
┃ 🆔 Nomor : @${sender.split("@")[0]}
┃ 🕒 WIB : ${wibTime}
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 📋 MENU 〕━━━⬣
┃ ✦ .menu
┃ ✦ .tagall
┃ ✦ .kick @user
┃ ✦ .promote @user
┃ ✦ .demote @user
┃ ✦ .info
┃ ✦ .profile
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ INFO BOT 〕━━━⬣
┃ Nama : MinnzyBot
┃ Mode : Group Only
┃ Status : Aktif ✅
╰━━━━━━━━━━━━━━━━━━⬣
`

        await sock.sendMessage(from, {
            text: menu,
            mentions: [sender]
        })
    }
}