import { apiRequest } from "@/services/api";
import { extractEntity } from "@/services/responseParsers";
import type {
  ApiResponse,
  AuthData,
  User,
} from "@/types/api";

// Donnees attendues pour la connexion.
export type LoginPayload = {
  email: string;
  password: string;
};

// Donnees attendues pour l'inscription.
export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export type UpdateProfilePayload = {
  name: string;
  email: string;
};

export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

// Authentifie un utilisateur et retourne son profil + token.
export function loginUser(
  payload: LoginPayload
): Promise<ApiResponse<AuthData>> {
  return apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

// Cree un nouveau compte utilisateur.
export function registerUser(
  payload: RegisterPayload
): Promise<ApiResponse<AuthData>> {
  return apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

function extractProfile(data: unknown): User {
  return extractEntity<User>(
    data,
    "user",
    "Le profil n'a pas pu etre lu depuis la reponse API."
  );
}

export async function getProfile(): Promise<ApiResponse<User>> {
  const response = await apiRequest<unknown>("/auth/profile", {
    method: "GET",
    requireAuth: true,
  });

  return {
    ...response,
    data: extractProfile(response.data),
  };
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ApiResponse<User>> {
  const response = await apiRequest<unknown>("/auth/profile", {
    method: "PUT",
    body: payload,
    requireAuth: true,
  });

  return {
    ...response,
    data: extractProfile(response.data),
  };
}

export function updatePassword(
  payload: UpdatePasswordPayload
): Promise<ApiResponse<null>> {
  return apiRequest<null>("/auth/password", {
    method: "PUT",
    body: payload,
    requireAuth: true,
  });
}
