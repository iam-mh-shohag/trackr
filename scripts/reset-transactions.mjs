import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const PERSON_ID = "6aeb4002c54b77ea4fed07b2"; // Shohag

const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  await client.connect();
  const db = client.db("trackr");

  const res = await db.collection("transactions").deleteMany({
    personId: new ObjectId(PERSON_ID),
  });
  console.log(`Deleted ${res.deletedCount} transactions for Shohag.`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});