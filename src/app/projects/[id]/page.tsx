"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import CreateTaskAiModal from "@/components/modals/CreateTaskAiModal";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import EditTaskModal from "@/components/modals/EditTaskModal";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChecklistIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  SearchIcon,
} from "@/components/dashboard/icons";
import { getProfile } from "@/services/authService";
import {
  getProjectTasks,
  getProjects,
} from "@/services/projectService";
import {
  extractProjects,
  extractTasks,
  formatStatus,
  getInitials,
  getMemberIdentity,
  getProjectAccessLevel,
  getProjectMembers,
  isTaskAssignedToUser,
} from "@/app/projects/[id]/helpers";
import type {
  Project,
  Task,
  User,
} from "@/types/api";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [profile, setProfile] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] =
    useState(false);
  const [isCreateTaskAiModalOpen, setIsCreateTaskAiModalOpen] =
    useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] =
    useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    async function loadProjectDetails() {
      if (!projectId) {
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const [profileResponse, projectsResponse, tasksResponse] =
          await Promise.all([
            getProfile(),
            getProjects(),
            getProjectTasks(projectId),
          ]);

        const projects = extractProjects(projectsResponse.data);
        const currentProject =
          projects.find((item) => item.id === projectId) ?? null;

        if (!currentProject) {
          router.replace("/projects");
          return;
        }

        setProfile(profileResponse.data);
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

  const members = getProjectMembers(project);
  const contributorCount = members.length;
  const accessLevel = getProjectAccessLevel(project, profile);
  const canEditProject = accessLevel === "admin";
  const canCreateTask =
    accessLevel === "admin" || accessLevel === "contributor";

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#222222]">
      <Header user={profile} activePage="projects" />

      <div className="mx-auto max-w-[1440px] px-8 pb-12 pt-12 lg:px-10 lg:pt-20">
        <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 lg:gap-5">
            <Link
              href="/projects"
              className="inline-flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#dde3ed] bg-white text-[#222222] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              aria-label="Retour aux projets"
            >
              <ArrowLeftIcon />
            </Link>

            <div className="max-w-[820px]">
              <div className="flex items-center gap-4">
                <h1 className="text-[32px] font-medium tracking-[-0.02em] text-[#222222] lg:text-[34px]">
                  {project?.name ?? "Projet"}
                </h1>
                {canEditProject && (
                  <button
                    type="button"
                    onClick={() => setIsEditProjectModalOpen(true)}
                    className="text-[16px] text-[#f0670f] underline underline-offset-2"
                  >
                    Modifier
                  </button>
                )}
              </div>

              <p className="mt-3 text-[17px] leading-8 text-[#778196] lg:text-[19px]">
                {project?.description || "Aucune description disponible."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canCreateTask && (
              <>
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(true)}
                  className="inline-flex h-[50px] items-center justify-center whitespace-nowrap rounded-xl bg-[#262323] px-7 text-[16px] text-white"
                >
                  Créer une tâche
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateTaskAiModalOpen(true)}
                  className="inline-flex h-[50px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#e46c0a] px-7 text-[16px] text-white"
                >
                  ✦ <span>IA</span>
                </button>
              </>
            )}
          </div>
        </section>

        {error && (
          <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <section className="mt-10 rounded-[16px] bg-[#f2f5fa] px-6 py-5 lg:px-12 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[17px] text-[#222222] lg:text-[18px]">
              <span className="font-medium">Contributeurs</span>{" "}
              <span className="text-[#778196]">{contributorCount} personnes</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
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

              {members.map((member) => (
                <div
                  key={getMemberIdentity(member).id}
                  className="flex items-center gap-2 rounded-full bg-[#e9edf3] px-3 py-1.5"
                >
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/70 px-2 text-[11px] text-[#222222]">
                    {getInitials(
                      getMemberIdentity(member).name ||
                        getMemberIdentity(member).email
                    )}
                  </span>
                  <span className="text-[14px] text-[#778196]">
                    {getMemberIdentity(member).name ||
                      getMemberIdentity(member).email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[16px] border border-[#dde3ed] bg-white px-6 py-8 sm:px-8 lg:px-14 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-[22px] font-medium text-[#222222]">Tâches</h2>
              <p className="mt-3 text-[16px] text-[#778196]">
                Par ordre de priorité
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex h-[45px] items-center gap-3 rounded-xl bg-[#fee8db] px-5 text-[15px] text-[#f0670f]"
                  >
                    <ChecklistIcon />
                    <span>Liste</span>
                  </button>
                  <button
                    type="button"
                    className="flex h-[45px] items-center gap-3 rounded-xl bg-white px-5 text-[15px] text-[#f0670f]"
                  >
                    <CalendarIcon />
                    <span>Calendrier</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="flex h-[45px] w-[148px] items-center justify-between rounded-xl border border-[#d8deea] bg-white px-5 text-[#778196]"
                >
                  <span className="text-[15px]">Statut</span>
                  <ChevronDownIcon />
                </button>

                <label className="flex h-[45px] w-[278px] items-center justify-between rounded-xl border border-[#d8deea] bg-white px-5 text-[#778196]">
                  <span className="text-[15px]">Rechercher une tâche</span>
                  <SearchIcon />
                </label>
              </div>

              <label className="hidden h-[45px] w-[278px] items-center justify-between rounded-xl border border-[#d8deea] bg-white px-5 text-[#778196]">
                <span className="text-[15px]">Rechercher une tâche</span>
                <SearchIcon />
              </label>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {isLoading ? (
              <article className="rounded-[16px] border border-[#dde3ed] bg-white px-8 py-8">
                <div className="h-7 w-48 rounded bg-[#eef2f7]" />
                <div className="mt-3 h-5 w-96 rounded bg-[#f3f5f9]" />
              </article>
            ) : tasks.length === 0 ? (
              <article className="rounded-[16px] border border-dashed border-[#dde3ed] bg-[#fcfcfc] px-8 py-16 text-center text-[#778196]">
                Aucune tâche trouvée pour ce projet.
              </article>
            ) : (
              tasks.map((task) => {
                const status = formatStatus(task.status);
                const assignees = task.assignees ?? [];

                return (
                  <article
                    key={task.id}
                    className="rounded-[16px] border border-[#dde3ed] bg-white px-9 py-8"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-[18px] font-semibold text-[#222222]">
                            {task.title}
                          </h3>
                          <span
                            className={`inline-flex rounded-full px-4 py-1.5 text-[14px] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-3 text-[16px] leading-8 text-[#778196]">
                          {task.description || "Aucune description disponible."}
                        </p>

                        <p className="mt-7 flex items-center gap-2 text-[15px] text-[#778196]">
                          <span>Échéance :</span>
                          <CalendarIcon />
                          <span>9 mars</span>
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-2 text-[15px] text-[#778196]">
                          <span>Assigné à :</span>
                          {assignees.map((assignee) => (
                            <div
                              key={assignee.id}
                              className="flex items-center gap-2 rounded-full bg-[#e9edf3] px-3 py-1.5"
                            >
                              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/70 px-2 text-[11px] text-[#222222]">
                                {getInitials(assignee.name || assignee.email)}
                              </span>
                              <span>{assignee.name || assignee.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="inline-flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#dde3ed] text-[#778196] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                      >
                        <MoreHorizontalIcon />
                      </button>
                    </div>

                    <div className="mt-7 border-t border-[#eceff5] pt-6">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left text-[16px] text-[#222222]"
                      >
                        <span>Commentaires ({task.comments?.length ?? 0})</span>
                        <ChevronDownIcon />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={projectId}
        members={members}
        currentUser={profile}
        onCreated={(task) =>
          setTasks((currentTasks) => [task, ...currentTasks])
        }
      />

      <CreateTaskAiModal
        isOpen={isCreateTaskAiModalOpen}
        onClose={() => setIsCreateTaskAiModalOpen(false)}
        projectId={projectId}
        onCreated={(createdTasks) =>
          setTasks((currentTasks) => [...createdTasks, ...currentTasks])
        }
      />

      {selectedTask && (
        <EditTaskModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          projectId={projectId}
          task={selectedTask}
          members={members}
          canEdit={accessLevel === "admin"}
          canDelete={
            accessLevel === "admin" ||
            (accessLevel === "contributor" &&
              isTaskAssignedToUser(selectedTask, profile))
          }
          onUpdated={(updatedTask) => {
            setTasks((currentTasks) =>
              currentTasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              )
            );
            setSelectedTask(updatedTask);
          }}
          onDeleted={(taskId) => {
            setTasks((currentTasks) =>
              currentTasks.filter((task) => task.id !== taskId)
            );
            setSelectedTask(null);
          }}
        />
      )}

      {isEditProjectModalOpen && (
        <CreateProjectModal
          isOpen={isEditProjectModalOpen}
          onClose={() => setIsEditProjectModalOpen(false)}
          projectToEdit={project}
          onUpdated={(updatedProject) => {
            setProject(updatedProject);
          }}
          onDeleted={() => {
            router.push("/projects");
          }}
        />
      )}

      <DashboardFooter />
    </main>
  );
}
