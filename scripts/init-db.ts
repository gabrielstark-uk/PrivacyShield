import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { subscriptionPlans, users } from '../shared/schema';
import bcrypt from 'bcryptjs';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/privacyshield',
});

// Initialize Drizzle ORM
const db = drizzle(pool);

async function initializeDatabase() {
  console.log('🔄 Initializing database with default data...');

  try {
    // Create default subscription plans
    console.log('📦 Creating default subscription plans...');
    
    // Free tier
    await db.insert(subscriptionPlans).values({
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
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    // Basic tier
    await db.insert(subscriptionPlans).values({
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
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    // Premium tier
    await db.insert(subscriptionPlans).values({
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
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    // Enterprise tier
    await db.insert(subscriptionPlans).values({
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
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    // Create admin user if ADMIN_EMAIL and ADMIN_PASSWORD are provided
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('👤 Creating admin user...');
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      await db.insert(users).values({
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: passwordHash,
        name: 'Admin User',
        subscriptionTier: 'enterprise',
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing();
      
      console.log(`✅ Admin user created with email: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('⚠️ Skipping admin user creation. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to create an admin user.');
    }

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});