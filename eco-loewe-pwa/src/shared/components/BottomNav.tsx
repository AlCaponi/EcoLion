import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="bottomNav">
      <NavLink to="/" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        <div className="navIcon">🏠</div>
        <span>Home</span>
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        <div className="navIcon">📊</div>
        <span>Stats</span>
      </NavLink>
      <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        <div className="navIcon">🏆</div>
        <span>Bestenliste</span>
      </NavLink>
      <NavLink to="/shop" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        <div className="navIcon">🛒</div>
        <span>Shop</span>
      </NavLink>
      <NavLink to="/challenges" className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
        <div className="navIcon">🎯</div>
        <span>Challenges</span>
      </NavLink>
    </nav>
  );
}
