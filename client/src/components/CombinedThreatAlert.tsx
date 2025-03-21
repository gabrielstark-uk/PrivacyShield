import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Radio, AlertTriangle, MapPin, Shield, Zap, Target, Clock, Satellite, Wifi, Server, Cpu, AlertCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

interface CombinedThreatAlertProps {
  v2kFrequency: number | null;
  soundCannonFrequency: number | null;
  v2kStartTime: Date | null;
  soundCannonStartTime: Date | null;
}

export function CombinedThreatAlert({
  v2kFrequency,
  soundCannonFrequency,
  v2kStartTime,
  soundCannonStartTime
}: CombinedThreatAlertProps) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  const [policeResponse, setPoliceResponse] = useState<{
    status: 'connecting' | 'transmitting' | 'confirmed' | 'tracking';
    caseNumber?: string;
    respondingUnit?: string;
    estimatedArrival?: number;
    threatSourceLocation?: {
      latitude: number;
      longitude: number;
      direction: string;
      distance: string;
      accuracy: number;
    };
    deviceType?: string;
  }>({
    status: 'connecting'
  });

  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [laserDeactivated, setLaserDeactivated] = useState<boolean>(false); // New state for laser deactivation

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  useEffect(() => {
    const connectingTimeout = setTimeout(() => {
      setPoliceResponse({
        status: 'transmitting'
      });

      const transmittingTimeout = setTimeout(() => {
        const caseNumber = `${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        const threatSourceLocation = simulateTriangulation();

        setPoliceResponse({
          status: 'confirmed',
          caseNumber,
          respondingUnit: `Mobile Patrol Unit ${Math.floor(Math.random() * 50) + 1}`,
          estimatedArrival: Math.floor(Math.random() * 10) + 5,
          threatSourceLocation,
          deviceType: determineDeviceType(v2kFrequency || 0, soundCannonFrequency || 0)
        });

        const trackingTimeout = setTimeout(() => {
          setPoliceResponse(prev => ({
            ...prev,
            status: 'tracking'
          }));
        }, 3000);

        return () => clearTimeout(trackingTimeout);
      }, 4000);

      return () => clearTimeout(transmittingTimeout);
    }, 2000);

    return () => clearTimeout(connectingTimeout);
  }, [v2kFrequency, soundCannonFrequency]);

  useEffect(() => {
    const startTime = v2kStartTime && soundCannonStartTime
      ? new Date(Math.min(v2kStartTime.getTime(), soundCannonStartTime.getTime()))
      : new Date();

    const updateElapsedTime = () => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');

      setElapsedTime(`${hours}:${minutes}:${seconds}`);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(interval);
  }, [v2kStartTime, soundCannonStartTime]);

  const simulateTriangulation = () => {
    if (!location) return undefined;

    const directions = [
      'North', 'North-Northeast', 'Northeast', 'East-Northeast',
      'East', 'East-Southeast', 'Southeast', 'South-Southeast',
      'South', 'South-Southwest', 'Southwest', 'West-Southwest',
      'West', 'West-Northwest', 'Northwest', 'North-Northwest'
    ];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const distanceMeters = Math.floor(Math.random() * 450) + 50;
    const distanceStr = `${distanceMeters} meters`;

    const earthRadius = 6371000;
    const degreesToRadians = Math.PI / 180;
    const radiansToDegrees = 180 / Math.PI;

    let bearing = 0;
    switch (direction) {
      case 'North': bearing = 0; break;
      case 'North-Northeast': bearing = 22.5; break;
      case 'Northeast': bearing = 45; break;
      case 'East-Northeast': bearing = 67.5; break;
      case 'East': bearing = 90; break;
      case 'East-Southeast': bearing = 112.5; break;
      case 'Southeast': bearing = 135; break;
      case 'South-Southeast': bearing = 157.5; break;
      case 'South': bearing = 180; break;
      case 'South-Southwest': bearing = 202.5; break;
      case 'Southwest': bearing = 225; break;
      case 'West-Southwest': bearing = 247.5; break;
      case 'West': bearing = 270; break;
      case 'West-Northwest': bearing = 292.5; break;
      case 'Northwest': bearing = 315; break;
      case 'North-Northwest': bearing = 337.5; break;
    }

    const bearingRad = bearing * degreesToRadians;
    const lat1 = location.latitude * degreesToRadians;
    const lon1 = location.longitude * degreesToRadians;

    const distanceRatio = distanceMeters / earthRadius;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceRatio) +
      Math.cos(lat1) * Math.sin(distanceRatio) * Math.cos(bearingRad)
    );
    const lon2 = lon1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distanceRatio) * Math.cos(lat1),
      Math.cos(distanceRatio) - Math.sin(lat1) * Math.sin(lat2)
    );

    const newLat = lat2 * radiansToDegrees;
    const newLon = lon2 * radiansToDegrees;

    return {
      latitude: newLat,
      longitude: newLon,
      direction,
      distance: distanceStr,
      accuracy: Math.max(5, Math.min(30, distanceMeters * 0.1))
    };
  };

  const determineDeviceType = (v2kFreq: number, soundCannonFreq: number): string => {
    const frequencyRatio = v2kFreq / soundCannonFreq;
    const frequencySum = v2kFreq + soundCannonFreq;

    if (v2kFreq > 18000 && soundCannonFreq < 8000) {
      return 'Military-Grade Directional Sound Projector with V2K Module';
    } else if (frequencyRatio > 2.5) {
      return 'Modified LRAD System with V2K Capabilities';
    } else if (v2kFreq > 15000 && soundCannonFreq > 5000) {
      return 'Advanced Acoustic/Electromagnetic Hybrid Device';
    } else if (frequencySum > 25000) {
      return 'Custom Multi-Frequency Transmitter Array';
    } else {
      return 'Experimental Non-Lethal Weapon Prototype';
    }
  };

  const formatCoordinates = (lat: number, lng: number): string => {
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";

    const latDeg = Math.abs(lat).toFixed(6);
    const lngDeg = Math.abs(lng).toFixed(6);

    return `${latDeg}° ${latDir}, ${lngDeg}° ${lngDir}`;
  };

  const getStatusIndicator = () => {
    switch (policeResponse.status) {
      case 'connecting':
        return (
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <Wifi className="h-5 w-5 text-amber-500" />
            </div>
            <span>Connecting to Emergency Services...</span>
            <Progress value={25} className="h-2 w-24" />
          </div>
        );
      case 'transmitting':
        return (
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <Server className="h-5 w-5 text-amber-500" />
            </div>
            <span>Transmitting Threat Data...</span>
            <Progress value={50} className="h-2 w-24" />
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-500" />
            <span>Police Response Confirmed</span>
            <Progress value={75} className="h-2 w-24" />
          </div>
        );
      case 'tracking':
        return (
          <div className="flex items-center gap-2">
            <div className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></div>
            <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
            <Satellite className="h-5 w-5 text-red-500 ml-1" />
            <span>Live Tracking Active</span>
            <Progress value={100} className="h-2 w-24" />
          </div>
        );
    }
  };

  return (
    <Card className="border-red-500">
      <CardHeader className="bg-red-500/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>EMERGENCY: Combined Threat Alert</span>
          </div>
          <Badge className="bg-red-500">POLICE NOTIFIED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Multiple Threats Detected and Locked</AlertTitle>
          <AlertDescription>
            Both V2K and Sound Cannon threats have been detected and locked. An emergency report has been automatically sent to the nearest police station with your location and threat details.
          </AlertDescription>
        </Alert>

        <div className="border rounded-md p-3 bg-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-700" />
              <span className="font-medium">Tracking Time: <span className="font-mono">{elapsedTime}</span></span>
            </div>
            {policeResponse.caseNumber && (
              <div className="text-sm">
                <span className="text-slate-500">Case #:</span> <span className="font-mono">{policeResponse.caseNumber}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            {getStatusIndicator()}
            {policeResponse.estimatedArrival && policeResponse.status === 'tracking' && (
              <div className="text-sm">
                <span className="text-slate-500">ETA:</span> <span className="font-mono">{policeResponse.estimatedArrival} min</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-3 bg-blue-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="h-4 w-4 text-blue-500" />
              <span className="font-medium">V2K Signal</span>
            </div>
            <p className="text-sm">
              Frequency: <span className="font-mono">{v2kFrequency?.toFixed(2)} Hz</span><br />
              Locked at: <span className="font-mono">{v2kStartTime?.toLocaleTimeString()}</span>
            </p>
          </div>

          <div className="border rounded-md p-3 bg-yellow-500/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Sound Cannon Signal</span>
            </div>
            <p className="text-sm">
              Frequency: <span className="font-mono">{soundCannonFrequency?.toFixed(2)} Hz</span><br />
              Locked at: <span className="font-mono">{soundCannonStartTime?.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Your Location</span>
            </div>
            {location ? (
              <p className="text-sm">
                Coordinates: <span className="font-mono">{formatCoordinates(location.latitude, location.longitude)}</span><br />
                Accuracy: <span className="font-mono">{Math.round(location.accuracy)} meters</span>
              </p>
            ) : (
              <p className="text-sm">Acquiring location data...</p>
            )}
          </div>

          {policeResponse.threatSourceLocation && (
            <div className="border rounded-md p-3 bg-red-50">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-red-500" />
                <span className="font-medium">Threat Source Location</span>
              </div>
              <p className="text-sm">
                Direction: <span className="font-mono">{policeResponse.threatSourceLocation.direction}</span><br />
                Distance: <span className="font-mono">{policeResponse.threatSourceLocation.distance}</span><br />
                Coordinates: <span className="font-mono">{formatCoordinates(
                  policeResponse.threatSourceLocation.latitude,
                  policeResponse.threatSourceLocation.longitude
                )}</span>
              </p>
            </div>
          )}
        </div>

        {policeResponse.deviceType && policeResponse.status === 'tracking' && (
          <div className="border rounded-md p-3 bg-slate-50">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-slate-700" />
              <span className="font-medium">Identified Device</span>
            </div>
            <p className="text-sm">
              Type: <span className="font-mono">{policeResponse.deviceType}</span><br />
              Signal Modulation: <span className="font-mono">Pulse-Width Modulation with Frequency Hopping</span><br />
              Power Source: <span className="font-mono">High-capacity lithium polymer battery pack</span>
            </p>
          </div>
        )}

        {policeResponse.respondingUnit && policeResponse.status === 'tracking' && (
          <div className="border rounded-md p-3 bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Responding Unit</span>
            </div>
            <p className="text-sm">
              Unit: <span className="font-mono">{policeResponse.respondingUnit}</span><br />
              Status: <span className="font-mono">En route to threat source</span><br />
              ETA: <span className="font-mono">{policeResponse.estimatedArrival} minutes</span>
            </p>
          </div>
        )}
        {
          policeResponse.status !== 'tracking' &&
          <Button onClick={() => setPoliceResponse(prev => ({...prev, status: 'tracking'}))}>
            Confirm Police Response
          </Button>
        }

        <div className="border rounded-md p-3">
          <p className="text-sm">
            <strong>IMPORTANT:</strong> Keep this application open and maintain signal lock. Law enforcement has been notified and is tracking the source of these signals. They will contact you shortly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
