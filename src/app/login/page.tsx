"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { loginUser } from "@/services/api";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  // État local utilisé pour contrôler les champs du formulaire.
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Gestion des erreurs et du chargement.
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Soumission du formulaire de connexion.
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      // Envoi des données de connexion au backend.
      const response = await loginUser(formData);

      // Sauvegarde temporaire du token utilisateur.
      localStorage.setItem("token", response.data.token);

      // Redirection après connexion réussie.
      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la connexion."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Bloc gauche : logo et formulaire de connexion */}
        <section className="relative z-10 flex min-h-screen w-full justify-center bg-white px-8 py-10 sm:px-10 lg:w-[524px] lg:min-w-[524px] lg:px-14 lg:py-8">
          <div className="flex w-full max-w-[410px] flex-col">
            <Link
              href="/"
              className="inline-flex w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d85d0a] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              aria-label="Retourner à l'accueil"
            >
              <Image
                src="/img/logo.png"
                alt="Logo Abricot"
                width={175}
                height={46}
                priority
                className="h-auto w-auto"
              />
            </Link>

            <div className="mx-auto mt-20 flex w-full max-w-[286px] flex-1 flex-col justify-center lg:mt-0">
              <h1 className="text-center text-4xl font-bold tracking-tight text-[#d85d0a]">
                Connexion
              </h1>

              <form
                onSubmit={handleSubmit}
                className="mt-12 space-y-6"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-slate-800"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        email: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d85d0a] focus:ring-2 focus:ring-[#d85d0a]/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-800"
                  >
                    Mot de passe
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        password: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d85d0a] focus:ring-2 focus:ring-[#d85d0a]/20"
                    required
                  />
                </div>

                {/* Message d'erreur affiché en cas d'échec */}
                {error && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#222222] px-5 text-base font-medium text-white transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d85d0a] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                  >
                    {isLoading
                      ? "Connexion..."
                      : "Se connecter"}
                  </button>

                  <button
                    type="button"
                    className="mt-5 text-sm text-[#d85d0a] underline underline-offset-2 transition hover:text-[#b74f08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d85d0a] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Mot de passe oublié?
                  </button>
                </div>
              </form>

              <p className="mt-24 text-center text-sm text-slate-800">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="text-[#d85d0a] underline underline-offset-2 transition hover:text-[#b74f08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d85d0a] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Bloc droit : image affichée uniquement sur desktop */}
        <aside className="relative hidden min-h-screen flex-1 lg:block">
          <Image
            src="/img/login.png"
            alt="Illustration d'un espace de travail Abricot"
            fill
            priority
            sizes="(min-width: 1024px) calc(100vw - 524px), 100vw"
            className="object-cover"
          />
        </aside>
      </div>
    </main>
  );
}