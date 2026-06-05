"use client";

import { useMemo, useState } from "react";

import {
  EditIcon,
  SendIcon,
  SparklesIcon,
  TrashIcon,
} from "@/components/dashboard/icons";
import BaseModal from "@/components/modals/BaseModal";
import { createProjectTask } from "@/services/projectService";
import type { Task } from "@/types/api";

type DraftTask = {
  id: string;
  title: string;
  description: string;
};

type CreateTaskAiModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCreated?: (tasks: Task[]) => void;
};

// Retourne une date simple pour pre-remplir les echeances generees.
function getTodayPlusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

// Construit des brouillons de taches a partir du texte saisi.
// Ici on reste volontairement simple pour garder une IA "locale" lisible.
function buildDraftTasks(prompt: string): DraftTask[] {
  const cleanedPrompt = prompt.trim();
  const chunks = cleanedPrompt
    .split(/\n|,|;/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (chunks.length >= 2) {
    return chunks.slice(0, 4).map((chunk, index) => ({
      id: `draft-${index}-${chunk}`,
      title:
        chunk.charAt(0).toUpperCase() + chunk.slice(1),
      description: `Tâche générée à partir de votre demande : ${chunk}.`,
    }));
  }

  return [
    {
      id: "draft-analysis",
      title: "Analyse du besoin",
      description: `Définir les attentes et le périmètre pour : ${cleanedPrompt}.`,
    },
    {
      id: "draft-implementation",
      title: "Implémentation principale",
      description: `Réaliser la partie principale liée à : ${cleanedPrompt}.`,
    },
    {
      id: "draft-validation",
      title: "Validation finale",
      description: `Tester et valider le résultat autour de : ${cleanedPrompt}.`,
    },
  ];
}

// Modale de creation assistee par IA.
export default function CreateTaskAiModal({
  isOpen,
  onClose,
  projectId,
  onCreated,
}: CreateTaskAiModalProps) {
  const [prompt, setPrompt] = useState("");
  const [draftTasks, setDraftTasks] = useState<DraftTask[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function resetState() {
    setPrompt("");
    setDraftTasks([]);
    setEditingTaskId(null);
    setError("");
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleGenerate() {
    if (!prompt.trim()) {
      return;
    }

    setDraftTasks(buildDraftTasks(prompt));
    setEditingTaskId(null);
    setError("");
  }

  function handleDeleteTask(taskId: string) {
    setDraftTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
  }

  function handleUpdateTask(
    taskId: string,
    field: "title" | "description",
    value: string
  ) {
    setDraftTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              [field]: value,
            }
          : task
      )
    );
  }

  async function handleCreateTasks() {
    setError("");
    setIsLoading(true);

    try {
      const createdTasks = await Promise.all(
        draftTasks.map(async (task, index) => {
          const response = await createProjectTask(projectId, {
            title: task.title.trim(),
            description: task.description.trim(),
            dueDate: getTodayPlusDays(index + 1),
            assigneeIds: [],
            status: "TODO",
          });

          return response.data;
        })
      );

      onCreated?.(createdTasks);
      handleClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la creation des taches."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const titleNode = useMemo(
    () => (
      <div className="flex items-center gap-3 text-[#222222]">
        <SparklesIcon className="text-[#f0670f]" />
        <span className="text-[28px] font-medium">
          {draftTasks.length > 0 ? "Vos tâches..." : "Créer une tâche"}
        </span>
      </div>
    ),
    [draftTasks.length]
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer une tâche avec IA"
      titleNode={titleNode}
    >
      <div className="flex min-h-[620px] flex-col">
        <div className="flex-1">
          {draftTasks.length > 0 && (
            <div className="space-y-6">
              {draftTasks.map((task) => {
                const isEditing = editingTaskId === task.id;

                return (
                  <article
                    key={task.id}
                    className="rounded-[14px] border border-[#dde3ed] px-10 py-8"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          value={task.title}
                          onChange={(event) =>
                            handleUpdateTask(
                              task.id,
                              "title",
                              event.target.value
                            )
                          }
                          className="w-full border-b border-[#dde3ed] pb-2 text-[18px] font-medium text-[#222222] outline-none"
                        />
                        <textarea
                          value={task.description}
                          onChange={(event) =>
                            handleUpdateTask(
                              task.id,
                              "description",
                              event.target.value
                            )
                          }
                          rows={3}
                          className="w-full rounded-[8px] border border-[#dde3ed] px-3 py-2 text-[16px] text-[#778196] outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[18px] font-medium text-[#222222]">
                          {task.title}
                        </h3>
                        <p className="mt-2 text-[16px] text-[#778196]">
                          {task.description}
                        </p>
                      </>
                    )}

                    <div className="mt-8 flex items-center gap-4 text-[14px] text-[#8b93a4]">
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="inline-flex items-center gap-2"
                      >
                        <TrashIcon />
                        <span>Supprimer</span>
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTaskId((currentId) =>
                            currentId === task.id ? null : task.id
                          )
                        }
                        className="inline-flex items-center gap-2"
                      >
                        <EditIcon />
                        <span>Modifier</span>
                      </button>
                    </div>
                  </article>
                );
              })}

              {error && (
                <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCreateTasks}
                  disabled={draftTasks.length === 0 || isLoading}
                  className="inline-flex h-[52px] items-center justify-center rounded-[14px] bg-[#262323] px-8 text-[16px] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Création..." : "+ Ajouter les tâches"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-[28px] bg-[#f7f9fc] px-6 py-4">
          <div className="flex items-center gap-4">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Décrivez les tâches que vous souhaitez ajouter..."
              className="w-full bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#778196]"
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#d85d0a] text-white disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
