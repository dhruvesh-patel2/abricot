"use client";

import { useDeferredValue, useEffect, useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import DashboardTabs, {
  type DashboardView,
} from "@/components/dashboard/DashboardTabs";
import KanbanView from "@/components/dashboard/KanbanView";
import ListView from "@/components/dashboard/ListView";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { getProfile } from "@/services/authService";
import {
  getAssignedTasks,
  getProjectsWithTasks,
} from "@/services/dashboardService";
import { updateProjectTask } from "@/services/projectService";
import type {
  Project,
  Task,
  User,
} from "@/types/api";

function extractTasks(data: unknown): Task[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "tasks" in data &&
    Array.isArray(data.tasks)
  ) {
    return data.tasks as Task[];
  }

  return [];
}

function extractProjects(data: unknown): Project[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "projects" in data &&
    Array.isArray(data.projects)
  ) {
    return data.projects as Project[];
  }

  return [];
}

function attachProjectIdsToTasks(projects: Project[]): Project[] {
  return projects.map((project) => ({
    ...project,
    tasks: (project.tasks ?? []).map((task) => ({
      ...task,
      projectId: task.projectId ?? project.id,
    })),
  }));
}

function updateTaskInProjects(
  projects: Project[],
  taskId: string,
  updater: (task: Task) => Task
): Project[] {
  return projects.map((project) => ({
    ...project,
    tasks: (project.tasks ?? []).map((task) =>
      task.id === taskId ? updater(task) : task
    ),
  }));
}

function updateTaskInList(
  tasks: Task[],
  taskId: string,
  updater: (task: Task) => Task
): Task[] {
  return tasks.map((task) => (task.id === taskId ? updater(task) : task));
}

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("list");
  const [profile, setProfile] = useState<User | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    async function loadDashboardData() {
      setError("");
      setIsLoading(true);

      try {
        // On recupere les donnees utiles au dashboard en parallele.
        const [
          profileResponse,
          assignedTasksResponse,
          projectsResponse,
        ] = await Promise.all([
          getProfile(),
          getAssignedTasks(),
          getProjectsWithTasks(),
        ]);

        setProfile(profileResponse.data);
        setAssignedTasks(extractTasks(assignedTasksResponse.data));
        setProjects(
          attachProjectIdsToTasks(extractProjects(projectsResponse.data))
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement du dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboardData();
  }, []);

  async function handleTaskStatusChange(
    task: Task,
    nextStatus: string
  ) {
    if (!task.projectId || task.status === nextStatus) {
      return;
    }

    const previousProjects = projects;
    const previousAssignedTasks = assignedTasks;

    setError("");
    setProjects((currentProjects) =>
      updateTaskInProjects(currentProjects, task.id, (currentTask) => ({
        ...currentTask,
        status: nextStatus,
      }))
    );
    setAssignedTasks((currentTasks) =>
      updateTaskInList(currentTasks, task.id, (currentTask) => ({
        ...currentTask,
        status: nextStatus,
      }))
    );

    try {
      const response = await updateProjectTask(task.projectId, task.id, {
        status: nextStatus,
      });

      const updatedTask = {
        ...response.data,
        projectId: response.data.projectId ?? task.projectId,
      };

      setProjects((currentProjects) =>
        updateTaskInProjects(currentProjects, task.id, () => updatedTask)
      );
      setAssignedTasks((currentTasks) =>
        updateTaskInList(currentTasks, task.id, (currentTask) => ({
          ...currentTask,
          ...updatedTask,
        }))
      );
    } catch (error) {
      setProjects(previousProjects);
      setAssignedTasks(previousAssignedTasks);
      setError(
        error instanceof Error
          ? error.message
          : "La mise a jour du statut de la tache a echoue."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#222222]">
      <Header user={profile} activePage="dashboard" />

      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-20">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[34px] font-medium tracking-[-0.02em] text-[#222222]">
              Tableau de bord
            </h1>
            <p className="mt-4 text-[19px] text-[#222222]">
              Bonjour {profile?.name ?? "utilisateur"}, voici un aperçu de vos
              projets et taches
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="inline-flex h-[50px] w-full min-w-fit items-center justify-center whitespace-nowrap rounded-xl bg-[#262323] px-8 text-[18px] text-white sm:w-[182px]"
          >
            + Créer un projet
          </button>
        </section>

        <DashboardTabs view={view} onChange={setView} />

        {error && (
          <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {view === "list" ? (
          <ListView
            tasks={assignedTasks}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            deferredSearchQuery={deferredSearchQuery}
          />
        ) : (
          <KanbanView
            projects={projects}
            isLoading={isLoading}
            onTaskStatusChange={handleTaskStatusChange}
          />
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreated={(project) =>
          setProjects((currentProjects) => [project, ...currentProjects])
        }
      />

      <DashboardFooter />
    </main>
  );
}
