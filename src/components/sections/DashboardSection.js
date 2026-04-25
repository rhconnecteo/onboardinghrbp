import React, { useState, useEffect, useCallback } from 'react';
import { getCollaborators } from '../../services/api';
import { formatDateFR } from '../../utils/dateFormatter';
import { getColorStyle, getColorBadgeStyle } from '../../utils/colorUtils';

function DashboardSection() {
  const [collaborators, setCollaborators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Filtres
  const [filters, setFilters] = useState({
    dateIntegrationFrom: '',
    dateIntegrationTo: '',
    searchMatriculeNom: '',
    fonction: '',
    rattachement: '',
  });

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    complete: 0,
    incomplete: 0,
    fonctions: {},
    rattachements: {},
  });

  const [filteredCollaborators, setFilteredCollaborators] = useState([]);

  const calculateStats = (collabs) => {
    let complete = 0;
    let incomplete = 0;
    const fonctions = {};
    const rattachements = {};

    collabs.forEach((collab) => {
      // Vérifier si le collaborateur a toutes les informations
      const hasEmptyField = Object.values(collab).some(
        (value) => !String(value || '').trim()
      );

      if (hasEmptyField) {
        incomplete++;
      } else {
        complete++;
      }

      // Compter les fonctions
      if (collab.fonction) {
        fonctions[collab.fonction] = (fonctions[collab.fonction] || 0) + 1;
      }

      // Compter les rattachements
      if (collab.rattachement) {
        rattachements[collab.rattachement] =
          (rattachements[collab.rattachement] || 0) + 1;
      }
    });

    setStats({
      total: collabs.length,
      complete,
      incomplete,
      fonctions,
      rattachements,
    });
  };

  const loadCollaborators = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollaborators();

      if (data && data.collaborators) {
        setCollaborators(data.collaborators);
        calculateStats(data.collaborators);
        setMessage('');
      } else {
        setMessage('📦 Aucun collaborateur trouvé');
        setCollaborators([]);
      }
    } catch (error) {
      setMessage('❌ Erreur lors du chargement des collaborateurs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...collaborators];

    // Filtre date d'intégration
    if (filters.dateIntegrationFrom) {
      filtered = filtered.filter(
        (c) =>
          new Date(c.dateIntegration) >=
          new Date(filters.dateIntegrationFrom)
      );
    }

    if (filters.dateIntegrationTo) {
      filtered = filtered.filter(
        (c) =>
          new Date(c.dateIntegration) <= new Date(filters.dateIntegrationTo)
      );
    }

    // Filtre matricule et nom combinés
    if (filters.searchMatriculeNom) {
      const search = filters.searchMatriculeNom.toLowerCase();
      filtered = filtered.filter((c) => {
        const matricule = String(c.matricule || '').toLowerCase();
        const nom = String(c.nom || '').toLowerCase();
        return matricule.includes(search) || nom.includes(search);
      });
    }

    // Filtre fonction
    if (filters.fonction) {
      filtered = filtered.filter(
        (c) => String(c.fonction || '').toLowerCase() === filters.fonction.toLowerCase()
      );
    }

    // Filtre rattachement
    if (filters.rattachement) {
      filtered = filtered.filter(
        (c) => String(c.rattachement || '').toLowerCase() === filters.rattachement.toLowerCase()
      );
    }

    setFilteredCollaborators(filtered);
  }, [filters, collaborators]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const calculateDateDifference = (dateIntegration, dateFin) => {
    if (!dateIntegration || !dateFin) return '-';
    
    const start = new Date(dateIntegration);
    const end = new Date(dateFin);
    
    if (isNaN(start) || isNaN(end)) return '-';
    
    const diffTime = end - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMonths > 0) {
      return `${diffMonths} mois ${diffDays % 30} jours`;
    }
    return `${diffDays} jours`;
  };

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  useEffect(() => {
    applyFilters();
  }, [filters, collaborators, applyFilters]);

  return (
    <div className="dashboard-section">
      <h2>📊 Tableau de Bord</h2>

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

      {!isLoading && (
        <>
          {/* Statistiques principales */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Collaborateurs</h3>
              <div className="value">{stats.total}</div>
            </div>
            <div className="stat-card success">
              <h3>Information Complète</h3>
              <div className="value">{stats.complete}</div>
            </div>
            <div className="stat-card warning">
              <h3>Information Incomplète</h3>
              <div className="value">{stats.incomplete}</div>
            </div>
          </div>

          {/* Répartition par fonction */}
          <div className="chart-section">
            <h3>Répartition par Fonction</h3>
            <div className="distribution-grid">
              {Object.entries(stats.fonctions).length > 0 ? (
                Object.entries(stats.fonctions).map(([fonction, count]) => (
                  <div
                    key={fonction}
                    className="distribution-card"
                    style={getColorStyle(fonction)}
                  >
                    <div className="distribution-label">{fonction}</div>
                    <div className="distribution-value">{count}</div>
                  </div>
                ))
              ) : (
                <p>Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* Répartition par rattachement */}
          <div className="chart-section">
            <h3>Répartition par Rattachement</h3>
            <div className="distribution-grid">
              {Object.entries(stats.rattachements).length > 0 ? (
                Object.entries(stats.rattachements).map(
                  ([rattachement, count]) => (
                    <div
                      key={rattachement}
                      className="distribution-card"
                      style={getColorStyle(rattachement)}
                    >
                      <div className="distribution-label">
                        {rattachement}
                      </div>
                      <div className="distribution-value">{count}</div>
                    </div>
                  )
                )
              ) : (
                <p>Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="filters-section">
            <h3>🔍 Filtres</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="dateIntegrationFrom">
                  Date d'intégration (De)
                </label>
                <input
                  type="date"
                  id="dateIntegrationFrom"
                  name="dateIntegrationFrom"
                  value={filters.dateIntegrationFrom}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="dateIntegrationTo">
                  Date d'intégration (À)
                </label>
                <input
                  type="date"
                  id="dateIntegrationTo"
                  name="dateIntegrationTo"
                  value={filters.dateIntegrationTo}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="searchMatriculeNom">
                  Matricule / Nom
                </label>
                <input
                  type="text"
                  id="searchMatriculeNom"
                  name="searchMatriculeNom"
                  value={filters.searchMatriculeNom}
                  onChange={handleFilterChange}
                  placeholder="Chercher par matricule ou nom..."
                />
              </div>

              <div className="filter-group">
                <label htmlFor="fonction">
                  Fonction
                </label>
                <select
                  id="fonction"
                  name="fonction"
                  value={filters.fonction}
                  onChange={handleFilterChange}
                >
                  <option value="">-- Toutes les fonctions --</option>
                  {Object.keys(stats.fonctions).map((func) => (
                    <option key={func} value={func}>
                      {func}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="rattachement">
                  Rattachement
                </label>
                <select
                  id="rattachement"
                  name="rattachement"
                  value={filters.rattachement}
                  onChange={handleFilterChange}
                >
                  <option value="">-- Tous les rattachements --</option>
                  {Object.keys(stats.rattachements).map((ratt) => (
                    <option key={ratt} value={ratt}>
                      {ratt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tableau résultats filtrés */}
          <div className="filtered-results">
            <h3>
              Résultats ({filteredCollaborators.length} /{' '}
              {stats.total})
            </h3>
            {filteredCollaborators.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom</th>
                      <th>Fonction</th>
                      <th>Rattachement</th>
                      <th>Date Intégration</th>
                      <th>Date Fin</th>
                      <th>Durée</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollaborators.map((collab, index) => {
                      const hasEmptyField = Object.values(collab).some(
                        (value) => !String(value || '').trim()
                      );
                      return (
                        <tr key={index} className={hasEmptyField ? 'incomplete' : ''}>
                          <td>{collab.matricule || '-'}</td>
                          <td>{collab.nom || '-'}</td>
                          <td>
                            <span
                              className="colored-badge"
                              style={getColorBadgeStyle(collab.fonction)}
                            >
                              {collab.fonction || '-'}
                            </span>
                          </td>
                          <td>
                            <span
                              className="colored-badge"
                              style={getColorBadgeStyle(collab.rattachement)}
                            >
                              {collab.rattachement || '-'}
                            </span>
                          </td>
                          <td>{formatDateFR(collab.dateIntegration) || '-'}</td>
                          <td>{formatDateFR(collab.dateFin) || '-'}</td>
                          <td>
                            {calculateDateDifference(
                              collab.dateIntegration,
                              collab.dateFin
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                hasEmptyField ? 'incomplete' : 'complete'
                              }`}
                            >
                              {hasEmptyField
                                ? 'Incomplète'
                                : 'Complète'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">Aucun collaborateur ne correspond aux filtres</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardSection;
