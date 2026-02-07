import { useState, type ReactNode } from "react";
import BottomNav from "./BottomNav";
import AboutModal from "./AboutModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="appShell">
      <header className="topBar">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            aria-label="Öffne Menü"
            className="burger"
            onClick={() => setAboutOpen(true)}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1h18" />
              <path d="M1 7h18" />
              <path d="M1 13h18" />
            </svg>
          </button>

          <div className="brand">Eco-Löwe</div>
        </div>

        <div className="topBarRight">
          <span className="pill">Winterthur</span>
        </div>
      </header>

      <main className="content">{children}</main>

      <BottomNav />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
