const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const fs = require("fs")
const path = require("path")

// ===== DATABASE =====
const rankDB = "./database/rank.json"
const ownerDB = "./database/owner.json"

if (!fs.existsSync("./database")) fs.mkdirSync("./database")
if (!fs.existsSync(rankDB)) fs.writeFileSync(rankDB, "{}")
if (!fs.existsSync(ownerDB)) fs.writeFileSync(ownerDB, JSON.stringify({ owner: ["085199038432"] }, null, 2))

const getRank = (num) => {
  const db = JSON.parse(fs.readFileSync(rankDB))
  return db[num] || 1
}

const setRank = (num, rank) => {
  const db = JSON.parse(fs.readFileSync(rankDB))
  db[num] = rank
  fs.writeFileSync(rankDB, JSON.stringify(db, null, 2))
}

const delRank = (num) => {
  const db = JSON.parse(fs.readFileSync(rankDB))
  delete db[num]
  fs.writeFileSync(rankDB, JSON.stringify(db, null, 2))
}

const randomPass = (name) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let res = name
  for (let i = 0; i < 6; i++) {
    res += chars[Math.floor(Math.random() * chars.length)]
  }
  return res
}

// ===== BOT =====
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const sock = makeWASocket({ auth: state, printQRInTerminal: true })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const from = m.key.remoteJid
    const sender = (m.key.participant || from).split("@")[0]
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const args = text.trim().split(/\s+/)
    const cmd = args[0].toLowerCase()
    const rank = getRank(sender)
    const date = new Date().toLocaleDateString("id-ID")

    // ===== MENU =====
    if (cmd === ".menu") {
      return sock.sendMessage(from, {
        text: `📋 MENU PANEL
Rank kamu: ${rank}

.cuser nama nomor
.cadp nama nomor
.chost nama nomor
.ccom nama nomor

Credits: Rexxy`
      })
    }

    // ===== OWNER MENU =====
    if (cmd === ".cmenu" && rank === 4) {
      return sock.sendMessage(from, {
        text: `👑 OWNER MENU
.setrank nomor 1-4
.delrank nomor`
      })
    }

    if (cmd === ".setrank" && rank === 4) {
      setRank(args[1], Number(args[2]))
      return sock.sendMessage(from, { text: "✅ Rank berhasil diset" })
    }

    if (cmd === ".delrank" && rank === 4) {
      delRank(args[1])
      return sock.sendMessage(from, { text: "✅ Rank berhasil dihapus" })
    }

    // ===== CREATE =====
    if (cmd.startsWith(".c")) {
      const name = args[1]
      const number = args[2]
      if (!name || !number) return sock.sendMessage(from, { text: "❌ Format salah" })

      const pass = randomPass(name)
      const link = cmd === ".cadp"
        ? "https://cx.galaxyhost.biz.id"
        : "https://p4.pablocloud.biz.id/"

      await sock.sendMessage(number + "@s.whatsapp.net", {
        text: `✅ Succes Create
User: ${name}
Password: ${pass}
Link: ${link}
Date: ${date}`
      })

      return sock.sendMessage(from, { text: "✅ Berhasil dikirim ke user" })
    }
  })
}

startBot()
        
