import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // États locaux pour gérer le chargement, les erreurs et le succès en direct
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState(false);

  const navigate = useNavigate();

  // 1. Récupération de la page d'origine stockée par le ProtectedRoute
  const getDestination = () => {
    const saved = sessionStorage.getItem('redirect_after_login');
    return saved || '/';
  };

  // 2. Si déjà connecté au chargement de la page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const dest = getDestination();
      sessionStorage.removeItem('redirect_after_login');
      navigate(dest, { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError('');
    setLocalSuccess(false);

    if (isLogin) {
      try {
        // 3. Appel direct à l'API de connexion
        const response = await fetch('http://localhost:5500/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Une erreur est survenue lors de la connexion.');
        }

        // 4. Extraction et stockage du Token et de l'Utilisateur
        const token = data.token || data.accessToken || data.jwt || data.data?.token;
        const user = data.user || data.data?.user;

        if (token) {
          localStorage.setItem('token', token);
          
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            localStorage.setItem('user', JSON.stringify(data));
          }

          setLocalSuccess(true);
          const dest = getDestination();
          sessionStorage.removeItem('redirect_after_login');

          console.log("Token sauvegardé avec succès :", token.substring(0, 15) + '...');

          // 5. Redirection après confirmation
          setTimeout(() => {
            navigate(dest, { replace: true });
          }, 800);
        } else {
          throw new Error("L'API n'a pas renvoyé de token de connexion.");
        }

      } catch (err) {
        console.error("Erreur de connexion :", err);
        setLocalError(err.message || 'Identifiants incorrects.');
      } finally {
        setLocalLoading(false);
      }
    } else {
      // Inscription
      console.log("Inscription demandée :", { name, email, password });
      alert("L'inscription sera bientôt reliée à l'API !");
      setLocalLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{isLogin ? 'Connexion' : 'Inscription'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@mail.com"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          <button type="submit" disabled={localLoading} className={styles.button}>
            {localLoading ? 'Patientez...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        {localError && <div className={styles.error}>{localError}</div>}
        {localSuccess && <div className={styles.success}>Succès ! Redirection...</div>}

        <div className={styles.toggleContainer}>
          {isLogin ? "Nouveau sur la plateforme ?" : "Déjà un compte ?"}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => {
              setIsLogin(!isLogin);
              setName('');
            }}
          >
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;