import EmptyStateCard from "@/components/dashboard/EmptyStateCard";

type KanbanColumnProps = {
  title: string;
  description: string;
};

function KanbanColumn({ title, description }: KanbanColumnProps) {
  return (
    <div className="rounded-[16px] border border-[#ffdede] bg-white px-6 py-8">
      <div className="flex items-center gap-3">
        <h2 className="text-[22px] font-medium text-[#222222]">{title}</h2>
        <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-full bg-[#e9edf3] px-3 text-[18px] text-[#778196]">
          0
        </span>
      </div>

      <div className="mt-10 space-y-5">
        <EmptyStateCard
          title="Colonne prête pour l'API"
          description={description}
        />
      </div>
    </div>
  );
}

export default function KanbanView() {
  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-3">
      {/* Chaque colonne garde le rendu actuel, sans données mockées. */}
      <KanbanColumn
        title="À faire"
        description="Les tâches à faire seront affichées ici après récupération des données backend."
      />
      <KanbanColumn
        title="En cours"
        description="Les tâches en cours apparaîtront ici quand les données backend seront disponibles."
      />
      <KanbanColumn
        title="Terminées"
        description="Les tâches terminées seront affichées ici une fois récupérées depuis l'API."
      />
    </section>
  );
}
