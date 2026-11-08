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

  const res = await db.collection("people").deleteMany({});
  console.log(`Deleted ${res.deletedCount} people.`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});