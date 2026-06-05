import { apiRequest } from "@/services/api";
import { extractEntity } from "@/services/responseParsers";
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

// Donnees necessaires pour creer une tache dans un projet.
export type CreateTaskPayload = {
  title: string;
  description: string;
  dueDate: string;
  assigneeIds: string[];
  status?: string;
  priority?: string;
};

// Donnees modifiables sur une tache existante.
export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: string;
  priority?: string;
  assigneeIds?: string[];
};

// Liste tous les projets accessibles a l'utilisateur connecte.
export function getProjects(): Promise<ApiResponse<Project[]>> {
  return apiRequest<Project[]>("/projects", {
    method: "GET",
    requireAuth: true,
  });
}

function extractProject(data: unknown): Project {
  return extractEntity<Project>(
    data,
    "project",
    "Le projet n'a pas pu etre lu depuis la reponse API."
  );
}

// Cree un nouveau projet avec ses contributeurs.
export async function createProject(
  payload: CreateProjectPayload
): Promise<ApiResponse<Project>> {
  const response = await apiRequest<unknown>("/projects", {
    method: "POST",
    body: payload,
    requireAuth: true,
  });

  return {
    ...response,
    data: extractProject(response.data),
  };
}

// Met a jour un projet existant.
export async function updateProject(
  projectId: string,
  payload: CreateProjectPayload
): Promise<ApiResponse<Project>> {
  const response = await apiRequest<unknown>(`/projects/${projectId}`, {
    method: "PUT",
    body: payload,
    requireAuth: true,
  });

  return {
    ...response,
    data: extractProject(response.data),
  };
}

// Supprime un projet existant.
export function deleteProject(
  projectId: string
): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/projects/${projectId}`, {
    method: "DELETE",
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

function extractTask(data: unknown): Task {
  return extractEntity<Task>(
    data,
    "task",
    "La tache creee n'a pas pu etre lue depuis la reponse API."
  );
}

export async function updateProjectTask(
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload
): Promise<ApiResponse<Task>> {
  const response = await apiRequest<unknown>(
    `/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PUT",
      body: payload,
      requireAuth: true,
    }
  );

  return {
    ...response,
    data: extractTask(response.data),
  };
}

export function deleteProjectTask(
  projectId: string,
  taskId: string
): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

export async function createProjectTask(
  projectId: string,
  payload: CreateTaskPayload
): Promise<ApiResponse<Task>> {
  const { status = "TODO", ...createPayload } = payload;

  const createResponse = await apiRequest<unknown>(
    `/projects/${projectId}/tasks`,
    {
      method: "POST",
      body: {
        ...createPayload,
        status: "TODO",
      },
      requireAuth: true,
    }
  );

  const createdTask = extractTask(createResponse.data);

  if (status !== "TODO") {
    return updateProjectTask(projectId, createdTask.id, {
      status,
    });
  }

  return {
    ...createResponse,
    data: createdTask,
  };
}
