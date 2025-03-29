import fs from "fs/promises";
import path from "path";
import { IStorage } from "./interfaces/storage";
import { User, InsertUser, PaymentMethod, InsertPaymentMethod } from "@shared/schema";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { hashPassword, comparePasswords } from "./password-utils";

const DATA_FILE = path.resolve("data.json");

interface DataFile {
  users: User[];
  paymentMethods: PaymentMethod[];
  cloudData: any[];
}

export class FileStorage implements IStorage {
  private data: DataFile;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'mywallet-secret-key';
  private readonly TOKEN_EXPIRY = '7d';

  constructor() {
    this.data = { users: [], paymentMethods: [], cloudData: [] };
  }

  async load() {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      this.data = JSON.parse(raw);
    } catch {
      await this.save(); // אם אין קובץ, צור חדש
    }
  }

  async save() {
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2));
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.data.users.length + 1;
    const now = new Date();

    const hashedPassword = user.password
    ? await hashPassword(user.password)  // שים לב ל-await
    : null;

    const newUser: User = {
      id,
      anonymousId: user.anonymousId || crypto.randomUUID(),
      email: user.email || null,
      username: user.username || null,
      password: hashedPassword,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      phone: user.phone || null,
      profilePicture: user.profilePicture || null,
      settings: user.settings || {},
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: now,
      updatedAt: now
    };

    this.data.users.push(newUser);
    await this.save();
    return newUser;
  }

  async login(username: string, password: string) {
    const user = this.data.users.find(u => u.username === username);
    if (!user || !user.password) return null;
    
    // השתמש בפונקציה החדשה
    const isValid = await comparePasswords(password, user.password);
    if (!isValid) return null;
    const token = jwt.sign({ id: user.id }, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY });
    const { password: _, resetToken, resetTokenExpiry, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.data.users.find(u => u.email === email);
  }

  async getUserByAnonymousId(anonymousId: string): Promise<User | undefined> {
    return this.data.users.find(u => u.anonymousId === anonymousId);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const now = new Date();

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: now
    };

    const index = this.data.users.findIndex(u => u.id === id);
    this.data.users[index] = updatedUser;
    await this.save();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const initialLength = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    await this.save();
    return this.data.users.length < initialLength;
  }

  async loginWithEmail(email: string, password: string) {
    const user = this.data.users.find(u => u.email === email);
    if (!user || !user.password) return null;
    
    // השתמש בפונקציה החדשה
    const isValid = await comparePasswords(password, user.password);
    if (!isValid) return null;

    const token = jwt.sign({ id: user.id }, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY });
    const { password: _, resetToken, resetTokenExpiry, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async createResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 שעות

    user.resetToken = resetToken;
    user.resetTokenExpiry = expiry;
    user.updatedAt = new Date();

    await this.save();
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = this.data.users.find(u =>
      u.resetToken === token && u.resetTokenExpiry && new Date(u.resetTokenExpiry) > new Date()
    );

    if (!user) return false;

    user.password = await hashPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.updatedAt = new Date();

    await this.save();
    return true;
  }

  async createPaymentMethod(pm: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.data.paymentMethods.length + 1;
    const now = new Date();

    const newPm: PaymentMethod = {
      id,
      userId: pm.userId ?? null,
      name: pm.name,
      type: pm.type,
      accountNumber: pm.accountNumber ?? null,
      bankName: pm.bankName ?? null,
      expiryDate: pm.expiryDate ?? null,
      color: pm.color ?? null,
      icon: pm.icon ?? null,
      isDefault: pm.isDefault ?? false,
      createdAt: now,
      updatedAt: now
    };

    if (newPm.isDefault) {
      this.data.paymentMethods.forEach(pm => {
        if (pm.userId === newPm.userId) pm.isDefault = false;
      });
    }

    this.data.paymentMethods.push(newPm);
    await this.save();
    return newPm;
  }

  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return this.data.paymentMethods.filter(pm => pm.userId === userId);
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.data.paymentMethods.find(pm => pm.id === id);
  }

  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod> {
    const index = this.data.paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) throw new Error("Payment method not found");

    const pm = this.data.paymentMethods[index];
    const now = new Date();
    const updated = { ...pm, ...updates, updatedAt: now };

    if (updates.isDefault) {
      this.data.paymentMethods.forEach(p => {
        if (p.userId === updated.userId) p.isDefault = false;
      });
    }

    this.data.paymentMethods[index] = updated;
    await this.save();
    return updated;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const before = this.data.paymentMethods.length;
    this.data.paymentMethods = this.data.paymentMethods.filter(pm => pm.id !== id);
    await this.save();
    return this.data.paymentMethods.length < before;
  }

  async storeCloudData(userId: number, data: string, timestamp?: string) {
    const now = timestamp || new Date().toISOString();

    // Remove any previous with same timestamp
    this.data.cloudData = this.data.cloudData.filter(d => !(d.userId === userId && d.timestamp === now));

    this.data.cloudData.push({ userId, data, timestamp: now });

    // Keep most recent 10
    this.data.cloudData = this.data.cloudData
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    await this.save();
    return { userId, data, timestamp: now };
  }

  async getCloudData(userId: number, timestamp?: string) {
    const data = this.data.cloudData.filter(d => d.userId === userId);
    if (!data.length) return undefined;
    if (timestamp) {
      return data.find(d => d.timestamp === timestamp);
    }
    return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  async getAnonymousStats() {
    const totalUsers = this.data.users.length;
    const activeUsersDaily = Math.floor(totalUsers * 0.3);
    const activeUsersWeekly = Math.floor(totalUsers * 0.7);
    const activeUsersMonthly = totalUsers;

    return {
      totalUsers,
      activeUsersDaily,
      activeUsersWeekly,
      activeUsersMonthly,
      activeSessions: 0,
      deviceTypes: {}
    };
  }
}
