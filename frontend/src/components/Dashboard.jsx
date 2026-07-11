import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEventsRequest } from '../api/events.api';
import styles from './Dashboard.module.css';

const ITEMS_PER_PAGE = 6;

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchEventsRequest();
        console.log("Données brutes reçues du serveur :", data);
        const targetData = data?.events || data?.data || data;
        setEvents(Array.isArray(targetData) ? targetData : []);
      } catch (err) {
        console.error("Erreur attrapée par useEffect :", err);
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };
    getEvents();
  }, []);

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

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.navbar}>
        <div className={styles.navTop}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>🎟️</span>
            <span>Gestion d'Événements</span>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <button
            className={styles.burger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Ouvrir le menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          <span className={styles.navLink}>Parcourir</span>
          <span className={styles.navLink}>Organiser</span>
          <span className={styles.navLink}>Aide</span>
          <span
            className={styles.activeLink}
            onClick={() => navigate('/creer-evenement')}
          >
            Créer un événement
          </span>
          <span className={styles.navLink}>Se connecter</span>
          <button className={styles.ctaBtn}>Ouvrir un compte</button>
        </nav>
      </header>

      <main className={styles.content}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Billetterie & inscriptions</p>
            <h1>Chaque événement mérite sa scène.</h1>
            <p className={styles.heroSubtitle}>
              Créez, publiez et suivez vos événements depuis un seul tableau de bord —
              des concerts intimistes aux conférences de grande envergure.
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
                paginatedEvents.map((event) => (
                  <article key={event._id || event.id} className={styles.eventCard}>
                    <div className={styles.cardImageWrapper}>
                      <img
                        src={event.coverImage || event.image || '/placeholder-event.jpg'}
                        alt={event.title || "Image de l'événement"}
                        className={styles.cardImage}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-event.jpg';
                        }}
                      />
                      <span
                        className={
                          event.status === "En cours"
                            ? styles.badgeActive
                            : styles.badgeDefault
                        }
                      >
                        {event.status || "Statut inconnu"}
                      </span>
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
                        onClick={() => alert(`Navigation vers : ${event.title}`)}
                      >
                        Naviguer <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                ))
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

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>🎟️</span>
            <span>Gestion d'Événements</span>
          </div>
          <p>Contactez-nous :0346505549</p>
        </div>
        <p className={styles.footerBottom}>
          © {new Date().getFullYear()} Gestion d'Événements — Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;