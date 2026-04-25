import React, { useState, useEffect } from 'react';
import { getIncompleteCollaborators, saveCollaborator } from '../../services/api';
import EditModal from '../EditModal';
import { EditIcon } from '../EditIcon';

function IncompleteSection() {
  const [incompleteData, setIncompleteData] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadIncompleteData();
  }, []);

  const loadIncompleteData = async () => {
    try {
      setIsLoading(true);
      const data = await getIncompleteCollaborators();

      if (data && data.incomplete && data.incomplete.length > 0) {
        setIncompleteData(data.incomplete);
        setMessage('');
      } else {
        setMessage('✅ Tous les collaborateurs sont complets!');
        setIncompleteData([]);
      }
    } catch (error) {
      setMessage('❌ Erreur lors du chargement');
      console.error(error);
      setIncompleteData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMissingFields = (item) => {
    const missing = [];
    const fields = {
      matricule: 'Matricule',
      matriculeGroupe: 'Matricule Groupe',
      statut: 'Statut',
      nom: 'Nom',
      fonction: 'Fonction',
      rattachement: 'Rattachement',
      dateIntegration: 'Date Intégration',
      dateFin: 'Date Fin'
    };

    Object.entries(fields).forEach(([key, label]) => {
      if (!String(item[key] || '').trim()) {
        missing.push(label);
      }
    });

    return missing.join(', ');
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      await saveCollaborator(formData);
      setMessage('✅ Collaborateur mis à jour!');
      
      setTimeout(() => {
        loadIncompleteData();
      }, 1000);
    } catch (error) {
      setMessage('❌ Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Collaborateurs à Compléter</h2>

      {isLoading && (
        <div className="message show warning">
          ⏳ Chargement...
        </div>
      )}

      {message && !isLoading && (
        <div className={`message show ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {!isLoading && incompleteData.length === 0 ? (
        <p>Aucun enregistrement incomplet.</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Fonction</th>
                <th>Champs Manquants</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incompleteData.map((item, index) => (
                <tr key={index}>
                  <td>{String(item.matricule || '').trim() || '❌'}</td>
                  <td>{String(item.nom || '').trim() || '❌'}</td>
                  <td>{String(item.fonction || '').trim() || '❌'}</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    {getMissingFields(item)}
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(item)}
                      title="Éditer"
                    >
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditModal
        collaborator={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default IncompleteSection;
