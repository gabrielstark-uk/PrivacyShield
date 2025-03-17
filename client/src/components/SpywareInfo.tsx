import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Info } from "lucide-react";

export function SpywareInfo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Frequency Range Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Electromagnetic Interference Detection</AlertTitle>
            <AlertDescription>
              Our system analyzes audio signal patterns to detect unusual electromagnetic interference that may indicate external manipulation or surveillance.
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Age-Specific Speech Ranges</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Adult Speech: 100Hz - 3kHz</p>
              <p>Child Speech: 3kHz - 8kHz</p>
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Special Ranges</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Infrasonic: 20Hz - 100Hz</p>
              <p>Ultrasonic: 8kHz - 20kHz</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detection Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Monitor for unusual frequency patterns</p>
          <p>2. Check age-specific frequency anomalies</p>
          <p>3. Watch for high frequency spikes</p>
          <p>4. Document any persistent signals</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Countermeasures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Advanced Countermeasure System</AlertTitle>
            <AlertDescription>
              When activated, deploys a sophisticated defense system:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Barbie Girl melody pattern with precise frequency targeting</li>
                <li>Phase-cancellation technology using destructive interference</li>
                <li>Multi-band noise generators targeting all speech ranges</li>
                <li>Dynamic signal processing to neutralize electromagnetic interference</li>
                <li>Frequency modulation to permanently disrupt external devices</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Automatic Emergency Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Real-Time Threat Reporting</AlertTitle>
            <AlertDescription>
              When a threat is detected, our system automatically:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Notifies relevant authorities with detailed threat information</li>
                <li>Provides real-time location tracking of the victim</li>
                <li>Analyzes and reports the attacker's location and device details</li>
                <li>Maintains continuous updates until the threat is neutralized</li>
                <li>Creates a permanent record for legal proceedings</li>
              </ul>
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground mt-2">
            Our system uses advanced signal processing to identify the source of attacks,
            providing authorities with critical information to locate and neutralize threats.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}