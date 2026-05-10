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
};

function KanbanColumn({
  title,
  tasks,
  isLoading,
  statusLabel,
  statusClassName,
}: KanbanColumnProps) {
  return (
    <div className="rounded-[16px] border border-[#ffdede] bg-white px-4 py-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[17px] font-medium text-[#222222]">{title}</h2>
        <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-full bg-[#e9edf3] px-2.5 text-[13px] text-[#778196]">
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
          tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-[14px] border border-[#dde3ed] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <h3 className="text-[15px] font-semibold leading-5 text-[#222222]">
                    {task.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-[#778196]">
                    {task.description || "Aucune description disponible."}
                  </p>
                </div>

                <span
                  className={`inline-flex min-w-fit whitespace-nowrap items-center justify-center rounded-[10px] px-3 py-1 text-[11px] leading-none ${statusClassName}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[#8a94a6]">
                <span className="inline-flex items-center gap-1.5">
                  <TaskFolderIcon />
                  <span>Nom du projet</span>
                </span>
                <span className="text-[#c8ced8]">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <TaskCalendarIcon />
                  <span>9 mars</span>
                </span>
                <span className="text-[#c8ced8]">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <CommentBubbleIcon />
                  <span>{task.comments?.length ?? 2}</span>
                </span>
              </div>

              <button
                type="button"
                className="mt-4 inline-flex h-[40px] w-[92px] items-center justify-center rounded-[12px] bg-[#262323] text-[14px] text-white"
              >
                Voir
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

type KanbanViewProps = {
  projects: Project[];
  isLoading: boolean;
};

function normalizeStatus(status?: string) {
  return (status ?? "")
    .trim()
    .toLowerCase();
}

export default function KanbanView({
  projects,
  isLoading,
}: KanbanViewProps) {
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

  return (
    <section className="mt-8 grid gap-4 xl:grid-cols-3">
      <KanbanColumn
        title="À faire"
        tasks={todoTasks}
        isLoading={isLoading}
        statusLabel="À faire"
        statusClassName="bg-[#ffe1e1] text-[#ff5a5a]"
      />
      <KanbanColumn
        title="En cours"
        tasks={inProgressTasks}
        isLoading={isLoading}
        statusLabel="En cours"
        statusClassName="bg-[#fff1dd] text-[#f39c12]"
      />
      <KanbanColumn
        title="Terminées"
        tasks={doneTasks}
        isLoading={isLoading}
        statusLabel="Terminée"
        statusClassName="bg-[#e5fbef] text-[#2bb673]"
      />
    </section>
  );
}
