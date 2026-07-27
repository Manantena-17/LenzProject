import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventByIdRequest, voteImageRequest } from '../api/events.api';
import AddImageForm from './AddImageForm';
import styles from './ImageGalleryEvent.module.css';

const API_ORIGIN = 'http://localhost:5500';
const PLACEHOLDER_IMAGE = '/placeholder-event.svg';
const RATED_KEY = 'ratedImages';
const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'user';
const MEDALS = ['🥇', '🥈', '🥉'];

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path}`;
};

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER_IMAGE;
};

// --- FIX: le suivi des votes déjà faits doit être propre à CHAQUE utilisateur,
// pas partagé par tout le navigateur. On dérive une clé de storage à partir
// de l'utilisateur connecté (ou "anonymous" si personne n'est connecté).
const getRatedStorageKey = (user) => {
  const uid = user?.id || user?._id || user?.email;
  return uid ? `${RATED_KEY}_${uid}` : `${RATED_KEY}_anonymous`;
};

const getRatedMap = (user) => {
  try {
    return JSON.parse(localStorage.getItem(getRatedStorageKey(user))) || {};
  } catch {
    return {};
  }
};

const markAsRated = (user, imageId, stars) => {
  const key = getRatedStorageKey(user);
  const current = getRatedMap(user);
  current[imageId] = stars;
  localStorage.setItem(key, JSON.stringify(current));
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY)) || null;
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getImageDate = (image) =>
  new Date(image.createdAt || image.uploadedAt || image.date || 0).getTime();

const normalizeImage = (image) => {
  if (!image) return {};
  const votes = Number(image.votes || 0);
  const ratingSum = Number(image.ratingSum || 0);
  const averageRating = image.averageRating !== undefined && image.averageRating !== null
    ? Number(image.averageRating)
    : (votes > 0 ? ratingSum / votes : 0);

  return {
    ...image,
    id: String(image.id || image._id), 
    votes,
    ratingSum,
    averageRating,
  };
};

const getAverage = (image) => (image ? Number(image.averageRating || 0) : 0);

const StarRating = React.memo(({ value = 0, onChange, readOnly = false, size = 20 }) => {
  const [hovered, setHovered] = useState(null);
  const displayValue = hovered ?? value;

  return (
    <div className={styles.starRow} onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={styles.starBtn}
          style={{ width: size, height: size }}
          disabled={readOnly}
          aria-label={`Noter ${star} étoile${star > 1 ? 's' : ''}`}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onClick={(e) => {
            e.stopPropagation();
            if (!readOnly) onChange?.(star);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= Math.round(displayValue) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            className={star <= Math.round(displayValue) ? styles.starFilled : styles.starEmpty}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
});

const ImageGalleryEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  // FIX: on initialise ratedMap avec la clé propre à l'utilisateur courant
  const [ratedMap, setRatedMap] = useState(() => getRatedMap(getStoredUser()));
  const [votingId, setVotingId] = useState(null);
  const [sortMode, setSortMode] = useState('recent');
  const [viewMode, setViewMode] = useState('gallery');
  const [activeImageId, setActiveImageId] = useState(null); // Fix Bug 1: Utilisation de l'ID au lieu de l'index
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isLoggedIn = !!currentUser;

  const lightboxCloseRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const notificationTimerRef = useRef(null);

  // FIX: dès que l'utilisateur connecté change (connexion, déconnexion, changement
  // de compte), on recharge le ratedMap correspondant à CE user, pas celui du précédent.
  useEffect(() => {
    setRatedMap(getRatedMap(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const syncRatedMap = (e) => {
      // FIX: on ne réagit qu'aux changements de la clé de l'utilisateur courant
      if (e.key === getRatedStorageKey(currentUser)) {
        setRatedMap(getRatedMap(currentUser));
      }
    };
    window.addEventListener('storage', syncRatedMap);
    return () => window.removeEventListener('storage', syncRatedMap);
  }, [currentUser]);

  const showNotification = useCallback((message, type = 'success') => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification({ message, type });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const data = await fetchEventByIdRequest(id);
        const targetEvent = data?.data || data;
        setEvent(targetEvent);
        const rawImages = Array.isArray(targetEvent?.images) ? targetEvent.images : [];
        setImages(rawImages.map(normalizeImage));
      } catch (err) {
        console.error("Erreur lors du chargement de l'événement :", err);
        setError("Impossible de charger cet événement.");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(null);
    showNotification('Vous avez été déconnecté.', 'success');
    navigate('/connexion');
  };

  const handleNewImage = useCallback((newImage) => {
    const normalized = normalizeImage(newImage);
    setImages((prevImages) => [normalized, ...prevImages]);
    showNotification('📸 Photo ajoutée avec succès !', 'success');
  }, [showNotification]);

  const rankById = useMemo(() => {
    const sorted = [...images].sort((a, b) => getAverage(b) - getAverage(a));
    const map = {};
    sorted.forEach((img, i) => { 
      if (img.id) map[img.id] = i; 
    });
    return map;
  }, [images]);

  const filteredImages = useMemo(() => {
    if (!searchTerm.trim()) return images;
    const term = searchTerm.toLowerCase();
    return images.filter(img =>
      img.title?.toLowerCase().includes(term) ||
      img.id?.toString().includes(term)
    );
  }, [images, searchTerm]);

  const displayedImages = useMemo(() => {
    const imagesToSort = filteredImages;
    if (sortMode === 'popular') {
      return [...imagesToSort].sort((a, b) => getAverage(b) - getAverage(a));
    }
    return [...imagesToSort].sort((a, b) => getImageDate(b) - getImageDate(a));
  }, [filteredImages, sortMode]);

  const lightboxIndex = useMemo(() => {
    if (!activeImageId) return null;
    const idx = displayedImages.findIndex(img => img.id === activeImageId);
    return idx !== -1 ? idx : null;
  }, [activeImageId, displayedImages]);

  const totalVotes = useMemo(() => images.reduce((sum, img) => sum + (img.votes || 0), 0), [images]);

  const votingOpen = useMemo(() => {
    if (!event?.votingEndsAt) return true;
    return new Date() < new Date(event.votingEndsAt);
  }, [event]);

  const winnerImage = useMemo(() => {
    if (votingOpen || images.length === 0) return null;
    const ranked = [...images].sort((a, b) => getAverage(b) - getAverage(a));
    const top = ranked[0];
    return top && getAverage(top) > 0 ? top : null;
  }, [votingOpen, images]);

  const handleRate = useCallback(async (imageId, rawStars) => {
    if (!isLoggedIn) {
      showNotification('🔒 Connectez-vous pour voter.', 'error');
      navigate('/connexion');
      return;
    }

    const stars = parseInt(rawStars, 10);
    if (isNaN(stars) || stars < 1 || stars > 5) {
      showNotification('❌ La note doit être un entier entre 1 et 5.', 'error');
      return;
    }

    if (ratedMap[imageId] || votingId === imageId || !votingOpen) return;

    setVotingId(imageId);
    try {
      const res = await voteImageRequest(id, imageId, stars);
      const updatedImageServer = res?.image || res?.data || res;

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            return normalizeImage({
              ...img,
              ...updatedImageServer,
            });
          }
          return img;
        })
      );

      // FIX: on marque le vote comme fait POUR CET UTILISATEUR uniquement
      markAsRated(currentUser, imageId, stars);
      setRatedMap((prev) => ({ ...prev, [imageId]: stars }));
      showNotification(`⭐ Vote de ${stars} étoile${stars > 1 ? 's' : ''} enregistré !`, 'success');
    } catch (err) {
      console.error('Erreur lors du vote :', err);
      showNotification(err.response?.data?.message || "❌ Le vote n'a pas pu être enregistré. Réessaie.", 'error');
    } finally {
      setVotingId(null);
    }
  }, [id, ratedMap, votingId, votingOpen, showNotification, isLoggedIn, navigate, currentUser]);

  const openLightbox = (image, triggerEl) => {
    lastFocusedRef.current = triggerEl || document.activeElement;
    setActiveImageId(image.id);
  };

  const closeLightbox = useCallback(() => {
    setActiveImageId(null);
    if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
      lastFocusedRef.current.focus();
    }
  }, []);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || displayedImages.length === 0) return;
    const prevIndex = (lightboxIndex - 1 + displayedImages.length) % displayedImages.length;
    setActiveImageId(displayedImages[prevIndex].id);
  }, [lightboxIndex, displayedImages]);

  const showNext = useCallback(() => {
    if (lightboxIndex === null || displayedImages.length === 0) return;
    const nextIndex = (lightboxIndex + 1) % displayedImages.length;
    setActiveImageId(displayedImages[nextIndex].id);
  }, [lightboxIndex, displayedImages]);

  useEffect(() => {
    if (activeImageId === null) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImageId, showPrev, showNext, closeLightbox]);

  useEffect(() => {
    if (activeImageId !== null && lightboxCloseRef.current) {
      lightboxCloseRef.current.focus();
    }
  }, [activeImageId]);

  const renderHeader = () => (
    <header className={styles.navbar}>
      <div className={styles.navTop}>
        <div
          className={styles.logo}
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        >
          <span className={styles.logoMark}>🎟️</span>
          <span>Lenz</span>
        </div>

        <div className={styles.navRight}>
          {isLoggedIn ? (
            <div className={styles.userInfo}>
              <span className={styles.userAvatar}>
                {(currentUser?.name || currentUser?.email || '?').charAt(0).toUpperCase()}
              </span>
              <span className={styles.userName}>
                {currentUser?.name || currentUser?.email || 'Mon compte'}
              </span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>
          ) : (
            <button className={styles.ctaBtn} onClick={() => navigate('/connexion')}>
              Se connecter
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>🎟️</span>
            <span>Lenz</span>
          </div>
          <p className={styles.footerTagline}>
            Le reflet de vos événements, choisi par les étudiants.
          </p>
        </div>

        <div className={styles.footerCol}>
          <span className={styles.footerColTitle}>Contact</span>
          <span className={styles.footerLink}>03 46 50 55 49</span>
          <span className={styles.footerLink}>contact@lenz.app</span>
        </div>
      </div>
      <p className={styles.footerBottom}>
        © {new Date().getFullYear()} Lenz — Tous droits réservés.
      </p>
    </footer>
  );

  if (loading) {
    return (
      <div className={styles.page}>
        {renderHeader()}
        <div className={styles.stateBlock}>
          <div className={styles.spinner} />
          <p>Chargement de la galerie…</p>
        </div>
        {renderFooter()}
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.page}>
        {renderHeader()}
        <div className={styles.stateBlock}>
          <p className={styles.errorText}>{error || 'Événement introuvable.'}</p>
          <button className={styles.backBtn} onClick={() => navigate('/')}>← Retour</button>
        </div>
        {renderFooter()}
      </div>
    );
  }

  const currentImage = lightboxIndex !== null ? displayedImages[lightboxIndex] : null;
  const coverUrl = resolveImageUrl(event.thumbnail || event.coverImage || event.image);
  const votedCount = Object.keys(ratedMap).filter(id => ratedMap[id]).length;

  return (
    <div className={styles.page}>

      {renderHeader()}

      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <span className={styles.notificationIcon}>
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          {notification.message}
        </div>
      )}

      <section className={styles.hero} style={coverUrl ? { '--hero-bg': `url(${coverUrl})` } : undefined}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroHeader}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>
              <span aria-hidden="true">←</span> Retour
            </button>

            <div className={styles.heroStatus}>
              <span className={`${styles.statusBadge} ${votingOpen ? styles.statusOpen : styles.statusClosed}`}>
                <span className={styles.statusDot} aria-hidden="true" />
                {votingOpen ? '🔓 Votes ouverts' : '🔒 Votes clos'}
              </span>
            </div>
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{event.title}</h1>
            {event.description && <p className={styles.heroDescription}>{event.description}</p>}

            <div className={styles.heroMeta}>
              {event.openedAt && (
                <span className={styles.metaPill}>
                  <span aria-hidden="true">📅</span> {formatDate(event.openedAt)}
                </span>
              )}
              {event.votingEndsAt && (
                <span className={styles.metaPill}>
                  <span aria-hidden="true">⏳</span> Fin: {formatDate(event.votingEndsAt)}
                </span>
              )}
              <span className={styles.metaPill}>
                <span aria-hidden="true">👥</span> {images.length} photo{images.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{images.length}</span>
                <span className={styles.statLabel}>📸 Photos</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{totalVotes}</span>
                <span className={styles.statLabel}>🗳️ Votes</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{votedCount}</span>
                <span className={styles.statLabel}>⭐ Votés</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className={styles.content}>

        {winnerImage && (
          <section className={styles.winnerBanner}>
            <div className={styles.winnerContent}>
              <span className={styles.winnerTrophy} aria-hidden="true">🏆</span>
              <button
                className={styles.winnerImageWrapper}
                onClick={(e) => openLightbox(winnerImage, e.currentTarget)}
                aria-label="Voir la photo gagnante en grand"
              >
                <img
                  src={resolveImageUrl(winnerImage.url) || PLACEHOLDER_IMAGE}
                  alt="Photo gagnante de l'événement"
                  onError={handleImageError}
                />
              </button>
              <div className={styles.winnerInfo}>
                <span className={styles.winnerLabel}>Photo gagnante</span>
                <span className={styles.winnerStats}>
                  ⭐ {getAverage(winnerImage).toFixed(1)} · {winnerImage.votes || 0} vote{winnerImage.votes !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </section>
        )}

        {votingOpen && (
          <section className={styles.uploadSection}>
            <div className={styles.uploadContainer}>
              <div className={styles.uploadHeader}>
                <h2 className={styles.sectionTitle}>
                  <span aria-hidden="true">📤</span> Partager une photo
                </h2>
                <p className={styles.sectionSubtitle}>
                  Ajoutez vos meilleures photos de l'événement
                </p>
              </div>

              {isLoggedIn ? (
                <AddImageForm eventId={id} onImageAdded={handleNewImage} />
              ) : (
                <div className={styles.authPrompt}>
                  <p className={styles.authPromptText}>
                    🔒 Connectez-vous pour ajouter une photo à cet événement.
                  </p>
                  <button className={styles.authPromptBtn} onClick={() => navigate('/connexion')}>
                    Se connecter
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        <div className={styles.toolbar}>
          <div className={styles.toolbarTop}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Rechercher une photo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => setSearchTerm('')}
                    aria-label="Effacer la recherche"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className={styles.toolbarRight}>
              <div className={styles.sortSwitch} role="tablist">
                <button
                  role="tab"
                  aria-selected={sortMode === 'recent'}
                  className={`${styles.sortBtn} ${sortMode === 'recent' ? styles.sortBtnActive : ''}`}
                  onClick={() => setSortMode('recent')}
                >
                  🕐 Récentes
                </button>
                <button
                  role="tab"
                  aria-selected={sortMode === 'popular'}
                  className={`${styles.sortBtn} ${sortMode === 'popular' ? styles.sortBtnActive : ''}`}
                  onClick={() => setSortMode('popular')}
                >
                  🔥 Populaires
                </button>
              </div>

              <div className={styles.viewSwitch} role="tablist">
                <button
                  role="tab"
                  aria-selected={viewMode === 'gallery'}
                  className={`${styles.viewBtn} ${viewMode === 'gallery' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('gallery')}
                >
                  🖼️
                </button>
                <button
                  role="tab"
                  aria-selected={viewMode === 'table'}
                  className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          <div className={styles.toolbarBottom}>
            <span className={styles.resultCount}>
              {displayedImages.length} photo{displayedImages.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
            {votingOpen && (
              <span className={styles.toolbarHint}>
                {isLoggedIn ? '⭐ Cliquez sur les étoiles pour voter' : '🔒 Connectez-vous pour voter'}
              </span>
            )}
          </div>
        </div>

        {displayedImages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon} aria-hidden="true">
              {searchTerm ? '🔍' : '🖼️'}
            </div>
            <h3 className={styles.emptyStateTitle}>
              {searchTerm ? 'Aucun résultat' : 'Aucune photo'}
            </h3>
            <p className={styles.emptyStateText}>
              {searchTerm
                ? `Aucune photo ne correspond à "${searchTerm}"`
                : votingOpen
                  ? 'Soyez le premier à ajouter une photo à cet événement !'
                  : 'Aucune photo n\'a été ajoutée à cet événement.'
              }
            </p>
            {searchTerm && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchTerm('')}
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : viewMode === 'gallery' ? (
          <div className={styles.grid}>
            {displayedImages.map((image) => {
              const myRating = ratedMap[image.id];
              const average = getAverage(image);
              const rank = rankById[image.id];
              const medal = rank !== undefined && rank < 3 && average > 0 ? MEDALS[rank] : null;
              const imgUrl = resolveImageUrl(image.url);
              const isVoting = votingId === image.id;

              return (
                <div key={image.id} className={styles.card}>
                  <div
                    className={styles.imageWrapper}
                    role="button"
                    tabIndex={0}
                    aria-label={`Agrandir la photo #${image.id}`}
                    onClick={(e) => openLightbox(image, e.currentTarget)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(image, e.currentTarget);
                      }
                    }}
                  >
                    <img
                      src={imgUrl || PLACEHOLDER_IMAGE}
                      alt={`Photo #${image.id}`}
                      loading="lazy"
                      onError={handleImageError}
                    />
                    {medal && <span className={styles.medalBadge}>{medal}</span>}
                    {isVoting && <div className={styles.votingOverlay}><div className={styles.spinnerSmall} /></div>}
                    <div className={styles.imageOverlay}>
                      <span className={styles.imageZoomHint}>🔍</span>
                      {myRating && <span className={styles.imageVoteBadge}>⭐ {myRating}</span>}
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardRating}>
                      <StarRating
                        value={myRating || average}
                        readOnly={!!myRating || !votingOpen}
                        onChange={(stars) => handleRate(image.id, stars)}
                        size={20}
                      />
                      {myRating && <span className={styles.yourVoteBadge}>Votre vote</span>}
                    </div>
                    <div className={styles.cardStats}>
                      <span className={styles.voteCount}>
                        {average > 0 ? `${average.toFixed(1)} ⭐` : '—'}
                      </span>
                      <span className={styles.voteCount}>
                        {image.votes || 0} vote{image.votes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thRank}>#</th>
                  <th className={styles.thImage}>Photo</th>
                  <th className={styles.thRating}>Note</th>
                  <th className={styles.thVotes}>Votes</th>
                  <th className={styles.thAction}>Votre vote</th>
                  <th className={styles.thStatus}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {displayedImages.map((image, idx) => {
                  const myRating = ratedMap[image.id];
                  const average = getAverage(image);
                  const rank = rankById[image.id];
                  const medal = rank !== undefined && rank < 3 && average > 0 ? MEDALS[rank] : null;
                  const isVoting = votingId === image.id;

                  return (
                    <tr key={image.id} className={myRating ? styles.votedRow : ''}>
                      <td className={styles.thRank}>
                        <span className={styles.rankNumber}>{medal || idx + 1}</span>
                      </td>
                      <td>
                        <button
                          className={styles.tableThumbBtn}
                          onClick={(e) => openLightbox(image, e.currentTarget)}
                          aria-label={`Agrandir la photo #${image.id}`}
                        >
                          <img
                            src={resolveImageUrl(image.url) || PLACEHOLDER_IMAGE}
                            alt={`Photo #${image.id}`}
                            className={styles.tableThumb}
                            loading="lazy"
                            onError={handleImageError}
                          />
                        </button>
                      </td>
                      <td className={styles.thRating}>
                        <StarRating value={average} readOnly size={16} />
                      </td>
                      <td className={styles.thVotes}>
                        <span className={styles.voteCountBadge}>{image.votes || 0}</span>
                      </td>
                      <td className={styles.thAction}>
                        <StarRating
                          value={myRating || 0}
                          readOnly={!!myRating || !votingOpen}
                          onChange={(stars) => handleRate(image.id, stars)}
                          size={16}
                        />
                        {isVoting && <span className={styles.votingIndicator}>⏳</span>}
                      </td>
                      <td className={styles.thStatus}>
                        {myRating ? (
                          <span className={styles.votedBadge}>✅ Voté</span>
                        ) : votingOpen ? (
                          <span className={styles.pendingBadge}>⏳ À voter</span>
                        ) : (
                          <span className={styles.closedBadge}>🔒 Clos</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {currentImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo #${currentImage.id}, ${lightboxIndex + 1} sur ${displayedImages.length}`}
        >
          <button
            ref={lightboxCloseRef}
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Fermer"
          >
            ✕
          </button>

          <button
            className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            aria-label="Image précédente"
          >‹</button>

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImageContainer}>
              <img
                src={resolveImageUrl(currentImage.url) || PLACEHOLDER_IMAGE}
                alt={`Photo #${currentImage.id}`}
                onError={handleImageError}
              />
              <div className={styles.lightboxInfo}>
                <span className={styles.lightboxCounter}>
                  {lightboxIndex + 1} / {displayedImages.length}
                </span>
                <span className={styles.lightboxVotes}>
                  {currentImage.votes || 0} vote{currentImage.votes !== 1 ? 's' : ''}
                </span>
                {getAverage(currentImage) > 0 && (
                  <span className={styles.lightboxAverage}>
                    ⭐ {getAverage(currentImage).toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.lightboxFooter}>
              <div className={styles.lightboxRating}>
                <span className={styles.lightboxLabel}>Votre note :</span>
                <StarRating
                  value={ratedMap[currentImage.id] || 0}
                  readOnly={!!ratedMap[currentImage.id] || !votingOpen}
                  onChange={(stars) => handleRate(currentImage.id, stars)}
                  size={28}
                />
                {ratedMap[currentImage.id] && (
                  <span className={styles.lightboxVotedBadge}>✅ Vote enregistré</span>
                )}
              </div>
            </div>
          </div>

          <button
            className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            aria-label="Image suivante"
          >›</button>
        </div>
      )}

      {renderFooter()}

    </div>
  );
};

export default ImageGalleryEvent;