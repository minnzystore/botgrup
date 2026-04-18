module.exports = {
    name: "menu",
    execute: async (sock, from, text, db, safeSend, owner, m) => {

        const menu = `
╔═══『 BOT GROUP 』
║
║ ➤ menu
║ ➤ tagall
║ ➤ kick @user
║ ➤ promote @user
║ ➤ demote @user
║ ➤ info
║
╚═══════════
`

        await safeSend(sock, from, { text: menu })
    }
}