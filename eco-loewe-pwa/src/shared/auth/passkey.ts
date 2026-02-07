import type {
  PublicKeyCredentialCreationOptionsDTO,
  PublicKeyCredentialRequestOptionsDTO,
  WebAuthnAuthenticationCredentialDTO,
  WebAuthnRegistrationCredentialDTO,
} from "../api/types";

function base64UrlToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) {
    bytes[i] = raw.charCodeAt(i);
  }
  return buffer;
}

function arrayBufferToBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function ensureWebAuthnSupport() {
  if (typeof window === "undefined" || typeof PublicKeyCredential === "undefined") {
    throw new Error("Passkeys are not supported in this browser.");
  }
}

function toCreationOptions(
  dto: PublicKeyCredentialCreationOptionsDTO,
): PublicKeyCredentialCreationOptions {
  return {
    challenge: base64UrlToArrayBuffer(dto.challenge),
    rp: dto.rp,
    user: {
      id: base64UrlToArrayBuffer(dto.user.id),
      name: dto.user.name,
      displayName: dto.user.displayName,
    },
    pubKeyCredParams: dto.pubKeyCredParams,
    timeout: dto.timeout,
    attestation: dto.attestation,
    authenticatorSelection: dto.authenticatorSelection,
    excludeCredentials: dto.excludeCredentials?.map((entry) => ({
      type: entry.type,
      id: base64UrlToArrayBuffer(entry.id),
      transports: entry.transports as AuthenticatorTransport[] | undefined,
    })),
  };
}

function toRequestOptions(
  dto: PublicKeyCredentialRequestOptionsDTO,
): PublicKeyCredentialRequestOptions {
  return {
    challenge: base64UrlToArrayBuffer(dto.challenge),
    rpId: dto.rpId,
    timeout: dto.timeout,
    userVerification: dto.userVerification,
    allowCredentials: dto.allowCredentials?.map((entry) => ({
      type: entry.type,
      id: base64UrlToArrayBuffer(entry.id),
      transports: entry.transports as AuthenticatorTransport[] | undefined,
    })),
  };
}

export async function createPasskey(
  options: PublicKeyCredentialCreationOptionsDTO,
): Promise<WebAuthnRegistrationCredentialDTO> {
  ensureWebAuthnSupport();

  const created = await navigator.credentials.create({
    publicKey: toCreationOptions(options),
  });
  if (!(created instanceof PublicKeyCredential)) {
    throw new Error("Passkey registration failed.");
  }

  const response = created.response as AuthenticatorAttestationResponse;
  const authenticatorData = response.getAuthenticatorData?.();
  const publicKey = response.getPublicKey?.();
  if (!authenticatorData || !publicKey) {
    throw new Error("Browser does not expose passkey attestation details.");
  }

  const userHandle = (response as { userHandle?: ArrayBuffer | null }).userHandle;

  return {
    id: created.id,
    rawId: arrayBufferToBase64Url(created.rawId),
    type: "public-key",
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      attestationObject: arrayBufferToBase64Url(response.attestationObject),
      authenticatorData: arrayBufferToBase64Url(authenticatorData),
      publicKey: arrayBufferToBase64Url(publicKey),
      publicKeyAlgorithm: response.getPublicKeyAlgorithm(),
      transports: response.getTransports?.(),
      userHandle: userHandle ? arrayBufferToBase64Url(userHandle) : undefined,
    },
  };
}

export async function getPasskeyAssertion(
  options: PublicKeyCredentialRequestOptionsDTO,
): Promise<WebAuthnAuthenticationCredentialDTO> {
  ensureWebAuthnSupport();

  const assertion = await navigator.credentials.get({
    publicKey: toRequestOptions(options),
  });
  if (!(assertion instanceof PublicKeyCredential)) {
    throw new Error("Passkey login failed.");
  }

  const response = assertion.response as AuthenticatorAssertionResponse;
  return {
    id: assertion.id,
    rawId: arrayBufferToBase64Url(assertion.rawId),
    type: "public-key",
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      signature: arrayBufferToBase64Url(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : undefined,
    },
  };
}
