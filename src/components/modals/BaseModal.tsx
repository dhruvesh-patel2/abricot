"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { useEffect } from "react";

import { CloseIcon } from "@/components/dashboard/icons";

type BaseModalProps = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  headerAction?: ReactNode;
  titleNode?: ReactNode;
}>;

export default function BaseModal({
  isOpen,
  title,
  onClose,
  headerAction,
  titleNode,
  children,
}: BaseModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-[600px] rounded-[18px] bg-white px-8 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.16)] sm:px-10 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          {titleNode ? (
            <div className="pt-10">{titleNode}</div>
          ) : (
            <h2 className="pt-10 text-[28px] font-medium text-[#222222]">
              {title}
            </h2>
          )}

          <div className="flex items-center gap-3">
            {headerAction}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#778196] transition hover:bg-[#f5f7fb]"
              aria-label="Fermer la modale"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </section>
    </div>
  );
}
