import { Router } from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { log } from "./vite";

// Function to initialize default subscription plans
export async function initializeSubscriptionPlans() {
  try {
    // Free tier
    await storage.createSubscriptionPlan({
      name: 'Free',
      description: 'Basic protection for personal use',
      price: 0,
      interval: 'monthly',
      tier: 'free',
      features: [
        'Basic frequency monitoring',
        'Manual threat detection',
        'Limited reports history (7 days)',
        'Community support'
      ],
      active: true
    });

    // Basic tier
    await storage.createSubscriptionPlan({
      name: 'Basic',
      description: 'Enhanced protection for individuals',
      price: 999, // $9.99
      interval: 'monthly',
      tier: 'basic',
      features: [
        'Advanced frequency monitoring',
        'Automatic threat detection',
        'Extended reports history (30 days)',
        'Email alerts',
        'Basic countermeasures',
        'Email support'
      ],
      active: true
    });

    // Premium tier
    await storage.createSubscriptionPlan({
      name: 'Premium',
      description: 'Professional protection for advanced users',
      price: 2999, // $29.99
      interval: 'monthly',
      tier: 'premium',
      features: [
        'Professional frequency monitoring',
        'Real-time threat detection',
        'Unlimited reports history',
        'SMS & Email alerts',
        'Advanced countermeasures',
        'Frequency locking & tracking',
        'Priority email support',
        'Authorities notification'
      ],
      active: true
    });

    // Enterprise tier
    await storage.createSubscriptionPlan({
      name: 'Enterprise',
      description: 'Complete protection for organizations',
      price: 9999, // $99.99
      interval: 'monthly',
      tier: 'enterprise',
      features: [
        'Enterprise-grade frequency monitoring',
        'Real-time threat detection & analysis',
        'Unlimited reports history & analytics',
        'SMS, Email & Phone alerts',
        'Military-grade countermeasures',
        'Advanced frequency locking & tracking',
        'Dedicated support team',
        'Priority authorities notification',
        'Custom integration options',
        'Multiple user accounts'
      ],
      active: true
    });

    log('Default subscription plans created successfully');
  } catch (error) {
    console.error('Error creating default subscription plans:', error);
    throw error;
  }
}

// Initialize Stripe with your secret key from environment variable
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('WARNING: STRIPE_SECRET_KEY environment variable is not set. Stripe functionality will not work correctly.');
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16',
});

