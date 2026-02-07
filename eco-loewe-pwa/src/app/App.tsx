import { useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import AppShell from "../shared/components/AppShell";
import ErrorBoundary from "../shared/components/ErrorBoundary";
import AuthPage from "../pages/AuthPage";
import { Api } from "../shared/api/endpoints";
import { apiClient } from "../shared/api/client";

export default function App() {
  const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
    "checking",
  );
  const element = useRoutes(routes);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = apiClient.getAuthToken();
      if (!token) {
        if (isMounted) {
          setAuthState("unauthenticated");
        }
        return;
      }
      try {
        await Api.dashboard();
        if (isMounted) {
          setAuthState("authenticated");
        }
      } catch {
        apiClient.clearAuthToken();
        if (isMounted) {
          setAuthState("unauthenticated");
        }
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ErrorBoundary>
      {authState === "checking" ? (
        <main className="authPage">
          <section className="authCard">
            <h1>Loading...</h1>
          </section>
        </main>
      ) : authState === "unauthenticated" ? (
        <AuthPage onAuthenticated={() => setAuthState("authenticated")} />
      ) : (
        <AppShell
          onLogout={() => {
            apiClient.clearAuthToken();
            setAuthState("unauthenticated");
          }}
        >
          {element}
        </AppShell>
      )}
    </ErrorBoundary>
  );
}
