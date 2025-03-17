import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, MapPin, Radio, Shield, Phone } from "lucide-react";
import { threatReportingService, type ThreatDetails } from "@/services/threat-reporting";

interface ThreatReportingProps {
  isActive: boolean;
  threatType: 'v2k' | 'sound-cannon' | 'laser' | 'unknown';
  signalStrength: number;
  frequencyData: Uint8Array | null;
  sampleRate: number | null;
  signalMetrics?: any;
}

export function ThreatReporting({
  isActive,
  threatType,
  signalStrength,
  frequencyData,
  sampleRate,
  signalMetrics
}: ThreatReportingProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'unavailable' | 'pending' | 'available'>('unavailable');
  const [attackSource, setAttackSource] = useState<{
    direction?: string;
    distance?: string;
    confidence: number;
    possibleDeviceType?: string;
  } | null>(null);
  
  // Check if geolocation is available
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('pending');
      navigator.geolocation.getCurrentPosition(
        () => setLocationStatus('available'),
        () => setLocationStatus('unavailable')
      );
    }
  }, []);
  
  // Start reporting when a threat is detected
  useEffect(() => {
    if (isActive && !isReporting) {
      handleStartReporting();
    } else if (!isActive && isReporting) {
      handleStopReporting();
    }
  }, [isActive]);
  
  // Analyze attack source when frequency data changes
  useEffect(() => {
    if (isReporting && frequencyData && sampleRate && !isAnalyzing) {
      analyzeAttackSource();
    }
  }, [frequencyData, isReporting]);
  
  const handleStartReporting = async () => {
    if (isReporting) return;
    
    setIsReporting(true);
    
    const threatDetails: ThreatDetails = {
      type: threatType,
      detectionTime: new Date(),
      signalStrength: signalStrength,
      frequencyRange: getFrequencyRangeForThreat(threatType),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
      },
      signalPatterns: {
        fluctuationRate: calculateFluctuationRate(frequencyData),
        peakFrequencies: findPeakFrequencies(frequencyData, sampleRate),
        modulationDetected: detectModulation(frequencyData)
      },
      // Include advanced signal metrics if available
      advancedMetrics: signalMetrics ? {
        spectralFlux: signalMetrics.spectralFlux,
        spectralCentroid: signalMetrics.spectralCentroid,
        spectralFlatness: signalMetrics.spectralFlatness,
        spectralRolloff: signalMetrics.spectralRolloff,
        highFreqEnergyRatio: signalMetrics.highFreqEnergyRatio,
        harmonicPatterns: signalMetrics.harmonicPatterns,
        temporalPatterns: signalMetrics.temporalPatterns,
        modulationDetected: signalMetrics.modulationDetected,
        detectionScore: signalMetrics.v2kScore
      } : undefined
    };
    
    try {
      const response = await threatReportingService.startLiveReporting(threatDetails);
      if (response.success && response.reportId) {
        setReportId(response.reportId);
      }
    } catch (error) {
      console.error("Failed to start threat reporting:", error);
    }
  };
  
  const handleStopReporting = () => {
    if (!isReporting) return;
    
    threatReportingService.stopReporting();
    setIsReporting(false);
    setReportId(null);
    setAttackSource(null);
  };
  
  const analyzeAttackSource = async () => {
    if (!frequencyData || !sampleRate || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await threatReportingService.analyzeAttackSource(frequencyData, sampleRate);
      setAttackSource(result);
    } catch (error) {
      console.error("Failed to analyze attack source:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper functions for signal analysis
  const calculateFluctuationRate = (data: Uint8Array | null): number => {
    if (!data || data.length < 2) return 0;
    
    let fluctuations = 0;
    for (let i = 1; i < data.length; i++) {
      if (Math.abs(data[i] - data[i-1]) > 10) {
        fluctuations++;
      }
    }
    
    return fluctuations / (data.length - 1);
  };
  
  const findPeakFrequencies = (data: Uint8Array | null, sampleRate: number | null): number[] => {
    if (!data || !sampleRate) return [];
    
    const peaks: number[] = [];
    const threshold = 200; // Amplitude threshold for peaks
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && data[i] > data[i-1] && data[i] > data[i+1]) {
        // Convert bin index to frequency
        const frequency = i * (sampleRate / 2) / data.length;
        peaks.push(Math.round(frequency));
      }
      
      // Limit to top 5 peaks
      if (peaks.length >= 5) break;
    }
    
    return peaks;
  };
  
  const detectModulation = (data: Uint8Array | null): boolean => {
    if (!data || data.length < 10) return false;
    
    // Simple modulation detection - look for repeating patterns
    let patternDetected = false;
    const patternLength = 10;
    
    for (let i = 0; i < data.length - patternLength * 2; i++) {
      let matches = 0;
      for (let j = 0; j < patternLength; j++) {
        if (Math.abs(data[i+j] - data[i+j+patternLength]) < 10) {
          matches++;
        }
      }
      
      if (matches > patternLength * 0.8) {
        patternDetected = true;
        break;
      }
    }
    
    return patternDetected;
  };
  
  const getFrequencyRangeForThreat = (type: string): string => {
    switch (type) {
      case 'v2k':
        return 'High frequency range (15-20kHz)';
      case 'sound-cannon':
        return 'Mid-high frequency range (2-10kHz)';
      case 'laser':
        return 'Electromagnetic interference pattern';
      default:
        return 'Unknown frequency pattern';
    }
  };
  
  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case 'v2k':
        return <Radio className="h-5 w-5" />;
      case 'sound-cannon':
        return <AlertTriangle className="h-5 w-5" />;
      case 'laser':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };
  
  const getThreatTypeName = (type: string): string => {
    switch (type) {
      case 'v2k':
        return 'Voice-to-Skull (V2K)';
      case 'sound-cannon':
        return 'Sound Cannon';
      case 'laser':
        return 'Non-lethal Laser';
      default:
        return 'Unknown Threat';
    }
  };
  
  // Always render something to maintain layout stability
  if (!isActive && !isReporting) {
    return (
      <Card className="border-muted bg-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Threat Monitoring Active</span>
            </div>
            <Badge variant="outline">MONITORING</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-muted-foreground">
          <p>No threats detected. System is actively monitoring for potential security threats.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Signal Strength</div>
              <Progress value={0} className="h-2" />
              <div className="text-xs">
                0% - Normal
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Location Status</div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {locationStatus === 'available'
                    ? "Location tracking active"
                    : locationStatus === 'pending'
                      ? "Acquiring location..."
                      : "Location unavailable"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-destructive">
      <CardHeader className="bg-destructive/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getThreatTypeIcon(threatType)}
            <span>Emergency Reporting: {getThreatTypeName(threatType)}</span>
          </div>
          <Badge variant={isReporting ? "destructive" : "outline"}>
            {isReporting ? "LIVE REPORTING" : "INACTIVE"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Threat Detected</AlertTitle>
          <AlertDescription>
            {isReporting 
              ? "Authorities have been notified and are tracking this incident."
              : "Automatic reporting system is preparing to notify authorities."}
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Signal Strength</div>
            <Progress value={signalStrength} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {Math.round(signalStrength)}% - {signalStrength > 70 ? "Strong" : signalStrength > 40 ? "Medium" : "Weak"}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Location Status</div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {locationStatus === 'available' 
                  ? "Location tracking active" 
                  : locationStatus === 'pending' 
                    ? "Acquiring location..." 
                    : "Location unavailable"}
              </span>
            </div>
          </div>
        </div>
        
        {reportId && (
          <div className="text-sm">
            <span className="font-medium">Report ID:</span> {reportId}
          </div>
        )}
        
        {attackSource && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/50">
            <div className="font-medium">Attack Source Analysis</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {attackSource.direction && (
                <div>
                  <span className="text-muted-foreground">Direction:</span> {attackSource.direction}
                </div>
              )}
              {attackSource.distance && (
                <div>
                  <span className="text-muted-foreground">Estimated Distance:</span> {attackSource.distance}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Confidence:</span> {attackSource.confidence}%
              </div>
              {attackSource.possibleDeviceType && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Possible Device:</span> {attackSource.possibleDeviceType}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={analyzeAttackSource}
            disabled={isAnalyzing || !frequencyData}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Analyze Source
              </>
            )}
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => window.open('tel:911')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Emergency
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}