import {
  CalendarIcon,
  ChecklistIcon,
} from "@/components/dashboard/icons";

export type DashboardView = "list" | "kanban";

type DashboardTabsProps = {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
};

export default function DashboardTabs({
  view,
  onChange,
}: DashboardTabsProps) {
  const baseClass =
    "flex h-[45px] items-center gap-3 rounded-xl px-5 text-[15px]";

  return (
    <section className="mt-14 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={view === "list"}
        className={`${baseClass} ${
          view === "list"
            ? "bg-[#fee8db] text-[#f0670f]"
            : "bg-white text-[#f0670f]"
        }`}
      >
        <ChecklistIcon />
        <span>Liste</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("kanban")}
        aria-pressed={view === "kanban"}
        className={`${baseClass} ${
          view === "kanban"
            ? "bg-[#fee8db] text-[#f0670f]"
            : "bg-white text-[#f0670f]"
        }`}
      >
        <CalendarIcon />
        <span>Kanban</span>
      </button>
    </section>
  );
}
