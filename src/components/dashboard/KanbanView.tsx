import Link from "next/link";
import { useState } from "react";

import EmptyStateCard from "@/components/dashboard/EmptyStateCard";
import {
  CommentBubbleIcon,
  TaskCalendarIcon,
  TaskFolderIcon,
} from "@/components/dashboard/icons";
import type {
  Project,
  Task,
} from "@/types/api";

type KanbanColumnProps = {
  title: string;
  tasks: Task[];
  isLoading: boolean;
  statusLabel: string;
  statusClassName: string;
  dropValue: string;
  draggedTaskId: string | null;
  activeDropValue: string | null;
  onDropTask: (status: string) => void;
  onDragOverColumn: (status: string) => void;
  onDragLeaveColumn: (status: string) => void;
  onDragStartTask: (task: Task) => void;
  onDragEndTask: () => void;
};

function KanbanColumn({
  title,
  tasks,
  isLoading,
  statusLabel,
  statusClassName,
  dropValue,
  draggedTaskId,
  activeDropValue,
  onDropTask,
  onDragOverColumn,
  onDragLeaveColumn,
  onDragStartTask,
  onDragEndTask,
}: KanbanColumnProps) {
  const isActiveDropZone = activeDropValue === dropValue;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverColumn(dropValue);
      }}
      onDragLeave={() => onDragLeaveColumn(dropValue)}
      onDrop={(event) => {
        event.preventDefault();
        onDropTask(dropValue);
      }}
      className={`rounded-[16px] border bg-white px-4 py-5 transition ${
        isActiveDropZone
          ? "border-[#f0670f] bg-[#fff7f1]"
          : "border-[#ffdede]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <h2 className="text-[17px] font-medium text-[#222222]">{title}</h2>
        <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-full bg-[#e9edf3] px-2.5 text-[13px] text-[#4d5768]">
          {tasks.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <EmptyStateCard
            title="Chargement des taches"
            description="Les taches du kanban sont en cours de recuperation."
            compact
          />
        ) : tasks.length === 0 ? (
          <EmptyStateCard
            title="Aucune tache dans cette colonne"
            description="Le backend n'a retourne aucune tache pour cet etat."
            compact
          />
        ) : (
          tasks.map((task) => {
            const projectHref = task.projectId
              ? `/projects/${task.projectId}`
              : null;

            return (
              <article
                key={task.id}
                draggable={Boolean(task.projectId)}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", task.id);
                  onDragStartTask(task);
                }}
                onDragEnd={onDragEndTask}
                className={`rounded-[14px] border border-[#dde3ed] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition ${
                  draggedTaskId === task.id
                    ? "opacity-60"
                    : "opacity-100"
                } ${task.projectId ? "cursor-grab active:cursor-grabbing" : ""}`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <h3 className="text-[15px] font-semibold leading-5 text-[#222222]">
                      {task.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-[#5f6b7a]">
                      {task.description || "Aucune description disponible."}
                    </p>
                  </div>

                  <span
                    className={`inline-flex min-w-fit whitespace-nowrap items-center justify-center rounded-[10px] px-3 py-1 text-[11px] leading-none ${statusClassName}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[#5f6b7a]">
                  <span className="inline-flex items-center gap-1.5">
                    <TaskFolderIcon />
                    <span>Nom du projet</span>
                  </span>
                  <span className="text-[#5f6b7a]">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <TaskCalendarIcon />
                    <span>9 mars</span>
                  </span>
                  <span className="text-[#5f6b7a]">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CommentBubbleIcon />
                    <span>{task.comments?.length ?? 2}</span>
                  </span>
                </div>

                {projectHref ? (
                  <Link
                    href={projectHref}
                    className="mt-4 inline-flex h-[40px] w-[92px] items-center justify-center rounded-[12px] bg-[#262323] text-[14px] text-white"
                  >
                    Voir
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-4 inline-flex h-[40px] w-[92px] items-center justify-center rounded-[12px] bg-[#262323] text-[14px] text-white opacity-50"
                  >
                    Voir
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

type KanbanViewProps = {
  projects: Project[];
  isLoading: boolean;
  onTaskStatusChange: (task: Task, nextStatus: string) => Promise<void>;
};

function normalizeStatus(status?: string) {
  return (status ?? "")
    .trim()
    .toLowerCase();
}

function getColumnStatusValue(status?: string) {
  const value = normalizeStatus(status);

  if (
    value === "en cours" ||
    value === "en_cours" ||
    value === "in progress" ||
    value === "in_progress"
  ) {
    return "IN_PROGRESS";
  }

  if (
    value === "terminee" ||
    value === "termine" ||
    value === "done" ||
    value === "completed"
  ) {
    return "DONE";
  }

  return "TODO";
}

export default function KanbanView({
  projects,
  isLoading,
  onTaskStatusChange,
}: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [activeDropValue, setActiveDropValue] = useState<string | null>(null);

  // On rassemble d'abord toutes les taches des projets.
  const allTasks = projects.flatMap((project) => project.tasks ?? []);

  // On filtre ensuite les taches par statut pour remplir les colonnes.
  const todoTasks = allTasks.filter((task) => {
    const status = normalizeStatus(task.status);

    return status === "a faire" || status === "a_faire" || status === "todo";
  });

  const inProgressTasks = allTasks.filter((task) => {
    const status = normalizeStatus(task.status);

    return (
      status === "en cours" ||
      status === "en_cours" ||
      status === "in progress" ||
      status === "in_progress"
    );
  });

  const doneTasks = allTasks.filter((task) => {
    const status = normalizeStatus(task.status);

    return (
      status === "terminee" ||
      status === "termine" ||
      status === "done" ||
      status === "completed"
    );
  });

  async function handleDropTask(nextStatus: string) {
    if (!draggedTask) {
      return;
    }

    setActiveDropValue(null);

    if (getColumnStatusValue(draggedTask.status) === nextStatus) {
      setDraggedTask(null);
      return;
    }

    const taskToMove = draggedTask;
    setDraggedTask(null);
    await onTaskStatusChange(taskToMove, nextStatus);
  }

  return (
    <section className="mt-8 grid gap-4 xl:grid-cols-3">
      <KanbanColumn
        title="À faire"
        tasks={todoTasks}
        isLoading={isLoading}
        statusLabel="À faire"
        statusClassName="bg-[#ffe1e1] text-[#b42318]"
        dropValue="TODO"
        draggedTaskId={draggedTask?.id ?? null}
        activeDropValue={activeDropValue}
        onDropTask={handleDropTask}
        onDragOverColumn={setActiveDropValue}
        onDragLeaveColumn={(status) => {
          if (activeDropValue === status) {
            setActiveDropValue(null);
          }
        }}
        onDragStartTask={setDraggedTask}
        onDragEndTask={() => {
          setDraggedTask(null);
          setActiveDropValue(null);
        }}
      />
      <KanbanColumn
        title="En cours"
        tasks={inProgressTasks}
        isLoading={isLoading}
        statusLabel="En cours"
        statusClassName="bg-[#fff1dd] text-[#9a5a00]"
        dropValue="IN_PROGRESS"
        draggedTaskId={draggedTask?.id ?? null}
        activeDropValue={activeDropValue}
        onDropTask={handleDropTask}
        onDragOverColumn={setActiveDropValue}
        onDragLeaveColumn={(status) => {
          if (activeDropValue === status) {
            setActiveDropValue(null);
          }
        }}
        onDragStartTask={setDraggedTask}
        onDragEndTask={() => {
          setDraggedTask(null);
          setActiveDropValue(null);
        }}
      />
      <KanbanColumn
        title="Terminées"
        tasks={doneTasks}
        isLoading={isLoading}
        statusLabel="Terminée"
        statusClassName="bg-[#e5fbef] text-[#166534]"
        dropValue="DONE"
        draggedTaskId={draggedTask?.id ?? null}
        activeDropValue={activeDropValue}
        onDropTask={handleDropTask}
        onDragOverColumn={setActiveDropValue}
        onDragLeaveColumn={(status) => {
          if (activeDropValue === status) {
            setActiveDropValue(null);
          }
        }}
        onDragStartTask={setDraggedTask}
        onDragEndTask={() => {
          setDraggedTask(null);
          setActiveDropValue(null);
        }}
      />
    </section>
  );
}
