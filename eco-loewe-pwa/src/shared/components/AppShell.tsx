import { type ReactNode, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import { Api } from "../api/endpoints";

interface AppShellProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function AppShell({ children, onLogout }: AppShellProps) {
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    async function init() {
      try {
        const [dashboard, me] = await Promise.all([Api.dashboard(), Api.whoami()]);
        setCoins(dashboard.lion.coins);
        setStreak(dashboard.streakDays);
        setDisplayName(me.displayName);
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
          {displayName ? (
            <div className="namePill" title={displayName}>
              {displayName}
            </div>
          ) : null}
          <div className="statPill">
            <span aria-hidden="true">🔥</span> {streak}
          </div>
          <div className="statPill">
            <span aria-hidden="true">🪙</span> {coins}
          </div>
        </div>
        <div className="topBarRight">
          <button className="logoutButton" aria-label="Logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span>
            Logout
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      <BottomNav />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
