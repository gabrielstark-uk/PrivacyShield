import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { setupAuth } from "./auth";
import { setupStripe, initializeSubscriptionPlans } from "./stripe";
import { setupChatbot } from "./chatbot";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add security headers
app.use((req, res, next) => {
  // Protect against XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Set strict Content Security Policy in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.stripe.com; frame-src https://*.stripe.com;"
    );
  }
  next();
});

// Check for session secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('WARNING: SESSION_SECRET environment variable is not set. Using a default secret is not secure for production.');
}

// Set up session middleware
app.use(session({
  secret: sessionSecret || 'privacy-shield-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Set up authentication
  setupAuth(app);

  // Set up Stripe integration
  setupStripe(app);

  // Initialize subscription plans if they don't exist
  try {
    const { storage } = await import('./storage');
    const plans = await storage.getActiveSubscriptionPlans();

    if (!plans || plans.length === 0) {
      log('No subscription plans found. Initializing default plans...');
      await initializeSubscriptionPlans();
      log('Default subscription plans initialized successfully');
    } else {
      log(`Found ${plans.length} active subscription plans`);
    }
  } catch (error) {
    console.error('Error checking/initializing subscription plans:', error);
  }

  // Set up chatbot
  setupChatbot(app);

  // Register main routes
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log detailed error in development, but be careful about sensitive info in production
    if (process.env.NODE_ENV !== 'production') {
      console.error("Server error:", err);
    } else {
      // In production, log without potentially sensitive details
      console.error(`Server error: ${status} - ${message}`);
    }

    // Don't expose error details in production
    if (process.env.NODE_ENV === 'production') {
      if (status === 500) {
        return res.status(status).json({
          message: "Internal Server Error"
        });
      }
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Use production configuration
    const { configureProductionApp } = await import('./production.js');
    configureProductionApp(app);
  }

  // Serve the app on an available port
  // this serves both the API and the client.
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
