

import { useState } from 'react';
import { loginRequest } from '../api/auth.api';
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
  return { login, loading, error, success };
};