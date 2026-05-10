import { apiRequest } from "@/services/api";
import type {
  ApiResponse,
  SearchUsersData,
} from "@/types/api";

// Recherche des utilisateurs par texte pour l'ajout de collaborateurs.
export function searchUsers(
  query: string
): Promise<ApiResponse<SearchUsersData>> {
  const searchParams = new URLSearchParams({
    query,
  });

  return apiRequest<SearchUsersData>(
    `/users/search?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}
