import { type FormEvent, useMemo, useState } from "react";
import { Api } from "../shared/api/endpoints";
import { ApiRequestError, apiClient } from "../shared/api/client";
import { createPasskey, getPasskeyAssertion } from "../shared/auth/passkey";

interface AuthPageProps {
  onAuthenticated: () => void;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }
  if (error instanceof DOMException && error.name === "SecurityError") {
    return "Passkey setup failed due to browser security checks. Ensure the site uses HTTPS and backend WEBAUTHN_RP_ID matches this domain.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Authentication failed. Please try again.";
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [displayName, setDisplayName] = useState("");
  const [quartier, setQuartier] = useState("Altstadt");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supportsPasskeys = useMemo(
    () => typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined",
    [],
  );

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setMessage("Please enter a name to create your passkey.");
      return;
    }

    setIsRegistering(true);
    setMessage(null);
    try {
      const begin = await Api.registerBegin({ displayName: trimmed });
      const credential = await createPasskey(begin.publicKey);
      const finish = await Api.registerFinish({
        sessionId: begin.sessionId,
        credential,
      });
      apiClient.setAuthToken(finish.token);
      onAuthenticated();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLogin() {
    setIsLoggingIn(true);
    setMessage(null);
    try {
      const begin = await Api.loginBegin();
      const credential = await getPasskeyAssertion(begin.publicKey);
      const finish = await Api.loginFinish({
        sessionId: begin.sessionId,
        credential,
      });
      apiClient.setAuthToken(finish.token);
      onAuthenticated();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="authEyebrow">Eco-Loewe</p>
        <h1>Anmelden</h1>
        <p className="authDescription">
          Melde dich mit deinem bestehenden Passkey an oder registriere dich neu.
        </p>

        <button
          type="button"
          className="btn"
          onClick={handleLogin}
          disabled={!supportsPasskeys || isLoggingIn || isRegistering}
        >
          {isLoggingIn ? "Warte auf Passkey..." : "Login"}
        </button>

        <h2 className="authSectionTitle">Registrieren</h2>
        <form className="authForm" onSubmit={handleRegister}>
          <label htmlFor="displayName">Name</label>
          <input
            id="displayName"
            type="text"
            placeholder="Dein Name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="nickname"
            disabled={!supportsPasskeys || isRegistering || isLoggingIn}
          />
          <label htmlFor="quartier">Quartier</label>
          <select
            id="quartier"
            value={quartier}
            onChange={(event) => setQuartier(event.target.value)}
            disabled={!supportsPasskeys || isRegistering || isLoggingIn}
          >
            <option value="Altstadt">Altstadt</option>
            <option value="Oberwinterthur">Oberwinterthur</option>
            <option value="Seen">Seen</option>
            <option value="Töss">Töss</option>
            <option value="Veltheim">Veltheim</option>
            <option value="Wülflingen">Wülflingen</option>
            <option value="Mattenbach">Mattenbach</option>
          </select>
          <button
            type="submit"
            className="btn btnPrimary"
            disabled={!supportsPasskeys || isRegistering || isLoggingIn}
          >
            {isRegistering ? "Registrierung läuft..." : "Registrieren"}
          </button>
        </form>

        {!supportsPasskeys && (
          <p className="authError">Dieser Browser unterstützt keine Passkeys.</p>
        )}
        {message && <p className="authError">{message}</p>}
      </section>
    </main>
  );
}
