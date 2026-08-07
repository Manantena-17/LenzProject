import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEventsRequest } from '../api/events.api';
import styles from './Dashboard.module.css';

const ITEMS_PER_PAGE = 6;

const API_ORIGIN = 'http://localhost:5500';

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path}`;
};

const NAV_ITEMS = [
  { label: 'Parcourir', to: null },
  { label: 'Organiser', to: '/organiser' },
  { label: 'Aide', to: '/aide' },
];

const BADGE_CLASS_BY_VARIANT = {
  active: 'badgeActive',
  upcoming: 'badgeUpcoming',
  past: 'badgePast',
  default: 'badgeDefault',
};


const parseDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};


const getEventStatus = (event) => {
  const now = new Date();
  const opened = parseDate(event?.openedAt);
  const closed = parseDate(event?.closedAt);

  if (opened && closed) {
    if (now < opened) return { label: 'À venir', variant: 'upcoming' };
    if (now > closed) return { label: 'Passé', variant: 'past' };
    return { label: 'En cours', variant: 'active' };
  }

  const fallback = opened || parseDate(event?.date);
  if (!fallback) {
    return { label: event?.status || 'Statut inconnu', variant: 'default' };
  }

  const fallbackDay = new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (fallbackDay.getTime() === today.getTime()) return { label: 'En cours', variant: 'active' };
  if (fallbackDay > today) return { label: 'À venir', variant: 'upcoming' };
  return { label: 'Passé', variant: 'past' };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const getEvents = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchEventsRequest();
      const targetData = data?.events || data?.data || data;
      setEvents(Array.isArray(targetData) ? targetData : []);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des événements :", err);
      if (!silent) setError("Erreur lors de la récupération des données.");
    } finally {
      if (!silent) setLoading(false);
    }
  };


  useEffect(() => {
    getEvents();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const goToAndCloseMenu = (to) => {
    setMenuOpen(false);
    if (to) navigate(to);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getEvents({ silent: true });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getEventDate = (event) =>
    new Date(event.createdAt || event.date || event.eventDate || 0).getTime();

  const recentEvents = [...events]
    .sort((a, b) => getEventDate(b) - getEventDate(a))
    .slice(0, 8);

  const [recentIndex, setRecentIndex] = useState(0);


  useEffect(() => {
    if (recentEvents.length <= 1) return;
    const interval = setInterval(() => {
      setRecentIndex((prev) => (prev + 1) % recentEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentEvents.length]);


  useEffect(() => {
    if (recentIndex >= recentEvents.length) setRecentIndex(0);
  }, [recentEvents.length, recentIndex]);

  const filteredEvents = events.filter((event) =>
    (event.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const goToGallery = (event) => {
    navigate(`/evenement/${event._id || event.id}`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.navbar}>
        <div className={styles.navTop}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>🎟️</span>
            <span>Lenz</span>
          </div>

          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un événement, une catégorie…"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          <div className={styles.mobileSearch}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un événement…"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {NAV_ITEMS.map((item) => (
            <span
              key={item.label}
              className={styles.navLink}
              role="button"
              tabIndex={0}
              onClick={() => goToAndCloseMenu(item.to)}
              onKeyDown={(e) => e.key === 'Enter' && goToAndCloseMenu(item.to)}
            >
              {item.label}
            </span>
          ))}
          <span
            className={styles.navLink}
            role="button"
            tabIndex={0}
            onClick={() => goToAndCloseMenu('/connexion')}
            onKeyDown={(e) => e.key === 'Enter' && goToAndCloseMenu('/connexion')}
          >
            Se connecter
          </span>
          <span
            className={styles.activeLink}
            role="button"
            tabIndex={0}
            onClick={() => goToAndCloseMenu('/creer-evenement')}
            onKeyDown={(e) => e.key === 'Enter' && goToAndCloseMenu('/creer-evenement')}
          >
            Créer un événement
          </span>
          <button className={styles.ctaBtn} onClick={() => goToAndCloseMenu('/inscription')}>
            Ouvrir un compte
          </button>
        </nav>
      </header>

      {recentEvents.length > 0 && (
        <section className={styles.recentStrip} aria-label="Événements récemment ajoutés">
          <div className={styles.recentHeader}>
            <span className={styles.recentTitle}>Récemment ajouté</span>
          </div>

          <div className={styles.recentCarousel}>
            <button
              className={styles.recentArrow}
              onClick={() =>
                setRecentIndex(
                  (prev) => (prev - 1 + recentEvents.length) % recentEvents.length
                )
              }
              aria-label="Événement précédent"
            >
              
            </button>

            {(() => {
              const event = recentEvents[recentIndex];
              if (!event) return null;
              return (
                <button
                  key={event._id || event.id}
                  className={styles.recentCard}
                  onClick={() => goToGallery(event)}
                >
                  <div className={styles.recentImageWrapper}>
                    <img
                      src={resolveImageUrl(event.coverImage || event.image || event.thumbnail) || '/placeholder-event.svg'}
                      alt={event.title || "Image de l'événement"}
                      className={styles.recentImage}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-event.svg';
                      }}
                    />
                  </div>
                  <span className={styles.recentCardTitle}>
                    {event.title || "Titre absent"}
                  </span>
                </button>
              );
            })()}

            <button
              className={styles.recentArrow}
              onClick={() => setRecentIndex((prev) => (prev + 1) % recentEvents.length)}
              aria-label="Événement suivant"
            >
              
            </button>
          </div>

          <div className={styles.recentDots}>
            {recentEvents.map((event, idx) => (
              <button
                key={event._id || event.id}
                className={`${styles.recentDot} ${idx === recentIndex ? styles.recentDotActive : ''}`}
                onClick={() => setRecentIndex(idx)}
                aria-label={`Voir l'événement ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      <main className={styles.content}>

        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Partage & vote étudiant</p>
            <h1>Chaque événement mérite ses meilleurs clichés.</h1>
            <p className={styles.heroSubtitle}>
              Partagez les photos de vos événements, laissez les étudiants voter pour
              leurs favorites et suivez tout depuis un seul tableau de bord.
            </p>
            <div className={styles.heroActions}>
              <button
                className={styles.heroPrimaryBtn}
                onClick={() => navigate('/creer-evenement')}
              >
                Créer un événement
              </button>
              <button className={styles.heroGhostBtn}>Explorer les événements</button>
            </div>
          </div>
          <div className={styles.heroTicket} aria-hidden="true">
            <div className={styles.ticketStub}>
              <div className={styles.ticketTop}>
                <span>ADMIT ONE</span>
                <span>★</span>
              </div>
              <div className={styles.ticketPerforation} />
              <div className={styles.ticketBottom}>
                <span className={styles.ticketBig}>{events.length || '—'}</span>
                <span className={styles.ticketLabel}>événements enregistrés</span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Événements enregistrés</h2>
          {!loading && !error && (
            <span className={styles.resultCount}>
              {filteredEvents.length} résultat{filteredEvents.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && (
          <div className={styles.stateBlock}>
            <div className={styles.spinner} />
            <p>Chargement des événements en cours…</p>
          </div>
        )}

        {error && (
          <div className={styles.stateBlock}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className={styles.grid}>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event) => {
                  const status = getEventStatus(event);
                  const badgeClass =
                    styles[BADGE_CLASS_BY_VARIANT[status.variant]] || styles.badgeDefault;

                  return (
                    <article key={event._id || event.id} className={styles.eventCard}>
                      <div className={styles.cardImageWrapper}>
                        <img
                          src={resolveImageUrl(event.coverImage || event.image || event.thumbnail) || '/placeholder-event.svg'}
                          alt={event.title || "Image de l'événement"}
                          className={styles.cardImage}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-event.svg';
                          }}
                        />
                        <span className={badgeClass}>{status.label}</span>
                      </div>

                      <div className={styles.perforation}>
                        <span className={styles.notchLeft} />
                        <span className={styles.notchLine} />
                        <span className={styles.notchRight} />
                      </div>

                      <div className={styles.cardBody}>
                        <h3>{event.title || "Titre absent"}</h3>
                        <p>{event.description || "Aucune description"}</p>
                        <button
                          className={styles.viewBtn}
                          onClick={() => goToGallery(event)}
                        >
                          Naviguer <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className={styles.emptyText}>Aucun événement disponible ou le serveur n'a pas renvoyé un tableau.</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  ← Précédent
                </button>

                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`dots-${idx}`} className={styles.dots}>…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`${styles.pageBtn} ${
                        currentPage === page ? styles.pageBtnActive : ''
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

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
      </main>

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
            <span className={styles.footerColTitle}>Navigation</span>
            {NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className={styles.footerLink}
                role="button"
                tabIndex={0}
                onClick={() => item.to && navigate(item.to)}
                onKeyDown={(e) => e.key === 'Enter' && item.to && navigate(item.to)}
              >
                {item.label}
              </span>
            ))}
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
    </div>
  );
};
export default Dashboard;