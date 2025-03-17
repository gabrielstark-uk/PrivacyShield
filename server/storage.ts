import { reports, threatReports, type Report, type InsertReport, type ThreatReport, type InsertThreatReport } from "@shared/schema";

// User types
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  name: string;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
}

export interface UpdateUserParams {
  email?: string;
  passwordHash?: string;
  name?: string;
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Subscription plan types
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  interval: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  features: any[];
  stripePriceId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionPlanParams {
  name: string;
  description: string;
  price: number;
  interval: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  features: any[];
  stripePriceId?: string;
  active: boolean;
}

export interface IStorage {
  // Regular reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReportsByUserId(userId: number): Promise<Report[]>;

  // Threat reports
  createThreatReport(report: InsertThreatReport): Promise<ThreatReport>;
  updateThreatReport(reportId: string, updates: Partial<ThreatReport>): Promise<ThreatReport | null>;
  getThreatReports(): Promise<ThreatReport[]>;
  getThreatReportsByUserId(userId: number): Promise<ThreatReport[]>;
  getThreatReportById(reportId: string): Promise<ThreatReport | null>;
  resolveThreatReport(reportId: string): Promise<ThreatReport | null>;

  // User management
  createUser(user: CreateUserParams): Promise<User>;
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: number, updates: UpdateUserParams): Promise<User>;
  deleteUser(id: number): Promise<boolean>;

  // Subscription plans
  createSubscriptionPlan(plan: CreateSubscriptionPlanParams): Promise<SubscriptionPlan>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | null>;
  getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | null>;
  updateSubscriptionPlan(id: number, updates: Partial<CreateSubscriptionPlanParams>): Promise<SubscriptionPlan>;
}

export class MemStorage implements IStorage {
  private reports: Map<number, Report>;
  private threatReports: Map<string, ThreatReport>;
  private users: Map<number, User>;
  private usersByEmail: Map<string, number>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;

  currentId: number;
  currentThreatId: number;
  currentUserId: number;
  currentPlanId: number;

  constructor() {
    this.reports = new Map();
    this.threatReports = new Map();
    this.users = new Map();
    this.usersByEmail = new Map();
    this.subscriptionPlans = new Map();

    this.currentId = 1;
    this.currentThreatId = 1;
    this.currentUserId = 1;
    this.currentPlanId = 1;

    // Initialize with default subscription plans
    this.initializeSubscriptionPlans();
  }

  private initializeSubscriptionPlans() {
    // Free tier
    this.createSubscriptionPlan({
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
    this.createSubscriptionPlan({
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
    this.createSubscriptionPlan({
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
    this.createSubscriptionPlan({
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
  }

  // Regular reports
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentId++;
    const report: Report = {
      ...insertReport,
      id,
      timestamp: new Date(),
      userId: null
    };
    this.reports.set(id, report);
    return report;
  }

  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Threat reports
  async createThreatReport(insertReport: InsertThreatReport): Promise<ThreatReport> {
    const id = this.currentThreatId++;
    const now = new Date();

    const threatReport: ThreatReport = {
      id,
      reportId: insertReport.reportId,
      type: insertReport.type,
      status: 'active',
      signalStrength: insertReport.signalStrength,
      frequencyRange: insertReport.frequencyRange,
      detectionTime: insertReport.detectionTime,
      lastUpdateTime: now,
      location: insertReport.location || null,
      deviceInfo: insertReport.deviceInfo,
      networkInfo: insertReport.networkInfo || null,
      signalPatterns: insertReport.signalPatterns || null,
      advancedMetrics: insertReport.advancedMetrics || null,
      sourceAnalysis: null,
      isCountermeasureActive: insertReport.isCountermeasureActive || false,
      notes: ''
    };

    this.threatReports.set(insertReport.reportId, threatReport);
    return threatReport;
  }

  async updateThreatReport(reportId: string, updates: Partial<ThreatReport>): Promise<ThreatReport | null> {
    const report = this.threatReports.get(reportId);
    if (!report) return null;

    const updatedReport = {
      ...report,
      ...updates,
      lastUpdateTime: new Date()
    };

    this.threatReports.set(reportId, updatedReport);
    return updatedReport;
  }

  async getThreatReports(): Promise<ThreatReport[]> {
    return Array.from(this.threatReports.values()).sort((a, b) =>
      b.detectionTime.getTime() - a.detectionTime.getTime()
    );
  }

  async getThreatReportsByUserId(userId: number): Promise<ThreatReport[]> {
    // In a real implementation, this would filter by user ID
    // For now, we'll just return all reports since our ThreatReport doesn't have userId yet
    return this.getThreatReports();
  }

  async getThreatReportById(reportId: string): Promise<ThreatReport | null> {
    return this.threatReports.get(reportId) || null;
  }

  async resolveThreatReport(reportId: string): Promise<ThreatReport | null> {
    const report = this.threatReports.get(reportId);
    if (!report) return null;

    const resolvedReport = {
      ...report,
      status: 'resolved',
      lastUpdateTime: new Date()
    };

    this.threatReports.set(reportId, resolvedReport);
    return resolvedReport;
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: CreateUserParams): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();

    const user: User = {
      id,
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name,
      subscriptionTier: userData.subscriptionTier,
      stripeCustomerId: userData.stripeCustomerId,
      stripeSubscriptionId: userData.stripeSubscriptionId,
      createdAt: userData.createdAt || now,
      updatedAt: now
    };

    this.users.set(id, user);
    this.usersByEmail.set(userData.email.toLowerCase(), id);

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = this.usersByEmail.get(email.toLowerCase());
    if (!userId) {
      return null;
    }
    return this.users.get(userId) || null;
  }

  async updateUser(id: number, updates: UpdateUserParams): Promise<User> {
    const user = await this.getUserById(id);

    // If email is being updated, update the email index
    if (updates.email && updates.email !== user.email) {
      this.usersByEmail.delete(user.email.toLowerCase());
      this.usersByEmail.set(updates.email.toLowerCase(), id);
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);

    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }

    this.usersByEmail.delete(user.email.toLowerCase());
    this.users.delete(id);

    return true;
  }

  // Subscription plan methods
  async createSubscriptionPlan(planData: CreateSubscriptionPlanParams): Promise<SubscriptionPlan> {
    const id = this.currentPlanId++;
    const now = new Date();

    const plan: SubscriptionPlan = {
      id,
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
    };

    this.subscriptionPlans.set(id, plan);

    return plan;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values())
      .filter(plan => plan.active)
      .sort((a, b) => a.price - b.price);
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | null> {
    return this.subscriptionPlans.get(id) || null;
  }

  async getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | null> {
    return Array.from(this.subscriptionPlans.values())
      .find(plan => plan.tier === tier && plan.active) || null;
  }

  async updateSubscriptionPlan(id: number, updates: Partial<CreateSubscriptionPlanParams>): Promise<SubscriptionPlan> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) {
      throw new Error(`Subscription plan with ID ${id} not found`);
    }

    const updatedPlan: SubscriptionPlan = {
      ...plan,
      ...updates,
      updatedAt: new Date()
    };

    this.subscriptionPlans.set(id, updatedPlan);

    return updatedPlan;
  }
}

export const storage = new MemStorage();
