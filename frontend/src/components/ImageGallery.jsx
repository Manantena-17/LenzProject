import React, { useState, useEffect } from 'react';
import styles from './ImageGallery.module.css'; // Si tu utilises des CSS modules

export default function ImageGallery({ event, token }) {
  const [images, setImages] = useState(event.images || []);
  const [votedImageIds, setVotedImageIds] = useState([]);
  const [votingStatus, setVotingStatus] = useState({ loadingId: null, error: null });

  // 1. Vérifier si la période de vote est encore ouverte
  const now = new Date();
  const isVotingOpen = now < new Date(event.votingEndsAt);

  // Charger les votes déjà effectués par l'utilisateur au montage (optionnel, pour l'UI)
  useEffect(() => {
    const savedVotes = localStorage.getItem(`votes_event_${event.id}`);
    if (savedVotes) {
      setVotedImageIds(JSON.parse(savedVotes));
    }
  }, [event.id]);

  const handleVote = async (imageId) => {
    if (!isVotingOpen) {
      alert("La période de vote pour cet événement est malheureusement terminée !");
      return;
    }

    if (!token) {
      alert("Vous devez être connecté pour voter.");
      return;
    }

    // Si l'utilisateur a déjà voté pour cette image (protection côté client)
    if (votedImageIds.includes(imageId)) {
      alert("Vous avez déjà voté pour cette photo !");
      return;
    }

    try {
      setVotingStatus({ loadingId: imageId, error: null });

      // Exemple d'appel API vers ton routeur Express : PUT /api/images/:id/vote
      const response = await fetch(`/api/images/${imageId}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du vote.");
      }

      const updatedImage = await response.json(); 
      // Si ton API renvoie l'objet image mis à jour avec son nouveau compteur de votes, 
      // ou sinon on incrémente manuellement de +1 dans l'état local :
      
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === imageId ? { ...img, votes: img.votes + 1 } : img
        )
      );

      // Enregistrer le vote en local pour éviter le double clic visuel
      const newVotes = [...votedImageIds, imageId];
      setVotedImageIds(newVotes);
      localStorage.setItem(`votes_event_${event.id}`, JSON.stringify(newVotes));

    } catch (err) {
      console.error(err);
      setVotingStatus({ loadingId: null, error: "Impossible de voter. Veuillez réessayer." });
    } finally {
      setVotingStatus({ loadingId: null, error: null });
    }
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryHeader}>
        <h2>Galerie de l'événement ({images.length} photos)</h2>
        <p className={styles.deadline}>
          {isVotingOpen ? (
            <span className={styles.open}>
              🗳️ Votes ouverts jusqu'au {new Date(event.votingEndsAt).toLocaleString()}
            </span>
          ) : (
            <span className={styles.closed}>
              🚫 Les votes sont clos depuis le {new Date(event.votingEndsAt).toLocaleString()}
            </span>
          )}
        </p>
      </div>

      {votingStatus.error && <div className={styles.errorBanner}>{votingStatus.error}</div>}

      <div className={styles.grid}>
        {images.map((image) => {
          const hasVoted = votedImageIds.includes(image.id);
          const isCurrentLoading = votingStatus.loadingId === image.id;

          return (
            <div key={image.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={image.url} alt="Soumission événement" loading="lazy" />
              </div>
              
              <div className={styles.cardFooter}>
                <span className={styles.voteCount}>
                  ❤️ {image.votes} {image.votes > 1 ? 'votes' : 'vote'}
                </span>

                <button
                  onClick={() => handleVote(image.id)}
                  disabled={!isVotingOpen || hasVoted || isCurrentLoading}
                  className={`${styles.voteBtn} ${hasVoted ? styles.voted : ''}`}
                >
                  {isCurrentLoading ? (
                    '...'
                  ) : hasVoted ? (
                    'A voté !'
                  ) : (
                    'Voter'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}