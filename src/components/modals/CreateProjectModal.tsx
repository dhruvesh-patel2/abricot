"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useId, useMemo, useState } from "react";

import { ChevronDownIcon, SearchIcon } from "@/components/dashboard/icons";
import BaseModal from "@/components/modals/BaseModal";
import DeleteProjectConfirmModal from "@/components/modals/DeleteProjectConfirmModal";
import { getProjectAccessLevel } from "@/app/projects/[id]/helpers";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/services/projectService";
import { searchUsers } from "@/services/userService";
import type {
  Project,
  ProjectMember,
  User,
} from "@/types/api";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onCreated?: (project: Project) => void;
  projectToEdit?: Project | null;
  canEditProject?: boolean;
  onUpdated?: (project: Project) => void;
  onDeleted?: (projectId: string) => void;
};

type FormState = {
  title: string;
  description: string;
};

function getInitialFormState(projectToEdit?: Project | null): FormState {
  return {
    title: projectToEdit?.name ?? "",
    description: projectToEdit?.description ?? "",
  };
}

function mapMemberToUser(member: ProjectMember): User | null {
  const id = member.user?.id ?? member.id;
  const email = member.user?.email ?? member.email;
  const name = member.user?.name ?? member.name;

  if (!id || !email) {
    return null;
  }

  return {
    id,
    email,
    name: name ?? email,
    createdAt: "",
    updatedAt: "",
  };
}

function getInitialSelectedUsers(projectToEdit?: Project | null): User[] {
  return (projectToEdit?.members ?? [])
    .map(mapMemberToUser)
    .filter((user): user is User => user !== null);
}

function ensureCreatorAdmin(project: Project, currentUser?: User | null): Project {
  if (!currentUser) {
    return project;
  }

  const nextMembers = [...(project.members ?? [])];
  const matchingMemberIndex = nextMembers.findIndex((member) => {
    const memberId = member.user?.id ?? member.id;
    const memberEmail = member.user?.email ?? member.email;

    return (
      memberId === currentUser.id || memberEmail === currentUser.email
    );
  });

  const creatorMember: ProjectMember = {
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    role: "admin",
    user: {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
    },
  };

  if (matchingMemberIndex === -1) {
    nextMembers.unshift(creatorMember);
  } else {
    nextMembers[matchingMemberIndex] = {
      ...nextMembers[matchingMemberIndex],
      ...creatorMember,
      role: nextMembers[matchingMemberIndex].role ?? "admin",
      user: nextMembers[matchingMemberIndex].user ?? creatorMember.user,
    };
  }

  return {
    ...project,
    members: nextMembers,
  };
}

