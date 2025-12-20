// MongoDB Client - Server-side only
import { MongoClient, type Db, ObjectId } from "mongodb"
import { DB_CONFIG } from "./config"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb

  if (!cachedClient) {
    cachedClient = new MongoClient(DB_CONFIG.MONGODB_URI)
    await cachedClient.connect()
  }

  cachedDb = cachedClient.db(DB_CONFIG.DB_NAME)
  return cachedDb
}

export { ObjectId }
