import { NextApiRequest, NextApiResponse } from "next"
import { MongoClient } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { email, code } = req.body
  const client = await MongoClient.connect(process.env.MONGO_URI!)
  const db = client.db()
  const user = await db.collection("users").findOne({ email })
  if (!user) return res.status(404).json({ error: "User not found" })
  const ver = await db.collection("verifications").findOne({ userId: user._id, code })
  if (!ver || ver.expiresAt < Date.now()) return res.status(400).json({ error: "Invalid/expired code" })
  // Bot will update DB when user verifies via Telegram /verify
  // So we just check if user is now marked as verified
  const updatedUser = await db.collection("users").findOne({ email })
  if (!updatedUser || !updatedUser.telegramVerified) {
    return res.status(400).json({ error: "Not verified yet. Please use /verify <code> in bot." })
  }
  res.json({ success: true })
}