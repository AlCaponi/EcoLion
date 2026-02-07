import { type ReactNode, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import { Api } from "../api/endpoints";
import { apiClient } from "../api/client";

export default function AppShell({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function init() {
        try {
            await apiClient.ensureAuth();
            const data = await Api.dashboard();
            if (data) {
                setCoins(data.lion.coins);
                setStreak(data.streakDays);
            }
        } catch (error) {
            console.error("Failed to init app shell:", error);
        }
    }
    init();
  }, []);

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="topBarLeft">
          <div className="statPill fire">
             🔥 {streak}
          </div>
          <div className="statPill coin">
             🪙 {coins}
          </div>
        </div>
        <div className="topBarRight">
          <button className="iconButton" aria-label="Settings">
            ⚙️
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      <BottomNav />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
