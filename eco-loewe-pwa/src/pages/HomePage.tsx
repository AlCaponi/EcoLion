import { useState, useEffect } from "react";
import Card from "../shared/components/Card";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import MascotDisplay from "../shared/components/MascotDisplay";
import PrimaryButton from "../shared/components/PrimaryButton";
import { Api } from "../shared/api/endpoints";
import type { ActivityType, UserDTO } from "../shared/api/types";

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
>>>>>>> 9f88386 (Syntax fixes)
=======
>>>>>>> db9a526 (Implement Mascot Layering and Shop Assets)

const STREAK_DAYS = 8;

export default function HomePage() {
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null);
  const [currentActivityId, setCurrentActivityId] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
        const data = await Api.dashboard();
        setUser(data);

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
    // Optimistic update
    setActiveActivity(type);
    setTimer(0);
    try {
        const data = await Api.startActivity({ activityType: type, startTime: new Date().toISOString() });
        setCurrentActivityId(data.activityId);
    } catch (e) {
        console.error("Failed to start activity", e);
        setActiveActivity(null); // Revert on failure
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
            level={user ? Math.floor(user.sustainabilityScore / 100) + 1 : 1}
            xp={user?.sustainabilityScore ?? 0}
            accessories={user?.lion.accessories}
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

>>>>>>> 9f88386 (Syntax fixes)
=======
>>>>>>> db9a526 (Implement Mascot Layering and Shop Assets)
  return (
    <div className="page homePage">
      <h1>Willkommen, Eco-Löwe! 🦁</h1>

      <Card>
        <div className="row between">
          <div>
            <div className="label">CO₂ gespart</div>
            <div className="heroValue">12.4 kg</div>
          </div>
          <div>
            <div className="label">Streak</div>
            <div className="heroValue">{user?.streakDays ?? STREAK_DAYS} Tage 🔥</div>
          </div>
<<<<<<< HEAD
        </div>
        <div className="streakBar" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={i < (user?.streakDays ?? STREAK_DAYS) ? "dot on" : "dot"} />
          ))}
        </div>
=======
        </div>
        <div className="streakBar" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={i < (user?.streakDays ?? STREAK_DAYS) ? "dot on" : "dot"} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Heute</div>
        <div className="todayGrid">
          <div className="todayStat">
            <span className="todayIcon">🚶</span>
            <span className="todayVal">2.3 km</span>
            <span className="todayLabel">zu Fuß</span>
          </div>
          <div className="todayStat">
            <span className="todayIcon">🚌</span>
            <span className="todayVal">1 Fahrt</span>
            <span className="todayLabel">ÖV</span>
          </div>
          <div className="todayStat">
            <span className="todayIcon">🚗</span>
            <span className="todayVal">0 km</span>
            <span className="todayLabel">Auto</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Dein Löwe</div>
<<<<<<< HEAD
        {user ? (
          <MascotDisplay 
            level={Math.floor(user.sustainabilityScore / 100) + 1}
            xp={user.sustainabilityScore}
            accessories={user.lion.accessories}
            movement="idle"
          />
        ) : (
           <div className="lionPreview">
              <div className="lionEmoji">🦁</div>
              <div>Lade Löwe...</div>
           </div>
        )}
>>>>>>> 9f88386 (Syntax fixes)
      </Card>

      <Card>
        <div className="sectionTitle">Heute</div>
        <div className="todayGrid">
          <div className="todayStat">
            <span className="todayIcon">🚶</span>
            <span className="todayVal">2.3 km</span>
            <span className="todayLabel">zu Fuß</span>
          </div>
          <div className="todayStat">
            <span className="todayIcon">🚌</span>
            <span className="todayVal">1 Fahrt</span>
            <span className="todayLabel">ÖV</span>
          </div>
          <div className="todayStat">
            <span className="todayIcon">🚗</span>
            <span className="todayVal">0 km</span>
            <span className="todayLabel">Auto</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="sectionTitle">Dein Löwe</div>
        <div className="lionPreview">
          <div className="lionEmoji">🦁</div>
          <div>
            <div className="lionMood">Stimmung: 😊 Happy</div>
            <div className="lionLevel">Level 5 · 120 XP · 85 Coins</div>
          </div>
        </div>
      </Card>
=======
        <div className="lionPreview">
          <div className="lionEmoji">🦁</div>
          <div>
            <div className="lionMood">Stimmung: 😊 Happy</div>
            <div className="lionLevel">Level 5 · 120 XP · 85 Coins</div>
          </div>
        </div>
      </Card>
>>>>>>> db9a526 (Implement Mascot Layering and Shop Assets)
    </div>
  );
}
