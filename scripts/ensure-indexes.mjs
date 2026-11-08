import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set. Check .env.local");
  process.exit(1);
}
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db("trackr");

  console.log("Creating indexes...");

  await db.collection("people").createIndex({ name: 1 }, { unique: true });
  console.log("✓ people.name unique index");

  await db
    .collection("channels")
    .createIndex({ personId: 1, name: 1 }, { unique: true });
  console.log("✓ channels (personId, name) unique index");

  await db
    .collection("transactions")
    .createIndex({ personId: 1, settlementId: 1, transactionDate: -1 });
  console.log("✓ transactions query index");

  await db
    .collection("settlements")
    .createIndex({ personId: 1, settledAt: -1 });
  console.log("✓ settlements query index");

  console.log("All indexes created.");
  await client.close();
}

main().catch((err) => {
  console.error("Index creation failed:", err);
  process.exit(1);
});