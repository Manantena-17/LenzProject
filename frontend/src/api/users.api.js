const API_URL = 'http://localhost:5500/api';

export const getUsersRequest = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = new Error('Impossible de charger les utilisateurs');
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API Users:", error);
    throw error;
  }
};