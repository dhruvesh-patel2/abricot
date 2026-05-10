import EmptyStateCard from "@/components/dashboard/EmptyStateCard";
import {
  CommentBubbleIcon,
  SearchIcon,
  TaskCalendarIcon,
  TaskFolderIcon,
} from "@/components/dashboard/icons";
import type { Task } from "@/types/api";

type ListViewProps = {
  tasks: Task[];
  isLoading: boolean;
};

function formatStatus(status?: string) {
  const value = (status ?? "").trim().toLowerCase();

  if (
    value === "in_progress" ||
    value === "in progress" ||
    value === "en cours"
  ) {
    return {
      label: "En cours",
      className: "bg-[#fff1dd] text-[#f39c12]",
    };
  }

  return {
    label: "À faire",
    className: "bg-[#ffe1e1] text-[#ff5a5a]",
  };
}

export default function ListView({
  tasks,
  isLoading,
}: ListViewProps) {
  return (
    <section className="mt-8 rounded-[16px] border border-[#dde3ed] bg-white px-4 py-6 sm:px-8 sm:py-10 lg:px-[58px] lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[22px] font-medium text-[#222222]">
            Mes tâches assignées
          </h2>
          <p className="mt-3 text-[16px] text-[#778196]">
            Par ordre de priorité
          </p>
        </div>

        <label className="flex h-[62px] w-full max-w-[356px] items-center justify-between rounded-xl border border-[#d8deea] bg-white px-8 text-[#778196]">
          <span className="text-[15px]">Rechercher une tâche</span>
          <SearchIcon />
        </label>
      </div>

      <div className="mt-10 space-y-5">
        {isLoading ? (
          <EmptyStateCard
            title="Chargement des taches"
            description="Les taches assignees sont en cours de recuperation depuis l'API."
          />
        ) : tasks.length === 0 ? (
          <EmptyStateCard
            title="Aucune tache assignee"
            description="Aucune tache n'a ete retournee par le backend pour le moment."
          />
        ) : (
          tasks.map((task) => {
            const status = formatStatus(task.status);

            return (
            <article
              key={task.id}
              className="rounded-[14px] border border-[#dde3ed] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.02)]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#222222]">
                    {task.title}
                  </h3>
                  <p className="mt-2 text-[15px] text-[#778196]">
                    {task.description || "Aucune description disponible."}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3 text-[15px] text-[#8a94a6]">
                    <span className="inline-flex items-center gap-2">
                      <TaskFolderIcon />
                      <span>Nom du projet</span>
                    </span>
                    <span className="text-[#c8ced8]">|</span>
                    <span className="inline-flex items-center gap-2">
                      <TaskCalendarIcon />
                      <span>9 mars</span>
                    </span>
                    <span className="text-[#c8ced8]">|</span>
                    <span className="inline-flex items-center gap-2">
                      <CommentBubbleIcon />
                      <span>{task.comments?.length ?? 2}</span>
                    </span>
                  </div>
                </div>

                <div className="flex min-w-[120px] flex-col items-start gap-9 lg:items-end">
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <button
                    type="button"
                    className="inline-flex h-[48px] w-[122px] items-center justify-center rounded-[12px] bg-[#262323] text-[18px] text-white"
                  >
                    Voir
                  </button>
                </div>
              </div>
            </article>
            );
          })
        )}
      </div>
    </section>
  );
}
