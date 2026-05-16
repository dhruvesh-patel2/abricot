import { FolderIcon } from "@/components/dashboard/icons";

type EmptyStateCardProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export default function EmptyStateCard({
  title,
  description,
  compact = false,
}: EmptyStateCardProps) {
  return (
    <article
      className={`rounded-[14px] border border-dashed border-[#d8deea] bg-[#fcfcfc] ${
        compact ? "px-5 py-10" : "px-6 py-16"
      }`}
    >
      <div className="mx-auto max-w-md text-center">
        <FolderIcon
          className={`mx-auto text-[#d85d0a] ${
            compact ? "h-8 w-8" : "h-10 w-10"
          }`}
        />
        <h3
          className={`font-semibold text-[#111111] ${
            compact ? "mt-3 text-[18px]" : "mt-4 text-[20px]"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-[#5f6b7a] ${
            compact ? "mt-2 text-[14px] leading-6" : "mt-3 text-[16px] leading-7"
          }`}
        >
          {description}
        </p>
      </div>
    </article>
  );
}
