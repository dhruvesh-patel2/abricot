"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/dashboard/icons";

type BaseModalProps = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
  headerAction?: ReactNode;
  titleNode?: ReactNode;
}>;

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

const openModalStack: HTMLElement[] = [];
let savedBodyOverflow = "";

function isVisible(element: HTMLElement) {
  return (
    !element.hasAttribute("hidden") &&
    element.getAttribute("aria-hidden") !== "true" &&
    element.tabIndex !== -1 &&
    (element.offsetWidth > 0 ||
      element.offsetHeight > 0 ||
      element.getClientRects().length > 0)
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(isVisible);
}

function getTopModal() {
  return openModalStack[openModalStack.length - 1] ?? null;
}

function syncBackgroundInteractivity() {
  const appRoot = document.getElementById("app-root");

  if (!appRoot) {
    return;
  }

  if (openModalStack.length > 0) {
    savedBodyOverflow ||= document.body.style.overflow;
    document.body.style.overflow = "hidden";
    appRoot.setAttribute("aria-hidden", "true");
    appRoot.inert = true;
    return;
  }

  document.body.style.overflow = savedBodyOverflow;
  savedBodyOverflow = "";
  appRoot.removeAttribute("aria-hidden");
  appRoot.inert = false;
}

// Structure commune des modales :
// overlay, fermeture clavier et bouton fermer.
export default function BaseModal({
  isOpen,
  title,
  onClose,
  headerAction,
  titleNode,
  children,
}: BaseModalProps) {
  const modalRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen || !modalRef.current) {
      return;
    }

    const modalElement = modalRef.current;
    triggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    openModalStack.push(modalElement);
    syncBackgroundInteractivity();

    const focusableElements = getFocusableElements(modalElement);
    const initialFocusTarget =
      focusableElements[0] ?? modalElement;
    initialFocusTarget.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (getTopModal() !== modalElement) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const updatedFocusableElements = getFocusableElements(modalElement);

      if (updatedFocusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstElement = updatedFocusableElements[0];
      const lastElement =
        updatedFocusableElements[updatedFocusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (!activeElement || !modalElement.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleFocusIn(event: FocusEvent) {
      if (getTopModal() !== modalElement) {
        return;
      }

      const target =
        event.target instanceof HTMLElement
          ? event.target
          : null;

      if (target && modalElement.contains(target)) {
        return;
      }

      const updatedFocusableElements = getFocusableElements(modalElement);
      const fallbackTarget =
        updatedFocusableElements[0] ?? modalElement;
      fallbackTarget.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      const modalIndex = openModalStack.lastIndexOf(modalElement);

      if (modalIndex >= 0) {
        openModalStack.splice(modalIndex, 1);
      }

      syncBackgroundInteractivity();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);

      const restoreTarget = triggerRef.current;

      if (restoreTarget && document.contains(restoreTarget)) {
        restoreTarget.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6">
      {/* Zone cliquable pour fermer la modale sans viser le bouton fermer. */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-[600px] rounded-[18px] bg-white px-8 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.16)] sm:px-10 sm:py-10"
      >
        <div className="flex items-start justify-between gap-4">
          {titleNode ? (
            <div className="pt-10">{titleNode}</div>
          ) : (
            <h2
              id={titleId}
              className="pt-10 text-[28px] font-medium text-[#222222]"
            >
              {title}
            </h2>
          )}

          {titleNode ? (
            <span id={titleId} className="sr-only">
              {title}
            </span>
          ) : null}

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
    </div>,
    document.body
  );
}
