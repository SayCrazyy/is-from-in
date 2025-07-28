import { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  let userId = ""
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    userId = decoded.userId
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const client = await MongoClient.connect(process.env.MONGO_URI!)
  const db = client.db()
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  if (!user) return res.status(404).json({ error: "Not found" })
  res.json({ user: {
    email: user.email,
    telegramUsername: user.telegramUsername,
    telegramVerified: user.telegramVerified,
    isChannelMember: user.isChannelMember,
    subdomain: user.subdomain,
    target: user.target,
    records: user.records || []
  }})
}