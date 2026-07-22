import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LogoutButton.module.css'; 
const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('redirect_after_login');
    navigate('/connexion', { replace: true });
    window.location.reload();
  };
  return (
    <button 
      onClick={handleLogout} 
      className={styles.logoutBtn}
      type="button"
    >
      Se déconnecter
    </button>
  );
};
export default LogoutButton;