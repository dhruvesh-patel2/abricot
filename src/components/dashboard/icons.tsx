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
