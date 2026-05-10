const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Structure des données envoyées lors de la connexion
type LoginPayload = {
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

export { API_URL };