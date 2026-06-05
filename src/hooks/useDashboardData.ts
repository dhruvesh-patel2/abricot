"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { getProfile } from "@/services/authService";
import {
  getAssignedTasks,
  getProjectsWithTasks,
} from "@/services/dashboardService";
import { updateProjectTask } from "@/services/projectService";
import {
  extractProjects,
  extractTasks,
} from "@/utils/projectUtils";
import type {
  Project,
  Task,
  User,
} from "@/types/api";

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

export function useDashboardData(searchQuery: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    async function loadDashboardData() {
      setError("");
      setIsLoading(true);

      try {
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

  async function handleTaskStatusChange(task: Task, nextStatus: string) {
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

  return {
    assignedTasks,
    deferredSearchQuery,
    error,
    handleTaskStatusChange,
    isLoading,
    profile,
    projects,
    setProjects,
  };
}
