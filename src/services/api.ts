const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Structure des données envoyées lors de la connexion
type LoginPayload = {
  email: string;
  password: string;
};

// Structure des donnees envoyees lors de l'inscription
type RegisterPayload = {
  email: string;
  password: string;
};

// Fonction utilisée pour connecter un utilisateur
export async function loginUser(payload: LoginPayload) {
  // Requête POST envoyée au backend
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Conversion des données du formulaire en JSON
    body: JSON.stringify(payload),
  });

  // Récupération de la réponse du backend
  const data = await response.json();

  // Gestion des erreurs de connexion
  if (!response.ok) {
    throw new Error(data.message || "Erreur lors de la connexion.");
  }

  // Retourne les données utilisateur et le token
  return data;
}

// Fonction utilisee pour inscrire un utilisateur
export async function registerUser(payload: RegisterPayload) {
  // Requete POST envoyee au backend
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Conversion des donnees du formulaire en JSON
    body: JSON.stringify(payload),
  });

  // Recuperation de la reponse du backend
  const data = await response.json();

  // Gestion des erreurs d'inscription
  if (!response.ok) {
    throw new Error(data.message || "Erreur lors de l'inscription.");
  }

  // Retourne les donnees utilisateur creees
  return data;
}