// Modale de creation et d'edition de projet.
export default function CreateProjectModal({
  isOpen,
  onClose,
  currentUser,
  onCreated,
  projectToEdit,
  canEditProject = true,
  onUpdated,
  onDeleted,
}: CreateProjectModalProps) {
  const [formState, setFormState] = useState<FormState>(
    getInitialFormState(projectToEdit)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isContributorPickerOpen, setIsContributorPickerOpen] =
    useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    getInitialSelectedUsers(projectToEdit)
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditMode = Boolean(projectToEdit);
  const router = useRouter();
  const normalizedSearchQuery = searchQuery.trim();
  const contributorListId = useId();
  const derivedAccessLevel = projectToEdit
    ? getProjectAccessLevel(projectToEdit, currentUser ?? null)
    : "admin";
  const canManageProject =
    canEditProject || derivedAccessLevel === "admin";

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      projectToEdit
    ) {
      console.info("[project-delete-access]", {
        profile: currentUser,
        project: projectToEdit,
        members: projectToEdit.members ?? [],
        contributors: projectToEdit.contributors ?? [],
        canEditProject,
        derivedAccessLevel,
        canDeleteProject: canManageProject,
      });
    }
  }, [
    canEditProject,
    canManageProject,
    currentUser,
    derivedAccessLevel,
    projectToEdit,
  ]);

  function handleClose() {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
    setDeleteError("");
    onClose();
  }

  useEffect(() => {
    async function loadUsers() {
      if (
        !isOpen ||
        !isContributorPickerOpen ||
        normalizedSearchQuery.length < 2
      ) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const response = await searchUsers(normalizedSearchQuery);
        setResults(response.data.users);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    void loadUsers();
  }, [isContributorPickerOpen, isOpen, normalizedSearchQuery]);

  const selectableUsers = useMemo(() => {
    return results.filter(
      (user) =>
        !selectedUsers.some(
          (selectedUser) => selectedUser.id === user.id
        )
    );
  }, [results, selectedUsers]);

  const isSubmitDisabled =
    !formState.title.trim() ||
    !formState.description.trim() ||
    isLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isEditMode && !canManageProject) {
      setError(
        "Seuls les administrateurs de ce projet peuvent modifier ses informations."
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const payload = {
        name: formState.title.trim(),
        description: formState.description.trim(),
        contributors: selectedUsers.map((user) => user.email),
      };

      const response =
        isEditMode && projectToEdit
          ? await updateProject(projectToEdit.id, payload)
          : await createProject(payload);

      if (isEditMode) {
        onUpdated?.(response.data);
      } else {
        onCreated?.(ensureCreatorAdmin(response.data, currentUser));
      }

      handleClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Une erreur est survenue lors de la modification du projet."
            : "Une erreur est survenue lors de la creation du projet."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectUser(user: User) {
    setSelectedUsers((currentUsers) => [...currentUsers, user]);
    setSearchQuery("");
    setResults([]);
  }

  function handleRemoveUser(userId: string) {
    setSelectedUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId)
    );
  }

  async function handleDeleteProject() {
    if (!projectToEdit) {
      return;
    }

    if (!canManageProject) {
      setDeleteError(
        "Seuls les administrateurs de ce projet peuvent supprimer ce projet."
      );
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteProject(projectToEdit.id);
      setIsDeleteModalOpen(false);
      onDeleted?.(projectToEdit.id);
      router.replace("/projects");
      router.refresh();

    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression du projet."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? "Modifier un projet" : "Créer un projet"}
      >
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <label
              htmlFor="project-title"
              className="block text-[16px] text-[#222222]"
            >
              Titre*
            </label>
            <input
              id="project-title"
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
            <label
              htmlFor="project-description"
              className="block text-[16px] text-[#222222]"
            >
              Description*
            </label>
            <textarea
              id="project-description"
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
            <div className="block text-[16px] text-[#222222]">
              Contributeurs
            </div>

            <button
              type="button"
              onClick={() =>
                setIsContributorPickerOpen((currentValue) => !currentValue)
              }
              aria-expanded={isContributorPickerOpen}
              aria-controls={contributorListId}
              aria-label="Choisir les contributeurs du projet"
              className="flex h-[52px] w-full items-center justify-between rounded-[6px] border border-[#d8deea] px-4 text-left text-[15px] text-[#5f6b7a]"
            >
              <span>
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} collaborateur(s) sélectionné(s)`
                  : "Choisir un ou plusieurs collaborateurs"}
              </span>
              <ChevronDownIcon />
            </button>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    aria-label={`Retirer ${user.name || user.email} des contributeurs`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#eef2f7] px-3 py-1.5 text-[13px] text-[#222222]"
                  >
                    <span>{user.name || user.email}</span>
                    <span className="text-[#5f6b7a]">×</span>
                  </button>
                ))}
              </div>
            )}

            {isContributorPickerOpen && (
              <div
                id={contributorListId}
                className="rounded-[10px] border border-[#d8deea] bg-white p-3"
              >
                <div className="flex h-[46px] items-center justify-between rounded-[8px] border border-[#d8deea] px-4 text-[#5f6b7a]">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Rechercher un collaborateur"
                    aria-label="Rechercher un collaborateur"
                    className="w-full bg-transparent text-[14px] text-[#222222] outline-none placeholder:text-[#778196]"
                  />
                  <SearchIcon />
                </div>

                <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
                  {isSearching ? (
                    <p className="px-2 py-2 text-[14px] text-[#778196]">
                      Recherche...
                    </p>
                  ) : selectableUsers.length > 0 ? (
                    selectableUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left transition hover:bg-[#f5f7fb]"
                      >
                        <span>
                          <span className="block text-[14px] text-[#222222]">
                            {user.name}
                          </span>
                          <span className="block text-[13px] text-[#778196]">
                            {user.email}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-[14px] text-[#778196]">
                      {normalizedSearchQuery.length < 2
                        ? "Tape au moins 2 caracteres."
                        : "Aucun utilisateur trouve."}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-600"
            >
              {error}
            </p>
          )}

          {isEditMode && !canManageProject && (
            <p className="rounded-[8px] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#778196]">
              Seuls les administrateurs de ce projet peuvent modifier ses
              informations.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitDisabled || (isEditMode && !canManageProject)}
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#dfe4ed] px-8 text-[16px] text-[#8b93a4] disabled:cursor-not-allowed enabled:bg-[#262323] enabled:text-white"
            >
              {isLoading
                ? isEditMode
                  ? "Mise à jour..."
                  : "Création..."
                : isEditMode
                  ? "Enregistrer"
                  : "Ajouter un projet"}
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={!canManageProject}
                className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#f3c7c7] px-6 text-[16px] text-[#b42318] transition hover:bg-[#fff5f5]"
              >
                Supprimer le projet
              </button>
            )}
          </div>
        </form>
      </BaseModal>

      <DeleteProjectConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteError("");
          }
        }}
        onConfirm={handleDeleteProject}
        isLoading={isDeleting}
        projectName={projectToEdit?.name}
        error={deleteError}
      />
    </>
  );
}
