import { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import axios from "axios"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  let userId = ""
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    userId = decoded.userId
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const { records } = req.body
  if (!Array.isArray(records) || !records.length)
    return res.status(400).json({ error: "No records provided" })

  const client = await MongoClient.connect(process.env.MONGO_URI!)
  const db = client.db()
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  if (!user || !user.telegramVerified || !user.isChannelMember || !user.subdomain)
    return res.status(403).json({ error: "Not allowed" })

  // Remove all old records for this subdomain in Cloudflare
  const cfRecords = await axios.get(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records?name=${user.subdomain}.is-from.in`,
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` } }
  )
  for (const r of cfRecords.data.result) {
    await axios.delete(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records/${r.id}`,
      { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` } }
    )
  }
  // Add new records
  for (const rec of records) {
    await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records`,
      {
        type: rec.type,
        name: `${user.subdomain}`,
        content: rec.content,
        ttl: 3600,
        proxied: false
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    )
  }
  // Save records in DB for user
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { records } }
  )
  res.json({ success: true })
}
