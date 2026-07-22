import React, { useState, useRef } from 'react';
import styles from './ImageUploader.module.css';


export const ImageUploader = ({ onImageSelected, currentPreview = null }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentPreview);
  const fileInputRef = useRef(null);


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file);
    } else {
      alert("Format invalide. Veuillez déposer un fichier image (PNG, JPG, WEBP).");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onZoneClick = () => {
    fileInputRef.current.click();
  };
  return (
    <div 
      className={`${styles.uploaderZone} ${dragActive ? styles.dragActive : ''} ${preview ? styles.hasPreview : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onZoneClick}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className={styles.fileInput} 
        accept="image/png, image/jpeg, image/webp" // Formats acceptés
        onChange={handleChange}
      />
      
      {preview ? (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Aperçu couverture" className={styles.previewImage} />
          <div className={styles.overlay}>
            <span>Glissez ou cliquez pour modifier la photo</span>
          </div>
        </div>
      ) : (
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