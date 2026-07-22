const API_URL = 'http://localhost:5500/api';

/**
 * Récupère le token d'authentification enregistré
 */
const getToken = () => localStorage.getItem('token') || localStorage.getItem('userToken');

/**
 * Récupérer tous les événements
 */
export const fetchEventsRequest = async () => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_URL}/events`, { headers });
  if (!response.ok) throw new Error('Impossible de récupérer les événements');
  return response.json();
};

/**
 * Récupérer un événement par son ID
 */
export const fetchEventByIdRequest = async (id) => {
  const response = await fetch(`${API_URL}/events/${id}`);
  if (!response.ok) throw new Error("Impossible de récupérer l'événement");
  return response.json();
};

/**
 * Créer un nouvel événement
 * Supporte les objets JSON classiques et les objets FormData (avec image)
 */
export const createEventRequest = async (eventData) => {
  const token = getToken();
  const isFormData = eventData instanceof FormData;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers,
    body: isFormData ? eventData : JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "Impossible de créer l'événement");
    error.status = response.status;
    throw error;
  }

  return response.json();
};

/**
 * Mettre à jour un événement existant (PUT)
 */
export const updateEventRequest = async (eventId, eventData) => {
  const token = getToken();
  const isFormData = eventData instanceof FormData;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'PUT',
    headers,
    body: isFormData ? eventData : JSON.stringify(eventData),
  });

  if (!response.ok) throw new Error("Impossible de mettre à jour l'événement");
  return response.json();
};

/**
 * Supprimer un événement
 */
export const deleteEventRequest = async (eventId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Erreur lors de la suppression : ${response.status}`);
  return response.json();
};

/**
 * Ajouter une image à un événement
 */
export const uploadImageRequest = async (eventId, file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_URL}/events/${eventId}/images`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Impossible d'ajouter l'image");
  }

  return response.json();
};

/**
 * Voté pour une image
 */
export const voteImageRequest = async (eventId, imageId, stars) => {
  const token = getToken();
  if (!token) throw new Error('Vous devez être connecté pour voter');

  const response = await fetch(`${API_URL}/events/${eventId}/images/${imageId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stars }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erreur lors du vote');
  return data;
};