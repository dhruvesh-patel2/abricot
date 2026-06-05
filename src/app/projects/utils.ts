import type {
  Project,
  ProjectMember,
  Task,
} from "@/types/api";

export function extractProjects(data: unknown): Project[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "projects" in data &&
    Array.isArray(data.projects)
  ) {
    return data.projects as Project[];
  }

  return [];
}

export function extractTasks(data: unknown): Task[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "tasks" in data &&
    Array.isArray(data.tasks)
  ) {
    return data.tasks as Task[];
  }

  return [];
}

export function getInitials(value?: string) {
  if (!value) {
    return "NA";
  }

  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getProjectMembers(
  project: Project | null | undefined
): ProjectMember[] {
  return project?.members ?? [];
}

export function getMemberIdentity(member: ProjectMember) {
  return {
    id:
      member.user?.id ?? member.id ?? member.email ?? member.name ?? "member",
    name: member.user?.name ?? member.name ?? "",
    email: member.user?.email ?? member.email ?? "",
  };
}

export function normalizeTaskStatus(status?: string) {
  return (status ?? "")
    .trim()
    .toLowerCase();
}

export function matchesTaskStatusFilter(status: string | undefined, filter: string) {
  const normalizedStatus = normalizeTaskStatus(status);

  if (filter === "all") {
    return true;
  }

  if (filter === "TODO") {
    return (
      normalizedStatus === "a faire" ||
      normalizedStatus === "a_faire" ||
      normalizedStatus === "todo"
    );
  }

  if (filter === "IN_PROGRESS") {
    return (
      normalizedStatus === "en cours" ||
      normalizedStatus === "en_cours" ||
      normalizedStatus === "in progress" ||
      normalizedStatus === "in_progress"
    );
  }

  return (
    normalizedStatus === "terminee" ||
    normalizedStatus === "termine" ||
    normalizedStatus === "done" ||
    normalizedStatus === "completed"
  );
}

export function isDoneTask(task: Task) {
  return matchesTaskStatusFilter(task.status, "DONE");
}
