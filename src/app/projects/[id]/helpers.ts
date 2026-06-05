import type {
  Project,
  Task,
  User,
} from "@/types/api";

export {
  extractProjects,
  extractTasks,
  getInitials,
  getMemberIdentity,
  getProjectMembers,
  normalizeTaskStatus,
} from "@/app/projects/utils";

import {
  getMemberIdentity,
  normalizeTaskStatus,
} from "@/app/projects/utils";

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
