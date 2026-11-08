import { ObjectId } from "mongodb";

export interface SettingsDoc {
  _id?: ObjectId;
  pinHash: string;
  recoveryHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonDoc {
  _id?: ObjectId;
  name: string;
  note: string;
  isLocked: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelDoc {
  _id?: ObjectId;
  personId: ObjectId;
  name: string;
  type: "bank" | "mfs" | "cash";
  isActive: boolean;
  createdAt: Date;
}

export interface Screenshot {
  url: string;
  thumbnailUrl?: string;
  fileType: "image" | "pdf";
  fileSize?: number;
  originalName?: string;
}

export interface TransactionDoc {
  _id?: ObjectId;
  personId: ObjectId;
  channelId: ObjectId;
  direction: "received" | "sent";
  amount: number;
  counterpartyName: string;
  counterpartyRef: string;
  referenceNo: string;
  transactionDate: Date;
  notes: string;
  screenshots: Screenshot[];
  settlementId: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementDoc {
  _id?: ObjectId;
  personId: ObjectId;
  settledAt: Date;
  snapshotBalance: number;
  note: string;
  screenshots: Screenshot[];
  createdAt: Date;
}

export const COLLECTIONS = {
  settings: "settings",
  people: "people",
  channels: "channels",
  transactions: "transactions",
  settlements: "settlements",
} as const;