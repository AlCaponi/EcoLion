import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="appShell">
      <header className="topBar">
        <div className="brand">Eco-Löwe</div>
        <div className="topBarRight">
          <span className="pill">Winterthur</span>
        </div>
      </header>

      <main className="content">{children}</main>

      <BottomNav />
    </div>
  );
}
