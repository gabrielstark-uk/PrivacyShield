import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Crosshair, Clock, Radio, AlertTriangle, Zap, Shield } from "lucide-react";

interface FrequencyTrackerProps {
  isActive: boolean;
  frequency: number | null;
  threatType: 'v2k' | 'sound-cannon' | 'laser' | null;
  startTime: Date | null;
  onUnlock: () => void;
}

export function FrequencyTracker({
  isActive,
  frequency,
  threatType,
  startTime,
  onUnlock
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