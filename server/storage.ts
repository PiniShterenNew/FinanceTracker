import { users, type User, type InsertUser } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

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

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAnonymousId(anonymousId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  storeCloudData(userId: number, data: string, timestamp?: string): Promise<CloudData>;
  getCloudData(userId: number, timestamp?: string): Promise<CloudData | undefined>;
  getAnonymousStats(): Promise<AnonymousStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cloudData: Map<number, CloudData[]>;
  private activeSessions: Set<string>;
  private deviceTypes: Record<string, number>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.cloudData = new Map();
    this.activeSessions = new Set();
    this.deviceTypes = {};
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Not using usernames in our implementation, but keeping the method
    // for interface compatibility
    return undefined;
  }
  
  async getUserByAnonymousId(anonymousId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.anonymousId === anonymousId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    // Ensure settings is not undefined
    const settings = insertUser.settings || {};
    const user: User = { 
      anonymousId: insertUser.anonymousId,
      settings,
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
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
