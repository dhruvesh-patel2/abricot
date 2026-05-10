"use client";

import { useEffect, useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import { getProfile } from "@/services/authService";
import {
  getProjectTasks,
  getProjects,
} from "@/services/projectService";
import type {
  Project,
  Task,
  User,
} from "@/types/api";

type ProjectWithTasks = Project & {
  tasks: Task[];
};

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

function isDoneTask(task: Task) {
  const status = (task.status ?? "").trim().toLowerCase();

  return (
    status === "done" ||
    status === "completed" ||
    status === "termine" ||
    status === "terminee"
  );
}

function getInitials(value?: string) {
  if (!value) {
    return "NA";
  }

  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProjectsPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjectsPage() {
      setError("");
      setIsLoading(true);

      try {
        // On charge le profil et la liste des projets.
        const [profileResponse, projectsResponse] = await Promise.all([
          getProfile(),
          getProjects(),
        ]);

        const baseProjects = extractProjects(projectsResponse.data);

        // On recupere les taches de chaque projet pour afficher la progression.
        const projectsWithTasks = await Promise.all(
          baseProjects.map(async (project) => {
            try {
              const tasksResponse = await getProjectTasks(project.id);

              return {
                ...project,
                tasks: extractTasks(tasksResponse.data),
              };
            } catch {
              return {
                ...project,
                tasks: [],
              };
            }
          })
        );

        setProfile(profileResponse.data);
        setProjects(projectsWithTasks);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement des projets."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjectsPage();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#222222]">
      <Header user={profile} activePage="projects" />

      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-20">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[34px] font-medium tracking-[-0.02em] text-[#222222]">
              Mes projets
            </h1>
            <p className="mt-4 text-[19px] text-[#222222]">
              Gerez vos projets
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-[50px] w-full min-w-fit items-center justify-center whitespace-nowrap rounded-xl bg-[#262323] px-8 text-[18px] text-white sm:w-[182px]"
          >
            + Créer un projet
          </button>
        </section>

        {error && (
          <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {isLoading ? (
          <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={index}
                className="min-h-[350px] rounded-[16px] border border-[#dde3ed] bg-white p-8"
              >
                <div className="h-7 w-40 rounded bg-[#eef2f7]" />
                <div className="mt-4 h-5 w-full rounded bg-[#f3f5f9]" />
                <div className="mt-2 h-5 w-4/5 rounded bg-[#f3f5f9]" />
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const totalTasks = project.tasks.length;
              const completedTasks = project.tasks.filter(isDoneTask).length;
              const progress =
                totalTasks === 0
                  ? 0
                  : Math.round((completedTasks / totalTasks) * 100);
              const members = project.members ?? [];

              return (
                <article
                  key={project.id}
                  className="min-h-[350px] rounded-[16px] border border-[#dde3ed] bg-white p-8"
                >
                  <h2 className="text-[20px] font-medium text-[#222222]">
                    {project.name}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-[16px] leading-8 text-[#778196]">
                    {project.description || "Aucune description disponible."}
                  </p>

                  <div className="mt-14">
                    <div className="flex items-center justify-between text-[16px] text-[#778196]">
                      <span>Progression</span>
                      <span className="text-[#222222]">{progress}%</span>
                    </div>

                    <div className="mt-4 h-[7px] overflow-hidden rounded-full bg-[#eceff5]">
                      <div
                        className="h-full rounded-full bg-[#d85d0a]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="mt-3 text-[13px] text-[#8b93a4]">
                      {completedTasks}/{totalTasks} tâches terminées
                    </p>
                  </div>

                  <div className="mt-14">
                    <p className="text-[14px] text-[#8b93a4]">
                      Équipe ({members.length})
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {profile && (
                        <>
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#fde8db] px-2 text-[12px] text-[#222222]">
                            {getInitials(profile.name)}
                          </span>
                          <span className="inline-flex rounded-full bg-[#fde8db] px-4 py-1.5 text-[14px] text-[#f0670f]">
                            Propriétaire
                          </span>
                        </>
                      )}

                      {members.slice(0, 2).map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#e9edf3] px-2 text-[12px] text-[#222222]"
                        >
                          {getInitials(member.name || member.email)}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      <DashboardFooter />
    </main>
  );
}
