import axios from 'axios';

export const BASE_URL = 'http://127.0.0.1:8000';
export const API_URL = `${BASE_URL}/api`;
export const STORAGE_URL = `${BASE_URL}/storage`;

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Remove leading slash if it exists and prepend storage URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${STORAGE_URL}/${cleanPath}`;
};

// Configuration de base
const API = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur pour ajouter le token automatiquement à chaque requête
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ========== Routes publiques ==========

// Récupérer les écoles avec pagination et filtres
export const getSchools = (params = {}) => API.get('/schools', { params });

// Récupérer une école par ID
export const getSchoolById = (id) => API.get(`/schools/${id}`);

// Récupérer les options de filtres
export const getFilters = () => API.get('/filters');

// Rechercher / filtrer les écoles
export const searchSchools = (filters) => API.post('/schools/search', filters);

// Récupérer les avis d'une école
export const getSchoolReviews = (schoolId) => API.get(`/schools/${schoolId}/reviews`);

// Recommandations personnalisées
export const getRecommendationFilters = () => API.get('/recommendations/filters');
export const getRecommendations = (data) => API.post('/recommendations', data);

// ========== Authentification ==========

// Inscription
export const register = (userData) => API.post('/register', userData);

// Connexion
export const login = (credentials) => API.post('/login', credentials);

// Déconnexion
export const logout = () => API.post('/logout');

// Récupérer l'utilisateur connecté
export const getUser = () => API.get('/user');

// Mettre à jour le profil (nom, email, avatar)
export const updateProfile = (userData) => {
  if (userData instanceof FormData) {
    userData.append('_method', 'PUT');
    return API.post('/user/profile', userData);
  }
  return API.put('/user/profile', userData);
};

// Mettre à jour le mot de passe
export const updatePassword = (passwordData) => API.put('/user/password', passwordData);

// ========== Routes protégées ==========

// Ajouter un avis
export const addReview = (reviewData) => API.post('/reviews', reviewData);

// Modifier un avis
export const updateReview = (reviewId, reviewData) => API.put(`/reviews/${reviewId}`, reviewData);

// Supprimer un avis
export const deleteReview = (reviewId) => API.delete(`/reviews/${reviewId}`);

// Récupérer le profil complet (avis + favoris)
export const getUserProfile = () => API.get('/profile');

// Ajouter / Retirer une école des favoris
export const toggleFavorite = (schoolId) => API.post(`/schools/${schoolId}/favorite`);

// ========== Routes ADMIN (protégées) ==========

// === Gestion des écoles ===
export const adminGetSchools = (page = 1) => API.get(`/admin/schools?page=${page}`);
export const adminGetSchool = (id) => API.get(`/admin/schools/${id}`);
export const adminCreateSchool = (data) => API.post('/admin/schools', data, {
    headers: { 'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json' }
});
export const adminUpdateSchool = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return API.post(`/admin/schools/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return API.put(`/admin/schools/${id}`, data);
};
export const adminDeleteSchool = (id) => API.delete(`/admin/schools/${id}`);

// === Gestion des formations ===
export const adminGetFormations = (schoolId) => API.get(`/admin/schools/${schoolId}/formations`);
export const adminCreateFormation = (schoolId, data) => API.post(`/admin/schools/${schoolId}/formations`, data);
export const adminUpdateFormation = (id, data) => API.put(`/admin/formations/${id}`, data);
export const adminDeleteFormation = (id) => API.delete(`/admin/formations/${id}`);

// === Gestion des avis (modération) ===
export const adminGetReviews = (page = 1) => API.get(`/admin/reviews?page=${page}`);
export const adminGetPendingReviews = (page = 1) => API.get(`/admin/reviews/pending?page=${page}`);
export const adminVerifyReview = (id) => API.post(`/admin/reviews/${id}/verify`);
export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);

// Récupérer le nombre d'avis en attente
export const adminGetPendingReviewsCount = () => API.get('/admin/reviews/pending/count');

// Récupérer les statistiques globales
export const adminGetStats = () => API.get('/admin/stats');

// === Gestion des utilisateurs ===
export const adminGetUsers = (page = 1, search = '') => 
    API.get(`/admin/users?page=${page}&search=${search}`);
export const adminToggleUserRole = (id) => API.put(`/admin/users/${id}/role`);
export const adminUpdateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);

// === Paramètres ===
export const adminGetSettings = () => API.get('/admin/settings');
export const adminUpdateSettings = (settings) => API.put('/admin/settings', settings);

export default API;
