import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import styles from './Event.module.css';
import { createEventRequest } from '../api/events.api';

registerLocale('fr', fr);

const initialForm = {
  title: '',
  description: '',
  thumbnail: '',
  limitPerPerson: '',
  limitContributors: '',
  limitTotalImages: '',
  openedAt: null,
  closedAt: null,
  votingEndsAt: null,
  photographerIds: []
};

const Event = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]); 
  const [photographerSearch, setPhotographerSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [coverMode, setCoverMode] = useState('upload'); 
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); 
  const [isDragging, setIsDragging] = useState(false);


  const handleLogout = () => {
  
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear(); 
    navigate('/connexion', { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5500/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const rawUsers = Array.isArray(data) ? data : data.users || data.data || [];
          setUsers(rawUsers.map((u) => ({ ...u, id: u.id || u._id })));
        } else {
          console.error("Réponse serveur non-OK :", response.status);
        }
      } catch (err) {
        console.error("Impossible de charger les utilisateurs :", err);
      }
    };

    fetchUsers();
  }, []);

  
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleDateChange = (field, date) => {
    setForm((prev) => ({ ...prev, [field]: date }));
  };

  const handlePhotographerToggle = (userId) => {
    setForm((prev) => {
      const isAlreadySelected = prev.photographerIds.includes(userId);
      const updatedIds = isAlreadySelected
        ? prev.photographerIds.filter((id) => id !== userId)
        : [...prev.photographerIds, userId];

      return { ...prev, photographerIds: updatedIds };
    });
  };

  const switchCoverMode = (mode) => {
    setCoverMode(mode);
    if (mode === 'url') {
      setThumbnailFile(null);
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
    } else {
      setForm((prev) => ({ ...prev, thumbnail: '' }));
    }
  };

  const applyFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Le fichier sélectionné n'est pas une image.");
      return;
    }

    setError(null);
    setThumbnailFile(file);

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    applyFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setThumbnailFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = photographerSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      (user.name || user.username || '').toLowerCase().includes(query)
    );
  }, [users, photographerSearch]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
   
    const userRaw = localStorage.getItem('user');
    const currentUser = userRaw ? JSON.parse(userRaw) : null;
    const userId = currentUser?.id || currentUser?._id;

    if (!token || !userId) {
      navigate('/connexion', { state: { from: '/creer-evenement' } });
      return;
    }

    if (!form.title.trim() || !form.openedAt || !form.closedAt || !form.votingEndsAt) {
      setError("Le titre, la date d'ouverture, de fermeture et de fin de vote sont obligatoires.");
      return;
    }

    try {
      setSubmitting(true);

      let payload;

      if (coverMode === 'upload' && thumbnailFile) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('limitPerPerson', form.limitPerPerson ? Number(form.limitPerPerson) : 0);
        formData.append('limitContributors', form.limitContributors ? Number(form.limitContributors) : 0);
        formData.append('limitTotalImages', form.limitTotalImages ? Number(form.limitTotalImages) : 0);
        formData.append('openedAt', form.openedAt.toISOString());
        formData.append('closedAt', form.closedAt.toISOString());
        formData.append('votingEndsAt', form.votingEndsAt.toISOString());
        formData.append('date', form.openedAt.toISOString());
        
        formData.append('organizerId', userId); 
        formData.append('userId', userId); 

        formData.append('photographerIds', JSON.stringify(form.photographerIds));
        formData.append('thumbnail', thumbnailFile);

        payload = formData;
      } else {
     
        payload = {
          ...form,

          organizerId: userId,
          userId: userId,
          limitPerPerson: form.limitPerPerson ? Number(form.limitPerPerson) : 0,
          limitContributors: form.limitContributors ? Number(form.limitContributors) : 0,
          limitTotalImages: form.limitTotalImages ? Number(form.limitTotalImages) : 0,
          openedAt: form.openedAt ? form.openedAt.toISOString() : null,
          closedAt: form.closedAt ? form.closedAt.toISOString() : null,
          votingEndsAt: form.votingEndsAt ? form.votingEndsAt.toISOString() : null,
          date: form.openedAt ? form.openedAt.toISOString() : null,
        };
      }

      await createEventRequest(payload, token);
      setSuccess(true);
      
      setTimeout(() => navigate('/organiser'), 1200); 
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
        <div className={styles.perforation} aria-hidden="true">
          <span className={styles.notch} />
          <span className={styles.notchLine} />
          <span className={styles.notch} />
        </div>
        <div className={styles.formHeader}>
          <div className={styles.headerTop}>
            <p className={styles.eyebrow}>Nouvel événement</p>
            <button 
              type="button" 
              onClick={handleLogout} 
              className={styles.logoutBtn}
              title="Déconnexion sécurisée"
            >
              🚪 Déconnexion
            </button>
          </div>
          <h1>Donnez vie à votre événement</h1>
          <p className={styles.subtitle}>
            Définissez les règles de contribution, de vote et désignez vos photographes.
          </p>
        </div>

        <div aria-live="polite">
          {success && (
            <div className={styles.successBanner}>
              ✓ Événement créé avec succès — redirection en cours…
            </div>
          )}
          {error && <div className={styles.errorBanner}>{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="title">Titre de l'événement *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex : Gala de fin d'année 2026"
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
            <label>Image de couverture</label>

            <div className={styles.segmentedControl} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={coverMode === 'upload'}
                className={`${styles.segmentBtn} ${coverMode === 'upload' ? styles.segmentBtnActive : ''}`}
                onClick={() => switchCoverMode('upload')}
              >
                📁 Uploader une image
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={coverMode === 'url'}
                className={`${styles.segmentBtn} ${coverMode === 'url' ? styles.segmentBtnActive : ''}`}
                onClick={() => switchCoverMode('url')}
              >
                🔗 Coller une URL
              </button>
            </div>

            {coverMode === 'upload' ? (
              filePreview ? (
                <div className={styles.previewWrapper}>
                  <img
                    src={filePreview}
                    alt="Aperçu de l'image de couverture"
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className={styles.removePreviewBtn}
                    aria-label="Retirer l'image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label
                  className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    id="thumbnailFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.visuallyHidden}
                  />
                  <span className={styles.dropzoneIcon} aria-hidden="true">🖼️</span>
                  <span className={styles.dropzoneText}>
                    Glissez une image ici ou <span className={styles.dropzoneLink}>parcourez vos fichiers</span>
                  </span>
                  <span className={styles.dropzoneHint}>PNG, JPG jusqu'à quelques Mo</span>
                </label>
              )
            ) : (
              <>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="text"
                  value={form.thumbnail}
                  onChange={handleChange}
                  placeholder="https://…"
                />
                {form.thumbnail && (
                  <div className={styles.previewWrapper}>
                    <img
                      src={form.thumbnail}
                      alt="Aperçu de l'image de couverture"
                      className={styles.previewImage}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      onLoad={(e) => { e.target.style.display = 'block'; }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.photographersHeader}>
              <label htmlFor="photographerSearch">Désigner les photographes de l'événement</label>
              {form.photographerIds.length > 0 && (
                <span className={styles.photographerCount}>
                  {form.photographerIds.length} sélectionné{form.photographerIds.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className={styles.fieldHelper}>
              Sélectionnez les membres autorisés à ajouter des photos.
            </p>

            {users.length > 4 && (
              <input
                id="photographerSearch"
                type="text"
                value={photographerSearch}
                onChange={(e) => setPhotographerSearch(e.target.value)}
                placeholder="Rechercher un élève…"
                className={styles.photographerSearch}
              />
            )}

            <div className={styles.photographersList}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isChecked = form.photographerIds.includes(user.id);
                  return (
                    <label
                      key={user.id}
                      className={`${styles.photographerPill} ${isChecked ? styles.photographerPillActive : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePhotographerToggle(user.id)}
                        className={styles.visuallyHidden}
                      />
                      <span>{user.name || user.username || `User #${user.id}`}</span>
                    </label>
                  );
                })
              ) : (
                <p className={styles.emptyText}>
                  {users.length === 0 ? 'Aucun utilisateur trouvé.' : 'Aucun résultat pour cette recherche.'}
                </p>
              )}
            </div>
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
              <DatePicker
                id="openedAt"
                selected={form.openedAt}
                onChange={(date) => handleDateChange('openedAt', date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Heure"
                dateFormat="dd/MM/yyyy HH:mm"
                locale="fr"
                placeholderText="Choisir une date et une heure"
                wrapperClassName={styles.datePickerWrapper}
                autoComplete="off"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="closedAt">Fermeture des contributions *</label>
              <DatePicker
                id="closedAt"
                selected={form.closedAt}
                onChange={(date) => handleDateChange('closedAt', date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Heure"
                dateFormat="dd/MM/yyyy HH:mm"
                locale="fr"
                placeholderText="Choisir une date et une heure"
                minDate={form.openedAt || null}
                wrapperClassName={styles.datePickerWrapper}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="votingEndsAt">Fin du vote *</label>
            <DatePicker
              id="votingEndsAt"
              selected={form.votingEndsAt}
              onChange={(date) => handleDateChange('votingEndsAt', date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Heure"
              dateFormat="dd/MM/yyyy HH:mm"
              locale="fr"
              placeholderText="Choisir une date et une heure"
              minDate={form.closedAt || form.openedAt || null}
              wrapperClassName={styles.datePickerWrapper}
              autoComplete="off"
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