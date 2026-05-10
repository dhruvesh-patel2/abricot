import EmptyStateCard from "@/components/dashboard/EmptyStateCard";
import { SearchIcon } from "@/components/dashboard/icons";

export default function ListView() {
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
        <EmptyStateCard
          title="Aucune donnée affichée pour le moment"
          description="La vue liste est prête à recevoir les tâches récupérées depuis l'API."
        />
      </div>
    </section>
  );
}
