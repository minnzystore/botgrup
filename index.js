require("dotenv").config()

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

// =========================
// OWNER
// =========================
const owner = "6285798407870@s.whatsapp.net"
const prefix = "."

// =========================
// DATABASE
// =========================
const DB_FILE = "./database.json"

function loadDB() {
    try {
        if (!fs.existsSync(DB_FILE)) return {}
        return JSON.parse(fs.readFileSync(DB_FILE))
    } catch {
        return {}
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// =========================
// 🔥 OWNER DETECT SUPER FIX
// =========================
function isOwnerJid(jid) {
    if (!jid) return false

    const cleanUser = String(jid).replace(/[^0-9]/g, "")
    const cleanOwner = String(owner).replace(/[^0-9]/g, "")

    return cleanUser.endsWith(cleanOwner.slice(-10))
}

// =========================
// QUEUE SYSTEM
// =========================
let queue = []
let isProcessing = false

async function runQueue() {
    if (isProcessing) return
    isProcessing = true

    while (queue.length > 0) {
        const job = queue.shift()
        await job()
    }

    isProcessing = false
}

// =========================
// ANTI SPAM
// =========================
global.reqCount = {}

function allowRequest(user) {
    if (!user) return false

    const now = Date.now()

    if (!global.reqCount[user]) {
        global.reqCount[user] = { count: 1, time: now }
        return true
    }

    const data = global.reqCount[user]

    if (now - data.time > 5000) {
        global.reqCount[user] = { count: 1, time: now }
        return true
    }

    data.count++
    return data.count <= 5
}

// =========================
// SAFE SEND
// =========================
const sleep = (ms) => new Promise(res => setTimeout(res, ms))

async function safeSend(sock, jid, msg) {
    try {
        if (!jid) return
        await sock.sendMessage(jid, msg)
        await sleep(700)
    } catch (e) {
        console.log("SEND ERROR:", e)
    }
}

// =========================
// START BOT
// =========================
async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("session")  
const { version } = await fetchLatestBaileysVersion()  

const sock = makeWASocket({  
    version,  
    logger: P({ level: "silent" }),  
    auth: state  
})  

sock.ev.on("creds.update", saveCreds)  

// =========================
// CONNECTION
// =========================
sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) qrcode.generate(qr, { small: true })

    if (connection === "open") {
        console.log("✅ BOT ONLINE")
    }

    if (connection === "close") {
        const reason = lastDisconnect?.error?.output?.statusCode

        if (reason !== DisconnectReason.loggedOut) {
            setTimeout(startBot, 3000)
        } else {
            console.log("⚠️ Scan ulang QR")
        }
    }
})

// =========================
// 🔥 GROUP EVENT
// =========================
sock.ev.on("group-participants.update", async (data) => {
    try {
        const { id, participants, action, author } = data

        for (let user of participants) {
            const jid = typeof user === "string" ? user : user?.id
            if (!jid) continue

            const clean = jid.split(":")[0]
            const number = clean.split("@")[0]

            // ANTI KICK OWNER
            if (action === "remove" && isOwnerJid(clean)) {
                await sock.groupParticipantsUpdate(id, [owner], "add")

                if (author && !isOwnerJid(author)) {
                    await sock.groupParticipantsUpdate(id, [author], "remove")
                }

                await safeSend(sock, id, {
                    text: "⚠️ Owner dilindungi!"
                })
                continue
            }

            // ANTI DEMOTE OWNER
            if (action === "demote" && isOwnerJid(clean)) {
                await sock.groupParticipantsUpdate(id, [owner], "promote")

                await safeSend(sock, id, {
                    text: "⚠️ Owner tidak bisa diturunkan!"
                })
                continue
            }

            // WELCOME
            if (action === "add") {
                await safeSend(sock, id, {
                    text: `✨ Welcome @${number} ✨`,
                    mentions: [clean]
                })
            }

            // GOODBYE
            if (action === "remove") {
                await safeSend(sock, id, {
                    text: `👋 Goodbye @${number}`,
                    mentions: [clean]
                })
            }
        }

    } catch (e) {
        console.log("GROUP EVENT ERROR:", e)
    }
})

// =========================
// LOAD COMMANDS
// =========================
const commands = new Map()

if (fs.existsSync("./commands")) {
    for (const file of fs.readdirSync("./commands")) {
        try {
            const cmd = require(`./commands/${file}`)
            if (cmd?.name && cmd?.execute) {
                commands.set(cmd.name.toLowerCase(), cmd)
            }
        } catch (e) {
            console.log("LOAD CMD ERROR:", e)
        }
    }
}

// =========================
// MESSAGE HANDLER
// =========================
sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
        const m = messages?.[0]
        if (!m?.message || !m.key) return
        if (m.key.fromMe) return

        const from = m.key.remoteJid
        if (!from || !from.endsWith("@g.us")) return

        // 🔥 FIX SENDER
        const rawSender = m.key.participant || m.key.remoteJid
        const sender = rawSender.split(":")[0]

        const text = (
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            ""
        ).trim()

        if (!text.startsWith(prefix)) return
        if (!allowRequest(sender)) return

        const command = text.slice(1).split(" ")[0].toLowerCase()

        let db = loadDB()

        // INIT USER
        if (!db[sender]) {
            db[sender] = {
                exp: 0,
                level: 1,
                created: Date.now()
            }
        }

        // 🔥 OWNER AUTO DEWA
        if (isOwnerJid(sender)) {
            db[sender].level = Infinity
            db[sender].exp = Infinity
        } else {
            db[sender].exp += 10

            const need = db[sender].level * 100

            if (db[sender].exp >= need) {
                db[sender].level++
                db[sender].exp = 0

                await safeSend(sock, from, {
                    text: `🎉 @${sender.split("@")[0]} naik ke level ${db[sender].level}!`,
                    mentions: [sender]
                })
            }
        }

        saveDB(db)

        const metadata = await sock.groupMetadata(from)
        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => p.id.split(":")[0])

        const isAdmin = admins.includes(sender)
        const isOwner = isOwnerJid(sender)

        const cmd = commands.get(command)
        if (!cmd) return

        queue.push(async () => {
            await cmd.execute(sock, from, text, db, safeSend, {
                isAdmin,
                isOwner,
                sender,
                metadata,
                m,
                isOwnerJid
            })
        })

        runQueue()

    } catch (e) {
        console.log("ERROR:", e)
    }
})

}

startBot()