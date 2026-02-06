import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="bottomNav">
      <NavLink to="/" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        Home
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        Stats
      </NavLink>
      <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        Leaderboard
      </NavLink>
      <NavLink to="/shop" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        Shop
      </NavLink>
    </nav>
  );
}
