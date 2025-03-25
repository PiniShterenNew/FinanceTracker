import { pgTable, text, serial, integer, doublePrecision, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Category types
export const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: "restaurant" },
  { id: "shopping", name: "Shopping", icon: "shopping_bag" },
  { id: "transport", name: "Transportation", icon: "directions_car" },
  { id: "entertainment", name: "Entertainment", icon: "sports_esports" },
  { id: "utilities", name: "Bills & Utilities", icon: "receipt" },
  { id: "health", name: "Health & Medical", icon: "local_hospital" },
  { id: "housing", name: "Housing", icon: "home" },
  { id: "education", name: "Education", icon: "school" },
  { id: "personal", name: "Personal Care", icon: "spa" },
  { id: "travel", name: "Travel", icon: "flight" },
  { id: "income", name: "Income", icon: "attach_money" },
  { id: "savings", name: "Savings", icon: "savings" },
  { id: "other", name: "Other", icon: "category" }
];

// Users (for anonymous ID)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  anonymousId: text("anonymous_id").notNull().unique(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  anonymousId: true,
  settings: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // "expense" or "income"
  category: text("category").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  syncStatus: text("sync_status").default("synced"), // "synced", "pending", "failed"
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  category: true,
  description: true,
  date: true,
  syncStatus: true,
});

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  category: true,
  amount: true,
  startDate: true,
  endDate: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

// Define frontend types for local storage
export interface TransactionData extends Omit<Transaction, 'id' | 'userId' | 'createdAt'> {
  id?: number;
  localId?: string;
}

export interface BudgetData extends Omit<Budget, 'id' | 'userId' | 'createdAt'> {
  id?: number;
  localId?: string;
}

export interface UserSettings {
  language: string;
  darkMode: boolean;
  currency: string;
  reminderEnabled: boolean;
  cloudSyncEnabled: boolean;
}
