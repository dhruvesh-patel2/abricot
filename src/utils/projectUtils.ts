import type {
  Project,
  ProjectMember,
  ProjectUserReference,
  Task,
} from "@/types/api";

function normalizeValue(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function toProjectMember(value: string | ProjectMember): ProjectMember {
  if (typeof value === "string") {
    return {
      email: value,
      name: value,
    };
  }

  return value;
}

function getUserReferenceIdentity(
  value?: ProjectUserReference | string | null
) {
  if (!value) {
    return {
      id: "",
      email: "",
      name: "",
    };
  }

  if (typeof value === "string") {
    return {
      id: value,
      email: value.includes("@") ? value : "",
      name: value,
    };
  }

  return {
    id: value.id ?? value.email ?? value.name ?? "",
    email: value.email ?? "",
    name: value.name ?? "",
  };
}

function getOwnerMember(project: Project): ProjectMember | null {
  const ownerReference =
    project.owner ?? project.createdBy ?? null;
  const ownerIdentity = getUserReferenceIdentity(ownerReference);
  const ownerId =
    ownerIdentity.id || project.ownerId || project.createdById;
  const ownerEmail =
    ownerIdentity.email || project.ownerEmail || project.createdByEmail;
  const ownerName = ownerIdentity.name;

  if (!ownerId && !ownerEmail) {
    return null;
  }

  return {
    id: ownerId,
    userId: ownerId,
    email: ownerEmail,
    userEmail: ownerEmail,
    name: ownerName || ownerEmail || ownerId || "Administrateur",
    role: "admin",
  };
}

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
  if (!project) {
    return [];
  }

  const members = (project.members ?? []).map(toProjectMember);
  const contributors = (project.contributors ?? []).map(toProjectMember);
  const ownerMember = getOwnerMember(project);
  const combinedMembers = ownerMember
    ? [ownerMember, ...members, ...contributors]
    : [...members, ...contributors];

  return combinedMembers.filter((member, index, currentMembers) => {
    const identity = getMemberIdentity(member);

    return currentMembers.findIndex((currentMember) => {
      const currentIdentity = getMemberIdentity(currentMember);

      return (
        normalizeValue(currentIdentity.id) === normalizeValue(identity.id) ||
        (identity.email &&
          normalizeValue(currentIdentity.email) === normalizeValue(identity.email))
      );
    }) === index;
  });
}

export function getMemberIdentity(member: ProjectMember) {
  return {
    id:
      member.user?.id ??
      member.userId ??
      member.id ??
      member.user?.email ??
      member.userEmail ??
      member.email ??
      member.name ??
      "member",
    name: member.user?.name ?? member.name ?? "",
    email:
      member.user?.email ?? member.userEmail ?? member.email ?? "",
  };
}

export function normalizeTaskStatus(status?: string) {
  return (status ?? "")
    .trim()
    .toLowerCase();
}

export function matchesTaskStatusFilter(
  status: string | undefined,
  filter: string
) {
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

export function getTaskSearchContent(task: Task) {
  return [task.title, task.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
