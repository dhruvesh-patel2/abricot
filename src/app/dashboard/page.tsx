"use client";

import { useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import DashboardTabs, {
  type DashboardView,
} from "@/components/dashboard/DashboardTabs";
import KanbanView from "@/components/dashboard/KanbanView";
import ListView from "@/components/dashboard/ListView";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const {
    assignedTasks,
    deferredSearchQuery,
    error,
    handleTaskStatusChange,
    isLoading,
    profile,
    projects,
    setProjects,
  } = useDashboardData(searchQuery);

  return (
    <main className="flex min-h-screen flex-col bg-[#fafafa] text-[#222222]">
      <Header user={profile} activePage="dashboard" />

      <div className="mx-auto w-full max-w-[1440px] px-6 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-20">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[34px] font-medium tracking-[-0.02em] text-[#222222]">
              Tableau de bord
            </h1>
            <p className="mt-4 text-[19px] text-[#222222]">
              Bonjour {profile?.name ?? "utilisateur"}, voici un aperçu de vos
              projets et taches
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

        <DashboardTabs view={view} onChange={setView} />

        {error && (
          <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {view === "list" ? (
          <ListView
            tasks={assignedTasks}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            deferredSearchQuery={deferredSearchQuery}
          />
        ) : (
          <KanbanView
            projects={projects}
            isLoading={isLoading}
            onTaskStatusChange={handleTaskStatusChange}
          />
        )}
      </div>

      {isCreateProjectModalOpen && (
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          currentUser={profile}
          onCreated={(project) =>
            setProjects((currentProjects) => [project, ...currentProjects])
          }
        />
      )}

      <DashboardFooter className="mt-auto" />
    </main>
  );
}
