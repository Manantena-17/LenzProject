import React, { useState, useRef } from 'react';
import styles from './ImageUploader.module.css';

/**
 * ImageUploader - Composant réutilisable pour le Drag & Drop d'images
 * @param {Function} onImageSelected - Callback recevant le fichier binaire sélectionné
 * @param {string} currentPreview - (Optionnel) URL d'une image existante à afficher par défaut
 */
export const ImageUploader = ({ onImageSelected, currentPreview = null }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentPreview);
  const fileInputRef = useRef(null);

  // --- Gestionnaires d'événements pour le Drag & Drop ---

  // Gère l'activation visuelle de la zone quand on survole avec un fichier
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Traite le fichier physique une fois récupéré (drop ou input)
  const processFile = (file) => {
    // Vérification de sécurité : est-ce bien une image ?
    if (file && file.type.startsWith('image/')) {
      // 1. Créer une URL temporaire locale pour la prévisualisation immédiate
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // 2. Envoyer le fichier physique brut au composant parent (Event.jsx)
      // C'est ce fichier qui sera mis dans le FormData pour l'API
      onImageSelected(file);
    } else {
      alert("Format invalide. Veuillez déposer un fichier image (PNG, JPG, WEBP).");
    }
  };

  // Gère l'événement de dépôt (drop) du fichier
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // --- Gestionnaires pour la sélection classique via clic ---

  // Déclenché quand l'utilisateur choisit un fichier via l'explorateur
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Permet de déclencher le clic sur l'input caché quand on clique sur la zone
  const onZoneClick = () => {
    fileInputRef.current.click();
  };

  // --- Rendu Visuel ---

  return (
    <div 
      // Application dynamique des classes CSS selon l'état
      className={`${styles.uploaderZone} ${dragActive ? styles.dragActive : ''} ${preview ? styles.hasPreview : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onZoneClick} // Rend toute la zone cliquable
    >
      {/* Input de fichier HTML standard, caché mais accessible via useRef */}
      <input 
        ref={fileInputRef}
        type="file" 
        className={styles.fileInput} 
        accept="image/png, image/jpeg, image/webp" // Formats acceptés
        onChange={handleChange}
      />
      
      {/* Affichage conditionnel : Aperçu OU Invite d'upload */}
      {preview ? (
        // Cas 1 : Une image est chargée (ou existante)
        <div className={styles.previewContainer}>
          <img src={preview} alt="Aperçu couverture" className={styles.previewImage} />
          {/* Overlay visible uniquement au survol pour indiquer le changement possible */}
          <div className={styles.overlay}>
            <span>Glissez ou cliquez pour modifier la photo</span>
          </div>
        </div>
      ) : (
        // Cas 2 : Zone vide, invite l'utilisateur à agir
        <div className={styles.prompt}>
          <div className={styles.icon}>📷</div>
          <p className={styles.mainText}>Glissez-déposez la photo de couverture ici</p>
          <p className={styles.subText}>ou cliquez pour parcourir vos dossiers</p>
          <p className={styles.formats}>Formats acceptés : JPG, PNG, WEBP</p>
        </div>
      )}
    </div>
  );
};