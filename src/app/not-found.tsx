import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/dashboard/Footer";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#fafafa] text-[#222222]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/dashboard"
          className="inline-flex w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d85d0a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]"
          aria-label="Retour au tableau de bord"
        >
          <Image
            src="/img/logo.png"
            alt="Logo Abricot"
            width={171}
            height={44}
            priority
            className="h-auto w-[140px] sm:w-[171px]"
          />
        </Link>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[760px] rounded-[28px] border border-[#dde3ed] bg-white px-8 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-12 sm:py-16">
            <p className="text-[16px] font-medium uppercase tracking-[0.25em] text-[#d85d0a]">
              Erreur 404
            </p>
            <h1 className="mt-5 text-[40px] font-medium tracking-[-0.03em] text-[#222222] sm:text-[52px]">
              Cette page n&apos;existe pas
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-8 text-[#778196] sm:text-[19px]">
              Le lien demandé est introuvable ou a peut-être été déplacé.
              Vous pouvez revenir au tableau de bord ou consulter vos projets.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-[52px] min-w-[190px] items-center justify-center rounded-xl bg-[#262323] px-7 text-[17px] text-white"
              >
                Retour au dashboard
              </Link>
              <Link
                href="/projects"
                className="inline-flex h-[52px] min-w-[190px] items-center justify-center rounded-xl border border-[#dde3ed] bg-white px-7 text-[17px] text-[#222222]"
              >
                Voir mes projets
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
