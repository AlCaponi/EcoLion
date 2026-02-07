import { NavLink } from "react-router-dom";

/* Minimal inline SVG icons — 24×24, strokeWidth 2, no fill */
const icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9" />
    </svg>
  ),
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  stats: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="6" width="4" height="14" rx="1" />
      <rect x="17" y="2" width="4" height="18" rx="1" />
    </svg>
  ),
  trophy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H3a1 1 0 01-1-1V5a1 1 0 011-1h3" />
      <path d="M18 9h3a1 1 0 001-1V5a1 1 0 00-1-1h-3" />
      <path d="M6 4h12v6a6 6 0 01-12 0V4z" />
      <path d="M12 16v2" />
      <path d="M8 22h8" />
      <path d="M8 22v-2a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  shop: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  rewards: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15l-3.5 2 1-4L6 10l4-.5L12 6l2 3.5 4 .5-3.5 3 1 4z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

export default function BottomNav() {
  const cls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navItem active" : "navItem";

  return (
    <nav className="bottomNav">
      <NavLink to="/" className={cls}>
        {icons.home}
        <span>Home</span>
      </NavLink>
      <NavLink to="/dashboard" className={cls}>
        {icons.dashboard}
        <span>Profile</span>
      </NavLink>
      <NavLink to="/leaderboard" className={cls}>
        {icons.trophy}
        <span>Rivals</span>
      </NavLink>
      <NavLink to="/shop" className={cls}>
        {icons.shop}
        <span>Shop</span>
      </NavLink>
      <NavLink to="/rewards" className={cls}>
        {icons.rewards}
        <span>Rewards</span>
      </NavLink>
    </nav>
  );
}