export function setupStripe(app: Router) {
  // Get subscription plans
  app.get('/api/subscription-plans', async (_req, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();

      // If no plans are found, initialize default plans
      if (!plans || plans.length === 0) {
        console.log('No subscription plans found. Creating default plans...');

        // Create default plans
        await initializeSubscriptionPlans();

        // Fetch plans again
        const newPlans = await storage.getActiveSubscriptionPlans();
        return res.json({ plans: newPlans });
      }

      res.json({ plans });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ message: 'Error fetching subscription plans' });
    }
  });

  // Admin endpoint to check subscription plans
  app.get('/api/admin/subscription-plans', async (req, res) => {
    try {
      // Require authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if user is an admin
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);

      if (user.subscriptionTier !== 'enterprise') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const allPlans = await storage.getSubscriptionPlans();
      const activePlans = await storage.getActiveSubscriptionPlans();

      res.json({
        allPlans,
        activePlans,
        count: {
          all: allPlans.length,
          active: activePlans.length
        }
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ message: 'Error fetching subscription plans' });
    }
  });

  // Endpoint to manually initialize subscription plans (admin only)
  app.post('/api/admin/initialize-plans', async (req, res) => {
    try {
      // Require authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user is an admin
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);

      if (user.subscriptionTier !== 'enterprise') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // Initialize subscription plans
      await initializeSubscriptionPlans();
      const plans = await storage.getActiveSubscriptionPlans();

      res.json({
        success: true,
        message: 'Subscription plans initialized successfully',
        plans
      });
    } catch (error) {
      console.error('Error initializing subscription plans:', error);
      res.status(500).json({
        success: false,
        message: 'Error initializing subscription plans',
        error: String(error)
      });
    }
  });
  
  // Create a checkout session for subscription
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const { planId } = req.body;
      const userId = (req.user as any).id;
      
      // Get the plan
      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Subscription plan not found' });
      }
      
      // Get the user
      const user = await storage.getUserById(userId);
      
      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }
      
      // Create a price in Stripe if not already created
      let priceId = plan.stripePriceId;
      
      if (!priceId && plan.price > 0) {
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            planId: plan.id.toString(),
            tier: plan.tier
          }
        });
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price,
          currency: 'usd',
          recurring: {
            interval: plan.interval as 'month' | 'year'
          },
          metadata: {
            planId: plan.id.toString()
          }
        });
        
        priceId = price.id;
        
        // Update plan with Stripe price ID
        await storage.updateSubscriptionPlan(plan.id, { stripePriceId: priceId });
      }
      
      // For free plans, just update the user's subscription tier
      if (plan.price === 0) {
        await storage.updateUser(userId, { subscriptionTier: plan.tier });
        return res.json({ 
          success: true, 
          message: 'Subscribed to free plan successfully',
          redirectUrl: '/dashboard'
        });
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/subscription/cancel`,
        metadata: {
          userId: userId.toString(),
          planId: plan.id.toString()
        }
      });
      
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  });
  
  // Handle webhook events from Stripe
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    // Check if webhook secret is configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('ERROR: STRIPE_WEBHOOK_SECRET environment variable is not set. Webhook verification will fail.');
      return res.status(500).send('Webhook Error: Webhook secret not configured');
    }

    let event;

    try {
      // Verify the event came from Stripe using the webhook secret
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      if (err instanceof Error) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      return res.status(400).send('Webhook Error');
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract user ID and plan ID from metadata
        const userId = parseInt(session.metadata?.userId || '0');
        const planId = parseInt(session.metadata?.planId || '0');
        
        if (userId && planId) {
          try {
            // Get the plan
            const plan = await storage.getSubscriptionPlanById(planId);
            if (!plan) {
              log(`Plan not found for ID: ${planId}`);
              break;
            }
            
            // Update user's subscription
            await storage.updateUser(userId, {
              subscriptionTier: plan.tier,
              stripeSubscriptionId: session.subscription as string
            });
            
            log(`User ${userId} subscribed to ${plan.name} plan`);
          } catch (error) {
            console.error('Error processing checkout session:', error);
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription ID
        try {
          // In a real implementation, you would have a more efficient way to look up users by subscription ID
          const users = await storage.getUsers();
          const user = users.find(u => u.stripeSubscriptionId === subscription.id);
          
          if (user) {
            // Get the price ID from the subscription
            const priceId = subscription.items.data[0].price.id;
            
            // Find the plan with this price ID
            const plans = await storage.getSubscriptionPlans();
            const plan = plans.find(p => p.stripePriceId === priceId);
            
            if (plan) {
              // Update user's subscription tier
              await storage.updateUser(user.id, { subscriptionTier: plan.tier });
              log(`User ${user.id} subscription updated to ${plan.name} plan`);
            }
          }
        } catch (error) {
          console.error('Error processing subscription update:', error);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription ID
        try {
          // In a real implementation, you would have a more efficient way to look up users by subscription ID
          const users = await storage.getUsers();
          const user = users.find(u => u.stripeSubscriptionId === subscription.id);
          
          if (user) {
            // Downgrade user to free tier
            await storage.updateUser(user.id, { 
              subscriptionTier: 'free',
              stripeSubscriptionId: undefined
            });
            
            log(`User ${user.id} subscription cancelled, downgraded to free tier`);
          }
        } catch (error) {
          console.error('Error processing subscription deletion:', error);
        }
        break;
      }
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  });
  
  // Get current subscription
  app.get('/api/user/subscription', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      // Get the plan for the user's subscription tier
      const plan = await storage.getSubscriptionPlanByTier(user.subscriptionTier);
      
      // If the user has a Stripe subscription, get more details
      let subscriptionDetails = null;
      
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          subscriptionDetails = {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          };
        } catch (error) {
          console.error('Error retrieving subscription details:', error);
        }
      }
      
      res.json({
        subscription: {
          tier: user.subscriptionTier,
          plan,
          details: subscriptionDetails
        }
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Error fetching subscription' });
    }
  });
  
  // Cancel subscription
  app.post('/api/user/subscription/cancel', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription to cancel' });
      }
      
      // Cancel at period end
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      
      res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: 'Error cancelling subscription' });
    }
  });
  
  // Reactivate cancelled subscription
  app.post('/api/user/subscription/reactivate', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No subscription to reactivate' });
      }
      
      // Remove the cancellation at period end
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false
      });
      
      res.json({ message: 'Subscription reactivated successfully' });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      res.status(500).json({ message: 'Error reactivating subscription' });
    }
  });
  
  // Create a portal session for managing billing
  app.post('/api/create-portal-session', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      if (!user.stripeCustomerId) {
        return res.status(400).json({ message: 'No Stripe customer found' });
      }
      
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin}/dashboard`,
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ message: 'Error creating portal session' });
    }
  });
}