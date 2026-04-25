/**
 * Génère une couleur cohérente basée sur une chaîne de texte
 * @param {string} text - Le texte à hacher
 * @returns {object} - Objet avec les propriétés de couleur
 */
export function getColorForText(text) {
  if (!text) return getDefaultColor();

  // Liste de couleurs attrayantes
  const colors = [
    { bg: '#E3F2FD', border: '#1976D2', text: '#0D47A1' }, // Bleu
    { bg: '#F3E5F5', border: '#7B1FA2', text: '#4A148C' }, // Violet
    { bg: '#E8F5E9', border: '#388E3C', text: '#1B5E20' }, // Vert
    { bg: '#FFF3E0', border: '#F57C00', text: '#E65100' }, // Orange
    { bg: '#FCE4EC', border: '#C2185B', text: '#880E4F' }, // Rose
    { bg: '#E0F2F1', border: '#00796B', text: '#004D40' }, // Teal
    { bg: '#F1F8E9', border: '#689F38', text: '#33691E' }, // Lime
    { bg: '#ECEFF1', border: '#455A64', text: '#263238' }, // Bleu Gris
    { bg: '#FFF9C4', border: '#F9A825', text: '#F57F17' }, // Ambre
    { bg: '#F0F4C3', border: '#AFB42B', text: '#827717' }, // Jaune Vert
  ];

  // Hash simple basé sur la chaîne de caractères
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

export function getDefaultColor() {
  return {
    bg: '#E3F2FD',
    border: '#1976D2',
    text: '#0D47A1',
  };
}

/**
 * Retourne une classe CSS ou des styles inline pour une couleur
 * @param {string} text - Le texte
 * @returns {object} - Objet de style
 */
export function getColorStyle(text) {
  const color = getColorForText(text);
  return {
    backgroundColor: color.bg,
    borderColor: color.border,
    color: color.text,
  };
}

/**
 * Retourne des styles pour un badge coloré
 * @param {string} text - Le texte
 * @returns {object} - Objet de style
 */
export function getColorBadgeStyle(text) {
  const color = getColorForText(text);
  return {
    backgroundColor: color.bg,
    color: color.text,
    borderLeft: `3px solid ${color.border}`,
  };
}
