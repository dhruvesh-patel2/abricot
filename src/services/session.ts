export const AUTH_COOKIE_NAME = "abricot_session";
const AUTH_COOKIE_DURATION = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof window !== "undefined";
}

function buildCookieAttributes(maxAge: number) {
  const secureAttribute =
    isBrowser() && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secureAttribute}`;
}

export function persistSessionToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem("token", token);
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${buildCookieAttributes(AUTH_COOKIE_DURATION)}`;
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem("token");
  document.cookie = `${AUTH_COOKIE_NAME}=; ${buildCookieAttributes(0)}`;
}

export function redirectToLogin() {
  if (!isBrowser()) {
    return;
  }

  window.location.replace("/login");
}
