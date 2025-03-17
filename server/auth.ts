import { Router } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { storage } from "./storage";
import { log } from "./vite";

// User schema validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

// Registration schema validation
const registerSchema = userSchema.extend({
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Setup passport authentication
export function setupAuth(app: Router) {
  // Configure passport local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        
        // Don't return the password hash to the client
        const { passwordHash, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      
      if (!user) {
        return done(null, false);
      }
      
      // Don't return the password hash to the client
      const { passwordHash, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
  
  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Register routes
  
  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(validatedData.password, salt);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash,
        name: validatedData.name || '',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });
      
      // Don't return the password hash to the client
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      // Log the user in
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        
        return res.status(201).json({ user: userWithoutPassword });
      });
      
      log(`New user registered: ${user.email}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  // Login endpoint
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: Express.User, info: { message: any; }) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        log(`User logged in: ${(user as any).email}`);
        return res.json({ user });
      });
    })(req, res, next);
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error during logout' });
      }
      
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user endpoint
  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json({ user: req.user });
  });
  
  // Middleware to check if user is authenticated
  app.use('/api/user/*', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    next();
  });
  
  // Update user profile
  app.put('/api/user/profile', async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Validate request body
      const validatedData = z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
      }).parse(req.body);
      
      // Update user
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      // Don't return the password hash to the client
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Profile update error:', error);
      return res.status(500).json({ message: 'Server error during profile update' });
    }
  });
  
  // Change password
  app.put('/api/user/password', async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Validate request body
      const validatedData = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }).parse(req.body);
      
      // Get user
      const user = await storage.getUserById(userId);
      
      // Check current password
      const isMatch = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(validatedData.newPassword, salt);
      
      // Update user
      await storage.updateUser(userId, { passwordHash });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Password change error:', error);
      return res.status(500).json({ message: 'Server error during password change' });
    }
  });
}