import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioAnalyzer } from "@/hooks/use-audio-analyzer";
import { FrequencyDisplay } from "./FrequencyDisplay";
import { ThreatReporting } from "./ThreatReporting";
import { FrequencyTracker } from "./FrequencyTracker";
import { Mic, MicOff, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function AudioAnalyzer() {
  const {
    isRecording,
    frequencyData,
    sampleRate,
    soundCannonDetected,
    v2kDetected,
    isCountermeasureActive,
    availableMicrophones,
    selectedMicrophone,
    setSelectedMicrophone,
    startRecording,
    stopRecording,
    getSignalMetrics,

    // Frequency locking
    isFrequencyLocked,
    lockedFrequency,
    lockedFrequencyData,
    lockedThreatType,
    trackingStartTime,
    lockFrequency,
    unlockFrequency
  } = useAudioAnalyzer();

  const [laserDetected, setLaserDetected] = useState(false);
  const [signalStrength, setSignalStrength] = useState(0);

  // State for debouncing laser detection
  const [laserDetectionCount, setLaserDetectionCount] = useState(0);
  const laserThreshold = 5; // Number of consecutive detections needed

  // Calculate signal strength based on frequency data
  useEffect(() => {
    if (frequencyData) {
      // Calculate average amplitude
      const sum = Array.from(frequencyData).reduce((acc, val) => acc + val, 0);
      const average = sum / frequencyData.length;

      // Convert to percentage (0-100)
      const strength = Math.min(100, Math.max(0, (average / 255) * 100));
      setSignalStrength(strength);

      // Detect laser based on specific frequency patterns with debouncing
      const highFreqCount = Array.from(frequencyData)
        .slice(Math.floor(frequencyData.length * 0.8))
        .filter(val => val > 200).length;

      // Potential laser detection
      if (highFreqCount > 5) {
        // Increment counter for debouncing
        setLaserDetectionCount(prev => Math.min(prev + 1, laserThreshold + 5));
      } else {
        // Decrement counter
        setLaserDetectionCount(prev => Math.max(prev - 1, 0));
      }

      // Only set laser detected if we've had multiple consecutive detections
      setLaserDetected(laserDetectionCount >= laserThreshold);
    } else {
      setSignalStrength(0);
      setLaserDetectionCount(0);
      setLaserDetected(false);
    }
  }, [frequencyData, laserDetectionCount]);

  // Determine the active threat type
  const getActiveThreatType = () => {
    if (v2kDetected) return 'v2k';
    if (soundCannonDetected) return 'sound-cannon';
    if (laserDetected) return 'laser';
    return 'unknown';
  };

  const threatType = getActiveThreatType();
  const isThreatActive = v2kDetected || soundCannonDetected || laserDetected;

  // Automatically lock onto the frequency when a threat is detected
  useEffect(() => {
    if (isThreatActive && !isFrequencyLocked && threatType !== 'unknown') {
      // Lock onto the detected frequency
      lockFrequency(threatType as 'v2k' | 'sound-cannon' | 'laser');
    }
  }, [isThreatActive, isFrequencyLocked, threatType, lockFrequency]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Frequency Protection System</span>
            <div className="flex items-center gap-4">
              <Select
                value={selectedMicrophone || ""}
                onValueChange={setSelectedMicrophone}
                disabled={isRecording}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {availableMicrophones.map((mic) => (
                    <SelectItem
                      key={mic.deviceId}
                      value={mic.deviceId || "default-mic"}
                    >
                      {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!selectedMicrophone}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert container with fixed height to prevent layout shifts */}
          <div className="min-h-[120px]">
            {soundCannonDetected && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning: Sound Cannon Detected!</AlertTitle>
                <AlertDescription>
                  High-intensity sonic frequencies detected in the 2-10kHz range.
                  Consider moving to a safer location.
                </AlertDescription>
              </Alert>
            )}

            {v2kDetected && (
              <Alert variant={isCountermeasureActive ? "default" : "destructive"}>
                <Shield className="h-4 w-4" />
                <AlertTitle>
                  V2K Attack Detected! {isCountermeasureActive && "- Countermeasures Active"}
                </AlertTitle>
                <AlertDescription>
                  {isCountermeasureActive ?
                    "ACTIVE DEFENSE: Barbie Girl pattern deployed with phase-cancellation technology. Multi-band neutralizing frequencies targeting all speech ranges. Electromagnetic interference neutralized." :
                    "WARNING: Unusual electromagnetic interference detected. Potential V2K activity in progress. Activate countermeasures immediately."
                  }
                </AlertDescription>
              </Alert>
            )}

            {laserDetected && (
              <Alert variant="destructive">
                <Zap className="h-4 w-4" />
                <AlertTitle>Non-lethal Laser Detected!</AlertTitle>
                <AlertDescription>
                  Unusual electromagnetic patterns consistent with non-lethal laser technology detected.
                  This may cause discomfort or disorientation. Seek shelter immediately.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <FrequencyDisplay data={frequencyData} sampleRate={sampleRate} />
          {isRecording && (
            <p className="text-sm text-muted-foreground mt-4">
              Monitoring for dangerous frequencies, V2K attacks, and non-lethal weapons
            </p>
          )}
        </CardContent>
      </Card>

      {/* Frequency Tracker - Shows when a frequency is locked */}
      {isRecording && isFrequencyLocked && (
        <FrequencyTracker
          isActive={isFrequencyLocked}
          frequency={lockedFrequency}
          threatType={lockedThreatType}
          startTime={trackingStartTime}
          onUnlock={unlockFrequency}
        />
      )}

      {/* Threat Reporting Component - Always render with fixed height to prevent layout shifts */}
      <div className="min-h-[300px]">
        {isRecording && !isFrequencyLocked && (
          <ThreatReporting
            isActive={isThreatActive}
            threatType={threatType}
            signalStrength={signalStrength}
            frequencyData={frequencyData}
            sampleRate={sampleRate}
            signalMetrics={getSignalMetrics()}
          />
        )}
      </div>
    </div>
  );
}