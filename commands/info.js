module.exports = {
    name: "info",
    execute: async (sock, from, text, db, safeSend, owner, m) => {

        const metadata = await sock.groupMetadata(from)

        const teks = `
📊 INFO GRUP

Nama: ${metadata.subject}
Member: ${metadata.participants.length}
Owner: ${metadata.owner || "-"}
`

        await safeSend(sock, from, { text: teks })
    }
}