import React, { useState, useEffect } from 'react';

function EditModal({ collaborator, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(collaborator || {});

  useEffect(() => {
    if (collaborator && isOpen) {
      setFormData(collaborator);
    }
  }, [collaborator, isOpen]);

  const isFieldMissing = (fieldName) => {
    return !String(formData[fieldName] || '').trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Compléter les données</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Matricule</label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('matricule')}
                className={isFieldMissing('matricule') ? 'input-missing' : 'input-completed'}
              />
            </div>

            <div className="form-group">
              <label>Matricule Groupe</label>
              <input
                type="text"
                name="matriculeGroupe"
                value={formData.matriculeGroupe || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('matriculeGroupe')}
                className={isFieldMissing('matriculeGroupe') ? 'input-missing' : 'input-completed'}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('nom')}
                className={isFieldMissing('nom') ? 'input-missing' : 'input-completed'}
              />
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select
                name="statut"
                value={formData.statut || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('statut')}
                className={isFieldMissing('statut') ? 'input-missing' : 'input-completed'}
              >
                <option value="">-- Sélectionner --</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="INT MDJ">INT MDJ</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fonction</label>
              <input
                type="text"
                name="fonction"
                value={formData.fonction || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('fonction')}
                className={isFieldMissing('fonction') ? 'input-missing' : 'input-completed'}
              />
            </div>

            <div className="form-group">
              <label>Rattachement</label>
              <input
                type="text"
                name="rattachement"
                value={formData.rattachement || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('rattachement')}
                className={isFieldMissing('rattachement') ? 'input-missing' : 'input-completed'}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date d'intégration</label>
              <input
                type="date"
                name="dateIntegration"
                value={formData.dateIntegration || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('dateIntegration')}
                className={isFieldMissing('dateIntegration') ? 'input-missing' : 'input-completed'}
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin || ''}
                onChange={handleChange}
                disabled={!isFieldMissing('dateFin')}
                className={isFieldMissing('dateFin') ? 'input-missing' : 'input-completed'}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
