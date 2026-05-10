import type { ApiResponse } from "@/types/api";

// URL de base de l'API backend, centralisee pour tous les services.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RequestConfig = Omit<RequestInit, "body" | "headers"> & {
  body?: BodyInit | Record<string, unknown> | null;
  headers?: HeadersInit;
  requireAuth?: boolean;
};

// Recupere le token JWT stocke dans le navigateur.
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

// Construit les headers communs et ajoute automatiquement le token si besoin.
export function authHeaders(
  headers: HeadersInit = {},
  requireAuth = true
): Headers {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = getToken();

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  } else if (requireAuth) {
    throw new Error("Vous devez etre connecte pour effectuer cette action.");
  }

  return requestHeaders;
}

// Uniformise la lecture des reponses JSON et texte du backend.
async function parseResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as ApiResponse<T>;
  }

  const text = await response.text();

  return {
    success: response.ok,
    message: text || "Reponse inattendue du serveur.",
    data: null as T,
  };
}

// Fonction generique reutilisable par tous les services metier.
export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    body,
    headers,
    requireAuth = false,
    ...requestInit
  } = config;

  const requestHeaders = authHeaders(headers, requireAuth);
  const requestBody =
    body && body instanceof FormData
      ? body
      : body && typeof body === "object"
        ? JSON.stringify(body)
        : body;

  if (body instanceof FormData) {
    requestHeaders.delete("Content-Type");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestInit,
    headers: requestHeaders,
    body: requestBody,
  });

  const payload = await parseResponse<T>(response);

  if (!response.ok) {
    throw new Error(
      payload.message || "Une erreur est survenue lors de la requete API."
    );
  }

  return payload;
}
