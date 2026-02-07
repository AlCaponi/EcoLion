import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Card from "../shared/components/Card";
import MascotDisplay from "../shared/components/MascotDisplay";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { ActivityType } from "../shared/api/types";

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
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null);
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0 });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
        // Calculate level based on XP (simplified logic for now)
        // In real app, backend might send level or we compute it
        setUserStats({ 
            level: Math.floor(data.sustainabilityScore / 100) + 1, 
            xp: data.sustainabilityScore 
        });

        if (data.currentActivity) {
            setActiveActivity(data.currentActivity.activityType);
            setCurrentActivityId(data.currentActivity.activityId);
            const elapsed = Math.floor((Date.now() - new Date(data.currentActivity.startTime).getTime()) / 1000);
            setTimer(elapsed > 0 ? elapsed : 0);
        }
    } catch (e) {
        console.error("Failed to fetch dashboard", e);
    }
  };

  useEffect(() => {
    let interval: number;
    if (activeActivity) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeActivity]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async (id: string) => {
    const type = id as ActivityType;
    try {
      const data = await Api.startActivity({ activityType: type, startTime: new Date().toISOString() });
      if (!data || typeof data.activityId !== "number") {
        console.error("Failed to start activity: invalid response payload", data);
        return;
      }
      setCurrentActivityId(data.activityId);
      setActiveActivity(type);
      setTimer(0);
    } catch (e) {
      console.error("Failed to start activity", e);
    }
  };

  const handleStop = async () => {
    if (currentActivityId) {
        try {
            await Api.stopActivity({ activityId: currentActivityId, stopTime: new Date().toISOString() });
            await fetchDashboard(); // Refresh stats
        } catch (e) {
            console.error("Failed to stop activity", e);
        }
    }
    setActiveActivity(null);
    setCurrentActivityId(null);
    setTimer(0);
  };

  if (activeActivity) {
    const activity = ACTIVITIES.find((a) => a.id === activeActivity);
    return (
      <div className="page homePage recording-mode">
        <div className="recording-header">
            <h1>Aufzeichnung läuft...</h1>
            <div className="recording-label">{activity?.label}</div>
        </div>
        
        <MascotDisplay 
            movement={activeActivity} 
            level={userStats.level} 
            xp={userStats.xp} 
            style={{ marginBottom: "1rem", padding: "0.5rem" }}
        />

        {/* Live Map */}
        {userLocation && (
          <div style={{ height: "220px", width: "100%", marginBottom: "1rem", borderRadius: "12px", overflow: "hidden" }}>
            <MapContainer
              center={userLocation}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={userLocation}>
                <Popup>Your location</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <div className="recording-actions" style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center" }}>
            <div className="recording-timer" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {formatTime(timer)}
            </div>
            <PrimaryButton onClick={handleStop} className="stop-btn">
                Stop
            </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="page homePage">
      <Card className="hero-card">
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
           <div className="sectionTitle">Dein Begleiter</div>
        </div>
        <MascotDisplay 
            level={userStats.level} 
            xp={userStats.xp} 
        />
      </Card>

      <section className="activity-section">
        <h2 className="sectionTitle">Aktivität starten</h2>
        <div className="activity-grid">
            {ACTIVITIES.map((act) => (
                <button 
                    key={act.id} 
                    className="activity-btn"
                    onClick={() => handleStart(act.id)}
                >
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
