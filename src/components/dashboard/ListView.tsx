import Link from "next/link";

import EmptyStateCard from "@/components/dashboard/EmptyStateCard";
import TaskSearchBar from "@/components/dashboard/TaskSearchBar";
import {
  CommentBubbleIcon,
  TaskCalendarIcon,
  TaskFolderIcon,
} from "@/components/dashboard/icons";
import type { Task } from "@/types/api";

type ListViewProps = {
  tasks: Task[];
  isLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  deferredSearchQuery: string;
};

// Traduit le statut brut du backend en badge lisible dans la vue liste.
function formatStatus(status?: string) {
  const value = (status ?? "").trim().toLowerCase();

  if (
    value === "in_progress" ||
    value === "in progress" ||
    value === "en cours"
  ) {
    return {
      label: "En cours",
      className: "bg-[#fff1dd] text-[#9a5a00]",
    };
  }

  return {
    label: "À faire",
    className: "bg-[#ffe1e1] text-[#b42318]",
  };
}

// Vue liste du dashboard personnel.
export default function ListView({
  tasks,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  deferredSearchQuery,
}: ListViewProps) {
  const normalizedSearchQuery = deferredSearchQuery
    .trim()
    .toLowerCase();

  // La recherche se fait sur le titre et la description.
  const filteredTasks = tasks.filter((task) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    const searchableContent = [
      task.title,
      task.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableContent.includes(normalizedSearchQuery);
  });

  return (
    <section className="mt-8 rounded-[16px] border border-[#dde3ed] bg-white px-4 py-6 sm:px-8 sm:py-10 lg:px-[58px] lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[22px] font-medium text-[#222222]">
            Mes tâches assignées
          </h2>
          <p className="mt-3 text-[16px] text-[#5f6b7a]">
            Par ordre de priorité
          </p>
        </div>

        <TaskSearchBar
          value={searchQuery}
          onChange={onSearchQueryChange}
        />
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
        ) : filteredTasks.length === 0 ? (
          <EmptyStateCard
            title="Aucun resultat"
            description="Aucune tache ne correspond a votre recherche."
          />
        ) : (
          filteredTasks.map((task) => {
            const status = formatStatus(task.status);
            const projectHref = task.projectId
              ? `/projects/${task.projectId}`
              : null;

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
                    <p className="mt-2 text-[15px] text-[#5f6b7a]">
                      {task.description || "Aucune description disponible."}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3 text-[15px] text-[#5f6b7a]">
                      <span className="inline-flex items-center gap-2">
                        <TaskFolderIcon />
                        <span>Nom du projet</span>
                      </span>
                      <span className="text-[#5f6b7a]">|</span>
                      <span className="inline-flex items-center gap-2">
                        <TaskCalendarIcon />
                        <span>9 mars</span>
                      </span>
                      <span className="text-[#5f6b7a]">|</span>
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

                    {projectHref ? (
                      <Link
                        href={projectHref}
                        className="inline-flex h-[48px] w-[122px] items-center justify-center rounded-[12px] bg-[#262323] text-[18px] text-white"
                      >
                        Voir
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-[48px] w-[122px] items-center justify-center rounded-[12px] bg-[#262323] text-[18px] text-white opacity-50"
                      >
                        Voir
                      </button>
                    )}
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
