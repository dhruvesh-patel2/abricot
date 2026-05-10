"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { ChevronDownIcon, SearchIcon } from "@/components/dashboard/icons";
import BaseModal from "@/components/modals/BaseModal";
import { createProject } from "@/services/projectService";
import { searchUsers } from "@/services/userService";
import type { Project, User } from "@/types/api";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
};

type FormState = {
  title: string;
  description: string;
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [formState, setFormState] = useState<FormState>({
    title: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isContributorPickerOpen, setIsContributorPickerOpen] =
    useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  function resetModalState() {
    setFormState({
      title: "",
      description: "",
    });
    setSearchQuery("");
    setResults([]);
    setSelectedUsers([]);
    setError("");
    setIsContributorPickerOpen(false);
  }

  function handleClose() {
    resetModalState();
    onClose();
  }

  useEffect(() => {
    async function loadUsers() {
      if (!isOpen || !isContributorPickerOpen || searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const response = await searchUsers(searchQuery.trim());
        setResults(response.data.users);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    void loadUsers();
  }, [isContributorPickerOpen, isOpen, searchQuery]);

  const availableResults = useMemo(() => {
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

    setError("");
    setIsLoading(true);

    try {
      const response = await createProject({
        name: formState.title.trim(),
        description: formState.description.trim(),
        contributors: selectedUsers.map((user) => user.email),
      });

      onCreated?.(response.data);
      handleClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un projet"
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
          <label className="block text-[16px] text-[#222222]">
            Contributeurs
          </label>

          <button
            type="button"
            onClick={() =>
              setIsContributorPickerOpen((currentValue) => !currentValue)
            }
            className="flex h-[52px] w-full items-center justify-between rounded-[6px] border border-[#d8deea] px-4 text-left text-[15px] text-[#778196]"
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
                  className="inline-flex items-center gap-2 rounded-full bg-[#eef2f7] px-3 py-1.5 text-[13px] text-[#222222]"
                >
                  <span>{user.name || user.email}</span>
                  <span className="text-[#778196]">×</span>
                </button>
              ))}
            </div>
          )}

          {isContributorPickerOpen && (
            <div className="rounded-[10px] border border-[#d8deea] bg-white p-3">
              <label className="flex h-[46px] items-center justify-between rounded-[8px] border border-[#d8deea] px-4 text-[#778196]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher un collaborateur"
                  className="w-full bg-transparent text-[14px] text-[#222222] outline-none placeholder:text-[#778196]"
                />
                <SearchIcon />
              </label>

              <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
                {isSearching ? (
                  <p className="px-2 py-2 text-[14px] text-[#778196]">
                    Recherche...
                  </p>
                ) : availableResults.length > 0 ? (
                  availableResults.map((user) => (
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
                    {searchQuery.trim().length < 2
                      ? "Tape au moins 2 caracteres."
                      : "Aucun utilisateur trouve."}
                  </p>
                )}
              </div>
            </div>
          )}
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
          {isLoading ? "Création..." : "Ajouter un projet"}
        </button>
      </form>
    </BaseModal>
  );
}
