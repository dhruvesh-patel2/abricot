"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { getProjectAccessLevel } from "@/app/projects/[id]/helpers";
import {
  extractProjects,
  extractTasks,
  getInitials,
  getMemberIdentity,
  getProjectMembers,
  isDoneTask,
} from "@/app/projects/utils";
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

// Page liste des projets avec progression et membres visibles.
export default function ProjectsPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

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
            onClick={() => setIsCreateProjectModalOpen(true)}
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
              const members = getProjectMembers(project);
              const projectAccessLevel = getProjectAccessLevel(project, profile);
              const currentUserRoleLabel =
                projectAccessLevel === "admin"
                  ? "Administrateur"
                  : projectAccessLevel === "contributor"
                    ? "Contributeur"
                    : null;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block min-h-[350px] rounded-[16px] border border-[#dde3ed] bg-white p-8 transition hover:border-[#d8cfc6]"
                >
                  <h2 className="text-[20px] font-medium text-[#222222]">
                    {project.name}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-[16px] leading-8 text-[#5f6b7a]">
                    {project.description || "Aucune description disponible."}
                  </p>

                  <div className="mt-14">
                    <div className="flex items-center justify-between text-[16px] text-[#5f6b7a]">
                      <span>Progression</span>
                      <span className="text-[#222222]">{progress}%</span>
                    </div>

                    <div className="mt-4 h-[7px] overflow-hidden rounded-full bg-[#eceff5]">
                      <div
                        role="progressbar"
                        aria-label={`Progression du projet ${project.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                        className="h-full rounded-full bg-[#d85d0a]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="mt-3 text-[13px] text-[#5f6b7a]">
                      {completedTasks}/{totalTasks} tâches terminées
                    </p>
                  </div>

                  <div className="mt-14">
                    <p className="text-[14px] text-[#5f6b7a]">
                      Équipe ({members.length})
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {profile && currentUserRoleLabel && (
                        <Fragment key={`profile-${project.id}`}>
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#fde8db] px-2 text-[12px] text-[#222222]">
                            {getInitials(profile.name)}
                          </span>
                          <span className="inline-flex rounded-full bg-[#fde8db] px-4 py-1.5 text-[14px] text-[#8a3b00]">
                            {currentUserRoleLabel}
                          </span>
                        </Fragment>
                      )}

                      {members.slice(0, 2).map((member) => (
                        <span
                          key={getMemberIdentity(member).id}
                          className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#e9edf3] px-2 text-[12px] text-[#222222]"
                        >
                          {getInitials(getMemberIdentity(member).name || getMemberIdentity(member).email)}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>

      {isCreateProjectModalOpen && (
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          currentUser={profile}
          onCreated={(project) =>
            setProjects((currentProjects) => [
              {
                ...project,
                tasks: [],
              },
              ...currentProjects,
            ])
          }
        />
      )}

      <DashboardFooter />
    </main>
  );
}
