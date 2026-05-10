import { apiRequest } from "@/services/api";
import type {
  ApiResponse,
  User,
} from "@/types/api";

// Recherche des utilisateurs par texte pour l'ajout de collaborateurs.
export function searchUsers(
  query: string
): Promise<ApiResponse<User[]>> {
  const searchParams = new URLSearchParams({
    query,
  });

  return apiRequest<User[]>(
    `/users/search?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}
