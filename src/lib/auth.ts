import bcrypt from "bcryptjs";
import { getDB } from "./mongodb";
import { COLLECTIONS, SettingsDoc } from "./types";

const SALT_ROUNDS = 10;

export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifySecret(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function getSettings(): Promise<SettingsDoc | null> {
  const db = await getDB();
  return db.collection<SettingsDoc>(COLLECTIONS.settings).findOne({});
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!pin || !/^\d{6}$/.test(pin)) return false;
  const settings = await getSettings();
  if (!settings) return false;
  return verifySecret(pin, settings.pinHash);
}

export async function verifyRecovery(recovery: string): Promise<boolean> {
  if (!recovery || recovery.trim().length === 0) return false;
  const settings = await getSettings();
  if (!settings) return false;
  return verifySecret(recovery.trim(), settings.recoveryHash);
}

export async function createSettings(pin: string, recovery: string) {
  const db = await getDB();
  const existing = await getSettings();
  if (existing) throw new Error("Settings already exist");
  const pinHash = await hashSecret(pin);
  const recoveryHash = await hashSecret(recovery.trim());
  const now = new Date();
  return db.collection(COLLECTIONS.settings).insertOne({
    pinHash,
    recoveryHash,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updatePin(newPin: string) {
  const db = await getDB();
  const pinHash = await hashSecret(newPin);
  return db
    .collection(COLLECTIONS.settings)
    .updateOne({}, { $set: { pinHash, updatedAt: new Date() } });
}

export async function updateRecovery(newRecovery: string) {
  const db = await getDB();
  const recoveryHash = await hashSecret(newRecovery.trim());
  return db
    .collection(COLLECTIONS.settings)
    .updateOne({}, { $set: { recoveryHash, updatedAt: new Date() } });
}