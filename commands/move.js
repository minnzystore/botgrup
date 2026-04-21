module.exports = {
    name: "move",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender } = ctx
        const game = global.tictactoe[from]

        if (!game) {
            return safeSend(sock, from, { text: "❌ Tidak ada game!" })
        }

        if (game.players.length < 2) {
            return safeSend(sock, from, { text: "⏳ Tunggu player 2!" })
        }

        const turnPlayer = game.players[game.turn]

        if (sender !== turnPlayer) {
            return safeSend(sock, from, { text: "⚠️ Bukan giliran kamu!" })
        }

        const pos = parseInt(text.split(" ")[1]) - 1

        if (pos < 0 || pos > 8 || game.board[pos] === "❌" || game.board[pos] === "⭕") {
            return safeSend(sock, from, { text: "❌ Posisi tidak valid!" })
        }

        game.board[pos] = game.turn === 0 ? "❌" : "⭕"

        // cek menang
        const win = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ]

        let winner = null

        for (let combo of win) {
            const [a,b,c] = combo
            if (
                game.board[a] === game.board[b] &&
                game.board[b] === game.board[c]
            ) {
                winner = sender
            }
        }

        const boardText = `
${game.board[0]} | ${game.board[1]} | ${game.board[2]}
${game.board[3]} | ${game.board[4]} | ${game.board[5]}
${game.board[6]} | ${game.board[7]} | ${game.board[8]}
`

        if (winner) {
            delete global.tictactoe[from]
            return safeSend(sock, from, {
                text: `🎉 MENANG!

${boardText}

🏆 @${sender.split("@")[0]} menang!`,
                mentions: [sender]
            })
        }

        // draw
        if (!game.board.includes("1") &&
            !game.board.includes("2") &&
            !game.board.includes("3")) {
            delete global.tictactoe[from]
            return safeSend(sock, from, {
                text: `🤝 SERI!

${boardText}`
            })
        }

        game.turn = game.turn === 0 ? 1 : 0

        const next = game.players[game.turn]

        await safeSend(sock, from, {
            text: `🎮

${boardText}

Giliran: @${next.split("@")[0]}`,
            mentions: [next]
        })
    }
}