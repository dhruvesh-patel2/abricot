"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  DashboardIcon,
  FolderIcon,
} from "@/components/dashboard/icons";
import type { User } from "@/types/api";

type HeaderProps = {
  user?: User | null;
  activePage?: "dashboard" | "projects" | "account";
};

// Header principal de l'espace connecte.
export default function Header({
  user,
  activePage = "dashboard",
}: HeaderProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // On derive les initiales pour l'avatar texte.
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // La deconnexion nettoie le token local avant de renvoyer au login.
  function handleLogout() {
    localStorage.removeItem("token");
    setIsMenuOpen(false);
    router.replace("/login");
  }

  const logo = (
    <Image
      src="/img/logo.png"
      alt="Abricot"
      width={171}
      height={44}
      priority
      className="h-auto w-[140px] sm:w-[171px]"
    />
  );

  return (
    <header className="border-b border-[#f0f0f0] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <div>{logo}</div>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-10">
            <li>
              <Link
                href="/dashboard"
                aria-current={
                  activePage === "dashboard" ? "page" : undefined
                }
                className={`flex items-center gap-4 rounded-2xl px-11 py-7 text-lg ${
                  activePage === "dashboard"
                    ? "bg-[#111111] text-white"
                    : "text-[#8a3b00]"
                }`}
              >
                <DashboardIcon />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                aria-current={
                  activePage === "projects" ? "page" : undefined
                }
                className={`flex items-center gap-4 rounded-2xl px-11 py-7 text-lg ${
                  activePage === "projects"
                    ? "bg-[#111111] text-white"
                    : "px-2 py-4 text-[#8a3b00]"
                }`}
              >
                <FolderIcon />
                <span>Projets</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="Ouvrir le menu du profil"
            className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-normal ${
              activePage === "account" || isMenuOpen
                ? "bg-[#d85d0a] text-white"
                : "bg-[#fde8db] text-[#8a3b00]"
            }`}
          >
            {initials}
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              aria-label="Menu du profil"
              className="absolute right-0 top-[84px] z-20 w-[220px] overflow-hidden rounded-[18px] border border-[#dde3ed] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/account");
                }}
                className="flex w-full items-center justify-center bg-[#e3e3e3] px-6 py-7 text-[18px] text-[#222222] transition hover:bg-[#dcdcdc]"
              >
                Profils
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center justify-center px-6 py-7 text-[18px] text-[#222222] transition hover:bg-[#f7f7f7]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
