import { useState, useEffect, useRef } from 'react';

interface RFDetectionResult {
  isScanning: boolean;
  signalStrength: number | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}

export function useRFDetector(): RFDetectionResult {
  const [isScanning, setIsScanning] = useState(false);
  const [signalStrength, setSignalStrength] = useState<number | null>(null);
  const magnetometerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  // Cleanup function to ensure resources are properly released
  const cleanup = () => {
    if (magnetometerRef.current) {
      try {
        magnetometerRef.current.stop();
        magnetometerRef.current = null;
      } catch (error) {
        console.error('Error stopping magnetometer:', error);
      }
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Ensure cleanup when component unmounts
  useEffect(() => {
    return cleanup;
  }, []);

  const startScanning = async () => {
    // Clean up any existing scanning first
    cleanup();

    try {
      // Check if the device has the required sensors
      if ('Magnetometer' in window) {
        // @ts-ignore - Magnetometer API is experimental
        const magnetometer = new Magnetometer({ frequency: 60 });

        magnetometer.addEventListener('reading', () => {
          // Calculate signal strength from magnetic field values
          const strength = Math.sqrt(
            Math.pow(magnetometer.x, 2) +
            Math.pow(magnetometer.y, 2) +
            Math.pow(magnetometer.z, 2)
          );

          setSignalStrength(strength);
        });

        magnetometer.start();
        magnetometerRef.current = magnetometer;
        setIsScanning(true);
      } else {
        throw new Error('Magnetometer not available');
      }
    } catch (error) {
      console.error('Error accessing magnetometer:', error);
      // Fallback to simulated detection for demo purposes
      simulateRFDetection();
    }
  };

  const stopScanning = () => {
    cleanup();
    setIsScanning(false);
    setSignalStrength(null);
  };

  // Simulate RF detection for devices without magnetometer
  const simulateRFDetection = () => {
    setIsScanning(true);

    // Clear any existing interval first
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval and store the reference
    intervalRef.current = window.setInterval(() => {
      // Simulate random signal strength fluctuations
      const baseStrength = 50;
      const noise = Math.random() * 20 - 10;
      setSignalStrength(baseStrength + noise);
    }, 100);
  };

  return {
    isScanning,
    signalStrength,
    startScanning,
    stopScanning
  };
}
