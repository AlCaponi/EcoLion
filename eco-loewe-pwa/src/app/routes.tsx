import HomePage from "../pages/HomePage";
import DashboardPage from "../pages/DashboardPage";
import StatsPage from "../pages/StatsPage";
import ShopPage from "../pages/ShopPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import RewardsPage from "../pages/RewardsPage";

import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  { path: "/", element: <DashboardPage /> },
  { path: "/profile", element: <HomePage /> },
  { path: "/stats", element: <StatsPage /> },
  { path: "/leaderboard", element: <LeaderboardPage /> },
  { path: "/shop", element: <ShopPage /> },
  { path: "/rewards", element: <RewardsPage /> },
];
