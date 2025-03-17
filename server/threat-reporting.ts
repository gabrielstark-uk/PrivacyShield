import { Router } from "express";
import { z } from "zod";
import { log } from "./vite";

// Schema for threat report validation
const threatReportSchema = z.object({
  type: z.enum(['v2k', 'sound-cannon', 'laser', 'unknown']),
  detectionTime: z.string().or(z.date()),
  signalStrength: z.number(),
  frequencyRange: z.string(),
  deviceInfo: z.object({
    userAgent: z.string(),
    platform: z.string(),
    screenResolution: z.string(),
    language: z.string()
  }),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number(),
    timestamp: z.number()
  }).optional(),
  networkInfo: z.object({
    ip: z.string().optional(),
    isp: z.string().optional(),
    connectionType: z.string().optional()
  }).optional(),
  signalPatterns: z.object({
    fluctuationRate: z.number(),
    peakFrequencies: z.array(z.number()),
    modulationDetected: z.boolean()
  }).optional()
});

// In-memory storage for threat reports
interface ThreatReport {
  id: string;
  reportTime: Date;
  lastUpdateTime: Date;
  status: 'active' | 'resolved' | 'investigating';
  details: z.infer<typeof threatReportSchema>;
  updates: {
    timestamp: Date;
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    signalStrength?: number;
  }[];
  sourceAnalysis?: {
    direction?: string;
    distance?: string;
    confidence: number;
    possibleDeviceType?: string;
    timestamp: Date;
  };
}

class ThreatReportingService {
  private reports: Map<string, ThreatReport> = new Map();
  
  constructor() {
    // Initialize service
    log("Threat reporting service initialized");
  }
  
  public createReport(details: z.infer<typeof threatReportSchema>): ThreatReport {
    const reportId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    
    const report: ThreatReport = {
      id: reportId,
      reportTime: now,
      lastUpdateTime: now,
      status: 'active',
      details,
      updates: []
    };
    
    this.reports.set(reportId, report);
    
    // Log the report creation
    log(`EMERGENCY: New ${details.type} threat reported. ID: ${reportId}`);
    
    // In a real implementation, this would notify authorities
    this.notifyAuthorities(report);
    
    return report;
  }
  
  public updateReport(reportId: string, update: {
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    };
    signalStrength?: number;
  }): ThreatReport | null {
    const report = this.reports.get(reportId);
    if (!report) return null;
    
    const now = new Date();
    
    // Add the update to the report
    report.updates.push({
      timestamp: now,
      location: update.location ? {
        latitude: update.location.latitude,
        longitude: update.location.longitude,
        accuracy: update.location.accuracy
      } : undefined,
      signalStrength: update.signalStrength
    });
    
    report.lastUpdateTime = now;
    
    // Log the update
    log(`Threat report ${reportId} updated. Updates: ${report.updates.length}`);
    
    return report;
  }
  
  public resolveReport(reportId: string): ThreatReport | null {
    const report = this.reports.get(reportId);
    if (!report) return null;
    
    report.status = 'resolved';
    report.lastUpdateTime = new Date();
    
    // Log the resolution
    log(`Threat report ${reportId} marked as resolved`);
    
    // In a real implementation, this would notify authorities
    this.notifyResolution(report);
    
    return report;
  }
  
  public getReport(reportId: string): ThreatReport | null {
    return this.reports.get(reportId) || null;
  }
  
  public getAllReports(): ThreatReport[] {
    return Array.from(this.reports.values());
  }
  
  public addSourceAnalysis(reportId: string, analysis: {
    direction?: string;
    distance?: string;
    confidence: number;
    possibleDeviceType?: string;
  }): ThreatReport | null {
    const report = this.reports.get(reportId);
    if (!report) return null;
    
    report.sourceAnalysis = {
      ...analysis,
      timestamp: new Date()
    };
    
    report.lastUpdateTime = new Date();
    
    // Log the analysis
    log(`Source analysis added to threat report ${reportId}`);
    
    return report;
  }
  
  private notifyAuthorities(report: ThreatReport): void {
    // In a real implementation, this would send the report to authorities
    // via an API call, email, SMS, or other notification method
    
    // For now, we'll just log it
    log(`SIMULATED: Notifying authorities about ${report.details.type} threat. ID: ${report.id}`);
    
    if (report.details.location) {
      log(`LOCATION: Lat ${report.details.location.latitude}, Lng ${report.details.location.longitude}, Accuracy: ${report.details.location.accuracy}m`);
    }
  }
  
  private notifyResolution(report: ThreatReport): void {
    // In a real implementation, this would notify authorities that the threat has been resolved
    
    // For now, we'll just log it
    log(`SIMULATED: Notifying authorities that threat ${report.id} has been resolved`);
  }
}

// Create a singleton instance
const threatReportingService = new ThreatReportingService();

// Create Express router
export function registerThreatReportingRoutes(app: Router): void {
  // Create a new threat report
  app.post('/api/emergency-report', async (req, res) => {
    try {
      const reportData = threatReportSchema.parse(req.body);
      const report = threatReportingService.createReport(reportData);
      
      res.status(201).json({
        success: true,
        reportId: report.id,
        message: 'Emergency report received. Authorities have been notified.',
        trackingUrl: `/tracking/${report.id}`
      });
    } catch (error) {
      console.error('Error creating threat report:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid report data'
      });
    }
  });
  
  // Update an existing threat report
  app.post('/api/threat-tracking/:reportId', async (req, res) => {
    try {
      const { reportId } = req.params;
      const { location, signalStrength } = req.body;
      
      const updatedReport = threatReportingService.updateReport(reportId, {
        location,
        signalStrength
      });
      
      if (!updatedReport) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        reportId,
        message: 'Threat report updated successfully.'
      });
    } catch (error) {
      console.error('Error updating threat report:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid update data'
      });
    }
  });
  
  // Resolve a threat report
  app.post('/api/threat-resolution/:reportId', async (req, res) => {
    try {
      const { reportId } = req.params;
      
      const resolvedReport = threatReportingService.resolveReport(reportId);
      
      if (!resolvedReport) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        reportId,
        message: 'Threat report marked as resolved.'
      });
    } catch (error) {
      console.error('Error resolving threat report:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }
  });
  
  // Add source analysis to a threat report
  app.post('/api/threat-analysis/:reportId', async (req, res) => {
    try {
      const { reportId } = req.params;
      const { direction, distance, confidence, possibleDeviceType } = req.body;
      
      const updatedReport = threatReportingService.addSourceAnalysis(reportId, {
        direction,
        distance,
        confidence,
        possibleDeviceType
      });
      
      if (!updatedReport) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        reportId,
        message: 'Source analysis added to threat report.'
      });
    } catch (error) {
      console.error('Error adding source analysis:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid analysis data'
      });
    }
  });
  
  // Get a specific threat report
  app.get('/api/threat-report/:reportId', async (req, res) => {
    try {
      const { reportId } = req.params;
      
      const report = threatReportingService.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        report
      });
    } catch (error) {
      console.error('Error retrieving threat report:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });
  
  // Get all threat reports
  app.get('/api/threat-reports', async (_req, res) => {
    try {
      const reports = threatReportingService.getAllReports();
      
      res.json({
        success: true,
        reports
      });
    } catch (error) {
      console.error('Error retrieving threat reports:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });
}