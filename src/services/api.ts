import type { ApiResponse } from "@/types/api";
import {
  clearSession,
  redirectToLogin,
} from "@/services/session";

function getApiUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL doit etre configure en production."
    );
  }

  return "http://localhost:8000";
}

export const API_URL = getApiUrl();

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

type ParsedResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function parseResponse<T>(
  response: Response
): Promise<ParsedResponse<T>> {
  if (response.status === 204) {
    return {
      success: true,
      message: "Action effectuée avec succès.",
    };
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as ApiResponse<T>;
  }

  const text = await response.text();

  return {
    success: response.ok,
    message: text || "Reponse inattendue du serveur.",
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

  if (response.status === 401) {
    clearSession();

    if (typeof window !== "undefined") {
      redirectToLogin();
    }
  }

  if (!response.ok) {
    throw new Error(
      payload.message || "Une erreur est survenue lors de la requete API."
    );
  }

  if (response.status === 204) {
    return {
      ...(payload as ApiResponse<T>),
      data: null as T,
    };
  }

  if (payload.data === undefined) {
    throw new Error("La reponse de l'API ne contient pas de donnees exploitables.");
  }

  return payload as ApiResponse<T>;
}
