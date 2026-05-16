"use client";

import BaseModal from "@/components/modals/BaseModal";

type DeleteProjectConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  projectName?: string;
  error?: string;
};

export default function DeleteProjectConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  projectName,
  error = "",
}: DeleteProjectConfirmModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer le projet"
    >
      <div className="space-y-6">
        <p className="text-[16px] leading-7 text-[#4b5563]">
          Confirmez-vous la suppression du projet
          {projectName ? ` "${projectName}"` : ""} ? Cette action est définitive.
        </p>

        {error && (
          <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#b42318] px-6 text-[16px] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Suppression..." : "Oui, supprimer"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#d8deea] px-6 text-[16px] text-[#222222] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
