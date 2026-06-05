import type {
  ProjectMember,
  TaskAssignee,
} from "@/types/api";
import {
  getMemberIdentity,
  normalizeTaskStatus as normalizeSharedTaskStatus,
} from "@/utils/projectUtils";

// Statuts supportes par les modales de taches.
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export { getMemberIdentity } from "@/utils/projectUtils";

export function normalizeTaskStatus(status?: string): TaskStatus {
  const value = normalizeSharedTaskStatus(status);

  if (value === "en cours" || value === "en_cours" || value === "in progress" || value === "in_progress") {
    return "IN_PROGRESS";
  }

  if (value === "terminee" || value === "termine" || value === "done" || value === "completed") {
    return "DONE";
  }

  return "TODO";
}

export const taskStatusOptions: Array<{
  value: TaskStatus;
  label: string;
  className: string;
}> = [
  {
    value: "TODO",
    label: "À faire",
    className: "bg-[#ffe1e1] text-[#ff5a5a]",
  },
  {
    value: "IN_PROGRESS",
    label: "En cours",
    className: "bg-[#fff1dd] text-[#f39c12]",
  },
  {
    value: "DONE",
    label: "Terminée",
    className: "bg-[#e5fbef] text-[#2bb673]",
  },
];

export function buildSelectedAssignees(
  members: ProjectMember[],
  selectedMemberIds: string[]
): TaskAssignee[] {
  return members
    .map(getMemberIdentity)
    .filter((member) => selectedMemberIds.includes(member.id))
    .map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
    }));
}
