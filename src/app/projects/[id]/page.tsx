"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import TaskSearchBar from "@/components/dashboard/TaskSearchBar";
import { useProjectDetails } from "@/hooks/useProjectDetails";
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
} from "@/components/dashboard/icons";
import {
  canManageProject,
  canManageProjectTasks,
  formatStatus,
  getInitials,
  getMemberIdentity,
} from "@/app/projects/[id]/helpers";
import type { Task } from "@/types/api";
import { formatTaskDueDate } from "@/utils/dateUtils";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] =
    useState(false);
  const [isCreateTaskAiModalOpen, setIsCreateTaskAiModalOpen] =
    useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] =
    useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const deferredTaskSearchQuery = useDeferredValue(taskSearchQuery);
  const {
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
  } = useProjectDetails({
    projectId,
    statusFilter,
    taskSearchQuery: deferredTaskSearchQuery,
  });
  const contributorCount = members.length;
  const canEditProject = canManageProject(accessLevel);
  const canManageTasks = canManageProjectTasks(accessLevel);
  const currentUserRoleLabel =
    accessLevel === "admin" ? "Administrateur" : "Contributeur";

  function handleOpenEditProjectModal() {
    if (!canEditProject) {
      return;
    }

    setIsEditProjectModalOpen(true);
  }

  function handleOpenCreateTaskModal() {
    if (!canManageTasks) {
      return;
    }

    setIsCreateTaskModalOpen(true);
  }

  function handleOpenCreateTaskAiModal() {
    if (!canManageTasks) {
      return;
    }

    setIsCreateTaskAiModalOpen(true);
  }

  function handleSelectTask(task: Task) {
    if (!canManageTasks) {
      return;
    }

    setSelectedTask(task);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#222222]">
      <Header user={profile} activePage="projects" />

      <div className="mx-auto max-w-[1440px] px-8 pb-12 pt-12 lg:px-10 lg:pt-20">
        <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 lg:gap-5">
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="inline-flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#dde3ed] bg-white text-[#222222] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              aria-label="Retour aux projets"
            >
              <ArrowLeftIcon />
            </button>

            <div className="w-full max-w-[820px]">
              <div className="flex items-center gap-4">
                <h1 className="text-[32px] font-medium tracking-[-0.02em] text-[#222222] lg:text-[34px]">
                  {project?.name ?? "Projet"}
                </h1>
                {canEditProject && (
                  <button
                    type="button"
                    onClick={handleOpenEditProjectModal}
                    aria-label="Modifier le projet"
                    className="text-[16px] text-[#8a3b00] underline underline-offset-2"
                  >
                    Modifier
                  </button>
                )}
              </div>

              <p className="mt-3 text-[17px] leading-8 text-[#5f6b7a] lg:text-[19px]">
                {project?.description || "Aucune description disponible."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManageTasks && (
              <>
                <button
                  type="button"
                  onClick={handleOpenCreateTaskModal}
                  className="inline-flex h-[50px] items-center justify-center whitespace-nowrap rounded-xl bg-[#262323] px-7 text-[16px] text-white"
                >
                  Créer une tâche
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateTaskAiModal}
                  aria-label="Créer des tâches avec l'assistant IA"
                  className="inline-flex h-[50px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#b45309] px-7 text-[16px] font-medium text-white"
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
              <span className="text-[#5f6b7a]">{contributorCount} personnes</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {profile && (
                <>
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#fde8db] px-2 text-[12px] text-[#222222]">
                    {getInitials(profile.name)}
                  </span>
                  <span className="inline-flex rounded-full bg-[#fde8db] px-4 py-1.5 text-[14px] text-[#8a3b00]">
                    {currentUserRoleLabel}
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
                  <span className="text-[14px] text-[#5f6b7a]">
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
              <p className="mt-3 text-[16px] text-[#5f6b7a]">
                Par ordre de priorité
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex h-[45px] items-center gap-3 rounded-xl bg-[#fee8db] px-5 text-[15px] font-medium text-[#8a3b00]"
                  >
                    <ChecklistIcon />
                    <span>Liste</span>
                  </button>
                  <button
                    type="button"
                    className="flex h-[45px] items-center gap-3 rounded-xl bg-white px-5 text-[15px] font-medium text-[#8a3b00]"
                  >
                    <CalendarIcon />
                    <span>Calendrier</span>
                  </button>
                </div>

                <div className="relative flex h-[45px] w-full sm:w-[148px] items-center rounded-xl border border-[#d8deea] bg-white px-5 text-[#5f6b7a] focus-within:border-[#f0670f]">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filtrer les tâches par statut"
                    className="h-full w-full appearance-none bg-transparent pr-8 text-[15px] text-[#5f6b7a] outline-none"
                  >
                    <option value="all">Statut</option>
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="DONE">Terminée</option>
                  </select>
                  <span className="pointer-events-none absolute right-4">
                    <ChevronDownIcon />
                  </span>
                </div>

                <div className="h-[45px] w-full sm:w-[278px] [&_label]:h-[45px] [&_label]:max-w-none [&_label]:px-5">
                  <TaskSearchBar
                    value={taskSearchQuery}
                    onChange={setTaskSearchQuery}
                  />
                </div>
              </div>
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
            ) : filteredTasks.length === 0 ? (
              <article className="rounded-[16px] border border-dashed border-[#dde3ed] bg-[#fcfcfc] px-8 py-16 text-center text-[#778196]">
                Aucune tâche ne correspond à votre recherche.
              </article>
            ) : (
              filteredTasks.map((task) => {
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

                        <p className="mt-3 text-[16px] leading-8 text-[#5f6b7a]">
                          {task.description || "Aucune description disponible."}
                        </p>

                        <p className="mt-7 flex items-center gap-2 text-[15px] text-[#5f6b7a]">
                          <span>Échéance :</span>
                          <CalendarIcon />
                          <span>{formatTaskDueDate(task.dueDate)}</span>
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-2 text-[15px] text-[#5f6b7a]">
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
                        onClick={() => handleSelectTask(task)}
                        aria-label={`Ouvrir les actions pour la tâche ${task.title}`}
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
        canCreate={canManageTasks}
        onCreated={(task) =>
          setTasks((currentTasks) => [task, ...currentTasks])
        }
      />

      <CreateTaskAiModal
        isOpen={isCreateTaskAiModalOpen}
        onClose={() => setIsCreateTaskAiModalOpen(false)}
        projectId={projectId}
        canCreate={canManageTasks}
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
          canEdit={canManageTasks}
          canDelete={canManageTasks}
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
          currentUser={profile}
          projectToEdit={project}
          canEditProject={canEditProject}
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
