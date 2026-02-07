import { useState, useEffect } from "react";
import Card from "../shared/components/Card";

const STREAK_DAYS = 8;

export default function HomePage() {
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
        <div className="lionPreview">
          <div className="lionEmoji">🦁</div>
          <div>
            <div className="lionMood">Stimmung: 😊 Happy</div>
            <div className="lionLevel">Level 5 · 120 XP · 85 Coins</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
