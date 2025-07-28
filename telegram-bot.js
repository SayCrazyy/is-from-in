const { Telegraf } = require("telegraf")
const { MongoClient, ObjectId } = require("mongodb")

require("dotenv").config()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const CHANNEL = process.env.TELEGRAM_CHANNEL || "@isfromin"

// Send code (used by API)
const express = require("express")
const app = express()
app.use(express.json())

app.post("/send", async (req, res) => {
  const { telegram, code } = req.body
  try {
    await bot.telegram.sendMessage("@" + telegram, `Your is-from.in verification code: ${code}\nSend /verify ${code} here.`)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: "Failed to send Telegram message" })
  }
})

bot.start(ctx => ctx.reply("Welcome to is-from.in bot! Use /verify <code> to verify."))
bot.help(ctx => ctx.reply("Use /verify <code> to verify your account with the code sent on registration."))

bot.command("verify", async ctx => {
  const parts = ctx.message.text.split(" ")
  if (parts.length != 2)
    return ctx.reply("Usage: /verify <code>")
  const code = parts[1]
  try {
    // Check if user is channel member
    let isMember = false
    try {
      const member = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id)
      if (["member","administrator","creator"].includes(member.status)) isMember = true
    } catch {}
    if (!isMember) return ctx.reply("You must join the @isfromin channel first!")

    // Find verification in DB
    const client = await MongoClient.connect(process.env.MONGO_URI)
    const db = client.db()
    const ver = await db.collection("verifications").findOne({ code })
    if (!ver) return ctx.reply("Invalid or expired code.")

    // Update user as verified
    await db.collection("users").updateOne(
      { _id: new ObjectId(ver.userId) },
      { $set: { telegramVerified: true, isChannelMember: true } }
    )
    ctx.reply("Telegram verified! You can now complete registration on the website.")
  } catch (e) {
    ctx.reply("Error verifying. Please try again.")
  }
})

bot.launch()
app.listen(process.env.BOT_PORT || 8375, () => {
  console.log("Telegram bot server running")
})