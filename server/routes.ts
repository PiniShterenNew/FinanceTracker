import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";
import { insertUserSchema, insertPaymentMethodSchema, CATEGORIES, PAYMENT_METHODS } from "@shared/schema";
import { z } from "zod";
import jwt from 'jsonwebtoken';
import { setupAuth } from "./auth";

// Authentication middleware that checks if the user is logged in
// This can be used with either session auth or JWT
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Try JWT authentication if session authentication failed
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mywallet-secret-key') as { id: number };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Cloud sync encryption helpers
function encrypt(text: string, secretKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

function decrypt(text: string, secretKey: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(secretKey, 'hex'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize passport and session authentication
  setupAuth(app);
  
  // Enable both session and JWT authentication for the API
  // Session authentication routes are provided by setupAuth
  
  // JWT-specific routes for mobile/API clients
  app.post("/api/jwt/login", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }
      
      let authResponse = null;
      
      // Try to login with username or email
      if (username) {
        authResponse = await storage.login(username, password);
      } else if (email) {
        authResponse = await storage.loginWithEmail(email, password);
      } else {
        return res.status(400).json({ message: 'Username or email is required' });
      }
      
      if (!authResponse) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      res.json(authResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const resetToken = await storage.createResetToken(email);
      
      if (!resetToken) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
      }
      
      // In a real app, we would send an email with a reset link
      // For development, we'll just return the token
      res.status(200).json({ 
        message: 'Password reset token generated',
        token: resetToken,
        note: 'In a production app, this token would be sent via email'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during password reset request' });
    }
  });
  
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }
      
      const success = await storage.resetPassword(token, newPassword);
      
      if (!success) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during password reset' });
    }
  });
  
  // Protected user routes - uses both session and JWT authentication
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send password back to client
      const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
      
      // Get payment methods
      const paymentMethods = await storage.getPaymentMethods(userId);
      
      res.json({ ...safeUser, paymentMethods });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while fetching user data' });
    }
  });
  
  app.put("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      const updateData = req.body;
      
      // Validate update data
      const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'profilePicture', 'settings'];
      const sanitizedData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce<Record<string, any>>((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
      
      const user = await storage.updateUser(userId, sanitizedData);
      
      // Don't send password back to client
      const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
      
      res.json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while updating user data' });
    }
  });
  
  // Payment methods routes
  app.post("/api/payment-methods", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      
      // Validate request body
      const data = { ...req.body, userId };
      const validatedData = insertPaymentMethodSchema.parse(data);
      
      const paymentMethod = await storage.createPaymentMethod(validatedData);
      res.status(201).json(paymentMethod);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating payment method' });
      }
    }
  });
  
  app.get("/api/payment-methods", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      const paymentMethods = await storage.getPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while fetching payment methods' });
    }
  });
  
  app.get("/api/payment-methods/:id", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      const id = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethod(id);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Check if this payment method belongs to the authenticated user
      if (paymentMethod.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this payment method' });
      }
      
      res.json(paymentMethod);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while fetching payment method' });
    }
  });
  
  app.put("/api/payment-methods/:id", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      const id = parseInt(req.params.id);
      const existingPaymentMethod = await storage.getPaymentMethod(id);
      
      if (!existingPaymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Check if this payment method belongs to the authenticated user
      if (existingPaymentMethod.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this payment method' });
      }
      
      // Update payment method
      const updatedPaymentMethod = await storage.updatePaymentMethod(id, req.body);
      res.json(updatedPaymentMethod);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while updating payment method' });
    }
  });
  
  app.delete("/api/payment-methods/:id", requireAuth, async (req, res) => {
    try {
      const userId = typeof req.user === 'object' ? req.user.id : req.user;
      const id = parseInt(req.params.id);
      const existingPaymentMethod = await storage.getPaymentMethod(id);
      
      if (!existingPaymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Check if this payment method belongs to the authenticated user
      if (existingPaymentMethod.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this payment method' });
      }
      
      await storage.deletePaymentMethod(id);
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while deleting payment method' });
    }
  });
  
  // Standard routes 
  app.get("/api/categories", (_req, res) => {
    res.json(CATEGORIES);
  });
  
  app.get("/api/payment-methods-types", (_req, res) => {
    res.json(PAYMENT_METHODS);
  });
  // Anonymous user registration/lookup route
  app.post('/api/users/anonymous', async (req, res) => {
    try {
      const { anonymousId } = req.body;
      
      if (!anonymousId) {
        return res.status(400).json({ message: 'Anonymous ID is required' });
      }
      
      // Check if user exists
      let user = await storage.getUserByAnonymousId(anonymousId);
      
      // If not, create a new one
      if (!user) {
        user = await storage.createUser({
          anonymousId,
          settings: {}
        });
      }
      
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          anonymousId: user.anonymousId,
          settings: user.settings
        }
      });
    } catch (error) {
      console.error('Error in anonymous user registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Cloud sync endpoints
  app.post('/api/sync', async (req, res) => {
    try {
      const { anonymousId, data, timestamp } = req.body;
      
      if (!anonymousId || !data) {
        return res.status(400).json({ message: 'Anonymous ID and data are required' });
      }
      
      // Get or create user
      let user = await storage.getUserByAnonymousId(anonymousId);
      
      if (!user) {
        user = await storage.createUser({
          anonymousId,
          settings: {}
        });
      }
      
      // Generate encryption key from anonymousId 
      // In a real app, we would use a proper key management system
      const secretKey = crypto.createHash('sha256').update(anonymousId).digest('hex');
      
      // Store encrypted data
      const encryptedData = encrypt(JSON.stringify(data), secretKey);
      await storage.storeCloudData(user.id, encryptedData, timestamp);
      
      res.status(200).json({
        success: true,
        message: 'Data synced successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in cloud sync:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/sync/:anonymousId', async (req, res) => {
    try {
      const { anonymousId } = req.params;
      const { timestamp } = req.query;
      
      // Get user
      const user = await storage.getUserByAnonymousId(anonymousId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get cloud data
      const cloudData = await storage.getCloudData(user.id, timestamp as string);
      
      if (!cloudData) {
        return res.status(200).json({
          success: true,
          data: null,
          timestamp: null
        });
      }
      
      // Generate encryption key from anonymousId
      const secretKey = crypto.createHash('sha256').update(anonymousId).digest('hex');
      
      // Decrypt data
      const decryptedData = decrypt(cloudData.data, secretKey);
      
      res.status(200).json({
        success: true,
        data: JSON.parse(decryptedData),
        timestamp: cloudData.timestamp
      });
    } catch (error) {
      console.error('Error in cloud fetch:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Admin routes (would be password-protected in production)
  app.get('/api/admin/stats', async (req, res) => {
    try {
      // This would be secured in production with authentication
      const stats = await storage.getAnonymousStats();
      
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error in admin stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
