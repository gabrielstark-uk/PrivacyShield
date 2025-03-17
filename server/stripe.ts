import { Router } from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { log } from "./vite";

// Initialize Stripe with your secret key
// In production, this should be stored in an environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key', {
  apiVersion: '2023-10-16',
});

export function setupStripe(app: Router) {
  // Get subscription plans
  app.get('/api/subscription-plans', async (_req, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();
      res.json({ plans });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ message: 'Error fetching subscription plans' });
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
    
    let event;
    
    try {
      // Verify the event came from Stripe
      // In production, you should use a webhook secret
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret'
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