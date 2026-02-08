import { useState, useEffect } from "react";
import { useSettings } from "../shared/context/SettingsContext";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Card from "../shared/components/Card";
import MascotDisplay from "../shared/components/MascotDisplay";
import { Api } from "../shared/api/endpoints";
import type { ActivityType, UserDTO } from "../shared/api/types";
import { useLocationTracking } from "../hooks/useLocationTracking";

// Component to update map view when location changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

import busIcon from "../assets/transport_types/bus_icon.png";
import carIcon from "../assets/transport_types/car_icon.png";
import carPoolingIcon from "../assets/transport_types/carPooling_icon.png";
import homeOfficeIcon from "../assets/transport_types/homeOffice_icon.png";
import walkingIcon from "../assets/transport_types/walking_icon.png";
import bikingIcon from "../assets/transport_types/biking_icon.png";

// Fix Leaflet default marker icon issue with webpack
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Create custom red marker
const RedIcon = L.icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" fill="#e74c3c">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 18 9 18s9-12.75 9-18c0-4.97-4.03-9-9-9z"/>
      <circle cx="12" cy="9" r="4" fill="white"/>
    </svg>
  `)}`,
  shadowUrl: iconShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowSize: [41, 41],
});

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ACTIVITIES = [
  { id: "walk", label: "Gehen", iconSrc: walkingIcon, emoji: "🚶" },
  { id: "bike", label: "Velo", iconSrc: bikingIcon, emoji: "🚲" },
  { id: "transit", label: "ÖV", iconSrc: busIcon, emoji: "🚌" },
  { id: "drive", label: "Auto", iconSrc: carIcon, emoji: "🚗" },
  { id: "wfh", label: "Home Office", iconSrc: homeOfficeIcon, emoji: "🏠" },
  { id: "pool", label: "Pooling", iconSrc: carPoolingIcon, emoji: "🤝" },
];

