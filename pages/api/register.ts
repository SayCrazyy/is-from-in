import { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"
import { MongoClient, ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { email, password, telegram } = req.body
  if (!email || !password || !telegram) return res.status(400).json({ error: "Missing fields" })

  const client = await MongoClient.connect(process.env.MONGO_URI!)
  const db = client.db()
  if (await db.collection("users").findOne({ email })) return res.status(409).json({ error: "Email exists" })
  if (await db.collection("users").findOne({ telegramUsername: telegram })) return res.status(409).json({ error: "Telegram already used" })

  const hash = await bcrypt.hash(password, 10)
  const user = await db.collection("users").insertOne({
    email, passwordHash: hash, telegramUsername: telegram, telegramVerified: false, isChannelMember: false, subdomain: null, target: null, records: []
  })
  // Generate code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await db.collection("verifications").insertOne({
    userId: user.insertedId, code, expiresAt: Date.now() + 10*60*1000
  })
  // Send code via bot
  //await fetch(process.env.BOT_URL + "/send", {
  //  method: "POST",
  //  headers: {"Content-Type": "application/json"},
  //  body: JSON.stringify({telegram, code})
  //})
  res.json({ ok: true, code })
}