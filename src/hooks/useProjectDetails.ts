"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getProfile } from "@/services/authService";
import {
  getProjectTasks,
  getProjects,
} from "@/services/projectService";
import {
  extractProjects,
  extractTasks,
  getTaskSearchContent,
  matchesTaskStatusFilter,
} from "@/utils/projectUtils";
import {
  canManageProjectTasks,
  getProjectAccessLevel,
  getProjectMembers,
} from "@/app/projects/[id]/helpers";
import type {
  Project,
  Task,
  User,
} from "@/types/api";

type UseProjectDetailsArgs = {
  projectId: string;
  statusFilter: string;
  taskSearchQuery: string;
};

export function useProjectDetails({
  projectId,
  statusFilter,
  taskSearchQuery,
}: UseProjectDetailsArgs) {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const normalizedTaskSearchQuery = taskSearchQuery.trim().toLowerCase();

  useEffect(() => {
    async function loadProjectDetails() {
      if (!projectId) {
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const [profileResponse, projectsResponse] =
          await Promise.all([
            getProfile(),
            getProjects(),
          ]);

        const currentProject =
          extractProjects(projectsResponse.data).find(
            (item) => item.id === projectId
          ) ?? null;

        if (!currentProject) {
          router.replace("/projects");
          return;
        }

        const currentProfile = profileResponse.data;
        const currentAccessLevel = getProjectAccessLevel(
          currentProject,
          currentProfile
        );
        const projectMembers = getProjectMembers(currentProject);

        if (process.env.NODE_ENV !== "production") {
          console.info("[project-access]", {
            profile: currentProfile,
            project: currentProject,
            members: projectMembers,
            contributors: currentProject.contributors ?? [],
            accessLevel: currentAccessLevel,
          });
        }

        if (!canManageProjectTasks(currentAccessLevel)) {
          router.replace("/projects");
          return;
        }

        const tasksResponse = await getProjectTasks(projectId);

        setProfile(currentProfile);
        setProject(currentProject);
        setTasks(extractTasks(tasksResponse.data));
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement du projet."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjectDetails();
  }, [projectId, router]);

  const members = useMemo(() => getProjectMembers(project), [project]);
  const accessLevel = useMemo(
    () => getProjectAccessLevel(project, profile),
    [profile, project]
  );
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = !normalizedTaskSearchQuery
        ? true
        : getTaskSearchContent(task).includes(normalizedTaskSearchQuery);

      return matchesSearch && matchesTaskStatusFilter(task.status, statusFilter);
    });
  }, [normalizedTaskSearchQuery, statusFilter, tasks]);

  return {
    accessLevel,
    error,
    filteredTasks,
    isLoading,
    members,
    profile,
    project,
    setProject,
    setTasks,
    tasks,
  };
}
