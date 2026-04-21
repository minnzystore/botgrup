module.exports = {
    name: "menu",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m, isAdmin, isOwner } = ctx || {}

        if (!sender || !m) return

        const username = m.pushName || "User"

        // =========================
        // SAFE DB
        // =========================
        if (!db[sender]) {
            db[sender] = { level: 1, exp: 0 }
        }

        let level = Number(db[sender].level) || 1
        let exp = Number(db[sender].exp) || 0

        // =========================
        // OWNER
        // =========================
        const ownerName = "Mikasa Amerta"

        let role = "User"
        let rank = "Bronze 🥉"

        // 🔥 OWNER MODE
        if (isOwner) {
            role = "Dewa Pencipta 👑"
            rank = "Dewa Tertinggi 🌌"
            level = "∞"
            exp = "∞"
        } else {

            if (isAdmin) role = "Admin 🛡️"

            // =========================
            // RANK SYSTEM
            // =========================
            if (level >= 2) rank = "Iron ⚙️"
            if (level >= 5) rank = "Silver 🥈"
            if (level >= 10) rank = "Gold 🥇"
            if (level >= 15) rank = "Platinum 💎"
            if (level >= 20) rank = "Diamond 🔷"
            if (level >= 30) rank = "Master 🏅"
            if (level >= 40) rank = "Grandmaster ⚡"
            if (level >= 50) rank = "Mythic 🔥"
            if (level >= 75) rank = "Legend 🌟"
            if (level >= 100) rank = "Supreme 👑"
            if (level >= 150) rank = "Immortal 💀"
            if (level >= 200) rank = "God Mode 🪐"
        }

        // =========================
        // TIME
        // =========================
        const now = new Date()

        const wibTime = now.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta"
        })

        // =========================
        // MENU
        // =========================
        const menu = `
╔═━━━「 𝐌𝐈𝐍𝐍𝐙𝐘 𝐁𝐎𝐓 」━━━═╗
║ 👑 Owner : ${ownerName}
║ 👤 User  : ${username}
║ 🎭 Role  : ${role}
║ 🏆 Rank  : ${rank}
║ 📊 Level : ${level}
║ ⭐ EXP   : ${exp}
║ 🆔 Nomor : @${sender.split("@")[0]}
║ 🕒 WIB   : ${wibTime}
╚═━━━━━━━━━━━━━━━━━━━═╝

┌─〔 📋 MENU UTAMA 〕
│ ✧ .menu
│ ✧ .profile
│ ✧ .info
└───────────────

┌─〔 👑 ADMIN MENU 〕
│ ✧ .tagall
│ ✧ .kick
│ ✧ .promote
│ ✧ .demote
└───────────────

┌─〔 📥 DOWNLOADER 〕
│ 🎵 .ytmp3 link
│ 🎬 .ytmp4 link
│ 🎵 .ttmp3 link
│ 🎬 .ttmp4 link
│ 📸 .ig link
└───────────────

┌─〔 ⚡ BOT INFO 〕
│ ✧ Status : Aktif
└───────────────
`

        await sock.sendMessage(from, {
            text: menu,
            mentions: [sender]
        })
    }
}