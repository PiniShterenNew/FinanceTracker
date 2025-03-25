import { users, paymentMethods, type User, type InsertUser, type PaymentMethod, type InsertPaymentMethod } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Interface for cloud data storage
interface CloudData {
  userId: number;
  data: string; // Encrypted data
  timestamp: string;
}

// Interface for anonymous stats
interface AnonymousStats {
  totalUsers: number;
  activeUsersDaily: number;
  activeUsersWeekly: number;
  activeUsersMonthly: number;
  activeSessions: number;
  deviceTypes: Record<string, number>;
}

export interface AuthResponse {
  user: Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'>;
  token: string;
}

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAnonymousId(anonymousId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  
  // Authentication
  login(username: string, password: string): Promise<AuthResponse | null>;
  loginWithEmail(email: string, password: string): Promise<AuthResponse | null>;
  createResetToken(email: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Payment methods
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<boolean>;
  
  // Cloud sync
  storeCloudData(userId: number, data: string, timestamp?: string): Promise<CloudData>;
  getCloudData(userId: number, timestamp?: string): Promise<CloudData | undefined>;
  
  // Statistics
  getAnonymousStats(): Promise<AnonymousStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private paymentMethods: Map<number, PaymentMethod>;
  private cloudData: Map<number, CloudData[]>;
  private activeSessions: Set<string>;
  private deviceTypes: Record<string, number>;
  currentId: number;
  paymentMethodId: number;

  // JWT secret key for token generation
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'mywallet-secret-key';
  private readonly TOKEN_EXPIRY = '7d'; // 7 days

  constructor() {
    this.users = new Map();
    this.paymentMethods = new Map();
    this.cloudData = new Map();
    this.activeSessions = new Set();
    this.deviceTypes = {};
    this.currentId = 1;
    this.paymentMethodId = 1;
  }

  // User Management Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByAnonymousId(anonymousId: string): Promise<User | undefined> {
    if (!anonymousId) return undefined;
    return Array.from(this.users.values()).find(
      (user) => user.anonymousId === anonymousId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    
    // Hash password if provided
    let hashedPassword = null;
    if (insertUser.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(insertUser.password, salt, 1000, 64, 'sha512').toString('hex');
      hashedPassword = `${salt}:${hash}`;
    }
    
    // Create user object with all fields
    const user: User = {
      id,
      anonymousId: insertUser.anonymousId || uuidv4(),
      email: insertUser.email || null,
      username: insertUser.username || null,
      password: hashedPassword,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null, 
      phone: insertUser.phone || null,
      profilePicture: insertUser.profilePicture || null,
      resetToken: null,
      resetTokenExpiry: null,
      settings: insertUser.settings || {},
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updates: Partial<User> = { ...updateData, updatedAt: new Date() };
    
    // Handle password update separately to hash it
    if (updateData.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(updateData.password, salt, 1000, 64, 'sha512').toString('hex');
      updates.password = `${salt}:${hash}`;
    }
    
    // Update user
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Authentication Methods
  async login(username: string, password: string): Promise<AuthResponse | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.password) return null;
    
    // Verify password
    const [salt, storedHash] = user.password.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    if (storedHash !== hash) return null;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      this.JWT_SECRET,
      { expiresIn: this.TOKEN_EXPIRY }
    );
    
    // Return user (without sensitive data) and token
    const { password: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
    return { user: safeUser, token };
  }
  
  async loginWithEmail(email: string, password: string): Promise<AuthResponse | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) return null;
    
    // Verify password
    const [salt, storedHash] = user.password.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    if (storedHash !== hash) return null;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      this.JWT_SECRET,
      { expiresIn: this.TOKEN_EXPIRY }
    );
    
    // Return user (without sensitive data) and token
    const { password: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
    return { user: safeUser, token };
  }
  
  async createResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update user with reset token
    const updatedUser = { 
      ...user, 
      resetToken, 
      resetTokenExpiry: expiry,
      updatedAt: now
    };
    
    this.users.set(user.id, updatedUser);
    return resetToken;
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user with this reset token
    const user = Array.from(this.users.values()).find(
      (u) => u.resetToken === token && u.resetTokenExpiry && new Date(u.resetTokenExpiry) > new Date()
    );
    
    if (!user) return false;
    
    // Hash new password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512').toString('hex');
    const hashedPassword = `${salt}:${hash}`;
    
    // Update user
    const updatedUser = { 
      ...user, 
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date()
    };
    
    this.users.set(user.id, updatedUser);
    return true;
  }
  
  // Payment Methods
  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.paymentMethodId++;
    const now = new Date();
    
    const newPaymentMethod: PaymentMethod = {
      id,
      userId: paymentMethod.userId,
      name: paymentMethod.name,
      type: paymentMethod.type,
      accountNumber: paymentMethod.accountNumber || null,
      bankName: paymentMethod.bankName || null,
      expiryDate: paymentMethod.expiryDate || null,
      color: paymentMethod.color || null,
      icon: paymentMethod.icon || null,
      isDefault: paymentMethod.isDefault || false,
      createdAt: now,
      updatedAt: now
    };
    
    this.paymentMethods.set(id, newPaymentMethod);
    
    // If this is set as default, update other payment methods for this user
    if (newPaymentMethod.isDefault) {
      for (const [otherPmId, otherPm] of this.paymentMethods.entries()) {
        if (otherPmId !== id && otherPm.userId === paymentMethod.userId && otherPm.isDefault) {
          const updated = { ...otherPm, isDefault: false, updatedAt: now };
          this.paymentMethods.set(otherPmId, updated);
        }
      }
    }
    
    return newPaymentMethod;
  }
  
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values())
      .filter(pm => pm.userId === userId);
  }
  
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }
  
  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod> {
    const paymentMethod = await this.getPaymentMethod(id);
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    
    const now = new Date();
    const updatedPaymentMethod = { 
      ...paymentMethod, 
      ...updates,
      updatedAt: now
    };
    
    this.paymentMethods.set(id, updatedPaymentMethod);
    
    // Handle default status changes
    if (updates.isDefault === true) {
      for (const [otherPmId, otherPm] of this.paymentMethods.entries()) {
        if (otherPmId !== id && otherPm.userId === paymentMethod.userId && otherPm.isDefault) {
          const updated = { ...otherPm, isDefault: false, updatedAt: now };
          this.paymentMethods.set(otherPmId, updated);
        }
      }
    }
    
    return updatedPaymentMethod;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }
  
  async storeCloudData(userId: number, data: string, timestamp?: string): Promise<CloudData> {
    if (!this.cloudData.has(userId)) {
      this.cloudData.set(userId, []);
    }
    
    const cloudDataArray = this.cloudData.get(userId)!;
    const now = timestamp || new Date().toISOString();
    
    const cloudData: CloudData = {
      userId,
      data,
      timestamp: now
    };
    
    // Add or update cloud data
    const existingIndex = cloudDataArray.findIndex(cd => cd.timestamp === now);
    if (existingIndex >= 0) {
      cloudDataArray[existingIndex] = cloudData;
    } else {
      cloudDataArray.push(cloudData);
    }
    
    // Keep only the 10 most recent entries
    cloudDataArray.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (cloudDataArray.length > 10) {
      this.cloudData.set(userId, cloudDataArray.slice(0, 10));
    }
    
    return cloudData;
  }
  
  async getCloudData(userId: number, timestamp?: string): Promise<CloudData | undefined> {
    const cloudDataArray = this.cloudData.get(userId);
    
    if (!cloudDataArray || cloudDataArray.length === 0) {
      return undefined;
    }
    
    if (timestamp) {
      return cloudDataArray.find(cd => cd.timestamp === timestamp);
    }
    
    // Return most recent
    return cloudDataArray.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }
  
  async getAnonymousStats(): Promise<AnonymousStats> {
    const totalUsers = this.users.size;
    
    // This is a simplified implementation
    // In a real app, we'd track active users more accurately
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const activeUsersDaily = Math.min(Math.floor(totalUsers * 0.3), totalUsers);
    const activeUsersWeekly = Math.min(Math.floor(totalUsers * 0.7), totalUsers);
    const activeUsersMonthly = totalUsers;
    
    return {
      totalUsers,
      activeUsersDaily,
      activeUsersWeekly,
      activeUsersMonthly,
      activeSessions: this.activeSessions.size,
      deviceTypes: this.deviceTypes,
    };
  }
  
  // Helper method to track sessions (would be called from middleware in a real app)
  trackSession(sessionId: string, deviceType: string): void {
    this.activeSessions.add(sessionId);
    
    if (!this.deviceTypes[deviceType]) {
      this.deviceTypes[deviceType] = 0;
    }
    
    this.deviceTypes[deviceType]++;
  }
  
  // Helper method to end sessions
  endSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }
}

export const storage = new MemStorage();
