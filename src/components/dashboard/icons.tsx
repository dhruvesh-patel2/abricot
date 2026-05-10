type IconProps = {
  className?: string;
};

export function DashboardIcon() {
  return (
    <span
      aria-hidden="true"
      className="grid h-6 w-6 grid-cols-2 gap-1 rounded-sm"
    >
      <span className="rounded-[2px] bg-white" />
      <span className="rounded-[2px] bg-white" />
      <span className="rounded-[2px] bg-white" />
      <span className="rounded-[2px] bg-white" />
    </span>
  );
}

export function FolderIcon({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-6 w-6 fill-current ${className}`}
    >
      <path d="M10 4.5a2 2 0 0 1 1.4.58l1.18 1.17c.19.19.44.3.7.3H18A2.5 2.5 0 0 1 20.5 9v7A2.5 2.5 0 0 1 18 18.5H6A2.5 2.5 0 0 1 3.5 16V7A2.5 2.5 0 0 1 6 4.5h4Z" />
    </svg>
  );
}

export function ChecklistIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 7h9" />
      <path d="M9 12h9" />
      <path d="M9 17h9" />
      <path d="m4 7 1.5 1.5L7.5 6" />
      <path d="m4 12 1.5 1.5L7.5 11" />
      <path d="m4 17 1.5 1.5L7.5 16" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M7 3.5v4" />
      <path d="M17 3.5v4" />
      <path d="M3.5 9.5h17" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function TaskFolderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M9 4.5a2 2 0 0 1 1.4.58l1.18 1.17c.19.19.44.3.7.3H18A2.5 2.5 0 0 1 20.5 9v7A2.5 2.5 0 0 1 18 18.5H6A2.5 2.5 0 0 1 3.5 16V7A2.5 2.5 0 0 1 6 4.5h3Z" />
    </svg>
  );
}

export function TaskCalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M7 3.5v4" />
      <path d="M17 3.5v4" />
      <path d="M3.5 9.5h17" />
    </svg>
  );
}

export function CommentBubbleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M6 5.5A2.5 2.5 0 0 0 3.5 8v7A2.5 2.5 0 0 0 6 17.5h1.9c.2 0 .39.08.53.22l1.95 1.95a.75.75 0 0 0 1.28-.53V18.3c0-.44.36-.8.8-.8H18A2.5 2.5 0 0 0 20.5 15V8A2.5 2.5 0 0 0 18 5.5H6Zm2.5 4a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 8.5 9.5Zm0 3.5a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 8.5 13Z" />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MoreHorizontalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-current"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function SparklesIcon({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 fill-current ${className}`}
    >
      <path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z" />
      <path d="m19 14 .9 2.6L22.5 18l-2.6.9L19 21.5l-.9-2.6-2.6-.9 2.6-.9L19 14Z" />
      <path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M9 3.5h6l.5 2H20v2H4v-2h4.5l.5-2Zm-1 6h2v8H8v-8Zm6 0h2v8h-2v-8ZM6 7.5h12V18A2.5 2.5 0 0 1 15.5 20.5h-7A2.5 2.5 0 0 1 6 18V7.5Z" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="m16.86 3.49 3.65 3.65a1.2 1.2 0 0 1 0 1.7l-9.9 9.9-4.64.99.99-4.64 9.9-9.9a1.2 1.2 0 0 1 1.7 0ZM6.94 14.95l2.11 2.11" />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M4 11.5 19.8 4a.7.7 0 0 1 .96.83l-2.88 12.1a.7.7 0 0 1-1.1.4l-4.2-3.05-2.9 2.9a.7.7 0 0 1-1.2-.5v-3.42L4.23 12.6A.7.7 0 0 1 4 11.5Z" />
    </svg>
  );
}
