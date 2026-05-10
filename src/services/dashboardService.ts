import { apiRequest } from "@/services/api";
import type {
  ApiResponse,
  Project,
  Task,
} from "@/types/api";

// Retourne les taches assignees a l'utilisateur connecte.
export function getAssignedTasks(): Promise<ApiResponse<Task[]>> {
  return apiRequest<Task[]>("/dashboard/assigned-tasks", {
    method: "GET",
    requireAuth: true,
  });
}

// Retourne les projets du dashboard avec leurs taches.
export function getProjectsWithTasks(): Promise<ApiResponse<Project[]>> {
  return apiRequest<Project[]>("/dashboard/projects-with-tasks", {
    method: "GET",
    requireAuth: true,
  });
}
