const axios = require("axios")

module.exports = {
    name: "profile",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m, isAdmin, isOwner } = ctx || {}
        if (!sender || !m) return

        const username = m.pushName || "User"

        // =========================
        // DB SAFE
        // =========================
        if (!db[sender]) {
            db[sender] = { level: 1, exp: 0 }
        }

        let level = db[sender].level
        let exp = db[sender].exp

        let role = "User"
        let rank = "Bronze 🥉"

        // =========================
        // OWNER MODE
        // =========================
        if (isOwner) {
            role = "Dewa Pencipta 👑"
            rank = "Dewa Tertinggi 🌌"
            level = "∞"
            exp = "∞"
        } else {
            if (isAdmin) role = "Admin 🛡️"

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
            if (level >= 999) rank = "VVIP 👑🔥💎"
        }

        // =========================
        // TIME
        // =========================
        const time = new Date().toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta"
        })

        // =========================
        // CAPTION (AESTHETIC)
        // =========================
        const caption = `
╭──〔 🌸 𝐌𝐈𝐍𝐍𝐙𝐘 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 🌸 〕──
│ 👤 Nama   : ${username}
│ 🎭 Role   : ${role}
│ 🏆 Rank   : ${rank}
│ 📊 Level  : ${level}
│ ⭐ EXP    : ${exp}
│ 🆔 ID     : @${sender.split("@")[0]}
│ 🕒 WIB    : ${time}
╰─────────────────────

💬 *"Teruslah berkembang, bahkan karakter terkuat pun pernah lemah."*

⚠️ Jangan spam bot ya!
✨ Gunakan dengan bijak
`

        // =========================
        // AVATAR (ANTI ERROR)
        // =========================
        const imageUrl = `https://api.dicebear.com/7.x/anime/png?seed=${encodeURIComponent(username)}`

        try {
            const res = await axios.get(imageUrl, {
                responseType: "arraybuffer"
            })

            await sock.sendMessage(from, {
                image: Buffer.from(res.data),
                caption,
                mentions: [sender]
            })

        } catch (e) {
            console.log("IMG ERROR:", e)

            await safeSend(sock, from, {
                text: caption
            })
        }
    }
}