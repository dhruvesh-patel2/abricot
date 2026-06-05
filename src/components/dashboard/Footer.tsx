import Image from "next/image";

// Footer utilise sur les pages principales de l'espace connecte.
export default function Footer() {
  return (
    <footer className="mt-16 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-7">
        <Image
          src="/img/logo.png"
          alt="Logo Abricot pied de page"
          width={102}
          height={26}
          className="h-auto w-[102px]"
        />
        <p className="text-[18px] text-[#222222]">Abricot 2025</p>
      </div>
    </footer>
  );
}
