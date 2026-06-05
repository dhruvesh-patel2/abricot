import { redirect } from "next/navigation";

// L'accueil de l'application n'affiche pas de contenu :
// on envoie directement l'utilisateur vers la connexion.
export default function Home() {
  redirect("/login");
}
