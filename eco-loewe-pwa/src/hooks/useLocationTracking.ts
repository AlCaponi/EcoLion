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
  startTracking: (useMockData?: boolean) => void;
  stopTracking: () => LocationPoint[];
  clearPoints: () => void;
  error: string | null;
}

const TRACKING_CONFIG = {
  minAccuracyMeters: 50, // Ignore points with accuracy > 50m
  enableHighAccuracy: true, // Use GPS (not just WiFi/cell towers)
  maximumAge: 5000, // Don't use cached positions older than 5s
  timeout: 10000, // Give up on location request after 10s
  mockIntervalMs: 2000, // Mock mode: add point every 2 seconds
};

// Mock route: circular path around Winterthur city center
const MOCK_ROUTE = [
  { lat: 47.5000, lng: 8.7200 }, // Start point
  { lat: 47.5010, lng: 8.7210 },
  { lat: 47.5020, lng: 8.7220 },
  { lat: 47.5030, lng: 8.7215 },
  { lat: 47.5035, lng: 8.7205 },
  { lat: 47.5030, lng: 8.7190 },
  { lat: 47.5020, lng: 8.7185 },
  { lat: 47.5010, lng: 8.7195 },
  { lat: 47.5000, lng: 8.7200 }, // Back to start
];

export function useLocationTracking(): UseLocationTrackingReturn {
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null); // Real GPS tracking
  const intervalIdRef = useRef<number | null>(null); // Mock mode timer

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

  const startTracking = useCallback((useMockData = false) => {
    setError(null);
    setIsTracking(true);

    // Mock mode: simulate GPS movement along a predefined route
    if (useMockData) {
      let mockIndex = 0;
      
      // Add first point immediately
      const firstPoint: LocationPoint = {
        lat: MOCK_ROUTE[0].lat,
        lng: MOCK_ROUTE[0].lng,
        timestamp: new Date().toISOString(),
        accuracy: 10,
      };
      setPoints([firstPoint]);
      console.log("🧪 Mock tracking started - simulating movement");

      // Add subsequent points at intervals
      intervalIdRef.current = window.setInterval(() => {
        mockIndex++;
        if (mockIndex >= MOCK_ROUTE.length) {
          mockIndex = 0; // Loop back to start
        }

        const point: LocationPoint = {
          lat: MOCK_ROUTE[mockIndex].lat,
          lng: MOCK_ROUTE[mockIndex].lng,
          timestamp: new Date().toISOString(),
          accuracy: Math.random() * 20 + 5, // Random accuracy 5-25m
        };

        setPoints((prev) => [...prev, point]);
        console.log(`📍 Mock point ${mockIndex + 1}/${MOCK_ROUTE.length}: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`);
      }, TRACKING_CONFIG.mockIntervalMs);

      return;
    }

    // Real GPS tracking
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
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
