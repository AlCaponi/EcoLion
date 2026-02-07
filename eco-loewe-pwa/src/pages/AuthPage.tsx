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
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Authentication failed. Please try again.";
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [displayName, setDisplayName] = useState("");
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
        <h1>Sign in with a Passkey</h1>
        <p className="authDescription">
          Register once with your name, then unlock the app with your passkey only.
        </p>

        <form className="authForm" onSubmit={handleRegister}>
          <label htmlFor="displayName">Name</label>
          <input
            id="displayName"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="nickname"
            disabled={!supportsPasskeys || isRegistering || isLoggingIn}
          />
          <button
            type="submit"
            className="btn btnPrimary"
            disabled={!supportsPasskeys || isRegistering || isLoggingIn}
          >
            {isRegistering ? "Creating passkey..." : "Register + Create Passkey"}
          </button>
        </form>

        <button
          type="button"
          className="btn"
          onClick={handleLogin}
          disabled={!supportsPasskeys || isLoggingIn || isRegistering}
        >
          {isLoggingIn ? "Waiting for passkey..." : "Login with Passkey"}
        </button>

        {!supportsPasskeys && (
          <p className="authError">This browser does not support passkeys.</p>
        )}
        {message && <p className="authError">{message}</p>}
      </section>
    </main>
  );
}
