import { z } from "zod";

const ScreenshotSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  fileType: z.enum(["image", "pdf"]).default("image"),
  fileSize: z.number().optional(),
  originalName: z.string().optional(),
});

export const CreatePersonSchema = z.object({
  name: z.string().trim().min(1).max(80),
  note: z.string().trim().max(200).optional().default(""),
});

export const UpdatePersonSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(200).optional(),
  isActive: z.boolean().optional(),
});

export const UnlockPersonSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
});

export const CreateChannelSchema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(["bank", "mfs", "cash"]),
});

export const UpdateChannelSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  isActive: z.boolean().optional(),
});

export const CreateTransactionSchema = z.object({
  channelId: z.string().min(1),
  direction: z.enum(["received", "sent"]),
  amount: z.coerce.number().positive(),
  counterpartyName: z.string().trim().max(80).optional().default(""),
  counterpartyRef: z.string().trim().max(80).optional().default(""),
  referenceNo: z.string().trim().max(120).optional().default(""),
  transactionDate: z.coerce.date(),
  notes: z.string().trim().max(1000).optional().default(""),
  screenshots: z.array(ScreenshotSchema).max(5).optional().default([]),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial();

export const DeleteTransactionSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
});

export const CreateSettlementSchema = z.object({
  settledAt: z.coerce.date(),
  note: z.string().trim().max(500).optional().default(""),
  screenshots: z.array(ScreenshotSchema).max(5).optional().default([]),
});

export const SetupPinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
  recovery: z.string().trim().min(4).max(200),
});

export const VerifyPinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
});

export const ChangePinSchema = z.object({
  currentPin: z.string().regex(/^\d{6}$/),
  newPin: z.string().regex(/^\d{6}$/),
});

export const ResetPinSchema = z.object({
  recovery: z.string().trim().min(1),
  newPin: z.string().regex(/^\d{6}$/),
});

export const ChangeRecoverySchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
  newRecovery: z.string().trim().min(4).max(200),
});