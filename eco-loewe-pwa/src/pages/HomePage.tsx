import { useState, useEffect } from "react";
import Card from "../shared/components/Card";
import MascotDisplay from "../shared/components/MascotDisplay";
import PrimaryButton from "../shared/components/PrimaryButton";

import busIcon from "../assets/transport_types/bus_icon.png";
import carIcon from "../assets/transport_types/car_icon.png";
import carPoolingIcon from "../assets/transport_types/carPooling_icon.png";
import homeOfficeIcon from "../assets/transport_types/homeOffice_icon.png";
import walkingIcon from "../assets/transport_types/walking_icon.png";
import bikingIcon from "../assets/transport_types/biking_icon.png";

const ACTIVITIES = [
  { id: "walk", label: "Gehen", iconSrc: walkingIcon, emoji: "🚶" },
  { id: "bike", label: "Velo", iconSrc: bikingIcon, emoji: "🚲" },
  { id: "transit", label: "ÖV", iconSrc: busIcon, emoji: "🚌" },
  { id: "drive", label: "Auto", iconSrc: carIcon, emoji: "🚗" },
  { id: "wfh", label: "Home Office", iconSrc: homeOfficeIcon, emoji: "🏠" },
  { id: "pool", label: "Pooling", iconSrc: carPoolingIcon, emoji: "🤝" },
];

const STREAK_DAYS = 8;

export default function HomePage() {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

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

  const handleStart = (id: string) => {
    setActiveActivity(id);
    setTimer(0);
  };

  const handleStop = () => {
    setActiveActivity(null);
    setTimer(0);
    // In a real app, save the activity here
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
            movement={activeActivity as any} 
            level={5} 
            xp={120} 
            style={{ marginBottom: "2rem" }}
        />

        <div className="recording-timer">
            {formatTime(timer)}
        </div>

        <div className="recording-actions">
            <PrimaryButton onClick={handleStop} className="stop-btn">
                Beenden & Speichern
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
            level={5} 
            xp={120} 
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
