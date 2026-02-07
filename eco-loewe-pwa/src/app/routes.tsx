import type { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";
import StatsPage from "../pages/StatsPage";
import ShopPage from "../pages/ShopPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import RewardsPage from "../pages/RewardsPage";

export const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/stats", element: <StatsPage /> },
  { path: "/leaderboard", element: <LeaderboardPage /> },
  { path: "/shop", element: <ShopPage /> },
  { path: "/rewards", element: <RewardsPage /> },
];
