import { apiRequest } from "@/services/api";
import type {
  ApiResponse,
  Project,
  Task,
} from "@/types/api";

// Donnees necessaires pour creer un projet.
export type CreateProjectPayload = {
  name: string;
  description: string;
  contributors: string[];
};

// Liste tous les projets accessibles a l'utilisateur connecte.
export function getProjects(): Promise<ApiResponse<Project[]>> {
  return apiRequest<Project[]>("/projects", {
    method: "GET",
    requireAuth: true,
  });
}

// Cree un nouveau projet avec ses contributeurs.
export function createProject(
  payload: CreateProjectPayload
): Promise<ApiResponse<Project>> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: payload,
    requireAuth: true,
  });
}

// Retourne les taches d'un projet a partir de son identifiant.
export function getProjectTasks(
  projectId: string
): Promise<ApiResponse<Task[]>> {
  return apiRequest<Task[]>(`/projects/${projectId}/tasks`, {
    method: "GET",
    requireAuth: true,
  });
}
