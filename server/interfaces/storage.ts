import { User, InsertUser, PaymentMethod, InsertPaymentMethod } from "@shared/schema";

export interface AuthResponse {
  user: Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'>;
  token: string;
}

interface CloudData {
  userId: number;
  data: string;
  timestamp: string;
}

interface AnonymousStats {
  totalUsers: number;
  activeUsersDaily: number;
  activeUsersWeekly: number;
  activeUsersMonthly: number;
  activeSessions: number;
  deviceTypes: Record<string, number>;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAnonymousId(anonymousId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;

  login(username: string, password: string): Promise<AuthResponse | null>;
  loginWithEmail(email: string, password: string): Promise<AuthResponse | null>;
  createResetToken(email: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<boolean>;

  storeCloudData(userId: number, data: string, timestamp?: string): Promise<CloudData>;
  getCloudData(userId: number, timestamp?: string): Promise<CloudData | undefined>;

  getAnonymousStats(): Promise<AnonymousStats>;
}
