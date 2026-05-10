import Image from "next/image";
import Link from "next/link";

import {
  DashboardIcon,
  FolderIcon,
} from "@/components/dashboard/icons";
import type { User } from "@/types/api";

type HeaderProps = {
  user?: User | null;
};

export default function Header({ user }: HeaderProps) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="border-b border-[#f0f0f0] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <Link href="/dashboard" aria-label="Retour au tableau de bord">
          <Image
            src="/img/logo.png"
            alt="Logo Abricot"
            width={171}
            height={44}
            priority
            className="h-auto w-[140px] sm:w-[171px]"
          />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-10">
            <li>
              <Link
                href="/dashboard"
                aria-current="page"
                className="flex items-center gap-4 rounded-2xl bg-[#111111] px-11 py-7 text-lg text-white"
              >
                <DashboardIcon />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className="flex items-center gap-4 px-2 py-4 text-lg text-[#d85d0a]"
              >
                <FolderIcon />
                <span>Projets</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fde8db] text-xl font-normal">
          {initials}
        </div>
      </div>
    </header>
  );
}
