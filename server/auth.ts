import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";
import { hashPassword, comparePasswords } from "./password-utils";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export function setupAuth(app: Express) {
  const MemStore = MemoryStore(session);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mywallet-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      // הגדרת אפשרויות לתמיכה בשימוש בשדה אימייל
      {
        usernameField: 'username', // שם השדה בבקשה (יכול להיות גם אימייל)
        passwordField: 'password'
      },
      async (username, password, done) => {
        try {
          console.log("🔑 Attempt login:", username);
          
          // בדיקה האם זה נראה כמו אימייל
          const isEmail = username.includes('@');
          
          // חיפוש משתמש לפי שם משתמש או אימייל
          let user = null;
          if (isEmail) {
            console.log("👆 Trying login with email");
            user = await storage.getUserByEmail(username);
          } else {
            console.log("👆 Trying login with username");
            user = await storage.getUserByUsername(username);
          }
          
          if (!user) {
            console.log("❌ User not found");
            return done(null, false);
          }
      
          console.log("👤 User found:", user.username);
          const match = await comparePasswords(password, user.password as string);
          console.log("🧪 Password match:", match);
      
          if (!user.password || !match) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (err) {
          console.error("🔥 Error in login:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password hash back to the client
        const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password hash back to the client
        const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication token is required" });
    }
    // Don't send the password hash back to the client
    const { password, resetToken, resetTokenExpiry, ...safeUser } = req.user as SelectUser;
    res.json(safeUser);
  });
}