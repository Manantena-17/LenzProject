
const API_URL = 'http://localhost:5500/api/auth';


export const loginRequest = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Une erreur est survenue lors de la connexion.');
    }

    return result; 
  } catch (error) {
    throw error;
  }
};