"use client";

import type { FormEvent } from "react";
import { useId, useState } from "react";

import {
  CalendarIcon,
  ChevronDownIcon,
} from "@/components/dashboard/icons";
import BaseModal from "@/components/modals/BaseModal";
import {
  buildSelectedAssignees,
  getMemberIdentity,
  normalizeTaskStatus,
  taskStatusOptions,
  type TaskStatus,
} from "@/components/modals/taskModalUtils";
import {
  deleteProjectTask,
  updateProjectTask,
} from "@/services/projectService";
import type {
  ProjectMember,
  Task,
} from "@/types/api";

type EditTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  task: Task;
  members: ProjectMember[];
  canEdit?: boolean;
  canDelete?: boolean;
  onUpdated?: (task: Task) => void;
  onDeleted?: (taskId: string) => void;
};

// Modale simple pour modifier ou supprimer une tache existante.
export default function EditTaskModal({
  isOpen,
  onClose,
  projectId,
  task,
  members,
  canEdit = true,
  canDelete = false,
  onUpdated,
  onDeleted,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title ?? "");
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? String(task.dueDate).slice(0, 10) : ""
  );
  const [status, setStatus] = useState<TaskStatus>(
    normalizeTaskStatus(task.status)
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    task.assignees?.map((assignee) => assignee.id) ?? []
  );
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const assigneeListId = useId();
  const statusGroupId = useId();
  const validMemberIds = members
    .map(getMemberIdentity)
    .map((member) => member.id);
  const filteredSelectedMemberIds = selectedMemberIds.filter((memberId) =>
    validMemberIds.includes(memberId)
  );

  const selectedMembers = members
    .map(getMemberIdentity)
    .filter((member) => filteredSelectedMemberIds.includes(member.id));

  function handleToggleMember(memberId: string) {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId]
    );
  }

  // On n'envoie que les assignees encore valides dans les membres du projet.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      setError(
        "Seuls les contributeurs de ce projet peuvent modifier cette tâche."
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await updateProjectTask(projectId, task.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        status,
        assigneeIds: filteredSelectedMemberIds,
      });

      const selectedAssignees = buildSelectedAssignees(
        members,
        filteredSelectedMemberIds
      );

      onUpdated?.({
        ...response.data,
        assignees: response.data.assignees?.length
          ? response.data.assignees
          : selectedAssignees,
      });
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la modification de la tâche."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) {
      setError(
        "Seuls les contributeurs de ce projet peuvent supprimer cette tâche."
      );
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      await deleteProjectTask(projectId, task.id);
      onDeleted?.(task.id);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression de la tâche."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Modifier">
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Titre</label>
          <input
            value={title}
            disabled={!canEdit}
            onChange={(event) => setTitle(event.target.value)}
            className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Description</label>
          <textarea
            value={description}
            disabled={!canEdit}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-[6px] border border-[#d8deea] px-4 py-3 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Échéance</label>
          <label className="flex h-[52px] items-center justify-between rounded-[6px] border border-[#d8deea] px-4 text-[#778196]">
            <input
              type="date"
              value={dueDate}
              disabled={!canEdit}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full bg-transparent text-[15px] text-[#222222] outline-none disabled:text-[#778196]"
            />
            <CalendarIcon />
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Assigné à :</label>
          <button
            type="button"
            disabled={!canEdit}
            onClick={() =>
              setIsAssigneePickerOpen((currentValue) => !currentValue)
            }
            aria-expanded={isAssigneePickerOpen}
            aria-controls={assigneeListId}
            className="flex h-[52px] w-full items-center justify-between rounded-[6px] border border-[#d8deea] px-4 text-left text-[15px] text-[#778196] disabled:bg-[#f8fafc]"
          >
            <span>
              {selectedMembers.length > 0
                ? `${selectedMembers.length} collaborateur(s)`
                : "Choisir un ou plusieurs collaborateurs"}
            </span>
            <ChevronDownIcon />
          </button>

          {isAssigneePickerOpen && canEdit && (
            <div
              id={assigneeListId}
              className="rounded-[10px] border border-[#d8deea] bg-white p-3"
            >
              <div className="space-y-2">
                {members.map((member) => {
                  const identity = getMemberIdentity(member);

                  return (
                    <label
                      key={identity.id}
                      className="flex cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2 transition hover:bg-[#f5f7fb]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(identity.id)}
                        onChange={() => handleToggleMember(identity.id)}
                        className="h-4 w-4 rounded border-[#cbd5e1]"
                      />
                      <div>
                        <p className="text-[14px] text-[#222222]">
                          {identity.name || identity.email}
                        </p>
                        {identity.email && (
                          <p className="text-[13px] text-[#778196]">
                            {identity.email}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-[16px] text-[#222222]">Statut :</label>
          <div
            role="radiogroup"
            aria-labelledby={statusGroupId}
            className="flex flex-wrap gap-3"
          >
            <span id={statusGroupId} className="sr-only">
              Statut
            </span>
            {taskStatusOptions.map((statusOption) => (
              <button
                key={statusOption.value}
                type="button"
                disabled={!canEdit}
                role="radio"
                aria-checked={status === statusOption.value}
                onClick={() => setStatus(statusOption.value)}
                className={`inline-flex rounded-full px-4 py-1.5 text-[14px] transition ${
                  status === statusOption.value
                    ? statusOption.className
                    : "bg-[#eef2f7] text-[#778196]"
                } disabled:opacity-70`}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>

        {!canEdit && (
          <p className="rounded-[8px] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#778196]">
            Seuls les contributeurs de ce projet peuvent modifier cette tâche.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {canEdit && (
            <button
              type="submit"
              disabled={!title.trim() || !description.trim() || !dueDate || isLoading}
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#dfe4ed] px-8 text-[16px] text-[#8b93a4] disabled:cursor-not-allowed enabled:bg-[#262323] enabled:text-white"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#f3c7c7] px-6 text-[16px] text-[#b42318] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          )}
        </div>
      </form>
    </BaseModal>
  );
}
