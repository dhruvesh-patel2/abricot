import { apiRequest } from "@/services/api";
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

// Recupere le profil de l'utilisateur connecte.
export function getProfile(): Promise<ApiResponse<User>> {
  return apiRequest<User>("/auth/profile", {
    method: "GET",
    requireAuth: true,
  });
}
