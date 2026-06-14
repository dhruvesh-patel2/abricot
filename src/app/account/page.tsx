"use client";

import { useEffect, useState } from "react";

import Footer from "@/components/dashboard/Footer";
import Header from "@/components/dashboard/Header";
import {
  getProfile,
  updatePassword,
  updateProfile,
} from "@/services/authService";
import type { User } from "@/types/api";

type AccountFormState = {
  lastName: string;
  firstName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Transforme les donnees du profil en champs simples pour le formulaire.
function buildAccountFormState(user: User | null): AccountFormState {
  const fullName = user?.name?.trim() ?? "";
  const nameParts = fullName.split(/\s+/).filter(Boolean);

  if (nameParts.length <= 1) {
    return {
      lastName: fullName,
      firstName: "",
      email: user?.email ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  }

  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return {
    lastName,
    firstName,
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

// Page "Mon compte" pour modifier profil et mot de passe.
export default function AccountPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [formState, setFormState] = useState<AccountFormState>({
    lastName: "",
    firstName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setError("");
      setIsLoading(true);

      try {
        const response = await getProfile();
        setProfile(response.data);
        setFormState(buildAccountFormState(response.data));
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement du profil."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  // On met a jour le profil, puis le mot de passe seulement si
  // l'utilisateur a rempli les champs prevus pour cela.
  async function handleSave() {
    setError("");
    setNotice("");
    setIsSaving(true);

    try {
      const fullName = [
        formState.firstName.trim(),
        formState.lastName.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      const profileResponse = await updateProfile({
        name: fullName || formState.lastName.trim(),
        email: formState.email.trim(),
      });

      if (
        formState.currentPassword ||
        formState.newPassword ||
        formState.confirmPassword
      ) {
        if (
          !formState.currentPassword ||
          !formState.newPassword ||
          !formState.confirmPassword
        ) {
          throw new Error("Remplissez tous les champs mot de passe.");
        }

        if (formState.newPassword !== formState.confirmPassword) {
          throw new Error(
            "Le nouveau mot de passe et sa confirmation ne correspondent pas."
          );
        }

        await updatePassword({
          currentPassword: formState.currentPassword,
          newPassword: formState.newPassword,
        });
      }

      setProfile(profileResponse.data);
      setFormState(buildAccountFormState(profileResponse.data));
      setNotice("Les informations du compte ont bien été mises à jour.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la mise à jour du compte."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#222222]">
      <Header user={profile} activePage="account" />

      <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-14 sm:px-8 lg:px-10">
        <section className="rounded-[16px] border border-[#dde3ed] bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <div>
            <h1 className="text-[22px] font-medium text-[#222222]">
              Mon compte
            </h1>
            <p className="mt-2 text-[16px] text-[#5f6b85]">
              {profile?.name ?? "Utilisateur"}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-8 rounded-[8px] bg-red-50 px-4 py-3 text-[14px] text-red-600"
            >
              {error}
            </p>
          )}

          <div className="mt-10 space-y-7">
            <div className="space-y-2">
              <label
                htmlFor="account-last-name"
                className="block text-[16px] text-[#222222]"
              >
                Nom
              </label>
              <input
                id="account-last-name"
                name="lastName"
                autoComplete="family-name"
                value={formState.lastName}
                disabled={isLoading}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    lastName: event.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account-first-name"
                className="block text-[16px] text-[#222222]"
              >
                Prénom
              </label>
              <input
                id="account-first-name"
                name="firstName"
                autoComplete="given-name"
                value={formState.firstName}
                disabled={isLoading}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    firstName: event.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account-email"
                className="block text-[16px] text-[#222222]"
              >
                Email
              </label>
              <input
                id="account-email"
                name="email"
                autoComplete="email"
                type="email"
                value={formState.email}
                disabled={isLoading}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    email: event.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account-current-password"
                className="block text-[16px] text-[#222222]"
              >
                Mot de passe actuel
              </label>
              <input
                id="account-current-password"
                name="currentPassword"
                autoComplete="current-password"
                type="password"
                value={formState.currentPassword}
                disabled={isLoading}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    currentPassword: event.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account-new-password"
                className="block text-[16px] text-[#222222]"
              >
                Nouveau mot de passe
              </label>
              <input
                id="account-new-password"
                name="newPassword"
                autoComplete="new-password"
                type="password"
                value={formState.newPassword}
                disabled={isLoading}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    newPassword: event.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account-confirm-password"
                className="block text-[16px] text-[#222222]"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="account-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                type="password"
                value={formState.confirmPassword}
                disabled={isLoading}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    confirmPassword: event.target.value,
                  }))
                }
                className="h-[52px] w-full rounded-[6px] border border-[#d8deea] px-4 text-[15px] text-[#222222] outline-none transition focus:border-[#d85d0a] disabled:bg-[#f8fafc] disabled:text-[#778196]"
              />
            </div>

            {notice && (
              <p
                aria-live="polite"
                className="rounded-[8px] bg-[#fff7f1] px-4 py-3 text-[14px] text-[#d85d0a]"
              >
                {notice}
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="inline-flex h-[50px] items-center justify-center rounded-[12px] bg-[#262323] px-7 text-[16px] text-white"
            >
              {isSaving
                ? "Enregistrement..."
                : "Modifier les informations"}
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
