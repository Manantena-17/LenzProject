const API_URL = 'http://localhost:5500/api'

export const fetchEventsRequest = async () => {
  try {
    const response = await fetch(`${API_URL}/events`);
    
    if (!response.ok) {
      throw new Error('Impossible de récupérer les événements');
    }
    
    return await response.json()
  } catch (error) {
    console.error("Erreur API:", error)
    throw error
  }
};

export const createEventRequest = async (eventData, token) => {
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = new Error("Impossible de créer l'événement");
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};