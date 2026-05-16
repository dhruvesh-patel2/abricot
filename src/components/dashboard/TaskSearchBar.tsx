import { SearchIcon } from "@/components/dashboard/icons";

type TaskSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function TaskSearchBar({
  value,
  onChange,
  placeholder = "Rechercher une tâche",
}: TaskSearchBarProps) {
  return (
    <div className="flex h-[62px] w-full max-w-[356px] items-center justify-between gap-3 rounded-xl border border-[#d8deea] bg-white px-6 text-[#778196] focus-within:border-[#d85d0a] focus-within:ring-2 focus-within:ring-[#d85d0a]/15">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#778196]"
      />
      <SearchIcon />
    </div>
  );
}
