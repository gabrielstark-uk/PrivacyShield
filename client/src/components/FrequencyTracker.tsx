import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Crosshair, Clock, Radio, AlertTriangle, Zap, Shield, BadgeHelp } from "lucide-react";
import { policeNotificationService } from "@/services/police-notification";

interface FrequencyTrackerProps {
  isActive: boolean;
  frequency: number | null;
  threatType: 'v2k' | 'sound-cannon' | 'laser' | null;
  startTime: Date | null;
  onUnlock: () => void;
  signalStrength?: number;
}

export function FrequencyTracker({
  isActive,
  frequency,
  threatType,
  startTime,
  onUnlock,
  signalStrength = 0
}: FrequencyTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  // Update elapsed time every second
  useEffect(() => {
    if (!isActive || !startTime) return;

    const updateElapsedTime = () => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();

      // Format as HH:MM:SS
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');

      setElapsedTime(`${hours}:${minutes}:${seconds}`);
    };

    // Update immediately
    updateElapsedTime();

    // Then update every second
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Update the police notification service when a threat is locked
  useEffect(() => {
    if (isActive && threatType && frequency) {
      // Create details object with all relevant information
      const details = {
        frequency,
        signalStrength,
        detectionTime: new Date(Date.now() - 5000), // Simulate detection 5 seconds before locking
        lockedTime: startTime || new Date()
      };

      // Update the police notification service with the locked threat
      policeNotificationService.updateThreatStatus(threatType, true, details);
    } else if (!isActive && threatType) {
      // Update the service when a threat is unlocked
      policeNotificationService.updateThreatStatus(threatType, false, null);

      // Reset the report status when all threats are unlocked
      if (threatType === 'v2k' || threatType === 'sound-cannon') {
        policeNotificationService.resetReportStatus();
      }
    }

    // Cleanup when component unmounts
    return () => {
      if (threatType) {
        policeNotificationService.updateThreatStatus(threatType, false, null);
      }
    };
  }, [isActive, threatType, frequency, signalStrength, startTime]);

  // Get icon based on threat type
  const getThreatIcon = () => {
    switch (threatType) {
      case 'v2k':
        return <Radio className="h-5 w-5" />;
      case 'sound-cannon':
        return <AlertTriangle className="h-5 w-5" />;
      case 'laser':
        return <Zap className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  if (!isActive) return null;

  return (
    <Card className="border-yellow-500">
      <CardHeader className="bg-yellow-500/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-yellow-500" />
            <span>Frequency Tracking Active</span>
          </div>
          <Badge className="bg-yellow-500">LOCKED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Target Frequency:</p>
            <p className="text-xl font-bold">{frequency ? `${frequency.toFixed(2)} Hz` : 'Unknown'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Threat Type:</p>
            <div className="flex items-center gap-2">
              {getThreatIcon()}
              <span className="font-medium">{threatType?.toUpperCase() || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Tracking for: <span className="font-mono">{elapsedTime}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Started: {startTime ? format(startTime, "HH:mm:ss") : 'Unknown'}</span>
          </div>
        </div>

        {/* Police notification status for V2K and Sound Cannon */}
        {(threatType === 'v2k' || threatType === 'sound-cannon') && (
          <div className="border rounded-md p-3 bg-blue-500/10 border-blue-500">
            <div className="flex items-center gap-2 mb-1">
              <BadgeHelp className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">Law Enforcement Notification</span>
            </div>
            <p className="text-sm">
              {threatType === 'v2k' ?
                "V2K signal locked. If a Sound Cannon is also detected and locked, an automatic emergency report will be sent to the nearest police station." :
                "Sound Cannon signal locked. If a V2K signal is also detected and locked, an automatic emergency report will be sent to the nearest police station."}
            </p>
          </div>
        )}

        <div className="border-t pt-4 mt-2">
          <p className="text-sm mb-2">
            <strong>IMPORTANT:</strong> Frequency locked for authorities. Maintain this frequency until authorities have located the source.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onUnlock}
          >
            Unlock Frequency (Only if Authorities Confirm)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}