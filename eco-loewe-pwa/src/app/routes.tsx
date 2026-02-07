import HomePage from "../pages/HomePage";
import StatsPage from "../pages/StatsPage";
import ShopPage from "../pages/ShopPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import RewardsPage from "../pages/RewardsPage";

import ChallengesPage from "../pages/ChallengesPage";

export const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/stats", element: <StatsPage /> },
  { path: "/leaderboard", element: <LeaderboardPage /> },
  { path: "/shop", element: <ShopPage /> },
  { path: "/leaderboard", element: <LeaderboardPage /> },
  { path: "/rewards", element: <RewardsPage /> },
];
