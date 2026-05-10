"use client";

import { useState } from "react";

import DashboardFooter from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import DashboardTabs, {
  type DashboardView,
} from "@/components/dashboard/DashboardTabs";
import KanbanView from "@/components/dashboard/KanbanView";
import ListView from "@/components/dashboard/ListView";

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>("list");

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#222222]">
      <Header />

      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-20">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[34px] font-medium tracking-[-0.02em] text-[#222222]">
              Tableau de bord
            </h1>
            <p className="mt-4 text-[19px] text-[#222222]">
              Bonjour Alice Dupont, voici un aperçu de vos projets et tâches
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-[50px] w-full items-center justify-center rounded-xl bg-[#262323] px-8 text-[18px] text-white sm:w-[182px]"
          >
            + Créer un projet
          </button>
        </section>

        <DashboardTabs view={view} onChange={setView} />

        {view === "list" ? <ListView /> : <KanbanView />}
      </div>

      <DashboardFooter />
    </main>
  );
}
