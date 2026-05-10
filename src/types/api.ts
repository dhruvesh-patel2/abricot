// Format standard des reponses renvoyees par le backend.
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Utilisateur de l'application.
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// Membre rattache a un projet avec son role.
export type ProjectMember = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

// Utilisateur assigne a une tache.
export type TaskAssignee = {
  id: string;
  email: string;
  name: string;
};

// Commentaire associe a une tache.
export type Comment = {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
};

// Tache metier manipulee dans le dashboard et les projets.
export type Task = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  projectId?: string;
  assignees?: TaskAssignee[];
  comments?: Comment[];
  createdAt?: string;
  updatedAt?: string;
};

// Projet metier avec ses membres et ses taches.
export type Project = {
  id: string;
  name: string;
  description?: string;
  members?: ProjectMember[];
  contributors?: string[];
  tasks?: Task[];
  createdAt?: string;
  updatedAt?: string;
};

// Donnees renvoyees apres connexion ou inscription.
export type AuthData = {
  user: User;
  token: string;
};

// Structure retournee par l'autocomplete de recherche utilisateurs.
export type SearchUsersData = {
  users: User[];
};

export type AuthResponse = ApiResponse<AuthData>;
