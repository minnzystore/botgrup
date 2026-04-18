const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

const owner = "6283847956426@s.whatsapp.net"
const prefix = "."

// =========================
// SIMPLE DATABASE
// =========================
const DB_FILE = "./database.json"

function loadDB() {
    if (!fs.existsSync(DB_FILE)) return {}
    return JSON.parse(fs.readFileSync(DB_FILE))
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
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
// GLOBAL
// =========================
global.processed = new Set()
global.lastMsg = {}
global.reqCount = {}

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

// =========================
// ANTI SPAM
// =========================
function allowRequest(user) {
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
async function safeSend(sock, jid, msg) {
    try {
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
            console.log("❌ DISCONNECT:", reason)

            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 3000)
            } else {
                console.log("⚠️ Scan ulang QR")
            }
        }
    })

    // =========================
    // WELCOME / GOODBYE
    // =========================
    sock.ev.on("group-participants.update", async (data) => {
        const { id, participants, action } = data

        for (let user of participants) {
            if (action === "add") {
                await sock.sendMessage(id, {
                    text: `👋 YOKOSO @${user.split("@")[0]}`,
                    mentions: [user]
                })
            }

            if (action === "remove") {
                await sock.sendMessage(id, {
                    text: `👋 SAYONARA @${user.split("@")[0]}`,
                    mentions: [user]
                })
            }
        }
    })

    // =========================
    // LOAD COMMANDS
    // =========================
    const commands = new Map()

    if (fs.existsSync("./commands")) {
        for (const file of fs.readdirSync("./commands")) {
            const cmd = require(`./commands/${file}`)
            if (cmd?.name && cmd?.execute) {
                commands.set(cmd.name.toLowerCase(), cmd)
            }
        }
    }

    // =========================
    // MESSAGE HANDLER
    // =========================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const m = messages[0]
            if (!m?.message || !m.key) return
            if (m.key.fromMe) return

            const from = m.key.remoteJid
            if (!from.endsWith("@g.us")) return

            const sender = m.key.participant
            const text = (
                m.message?.conversation ||
                m.message?.extendedTextMessage?.text ||
                ""
            ).trim()

            if (!text.startsWith(prefix)) return

            const command = text.slice(1).split(" ")[0].toLowerCase()

            // anti spam
            if (!allowRequest(sender)) return

            let db = loadDB()

            if (!db[sender]) {
                db[sender] = { created: Date.now() }
                saveDB(db)
            }

            const metadata = await sock.groupMetadata(from)
            const admins = metadata.participants
                .filter(p => p.admin)
                .map(p => p.id)

            const isAdmin = admins.includes(sender)
            const isOwner = sender === owner

            const cmd = commands.get(command)
            if (!cmd) return

            queue.push(async () => {
                try {
                    await cmd.execute(sock, from, text, db, safeSend, {
                        isAdmin,
                        isOwner,
                        sender,
                        metadata,
                        m
                    })
                } catch (e) {
                    console.log("CMD ERROR:", e)
                }
            })

            runQueue()

        } catch (e) {
            console.log("ERROR:", e)
        }
    })
}

startBot()