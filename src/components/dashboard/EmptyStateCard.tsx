import { FolderIcon } from "@/components/dashboard/icons";

type EmptyStateCardProps = {
  title: string;
  description: string;
};

export default function EmptyStateCard({
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <article className="rounded-[14px] border border-dashed border-[#d8deea] bg-[#fcfcfc] px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <FolderIcon className="mx-auto h-10 w-10 text-[#d85d0a]" />
        <h3 className="mt-4 text-[20px] font-semibold text-[#111111]">
          {title}
        </h3>
        <p className="mt-3 text-[16px] leading-7 text-[#778196]">
          {description}
        </p>
      </div>
    </article>
  );
}
