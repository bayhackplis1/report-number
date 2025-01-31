import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { REPORT_STATUS, type ReportStatus } from "../client/src/lib/constants";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).$type<ReportStatus>().notNull().default(REPORT_STATUS.PENDING),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create base schema first
const baseSchema = createSelectSchema(reports);

// Then customize it for insert
export const insertReportSchema = z.object({
  phoneNumber: baseSchema.shape.phoneNumber,
  description: baseSchema.shape.description,
  status: baseSchema.shape.status.optional(),
  createdAt: baseSchema.shape.createdAt.optional(),
});

export const selectReportSchema = baseSchema;

export type InsertReport = typeof reports.$inferInsert;
export type SelectReport = typeof reports.$inferSelect;