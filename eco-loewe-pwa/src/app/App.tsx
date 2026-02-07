import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import AppShell from "../shared/components/AppShell";
import ErrorBoundary from "../shared/components/ErrorBoundary";

export default function App() {
  const element = useRoutes(routes);
  return (
    <ErrorBoundary>
      <AppShell>{element}</AppShell>
    </ErrorBoundary>
  );
}
