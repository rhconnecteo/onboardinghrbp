/**
 * Formate une date au format DD/MM/YYYY
 * @param {string | Date} date - La date à formater
 * @returns {string} - La date formatée en DD/MM/YYYY
 */
export function formatDateFR(date) {
  if (!date) return '';

  let day, month, year;

  if (typeof date === 'string') {
    // Si c'est une date ISO (avec ou sans fuseau horaire)
    if (date.includes('T')) {
      // Créer une Date object depuis la string ISO
      // Attention: new Date() traite la date comme UTC et la convertit selon le fuseau horaire local
      const dateObj = new Date(date);
      
      // Vérifier si c'est une date valide
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      // Extraire les composants en utilisant le fuseau horaire LOCAL
      day = dateObj.getDate();
      month = dateObj.getMonth() + 1;
      year = dateObj.getFullYear();
    } else {
      // Format simple YYYY-MM-DD
      const parts = date.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        return '';
      }
    }
  } else if (date instanceof Date) {
    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();
  } else {
    return '';
  }

  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');

  return `${dayStr}/${monthStr}/${year}`;
}
