module.exports = {
    name: "join",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender } = ctx
        const game = global.tictactoe[from]

        if (!game) {
            return safeSend(sock, from, { text: "❌ Tidak ada game!" })
        }

        if (game.players.length >= 2) {
            return safeSend(sock, from, { text: "⚠️ Player sudah penuh!" })
        }

        if (game.players.includes(sender)) {
            return safeSend(sock, from, { text: "⚠️ Kamu sudah join!" })
        }

        game.players.push(sender)

        const [p1, p2] = game.players

        await safeSend(sock, from, {
            text: `🎮 Game dimulai!

❌ @${p1.split("@")[0]}
⭕ @${p2.split("@")[0]}

Giliran: @${p1.split("@")[0]}
Ketik angka 1-9`,
            mentions: [p1, p2]
        })
    }
}