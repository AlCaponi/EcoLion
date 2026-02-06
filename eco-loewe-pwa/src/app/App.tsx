import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import AppShell from "../shared/components/AppShell";

export default function App() {
  const element = useRoutes(routes);
  return <AppShell>{element}</AppShell>;
}
