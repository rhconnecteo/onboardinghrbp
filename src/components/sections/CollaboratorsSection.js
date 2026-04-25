import React, { useState, useEffect } from 'react';
import { getCollaborators, calculateStats } from '../../services/api';
import { formatDateFR } from '../../utils/dateFormatter';

function CollaboratorsSection() {
  const [collaborators, setCollaborators] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    cdi: 0,
    cdd: 0,
    intMdj: 0,
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      setIsLoading(true);
      const data = await getCollaborators();

      if (data && data.collaborators) {
        setCollaborators(data.collaborators);
        setStats(calculateStats(data.collaborators));
        setMessage('');
      } else {
        setMessage('📦 Aucun collaborateur trouvé');
        setCollaborators([]);
        setStats({ total: 0, cdi: 0, cdd: 0, intMdj: 0 });
      }
    } catch (error) {
      setMessage('❌ Erreur lors du chargement des collaborateurs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Liste des Collaborateurs</h2>

      {isLoading && (
        <div className="message show warning">
          ⏳ Chargement des données...
        </div>
      )}

      {message && !isLoading && (
        <div className="message show warning">
          {message}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total</h3>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card success">
          <h3>CDI</h3>
          <div className="value">{stats.cdi}</div>
        </div>
        <div className="stat-card warning">
          <h3>CDD</h3>
          <div className="value">{stats.cdd}</div>
        </div>
        <div className="stat-card">
          <h3>INT MDJ</h3>
          <div className="value">{stats.intMdj}</div>
        </div>
      </div>

      {!isLoading && collaborators.length === 0 ? (
        <p style={{ marginTop: '24px' }}>Aucun collaborateur enregistré.</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Fonction</th>
                <th>Statut</th>
                <th>Rattachement</th>
                <th>Date Intégration</th>
                <th>Matricule Groupe</th>
              </tr>
            </thead>
            <tbody>
              {collaborators.map((collab, index) => (
                <tr key={index}>
                  <td>{collab.matricule || '-'}</td>
                  <td>{collab.nom || '-'}</td>
                  <td>{collab.fonction || '-'}</td>
                  <td>{collab.statut || '-'}</td>
                  <td>{collab.rattachement || '-'}</td>
                  <td>{formatDateFR(collab.dateIntegration) || '-'}</td>
                  <td>{collab.matriculeGroupe || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CollaboratorsSection;
