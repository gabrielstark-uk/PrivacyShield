import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, reports, threatReports, subscriptionPlans, subscriptionTierEnum } from '@shared/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { IStorage, User, CreateUserParams, UpdateUserParams, SubscriptionPlan, CreateSubscriptionPlanParams } from './storage';
import { Report, InsertReport, ThreatReport, InsertThreatReport } from '@shared/schema';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/privacyshield',
});

// Initialize Drizzle ORM
const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  // Regular reports
  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values({
      frequency: report.frequency,
      description: report.description,
      timestamp: new Date(),
    }).returning();
    return created;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.timestamp));
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    return await db.select().from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.timestamp));
  }

  // Threat reports
  async createThreatReport(report: InsertThreatReport): Promise<ThreatReport> {
    const now = new Date();
    const [created] = await db.insert(threatReports).values({
      reportId: report.reportId,
      type: report.type,
      status: 'active',
      signalStrength: report.signalStrength,
      frequencyRange: report.frequencyRange,
      detectionTime: report.detectionTime,
      lastUpdateTime: now,
      location: report.location || null,
      deviceInfo: report.deviceInfo,
      networkInfo: report.networkInfo || null,
      signalPatterns: report.signalPatterns || null,
      advancedMetrics: report.advancedMetrics || null,
      sourceAnalysis: null,
      isCountermeasureActive: report.isCountermeasureActive || false,
      notes: ''
    }).returning();
    return created;
  }

  async updateThreatReport(reportId: string, updates: Partial<ThreatReport>): Promise<ThreatReport | null> {
    // Remove id from updates to prevent primary key modification
    const { id, ...safeUpdates } = updates as any;

    const [updated] = await db.update(threatReports)
      .set({
        ...safeUpdates,
        lastUpdateTime: new Date()
      })
      .where(eq(threatReports.reportId, reportId))
      .returning();
    return updated || null;
  }

  async getThreatReports(): Promise<ThreatReport[]> {
    return await db.select().from(threatReports)
      .orderBy(desc(threatReports.detectionTime));
  }

  async getThreatReportsByUserId(userId: number): Promise<ThreatReport[]> {
    // Join with reports table to get threat reports associated with a user
    const userReports = await db.select({
      reportId: reports.id
    })
    .from(reports)
    .where(eq(reports.userId, userId));

    if (userReports.length === 0) {
      return [];
    }

    const reportIds = userReports.map(r => r.reportId.toString());

    // Use inArray instead of .in() method
    return await db.select().from(threatReports)
      .where(inArray(threatReports.reportId, reportIds))
      .orderBy(desc(threatReports.detectionTime));
  }

  async getThreatReportById(reportId: string): Promise<ThreatReport | null> {
    const [report] = await db.select().from(threatReports)
      .where(eq(threatReports.reportId, reportId));
    return report || null;
  }

  async resolveThreatReport(reportId: string): Promise<ThreatReport | null> {
    const [resolved] = await db.update(threatReports)
      .set({
        status: 'resolved',
        lastUpdateTime: new Date()
      })
      .where(eq(threatReports.reportId, reportId))
      .returning();
    return resolved || null;
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    const dbUsers = await db.select().from(users);
    // Transform to match User interface (ensure name is string, not null)
    return dbUsers.map(user => ({
      ...user,
      name: user.name || '',
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined
    }));
  }

  async createUser(userData: CreateUserParams): Promise<User> {
    const now = new Date();

    // Validate subscription tier
    if (!['free', 'basic', 'premium', 'enterprise'].includes(userData.subscriptionTier)) {
      throw new Error(`Invalid subscription tier: ${userData.subscriptionTier}`);
    }

    const [created] = await db.insert(users).values({
      email: userData.email.toLowerCase(), // Ensure email is lowercase
      passwordHash: userData.passwordHash,
      name: userData.name || '',
      subscriptionTier: userData.subscriptionTier,
      stripeCustomerId: userData.stripeCustomerId,
      stripeSubscriptionId: userData.stripeSubscriptionId,
      createdAt: userData.createdAt || now,
      updatedAt: now
    }).returning();

    // Transform to match User interface
    return {
      ...created,
      name: created.name || '',
      stripeCustomerId: created.stripeCustomerId || undefined,
      stripeSubscriptionId: created.stripeSubscriptionId || undefined
    };
  }

  async getUserById(id: number): Promise<User> {
    const [user] = await db.select().from(users)
      .where(eq(users.id, id));

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Transform to match User interface
    return {
      ...user,
      name: user.name || '',
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }

    const [user] = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!user) {
      return null;
    }

    // Transform to match User interface
    return {
      ...user,
      name: user.name || '',
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined
    };
  }

  async updateUser(id: number, updates: UpdateUserParams): Promise<User> {
    // Validate subscription tier if provided
    if (updates.subscriptionTier &&
        !['free', 'basic', 'premium', 'enterprise'].includes(updates.subscriptionTier)) {
      throw new Error(`Invalid subscription tier: ${updates.subscriptionTier}`);
    }

    // Ensure email is lowercase if provided
    const safeUpdates = { ...updates };
    if (safeUpdates.email) {
      safeUpdates.email = safeUpdates.email.toLowerCase();
    }

    const [updated] = await db.update(users)
      .set({
        ...safeUpdates,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Transform to match User interface
    return {
      ...updated,
      name: updated.name || '',
      stripeCustomerId: updated.stripeCustomerId || undefined,
      stripeSubscriptionId: updated.stripeSubscriptionId || undefined
    };
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users)
        .where(eq(users.id, id));
      // Use rowCount instead of count
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      return false;
    }
  }

  // Subscription plan methods
  async createSubscriptionPlan(planData: CreateSubscriptionPlanParams): Promise<SubscriptionPlan> {
    const now = new Date();

    // Validate subscription tier
    if (!['free', 'basic', 'premium', 'enterprise'].includes(planData.tier)) {
      throw new Error(`Invalid subscription tier: ${planData.tier}`);
    }

    const [created] = await db.insert(subscriptionPlans).values({
      name: planData.name,
      description: planData.description,
      price: planData.price,
      interval: planData.interval,
      tier: planData.tier,
      features: planData.features,
      stripePriceId: planData.stripePriceId,
      active: planData.active,
      createdAt: now,
      updatedAt: now
    }).returning();

    // Transform to match SubscriptionPlan interface
    return {
      ...created,
      features: Array.isArray(created.features) ? created.features : [],
      stripePriceId: created.stripePriceId || undefined
    };
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const plans = await db.select().from(subscriptionPlans);
    // Transform to match SubscriptionPlan interface
    return plans.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
      stripePriceId: plan.stripePriceId || undefined
    }));
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const plans = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.active, true))
      .orderBy(subscriptionPlans.price);

    // Transform to match SubscriptionPlan interface
    return plans.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
      stripePriceId: plan.stripePriceId || undefined
    }));
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | null> {
    const [plan] = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));

    if (!plan) {
      return null;
    }

    // Transform to match SubscriptionPlan interface
    return {
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
      stripePriceId: plan.stripePriceId || undefined
    };
  }

  async getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | null> {
    // Validate tier
    if (!['free', 'basic', 'premium', 'enterprise'].includes(tier)) {
      return null;
    }

    // Use a separate query for each condition to avoid the second where issue
    const plans = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.tier, tier as any));

    const activePlan = plans.find(plan => plan.active);

    if (!activePlan) {
      return null;
    }

    // Transform to match SubscriptionPlan interface
    return {
      ...activePlan,
      features: Array.isArray(activePlan.features) ? activePlan.features : [],
      stripePriceId: activePlan.stripePriceId || undefined
    };
  }

  async updateSubscriptionPlan(id: number, updates: Partial<CreateSubscriptionPlanParams>): Promise<SubscriptionPlan> {
    // Validate subscription tier if provided
    if (updates.tier && !['free', 'basic', 'premium', 'enterprise'].includes(updates.tier)) {
      throw new Error(`Invalid subscription tier: ${updates.tier}`);
    }

    const [updated] = await db.update(subscriptionPlans)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPlans.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Subscription plan with ID ${id} not found`);
    }

    // Transform to match SubscriptionPlan interface
    return {
      ...updated,
      features: Array.isArray(updated.features) ? updated.features : [],
      stripePriceId: updated.stripePriceId || undefined
    };
  }
}