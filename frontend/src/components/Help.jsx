import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Help.module.css';

const FAQ_CATEGORIES = ['Toutes', 'Événements', 'Photos & votes', 'Compte'];

const FAQ_ITEMS = [
  {
    category: 'Événements',
    question: "Comment créer un événement sur Lenz ?",
    answer:
      "Depuis le tableau de bord, cliquez sur « Créer un événement », renseignez un titre, une description et une image de couverture, puis validez. Il apparaît immédiatement dans votre espace organisateur.",
  },
  {
    category: 'Événements',
    question: "Puis-je modifier un événement après sa création ?",
    answer:
      "Oui. Rendez-vous dans l'espace « Organiser », repérez l'événement concerné et cliquez sur « Modifier ». Les changements sont visibles immédiatement pour les participants.",
  },
  {
    category: 'Événements',
    question: "Comment supprimer un événement ?",
    answer:
      "Dans l'espace « Organiser », cliquez sur « Supprimer » puis confirmez. Cette action est définitive : les photos et votes associés sont également supprimés.",
  },
  {
    category: 'Photos & votes',
    question: "Qui peut voter pour une photo ?",
    answer:
      "Tout étudiant connecté peut voter une fois par photo sur un événement donné. Les votes sont anonymes pour les autres participants.",
  },
  {
    category: 'Photos & votes',
    question: "Y a-t-il une limite au nombre de photos que je peux partager ?",
    answer:
      "Non, vous pouvez partager autant de photos que vous le souhaitez tant que l'événement est encore ouvert aux contributions.",
  },
  {
    category: 'Photos & votes',
    question: "Puis-je retirer une photo que j'ai publiée ?",
    answer:
      "Oui, ouvrez la galerie de l'événement, sélectionnez votre photo et choisissez « Retirer ». Les votes associés sont perdus.",
  },
  {
    category: 'Compte',
    question: "Comment réinitialiser mon mot de passe ?",
    answer:
      "Sur la page de connexion, cliquez sur « Mot de passe oublié » et suivez les instructions envoyées par e-mail.",
  },
  {
    category: 'Compte',
    question: "Comment supprimer mon compte ?",
    answer:
      "Contactez-nous directement à contact@lenz.app avec l'adresse e-mail associée à votre compte ; nous traitons les demandes sous 48h.",
  },
];

const Help = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaq = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = category === 'Toutes' || item.category === category;
      const matchesSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Centre d'aide</p>
        <h1>Une question ? On répond ici.</h1>
        <p className={styles.subtitle}>
          Parcourez la foire aux questions ou contactez-nous directement si vous ne trouvez pas votre réponse.
        </p>

        <div className={styles.searchBar}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une question…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
          />
        </div>
      </header>

      <div className={styles.categoryTabs}>
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryTab} ${category === cat ? styles.categoryTabActive : ''}`}
            onClick={() => {
              setCategory(cat);
              setOpenIndex(null);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className={styles.faqList}>
        {filteredFaq.length > 0 ? (
          filteredFaq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}>⌄</span>
                </button>
                {isOpen && <p className={styles.faqAnswer}>{item.answer}</p>}
              </div>
            );
          })
        ) : (
          <p className={styles.emptyText}>Aucun résultat pour « {search} ».</p>
        )}
      </section>

      <section className={styles.contactCard}>
        <div>
          <h2>Toujours besoin d'aide ?</h2>
          <p>Notre équipe vous répond sous 24h ouvrées.</p>
        </div>
        <div className={styles.contactActions}>
          <a className={styles.contactBtn} href="mailto:contact@lenz.app">
            ✉ contact@lenz.app
          </a>
          <a className={styles.contactBtnGhost} href="tel:0346505549">
            ☎ 03 46 50 55 49
          </a>
        </div>
      </section>

      <button className={styles.backLink} onClick={() => navigate('/')}>
        ← Retour au tableau de bord
      </button>
    </div>
  );
};

export default Help;