import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEventsRequest, deleteEventRequest } from '../api/events.api';
import styles from './Organiser.module.css';

const ITEMS_PER_PAGE = 6;
const API_ORIGIN = 'http://localhost:5500';

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path}`;
};


const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user'); 
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getEventDate = (event) =>
  new Date(event.createdAt || event.date || event.eventDate || 0).getTime();

const Organiser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  
  useEffect(() => {
    const currentUser = getCurrentUser();
    const token = localStorage.getItem('token');
    
    if (!currentUser || !token) {
      navigate('/connexion', { replace: true, state: { from: '/organiser' } });
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const getEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const data = await fetchEventsRequest(token); 
      
      const targetData = data?.events || data?.data || data;
      setEvents(Array.isArray(targetData) ? targetData : []);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des événements :", err);
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) getEvents();
  }, [user]);

  // Function logout 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/connexion', { replace: true });
  };


 const mesEvenements = useMemo(() => {
  if (!user) return [];
  const userId = user.id || user._id;

  return events.filter((event) => {
    const creatorId = 
      event.userId ?? 
      event.organizerId ?? 
      event.UserId ?? 
      event.OrganizerId ?? 
      event.ownerId ?? 
      event.creator?.id ?? 
      event.creator;
    if (creatorId === undefined) {
      return true; 
    }

    return String(creatorId) === String(userId);
  });
}, [events, user]);
useEffect(() => {
  if (events.length > 0) {
    console.log("Utilisateur connecté :", user);
    console.log("Premier événement de la liste :", events[0]);
  }
}, [events, user]);
  const stats = useMemo(() => {
    const total = mesEvenements.length;
    const actifs = mesEvenements.filter((e) => e.status === 'En cours').length;
    const totalVotes = mesEvenements.reduce(
      (sum, e) => sum + (e.votesCount ?? e.votes?.length ?? 0),
      0
    );
    const totalPhotos = mesEvenements.reduce(
      (sum, e) => sum + (e.photosCount ?? e.photos?.length ?? 0),
      0
    );
    return { total, actifs, totalVotes, totalPhotos };
  }, [mesEvenements]);

  const filteredEvents = useMemo(() => {
    return [...mesEvenements]
      .sort((a, b) => getEventDate(b) - getEventDate(a))
      .filter((event) => (event.title || '').toLowerCase().includes(search.toLowerCase()))
      .filter((event) => statusFilter === 'Tous' || event.status === statusFilter);
  }, [mesEvenements, search, statusFilter]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (event) => {
    const id = event._id || event.id;
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/connexion');
      return;
    }

    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }

    try {
      setDeletingId(id);
      await deleteEventRequest(id, token);
      setEvents((prev) => prev.filter((e) => (e._id || e.id) !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError("Impossible de supprimer cet événement pour le moment.");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.topNavigation}>
        <button className={styles.ghostBtn} onClick={() => navigate('/dashboard')}>
          ← Retour au Dashboard
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Se déconnecter 🔌
        </button>
      </div>

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Espace organisateur</p>
          <h1>Bonjour {user.name || user.firstName || 'à vous'} 👋</h1>
          <p className={styles.subtitle}>Gérez vos événements et suivez les votes en un coup d'œil.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => navigate('/creer-evenement')}>
          + Créer un événement
        </button>
      </header>

      <section className={styles.statStrip}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Événements créés</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.actifs}</span>
          <span className={styles.statLabel}>En cours</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalPhotos}</span>
          <span className={styles.statLabel}>Photos partagées</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalVotes}</span>
          <span className={styles.statLabel}>Votes reçus</span>
        </div>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un de vos événements…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.statusTabs}>
          {['Tous', 'En cours', 'Terminé', 'À venir'].map((status) => (
            <button
              key={status}
              className={`${styles.statusTab} ${statusFilter === status ? styles.statusTabActive : ''}`}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className={styles.stateBlock}>
          <div className={styles.spinner} />
          <p>Chargement de vos événements…</p>
        </div>
      )}

      {error && !loading && (
        <div className={styles.stateBlock}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {paginatedEvents.length > 0 ? (
            <div className={styles.list}>
              {paginatedEvents.map((event) => {
                const id = event._id || event.id;
                const photosCount = event.photosCount ?? event.photos?.length ?? 0;
                const votesCount = event.votesCount ?? event.votes?.length ?? 0;

                return (
                  <article key={id} className={styles.row}>
                    <img
                      src={resolveImageUrl(event.coverImage || event.image || event.thumbnail) || '/placeholder-event.svg'}
                      alt={event.title || "Image de l'événement"}
                      className={styles.rowImage}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-event.svg';
                      }}
                    />

                    <div className={styles.rowBody}>
                      <div className={styles.rowHead}>
                        <h3>{event.title || 'Titre absent'}</h3>
                        <span className={event.status === 'En cours' ? styles.badgeActive : styles.badgeDefault}>
                          {event.status || 'Statut inconnu'}
                        </span>
                      </div>
                      <p className={styles.rowMeta}>
                        {photosCount} photo{photosCount !== 1 ? 's' : ''} · {votesCount} vote{votesCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className={styles.rowActions}>
                      <button
                        className={styles.ghostBtn}
                        onClick={() => navigate(`/evenement/${id}`)}
                      >
                        Voir
                      </button>
                      <button
                        className={styles.ghostBtn}
                        onClick={() => navigate(`/evenement/${id}/modifier`)}
                      >
                        Modifier
                      </button>
                      <button
                        className={confirmingId === id ? styles.dangerBtnConfirm : styles.dangerBtn}
                        onClick={() => handleDelete(event)}
                        disabled={deletingId === id}
                      >
                        {deletingId === id
                          ? 'Suppression…'
                          : confirmingId === id
                          ? 'Confirmer ?'
                          : 'Supprimer'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Vous n'avez pas encore créé d'événement.</p>
              <button className={styles.primaryBtn} onClick={() => navigate('/creer-evenement')}>
                Créer mon premier événement
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                ← Précédent
              </button>
              <span className={styles.pageIndicator}>
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Organiser;