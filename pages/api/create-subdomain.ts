import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let userId = "";
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { subdomain } = req.body;

  if (!subdomain || typeof subdomain !== "string")
    return res.status(400).json({ error: "Subdomain required" });

  const name = subdomain.toLowerCase().trim();

  if (!/^[a-z0-9\-]{3,30}$/.test(name))
    return res.status(400).json({ error: "Invalid subdomain (3-30 chars, a-z, 0-9, - only)" });

  const reserved = ["admin", "api", "www", "login", "dash", "ap", "tg"];
  if (reserved.includes(name))
    return res.status(400).json({ error: "This subdomain is reserved" });

  const client = await MongoClient.connect(process.env.MONGO_URI!);
  const db = client.db();

  const exists = await db.collection("users").findOne({ subdomain: name });
  if (exists)
    return res.status(409).json({ error: "Subdomain already taken" });

  await db.collection("users").updateOne(
    { _id: new (require("mongodb").ObjectId)(userId) },
    { $set: { subdomain: name } }
  );

  res.json({ success: true });
}