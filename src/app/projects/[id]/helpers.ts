import type {
  Project,
  ProjectMember,
  Task,
  User,
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

export function getProjectMembers(project: Project | null): ProjectMember[] {
  return project?.members ?? [];
}

export function getMemberIdentity(member: ProjectMember) {
  return {
    id: member.user?.id ?? member.id ?? member.email ?? member.name ?? "member",
    name: member.user?.name ?? member.name ?? "",
    email: member.user?.email ?? member.email ?? "",
  };
}

function normalizeRole(role?: string) {
  return (role ?? "")
    .trim()
    .toLowerCase();
}

export function getProjectAccessLevel(
  project: Project | null,
  profile: User | null
): "admin" | "contributor" | "none" {
  if (!project || !profile) {
    return "none";
  }

  const matchingMember = (project.members ?? []).find((member) => {
    const identity = getMemberIdentity(member);

    return identity.id === profile.id || identity.email === profile.email;
  });

  if (!matchingMember) {
    return "admin";
  }

  const role = normalizeRole(matchingMember.role);

  if (
    role === "admin" ||
    role === "administrateur" ||
    role === "owner" ||
    role === "proprietaire" ||
    role === "propriétaire"
  ) {
    return "admin";
  }

  return "contributor";
}

export function isTaskAssignedToUser(task: Task, profile: User | null) {
  if (!profile) {
    return false;
  }

  const profileId = (profile.id ?? "").trim().toLowerCase();
  const profileEmail = (profile.email ?? "").trim().toLowerCase();
  const profileName = (profile.name ?? "").trim().toLowerCase();

  return (task.assignees ?? []).some((assignee) => {
    const assigneeId = assignee.id?.trim().toLowerCase();
    const assigneeEmail = assignee.email?.trim().toLowerCase();
    const assigneeName = assignee.name?.trim().toLowerCase();

    return (
      assigneeId === profileId ||
      assigneeEmail === profileEmail ||
      (!assigneeId && !assigneeEmail && assigneeName === profileName)
    );
  });
}

export function formatStatus(status?: string) {
  const value = normalizeTaskStatus(status);

  if (
    value === "en cours" ||
    value === "en_cours" ||
    value === "in progress" ||
    value === "in_progress"
  ) {
    return {
      label: "En cours",
      className: "bg-[#fff1dd] text-[#9a5a00]",
    };
  }

  if (
    value === "terminee" ||
    value === "termine" ||
    value === "done" ||
    value === "completed"
  ) {
    return {
      label: "Terminée",
      className: "bg-[#e5fbef] text-[#166534]",
    };
  }

  return {
    label: "À faire",
    className: "bg-[#ffe1e1] text-[#b42318]",
  };
}

export function normalizeTaskStatus(status?: string) {
  return (status ?? "")
    .trim()
    .toLowerCase();
}
