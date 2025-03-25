import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";

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
