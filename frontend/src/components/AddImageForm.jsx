import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader'; // On importe ton uploader ici !
import { uploadImageRequest } from '../api/events.api';

const AddImageForm = ({ eventId, onImageAdded }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {

      const response = await uploadImageRequest(eventId, selectedFile);
      
    
      if (onImageAdded) onImageAdded(response.data);
      
      setSelectedFile(null); 
   } catch (error) {
  console.error("Erreur lors de l'envoi de l'image :", error);
  alert(error.response?.data?.message || "Erreur lors de l'envoi");
}
  };

  return (
    <form onSubmit={handleSubmit}>

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