export default function HomePage() {
  const { language, setLanguage } = useSettings();
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null);
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [userStats] = useState({ level: 1, xp: 0 });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // GPS route tracking
  const { points, startTracking, stopTracking } = useLocationTracking(isPaused);

  // Update map center to follow latest tracked point
  useEffect(() => {
    if (points.length > 0) {
      const latestPoint = points[points.length - 1];
      setUserLocation([latestPoint.lat, latestPoint.lng]);
    }
  }, [points]);

  useEffect(() => {
    fetchDashboard();
    
    // Get user's GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Could not get location:", error);
          // Fallback to Winterthur center
          setUserLocation([47.5, 8.72]);
        }
      );
    } else {
      // Fallback to Winterthur center
      setUserLocation([47.5, 8.72]);
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await Api.dashboard();
      setUser(data);

      if ((data as any).currentActivity) {
        setActiveActivity((data as any).currentActivity.activityType);
        setCurrentActivityId((data as any).currentActivity.activityId);
        const elapsed = Math.floor((Date.now() - new Date((data as any).currentActivity.startTime).getTime()) / 1000);
        setTimer(elapsed > 0 ? elapsed : 0);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch dashboard", e);
    }
  };

  useEffect(() => {
    let interval: number;
    if (activeActivity && !isPaused) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeActivity, isPaused]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async (id: string) => {
    const type = id as ActivityType;
    // Optimistic update
    setActiveActivity(type);
    setTimer(0);
    
    // Check if we should use mock data (for testing)
    const useMockData = new URLSearchParams(window.location.search).get('mock') === 'true';
    
    // Start GPS tracking (with optional mock mode)
    startTracking(useMockData);
    
    try {
      const data = await Api.startActivity({ activityType: type, startTime: new Date().toISOString() });
      setCurrentActivityId(data.activityId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to start activity", e);
      setActiveActivity(null); // Revert on failure
      stopTracking(); // Stop tracking on failure
    }
  };

  const handleStop = async () => {
    // Stop GPS tracking and get collected points
    const routePoints = stopTracking();
    
    if (currentActivityId) {
      try {
        await Api.stopActivity({ 
          activityId: currentActivityId, 
          stopTime: new Date().toISOString(),
          gpx: { points: routePoints }, // Send route data
        });
        await fetchDashboard(); // Refresh stats
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to stop activity", e);
      }
    }
    setActiveActivity(null);
    setCurrentActivityId(null);
    setTimer(0);
  };

  if (activeActivity) {
    return (
      <div className="page homePage recording-mode">
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "0" }}>
          {/* Compact Mascot Display with Custom Activity Animation */}
          <div style={{ marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
            <MascotDisplay 
              movement={activeActivity} 
              mood={user?.lion?.mood}
              level={userStats.level} 
              xp={userStats.xp} 
              compact={true}
            />
          </div>
        </div>

        {/* Live Map - Simple SBB-style color scheme */}
        {userLocation && (
          <div className="map-container" style={{ height: "220px", width: "100%", marginBottom: "1rem", borderRadius: "12px", overflow: "hidden" }}>
            <MapContainer
              center={userLocation}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <MapUpdater center={userLocation} />
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              
              {/* Route polyline - shows tracked path */}
              {points.length > 1 && (
                <Polyline 
                  positions={points.map(p => {
                    console.log(`📍 Point: [${p.lat}, ${p.lng}]`);
                    return [p.lat, p.lng];
                  })}
                  color="#e74c3c"
                  weight={4}
                  opacity={0.8}
                />
              )}
              
              <Marker position={userLocation} icon={RedIcon}>
                <Popup>Your location</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Slider Control - SBB Easy Ride Style */}
        <div style={{ 
          padding: "0 1rem", 
          width: "100%", 
          maxWidth: "600px", 
          margin: "0 auto",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center" // Center the whole control group
        }}>
          {/* Pause/Play Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              width: "50px",
              height: "50px",
              flexShrink: 0, // Prevent shrinking
              borderRadius: "50%",
              border: "none",
              backgroundColor: isPaused ? "#2ecc71" : "#f1c40f",
              color: "white",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            {isPaused ? "▶" : "⏸"}
          </button>

          {/* Swipe to Stop Slider */}
          <div 
            className="slider-container"
            style={{ 
              position: "relative",
              flex: 1,
              height: "60px",
              backgroundColor: "#f0f0f0",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}
          >
            {/* Timer Display (Centered) */}
            <div style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "1.2rem", // Slightly larger
              fontWeight: "bold",
              color: "#333", // Darker for better visibility
              pointerEvents: "none",
              zIndex: 2 // Above everything else
            }}>
              {formatTime(timer)}
            </div>

            {/* Slider Track Text - Hide if timer has started to reduce clutter, or make it subtle */}
            <div style={{
              position: "absolute",
              width: "100%",
              textAlign: "right", // Move to right
              paddingRight: "20px",
              fontSize: "0.8rem",
              color: "#aaa",
              pointerEvents: "none",
              zIndex: 0,
              opacity: timer > 5 ? 0 : 1, // Fade out after 5 seconds
              transition: "opacity 0.5s"
            }}>
              Slide to Stop &gt;&gt;
            </div>

            {/* Draggable Handle */}
            <div
              className="slider-handle"
              onMouseDown={(e) => {
                const handle = e.currentTarget;
                const container = handle.parentElement;
                if (!container) return;
                
                const startX = e.clientX;
                const maxDist = container.clientWidth - handle.clientWidth - 8; 
                
                const onMove = (moveEvent: MouseEvent) => {
                  let dist = moveEvent.clientX - startX;
                  if (dist < 0) dist = 0;
                  if (dist > maxDist) dist = maxDist;
                  handle.style.transform = `translateX(${dist}px)`;
                };
                
                const onUp = (upEvent: MouseEvent) => {
                  const dist = upEvent.clientX - startX;
                  document.removeEventListener("mousemove", onMove);
                  document.removeEventListener("mouseup", onUp);
                  
                  if (dist > maxDist * 0.8) { // Require 80% slide
                    handleStop();
                  } else {
                    handle.style.transition = "transform 0.3s ease";
                    handle.style.transform = "translateX(0)";
                    setTimeout(() => {
                      handle.style.transition = "none";
                    }, 300);
                  }
                };
                
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
              }}
              onTouchStart={(e) => {
                 const handle = e.currentTarget;
                 const container = handle.parentElement;
                 if (!container) return;
                 
                 const touch = e.touches[0];
                 const startX = touch.clientX;
                 const maxDist = container.clientWidth - handle.clientWidth - 8;

                 const onTouchMove = (moveEvent: TouchEvent) => {
                   let dist = moveEvent.touches[0].clientX - startX;
                   if (dist < 0) dist = 0;
                   if (dist > maxDist) dist = maxDist;
                   handle.style.transform = `translateX(${dist}px)`;
                 };

                 const onTouchEnd = (endEvent: TouchEvent) => {
                   const dist = endEvent.changedTouches[0].clientX - startX;
                   document.removeEventListener("touchmove", onTouchMove);
                   document.removeEventListener("touchend", onTouchEnd);
                   
                   if (dist > maxDist * 0.8) {
                     handleStop();
                   } else {
                     handle.style.transition = "transform 0.3s ease";
                     handle.style.transform = "translateX(0)";
                     setTimeout(() => {
                        handle.style.transition = "none";
                     }, 300);
                   }
                 };

                 document.addEventListener("touchmove", onTouchMove);
                 document.addEventListener("touchend", onTouchEnd);
              }}
              style={{
                width: "52px",
                height: "52px",
                backgroundColor: "#e74c3c",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: "bold",
                cursor: "grab",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                zIndex: 3, // Highest priority
                touchAction: "none"
              }}
            >
              STOP
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page homePage">
      <h1>Willkommen, Eco-Löwe! 🦁</h1>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div className="sectionTitle" style={{ marginBottom: 0 }}>Dein Löwe</div>
          <div className="segmented" style={{ transform: "scale(0.8)", margin: 0 }}>
            <button
              aria-selected={language === "de"}
              onClick={() => setLanguage("de")}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              DE
            </button>
            <button
              aria-selected={language === "en"}
              onClick={() => setLanguage("en")}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              EN
            </button>
          </div>
        </div>
        {user?.lion ? (
          <MascotDisplay
            level={Math.floor(user.sustainabilityScore / 100) + 1}
            xp={user.sustainabilityScore}
            accessories={user.lion.accessories}
            movement="idle"
            mood={user.lion.mood}
          />
        ) : (
          <div className="lionPreview">
            <div className="lionEmoji">🦁</div>
            <div>Lade Löwe...</div>
          </div>
        )}
      </Card>

      <section className="activity-section" style={{ marginTop: "1rem" }}>
        <h2 className="sectionTitle">Aktivität starten</h2>
        
        {/* Mock mode indicator */}
        {new URLSearchParams(window.location.search).get('mock') === 'true' && (
          <div style={{ 
            padding: "8px 12px", 
            backgroundColor: "#fff3cd", 
            border: "1px solid #ffc107",
            borderRadius: "8px", 
            marginBottom: "12px",
            fontSize: "13px",
            fontWeight: "600",
            textAlign: "center"
          }}>
            🧪 Test-Modus: Simulierte GPS-Daten werden verwendet
          </div>
        )}
        
        <div className="activity-grid">
          {ACTIVITIES.map((act) => (
            <button key={act.id} className="activity-btn" onClick={() => handleStart(act.id)}>
              <div className="act-icon">
                {act.iconSrc ? (
                  <img src={act.iconSrc} alt={act.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  act.emoji
                )}
              </div>
              <div className="act-label">{act.label}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
