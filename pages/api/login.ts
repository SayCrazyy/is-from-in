import { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { MongoClient } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { email, password } = req.body
  const client = await MongoClient.connect(process.env.MONGO_URI!)
  const db = client.db()
  const user = await db.collection("users").findOne({ email })
  if (!user) return res.status(404).json({ error: "Email not found" })
  if (!await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ error: "Wrong password" })
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" })
  res.json({ token })
}