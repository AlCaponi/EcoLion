import { useState, useRef, useCallback } from "react";

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string; // ISO
  accuracy?: number; // meters
}

interface UseLocationTrackingReturn {
  points: LocationPoint[];
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => LocationPoint[];
  clearPoints: () => void;
  error: string | null;
}

const TRACKING_CONFIG = {
  intervalSeconds: 5, // Record point every 5 seconds
  minAccuracyMeters: 50, // Ignore points with accuracy > 50m
  enableHighAccuracy: true, // Use GPS (not just WiFi/cell towers)
  maximumAge: 5000, // Don't use cached positions older than 5s
  timeout: 10000, // Give up on location request after 10s
};

export function useLocationTracking(): UseLocationTrackingReturn {
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  const addPoint = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    
    // Filter out low-accuracy points
    if (accuracy > TRACKING_CONFIG.minAccuracyMeters) {
      console.warn(`Skipping low-accuracy point: ${accuracy}m`);
      return;
    }

    const point: LocationPoint = {
      lat: latitude,
      lng: longitude,
      timestamp: new Date().toISOString(),
      accuracy,
    };

    setPoints((prev) => [...prev, point]);
    console.log(`📍 Tracked point: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(1)}m)`);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = "Unknown location error";
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable location access.";
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = "Location unavailable. Please check your GPS.";
        break;
      case err.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
    }
    
    console.error("Location tracking error:", errorMessage, err);
    setError(errorMessage);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setError(null);
    setIsTracking(true);
    
    // Get initial position immediately
    navigator.geolocation.getCurrentPosition(
      addPoint,
      handleError,
      {
        enableHighAccuracy: TRACKING_CONFIG.enableHighAccuracy,
        maximumAge: 0,
        timeout: TRACKING_CONFIG.timeout,
      }
    );

    // Start watching position for real-time updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      addPoint,
      handleError,
      {
        enableHighAccuracy: TRACKING_CONFIG.enableHighAccuracy,
        maximumAge: TRACKING_CONFIG.maximumAge,
        timeout: TRACKING_CONFIG.timeout,
      }
    );

    console.log("🎯 Location tracking started");
  }, [addPoint, handleError]);

  const stopTracking = useCallback((): LocationPoint[] => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    setIsTracking(false);
    console.log(`🛑 Location tracking stopped. Total points: ${points.length}`);
    
    return points;
  }, [points]);

  const clearPoints = useCallback(() => {
    setPoints([]);
    console.log("🗑️ Cleared all tracking points");
  }, []);

  // Cleanup on unmount
  useRef(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  });

  return {
    points,
    isTracking,
    startTracking,
    stopTracking,
    clearPoints,
    error,
  };
}
