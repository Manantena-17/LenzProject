import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEventRequest } from '../api/events.api';
import styles from './Event.module.css';

const initialForm = {
  title: '',
  description: '',
  thumbnail: '',
  limitPerPerson: '',
  limitContributors: '',
  limitTotalImages: '',
  openedAt: '',
  closedAt: '',
  votingEndsAt: '',
};

const Event = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/connexion', { state: { from: '/creer-evenement' } });
      return;
    }

    if (!form.title.trim() || !form.openedAt || !form.closedAt || !form.votingEndsAt) {
      setError("Le titre, la date d'ouverture, de fermeture et de fin de vote sont obligatoires.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        limitPerPerson: form.limitPerPerson ? Number(form.limitPerPerson) : 0,
        limitContributors: form.limitContributors ? Number(form.limitContributors) : 0,
        limitTotalImages: form.limitTotalImages ? Number(form.limitTotalImages) : 0,
      };
      await createEventRequest(payload, token);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error("Erreur lors de la création de l'événement :", err);
      if (err?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/connexion', { state: { from: '/creer-evenement' } });
        return;
      }
      setError("Une erreur est survenue lors de la création de l'événement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <p className={styles.eyebrow}>Nouvel événement</p>
          <h1>Donnez vie à votre événement</h1>
          <p className={styles.subtitle}>
            Définissez les règles de contribution et de vote pour cet événement.
          </p>
        </div>

        {success && (
          <div className={styles.successBanner}>
            ✓ Événement créé avec succès — redirection en cours…
          </div>
        )}

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title">Titre de l'événement *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex : Mariage de Sarah & Tom"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez votre événement en quelques phrases…"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="thumbnail">Image de couverture (URL)</label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="text"
              value={form.thumbnail}
              onChange={handleChange}
              placeholder="https://…"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="limitPerPerson">Limite de photos / personne</label>
              <input
                id="limitPerPerson"
                name="limitPerPerson"
                type="number"
                min="0"
                value={form.limitPerPerson}
                onChange={handleChange}
                placeholder="0 = illimité"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="limitContributors">Limite de contributeurs</label>
              <input
                id="limitContributors"
                name="limitContributors"
                type="number"
                min="0"
                value={form.limitContributors}
                onChange={handleChange}
                placeholder="0 = illimité"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="limitTotalImages">Limite totale de photos</label>
            <input
              id="limitTotalImages"
              name="limitTotalImages"
              type="number"
              min="0"
              value={form.limitTotalImages}
              onChange={handleChange}
              placeholder="0 = illimité"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="openedAt">Ouverture des contributions *</label>
              <input
                id="openedAt"
                name="openedAt"
                type="datetime-local"
                value={form.openedAt}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="closedAt">Fermeture des contributions *</label>
              <input
                id="closedAt"
                name="closedAt"
                type="datetime-local"
                value={form.closedAt}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="votingEndsAt">Fin du vote *</label>
            <input
              id="votingEndsAt"
              name="votingEndsAt"
              type="datetime-local"
              value={form.votingEndsAt}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/')}
            >
              Annuler
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Création en cours…' : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Event;