import React, { useState, useEffect } from 'react';
import { getBase, saveCollaborator } from '../../services/api';

function FormSection() {
  const [formData, setFormData] = useState({
    matricule: '',
    matriculeGroupe: '',
    statut: '',
    nom: '',
    fonction: '',
    rattachement: '',
    dateIntegration: '',
    dateFin: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseData, setBaseData] = useState({ fonctions: [], rattachements: [] });

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    try {
      const data = await getBase();
      if (data) {
        setBaseData({
          fonctions: data.fonctions || [],
          rattachements: data.rattachements || [],
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la base:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('📤 Envoi des données...');
    setMessageType('warning');

    try {
      const result = await saveCollaborator(formData);

      if (result && result.success) {
        setMessage('✅ Collaborateur enregistré avec succès');
        setMessageType('success');
        setFormData({
          matricule: '',
          matriculeGroupe: '',
          statut: '',
          nom: '',
          fonction: '',
          rattachement: '',
          dateIntegration: '',
          dateFin: '',
        });

        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage('❌ Erreur lors de l\'enregistrement des données');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'envoi');
      setMessageType('error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Formulaire Collaborateur</h2>

      {message && (
        <div className={`message show ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="matricule">Matricule</label>
            <input
              type="text"
              id="matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleInputChange}
              placeholder="Entrez le matricule"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="matriculeGroupe">Matricule Groupe</label>
            <input
              type="text"
              id="matriculeGroupe"
              name="matriculeGroupe"
              value={formData.matriculeGroupe}
              onChange={handleInputChange}
              placeholder="Entrez le matricule groupe"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Entrez le nom"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner un statut --</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="INT MDJ">INT MDJ</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fonction">Fonction</label>
            <select
              id="fonction"
              name="fonction"
              value={formData.fonction}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner une fonction --</option>
              {baseData.fonctions.map((fonction, index) => (
                <option key={index} value={fonction}>
                  {fonction}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rattachement">Rattachement</label>
            <select
              id="rattachement"
              name="rattachement"
              value={formData.rattachement}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Sélectionner un rattachement --</option>
              {baseData.rattachements.map((rattachement, index) => (
                <option key={index} value={rattachement}>
                  {rattachement}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateIntegration">Date d'intégration</label>
            <input
              type="date"
              id="dateIntegration"
              name="dateIntegration"
              value={formData.dateIntegration}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateFin">Date de fin (optionnel)</label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={formData.dateFin}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}

export default FormSection;
