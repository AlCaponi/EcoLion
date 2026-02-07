import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="appShell">
      <header className="topBar">
        <div className="topBarLeft">
          <div className="statPill fire">
             🔥 8
          </div>
          <div className="statPill coin">
             🪙 85
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
    </div>
  );
}
