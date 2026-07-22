import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader'; // On importe ton uploader ici !
import { uploadImageRequest } from '../api/events.api';

const AddImageForm = ({ eventId, onImageAdded }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      // Envoi au backend via l'API
      const response = await uploadImageRequest(eventId, selectedFile);
      
      // On ajoute l'image à la galerie React
      if (onImageAdded) onImageAdded(response.data);
      
      setSelectedFile(null); // On vide l'uploader après succès
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'image :", error);
      alert("Erreur lors de l'envoi");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TON UPLOADER EST UTILISÉ ICI */}
      <ImageUploader 
        onImageSelected={(file) => setSelectedFile(file)} 
        key={selectedFile ? 'filled' : 'empty'} 
      />
      
      <button type="submit" disabled={!selectedFile}>
        Partager ma photo
      </button>
    </form>
  );
};

export default AddImageForm;