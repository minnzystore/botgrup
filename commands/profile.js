const axios = require("axios")

module.exports = {
    name: "profile",
    execute: async (sock, from, text, db, safeSend, ctx) => {

        const { sender, m, isAdmin, isOwner } = ctx || {}
        if (!sender || !m) return

        const username = m.pushName || "User"

        // =========================
        // DATABASE SAFE
        // =========================
        if (!db[sender]) db[sender] = { level: 1, exp: 0 }

        let level = db[sender].level
        let exp = db[sender].exp

        // =========================
        // ROLE & RANK
        // =========================
        let role = "User"
        let rank = "Bronze 🥉"

        if (isOwner) {
            role = "Dewa Pencipta 👑"
            rank = "Ackerman Bloodline ⚔️🔥"
            level = "∞"
            exp = "∞"
        } else {
            if (isAdmin) role = "Elite Soldier 🛡️"

            if (level >= 5) rank = "Cadet 🪖"
            if (level >= 10) rank = "Scout ⚔️"
            if (level >= 20) rank = "Captain 🏹"
            if (level >= 50) rank = "Elite Ackerman 🔥"
            if (level >= 100) rank = "Humanity's Strongest 💀"
        }

        // =========================
        // PROFILE PICTURE
        // =========================
        let pp = "https://i.ibb.co/2kR5zqB/user.png"
        try {
            pp = await sock.profilePictureUrl(sender, "image")
        } catch {}

        // =========================
        // BACKGROUND MIKASA (DARK)
        // =========================
        const bg = "https://i.ibb.co/0jqHP0v/mikasa-dark.jpg"

        // =========================
        // API IMAGE (AESTHETIC)
        // =========================
        const imageUrl = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(bg)}&text1=${encodeURIComponent(username)}&text2=${encodeURIComponent(rank)}&text3=Lv:${level}&avatar=${encodeURIComponent(pp)}`

        // =========================
        // CAPTION MIKASA STYLE
        // =========================
        const caption = `
⚔️ 「 𝐌𝐈𝐍𝐍𝐙𝐘 - 𝐌𝐈𝐊𝐀𝐒𝐀 𝐒𝐓𝐘𝐋𝐄 」 ⚔️

👤 Nama   : ${username}
🎭 Role   : ${role}
🏆 Rank   : ${rank}
📊 Level  : ${level}
⭐ EXP    : ${exp}

🧠 "Kalau aku tidak bertarung... aku tidak akan menang."

🔥 Tetap kuat, tetap fokus.
💢 Jangan mudah menyerah.

⚠️ Gunakan bot dengan bijak
🚫 Jangan spam atau abuse fitur
`

        // =========================
        // SEND
        // =========================
        await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption,
            mentions: [sender]
        })
    }
}