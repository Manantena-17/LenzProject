

import { useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth.api';
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await loginRequest(email, password);
      
      localStorage.setItem('token', data.token);
      
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await registerRequest(name, email, password);

      // Si le backend connecte automatiquement l'utilisateur après inscription
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error, success };
};