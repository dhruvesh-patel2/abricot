"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import {
  CalendarIcon,
  ChevronDownIcon,
} from "@/components/dashboard/icons";
import BaseModal from "@/components/modals/BaseModal";
import {
  buildSelectedAssignees,
  getMemberIdentity,
  taskStatusOptions,
  type TaskStatus,
} from "@/components/modals/taskModalUtils";
import { createProjectTask } from "@/services/projectService";
import type {
  ProjectMember,
  Task,
  User,
} from "@/types/api";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  currentUser?: User | null;
  onCreated?: (task: Task) => void;
};

type FormState = {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
};

// Modale de creation de tache.
export default function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  members,
  currentUser,
  onCreated,
}: CreateTaskModalProps) {
  const [formState, setFormState] = useState<FormState>({
    title: "",
    description: "",
    dueDate: "",
    status: "TODO",
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function resetModalState() {
    setFormState({
      title: "",
      description: "",
      dueDate: "",
      status: "TODO",
    });
    setSelectedMemberIds([]);
    setIsAssigneePickerOpen(false);
    setError("");
  }

  function handleClose() {
    resetModalState();
    onClose();
  }

  function handleToggleMember(memberId: string) {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId]
    );
  }

  // Si aucun assigne n'est choisi, on essaye d'assigner automatiquement
  // l'utilisateur courant pour eviter de creer une tache "vide".
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const fallbackAssigneeIds =
        selectedMemberIds.length > 0
          ? selectedMemberIds
          : members
              .map(getMemberIdentity)
              .filter(
                (member) =>
                  member.id === currentUser?.id ||
                  member.email === currentUser?.email
              )
              .map((member) => member.id);

      const response = await createProjectTask(projectId, {
        title: formState.title.trim(),
        description: formState.description.trim(),
        dueDate: formState.dueDate,
        assigneeIds: fallbackAssigneeIds,
        status: formState.status,
      });

      const selectedAssignees = buildSelectedAssignees(
        members,
        fallbackAssigneeIds
      );

      onCreated?.({
        ...response.data,
        assignees: response.data.assignees?.length
          ? response.data.assignees
          : selectedAssignees,
      });

      handleClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la creation de la tache."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isSubmitDisabled =
    !formState.title.trim() ||
    !formState.description.trim() ||
    !formState.dueDate ||
    isLoading;

  const selectedMembers = members
    .map(getMemberIdentity)
    .filter((member) => selectedMemberIds.includes(member.id));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer une tâche"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Titre*</label>
          <input
            value={formState.title}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                title: event.target.value,
              }))
            }
            className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">
            Description*
          </label>
          <textarea
            value={formState.description}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                description: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-[6px] border border-[#d8deea] px-4 py-3 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Échéance*</label>
          <label className="flex h-[52px] items-center justify-between rounded-[6px] border border-[#d8deea] px-4 text-[#778196]">
            <input
              type="date"
              value={formState.dueDate}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  dueDate: event.target.value,
                }))
              }
              className="w-full bg-transparent text-[15px] text-[#222222] outline-none"
            />
            <CalendarIcon />
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#222222]">Assigné à :</label>

          <button
            type="button"
            onClick={() =>
              setIsAssigneePickerOpen((currentValue) => !currentValue)
            }
            className="flex h-[52px] w-full items-center justify-between rounded-[6px] border border-[#d8deea] px-4 text-left text-[15px] text-[#778196]"
          >
            <span>
              {selectedMembers.length > 0
                ? `${selectedMembers.length} collaborateur(s) sélectionné(s)`
                : "Choisir un ou plusieurs collaborateurs"}
            </span>
            <ChevronDownIcon />
          </button>

          {isAssigneePickerOpen && (
            <div className="rounded-[10px] border border-[#d8deea] bg-white p-3">
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
          <div className="flex flex-wrap gap-3">
            {taskStatusOptions.map((statusOption) => (
              <button
                key={statusOption.value}
                type="button"
                onClick={() =>
                  setFormState((currentState) => ({
                    ...currentState,
                    status: statusOption.value,
                  }))
                }
                className={`inline-flex rounded-full px-4 py-1.5 text-[14px] transition ${
                  formState.status === statusOption.value
                    ? statusOption.className
                    : "bg-[#eef2f7] text-[#778196]"
                }`}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#dfe4ed] px-8 text-[16px] text-[#8b93a4] disabled:cursor-not-allowed enabled:bg-[#262323] enabled:text-white"
        >
          {isLoading ? "Création..." : "+ Ajouter une tâche"}
        </button>
      </form>
    </BaseModal>
  );
}
