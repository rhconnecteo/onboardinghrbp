// Configuration API
const API_URL = "https://script.google.com/macros/s/AKfycbwFeowZnHTtxGYp9MLg6pA_80s27vY0rMx2tMuIF8icMhu6C5WgOwvjgpPZAK79VSrQ/exec";

async function fetchFromAPI(params) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}?${queryString}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur API:', error.message);
    throw error;
  }
}

export async function getBase() {
  try {
    const data = await fetchFromAPI({ action: 'getBase' });
    return data;
  } catch (error) {
    console.error('❌ Erreur base:', error);
    throw error;
  }
}

export async function getCollaborators() {
  try {
    const data = await fetchFromAPI({ action: 'getUsers' });
    return { collaborators: Array.isArray(data) ? data : [] };
  } catch (error) {
    console.error('❌ Erreur collaborateurs:', error);
    throw error;
  }
}

export async function getIncompleteCollaborators() {
  try {
    const data = await fetchFromAPI({ action: 'getUsers' });
    
    const incomplete = Array.isArray(data) 
      ? data.filter(collab => {
          return Object.values(collab).some(value => !String(value || '').trim());
        })
      : [];
    
    return { incomplete };
  } catch (error) {
    console.error('❌ Erreur incomplets:', error);
    throw error;
  }
}

export async function saveCollaborator(collaboratorData) {
  try {
    const data = await fetchFromAPI({
      action: 'addUser',
      ...collaboratorData,
    });
    return data;
  } catch (error) {
    console.error('❌ Erreur enregistrement:', error);
    throw error;
  }
}

export function calculateStats(collaborators) {
  if (!Array.isArray(collaborators) || collaborators.length === 0) {
    return { total: 0, cdi: 0, cdd: 0, intMdj: 0 };
  }

  return {
    total: collaborators.length,
    cdi: collaborators.filter((c) => c.statut === 'CDI').length,
    cdd: collaborators.filter((c) => c.statut === 'CDD').length,
    intMdj: collaborators.filter((c) => c.statut === 'INT MDJ').length,
  };
}
