// ===============================
// CONFIG API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbwFeowZnHTtxGYp9MLg6pA_80s27vY0rMx2tMuIF8icMhu6C5WgOwvjgpPZAK79VSrQ/exec";
// ===============================
// CREDENTIALS
// ===============================
const VALID_USERS = ["malala", "chissie", "koloina", "ravo", "mams"];
const VALID_PASSWORD = "onboarding";

// ===============================
// ÉLÉMENTS HTML
// ===============================
let el = {};

function initializeElements() {
  el = {
    // Login elements
    loginSection: document.getElementById("loginSection"),
    loginForm: document.getElementById("loginForm"),
    loginMessage: document.getElementById("loginMessage"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    
    // Main content
    hrbpForm: document.getElementById("hrbpForm"),
    formMessage: document.getElementById("formMessage"),
    previewContainer: document.getElementById("previewContainer"),
    previewHead: document.getElementById("previewHead"),
    previewBody: document.getElementById("previewBody"),
    importMessage: document.getElementById("importMessage"),
    excelFile: document.getElementById("excelFile"),
    totalCollaborators: document.getElementById("totalCollaborators"),
    totalCDI: document.getElementById("totalCDI"),
    totalCDD: document.getElementById("totalCDD"),
    totalINT: document.getElementById("totalINT")
  };
}

// ===============================
// DONNÉES GLOBALES
// ===============================
let allCollaborators = [];
let baseData = { fonctions: [], rattachements: [] };
let collaboratorsChart = null;
let isAuthenticated = false;

// ===============================
// FONCTION UTILITAIRE : Formater date au format DD/MM/YYYY
// ===============================
function formatDateFR(date) {
  if (!date) return "";
  
  let day, month, year;

  if (typeof date === "string") {
    // Si c'est une date ISO avec Z (UTC), convertir en Date object
    // pour que JavaScript l'ajuste automatiquement au fuseau horaire local
    if (date.includes("T") && date.includes("Z")) {
      const dateObj = new Date(date); // Convertit UTC en fuseau local
      day = dateObj.getDate();
      month = dateObj.getMonth() + 1;
      year = dateObj.getFullYear();
    } else {
      // Format simple YYYY-MM-DD
      const parts = date.split("T")[0].split("-");
      if (parts.length === 3) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      } else {
        return "";
      }
    }
  } else if (date instanceof Date) {
    // Utiliser directement les valeurs de la Date
    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();
  } else {
    return "";
  }

  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  
  return `${dayStr}/${monthStr}/${year}`;
}

// ===============================
// AUTHENTIFICATION
// ===============================
function setupLoginListener() {
  el.loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const username = el.username.value.trim();
    const password = el.password.value.trim();
    
    if (VALID_USERS.includes(username) && password === VALID_PASSWORD) {
      // Authentification réussie
      isAuthenticated = true;
      sessionStorage.setItem("authenticated", "true");
      
      el.loginMessage.innerHTML = "✅ Connexion réussie...";
      el.loginMessage.className = "login-message show success";
      
      setTimeout(() => {
        el.loginSection.classList.add("hidden");
        initApp();
      }, 1000);
    } else {
      // Authentification échouée
      el.loginMessage.innerHTML = "❌ Identifiants incorrects";
      el.loginMessage.className = "login-message show error";
      el.password.value = "";
    }
  });
}

function checkAuthentication() {
  // Vérifier si l'utilisateur est déjà connecté
  if (sessionStorage.getItem("authenticated") === "true") {
    isAuthenticated = true;
    el.loginSection.classList.add("hidden");
    initApp();
  } else {
    setupLoginListener();
  }
}

// ===============================
// INITIALISATION
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  initializeElements();
  checkAuthentication();
});

function initApp() {
  loadBase();
  loadCollaborators();
  setupFormListener();
  setupFileInputListener();
  setupMatriculeGroupeListener();
}

// ===============================
// CHARGER LA BASE (Fonctions & Rattachements)
// ===============================
async function loadBase() {
  try {
    const response = await fetch(API_URL + "?action=getBase");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.fonctions && data.rattachements) {
      baseData = data;
      populateSelects();
    } else if (data.error) {
      throw new Error(data.error);
    }

  } catch (err) {
    console.error("Erreur chargement BASE:", err);
  }
}

// ===============================
// PEUPLER LES SELECTS
// ===============================
function populateSelects() {
  const fonctionSelect = document.getElementById("fonction");
  const rattachementSelect = document.getElementById("rattachement");

  if (!fonctionSelect || !rattachementSelect) return;

  // Remplir Rattachement
  rattachementSelect.innerHTML = '<option value="">-- Sélectionner rattachement --</option>';
  baseData.rattachements.forEach(r => {
    const option = document.createElement("option");
    option.value = r;
    option.textContent = r;
    rattachementSelect.appendChild(option);
  });

  // Ajouter l'event listener pour filtrer les Fonction
  rattachementSelect.addEventListener("change", filterFonctions);

  // Initialiser avec toutes les fonctions
  filterFonctions();
}

// ===============================
// FILTRER LES FONCTIONS PAR RATTACHEMENT
// ===============================
function filterFonctions() {
  const fonctionSelect = document.getElementById("fonction");
  const rattachementSelect = document.getElementById("rattachement");

  if (!fonctionSelect || !rattachementSelect) return;

  const selectedRattachement = rattachementSelect.value;

  // TODO: A implémenter avec logique de filtrage spécifique
  // Pour l'instant, afficher toutes les fonctions
  fonctionSelect.innerHTML = '<option value="">-- Sélectionner fonction --</option>';
  baseData.fonctions.forEach(f => {
    const option = document.createElement("option");
    option.value = f;
    option.textContent = f;
    fonctionSelect.appendChild(option);
  });
}

// ===============================
// CHARGER LES COLLABORATEURS
// ===============================
async function loadCollaborators() {
  try {
    // Récupérer les données depuis l'API avec GET et action=getUsers
    const response = await fetch(API_URL + "?action=getUsers");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // L'API retourne un array ou un objet avec error
    if (Array.isArray(data)) {
      allCollaborators = data;
      updateStats();
      renderChart();
      renderCollaboratorsTable();
      renderCollaboratorsWithoutMatriculeGroupe();
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Format de réponse invalide");
    }

  } catch (err) {
    console.error("Erreur chargement collaborateurs:", err);
    showFormMessage(`❌ Erreur: ${err.message}`, "error");
  }
}

// ===============================
// METTRE À JOUR LES STATS
// ===============================
function updateStats() {
  const total = allCollaborators.length;
  const cdi = allCollaborators.filter(c => c.statut === "CDI").length;
  const cdd = allCollaborators.filter(c => c.statut === "CDD").length;
  const intMdj = allCollaborators.filter(c => c.statut === "INT MDJ").length;

  el.totalCollaborators.textContent = total;
  el.totalCDI.textContent = cdi;
  el.totalCDD.textContent = cdd;
  el.totalINT.textContent = intMdj;
}

// ===============================
// AFFICHER MESSAGE FORMULAIRE
// ===============================
function showFormMessage(text, type) {
  el.formMessage.textContent = text;
  el.formMessage.className = `message show ${type}`;
  
  // Masquer le message après 4 secondes
  setTimeout(() => {
    el.formMessage.classList.remove("show");
  }, 4000);
}

// ===============================
// SWITCH TAB (Navigation)
// ===============================
function switchTab(tabName) {
  // Masquer tous les onglets
  const tabs = document.querySelectorAll(".tab-section");
  tabs.forEach(tab => tab.classList.remove("active"));
  
  // Désactiver tous les boutons de nav
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(btn => btn.classList.remove("active"));
  
  // Afficher l'onglet sélectionné
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  
  // Activer le bouton correspondant
  const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("active");
  }

  // Si on accède à détails, rafraîchir le graphique
  if (tabName === "details") {
    setTimeout(() => {
      if (collaboratorsChart) {
        collaboratorsChart.resize();
      }
    }, 100);
  }
}

// ===============================
// LISTENER POUR MATRICULE GROUPE (Auto-remplir Date Fin)
// ===============================
function setupMatriculeGroupeListener() {
  const matriculeGroupeInput = document.getElementById("matriculeGroupe");
  const dateFinInput = document.getElementById("dateFin");

  if (matriculeGroupeInput && dateFinInput) {
    matriculeGroupeInput.addEventListener("blur", () => {
      if (matriculeGroupeInput.value.trim() !== "") {
        // Remplir avec la date du jour (format YYYY-MM-DD pour input type="date")
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateValue = `${year}-${month}-${day}`;
        dateFinInput.value = dateValue;
      } else {
        // Vider si Matricule Groupe est vide
        dateFinInput.value = "";
      }
    });

    // Aussi écouter l'événement "input" pour une mise à jour en temps réel
    matriculeGroupeInput.addEventListener("input", () => {
      if (matriculeGroupeInput.value.trim() === "") {
        dateFinInput.value = "";
      }
    });
  }
}

// ===============================
// SETUP FORMULAIRE
// ===============================
function setupFormListener() {
  el.hrbpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Récupérer les données du formulaire
    const formData = {
      matricule: document.getElementById("matricule").value.trim(),
      matriculeGroupe: document.getElementById("matriculeGroupe")?.value.trim() || "",
      statut: document.getElementById("statut").value,
      nom: document.getElementById("nom").value.trim(),
      fonction: document.getElementById("fonction").value,
      rattachement: document.getElementById("rattachement").value,
      dateIntegration: document.getElementById("dateIntegration").value,
      dateFin: document.getElementById("dateFin")?.value || ""
    };

    // Validation
    if (!formData.matricule || !formData.statut || !formData.nom || !formData.fonction || !formData.rattachement || !formData.dateIntegration) {
      showFormMessage("❌ Veuillez remplir tous les champs", "error");
      return;
    }

    // Valider Fonction et Rattachement contre la BASE
    if (!baseData.fonctions.includes(formData.fonction)) {
      showFormMessage(`❌ Fonction invalide: ${formData.fonction}`, "error");
      return;
    }
    if (!baseData.rattachements.includes(formData.rattachement)) {
      showFormMessage(`❌ Rattachement invalide: ${formData.rattachement}`, "error");
      return;
    }

    try {
      // Construire l'URL avec les paramètres GET
      const params = new URLSearchParams();
      params.append("action", "addUser");
      params.append("matricule", formData.matricule);
      params.append("matriculeGroupe", formData.matriculeGroupe);
      params.append("statut", formData.statut);
      params.append("nom", formData.nom);
      params.append("fonction", formData.fonction);
      params.append("rattachement", formData.rattachement);
      params.append("dateIntegration", formData.dateIntegration);
      params.append("dateFin", formData.dateFin);

      const response = await fetch(API_URL + "?" + params.toString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showFormMessage("✅ Collaborateur ajouté avec succès!", "success");
        el.hrbpForm.reset();
        
        // Recharger les collaborateurs après quelques secondes
        setTimeout(() => {
          loadCollaborators();
        }, 1000);
      } else {
        showFormMessage(`❌ Erreur: ${data.error}`, "error");
      }

    } catch (err) {
      console.error("Erreur submission:", err);
      showFormMessage(`❌ Impossible d'enregistrer: ${err.message}`, "error");
    }
  });
}

// ===============================
// AFFICHAGE DU NOM DU FICHIER EXCEL
// ===============================
function setupFileInputListener() {
  el.excelFile.addEventListener("change", function() {
    const fileNameDisplay = document.getElementById("fileName");
    
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const fileName = file.name;
      const fileSize = (file.size / 1024).toFixed(2); // Convertir en KB
      
      fileNameDisplay.innerHTML = `✅ <strong>Fichier chargé:</strong> ${fileName} (${fileSize} KB)`;
      fileNameDisplay.classList.add("show");
    } else {
      fileNameDisplay.classList.remove("show");
    }
  });
}

// ===============================
// DIAGRAMME
// ===============================
// ===============================
// AFFICHER TABLEAU DES COLLABORATEURS
// ===============================
function renderCollaboratorsTable() {
  if (allCollaborators.length === 0) return;

  const tableContainer = document.getElementById("collaboratorsTableContainer");
  if (!tableContainer) return;

  let tableHTML = `
    <table class="collaborators-table">
      <thead>
        <tr>
          <th>📅 Date Insertion</th>
          <th>👤 Matricule</th>
          <th>🔗 Matricule Groupe</th>
          <th>✓ Statut</th>
          <th>👥 Nom</th>
          <th>💼 Fonction</th>
          <th>🏢 Rattachement</th>
          <th>📆 Date d'intégration</th>
          <th>🏁 Date Fin</th>
        </tr>
      </thead>
      <tbody>
  `;

  allCollaborators.forEach((collab) => {
    let badgeClass = "badge-cdi";
    if (collab.statut === "INT MDJ") badgeClass = "badge-int";
    if (collab.statut === "CDD") badgeClass = "badge-cdd";

    // Formater les dates au format DD/MM/YYYY
    const dateInsertionFormatted = formatDateFR(collab.dateInsertion);
    const dateIntegrationFormatted = formatDateFR(collab.dateIntegration);
    const dateFinFormatted = formatDateFR(collab.dateFin);

    tableHTML += `
      <tr>
        <td><strong>${dateInsertionFormatted}</strong></td>
        <td>${collab.matricule}</td>
        <td>${collab.matriculeGroupe || "--"}</td>
        <td><span class="badge ${badgeClass}">${collab.statut}</span></td>
        <td>${collab.nom}</td>
        <td>${collab.fonction}</td>
        <td>${collab.rattachement}</td>
        <td>${dateIntegrationFormatted}</td>
        <td>${dateFinFormatted || "--"}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHTML;
}

// ===============================
// AFFICHER COLLABORATEURS SANS MATRICULE GROUPE
// ===============================
function renderCollaboratorsWithoutMatriculeGroupe() {
  if (allCollaborators.length === 0) return;

  const tableContainer = document.getElementById("collaboratorsWithoutMatriculeGroupeContainer");
  if (!tableContainer) return;

  // Filtrer les collaborateurs sans Matricule Groupe
  const filtered = allCollaborators.filter(c => !c.matriculeGroupe);

  if (filtered.length === 0) {
    tableContainer.innerHTML = '<p style="text-align: center; padding: 20px;">✅ Tous les collaborateurs ont un matricule groupe.</p>';
    return;
  }

  let tableHTML = `
    <table class="collaborators-table">
      <thead>
        <tr>
          <th>📅 Date Insertion</th>
          <th>👤 Matricule</th>
          <th>✓ Statut</th>
          <th>👥 Nom</th>
          <th>💼 Fonction</th>
          <th>🏢 Rattachement</th>
          <th>📆 Date d'intégration</th>
          <th>🔗 Matricule Groupe</th>
          <th>🏁 Date Fin</th>
          <th>✏️ Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  filtered.forEach((collab, index) => {
    let badgeClass = "badge-cdi";
    if (collab.statut === "INT MDJ") badgeClass = "badge-int";
    if (collab.statut === "CDD") badgeClass = "badge-cdd";

    // Formater les dates au format DD/MM/YYYY
    const dateInsertionFormatted = formatDateFR(collab.dateInsertion);
    const dateIntegrationFormatted = formatDateFR(collab.dateIntegration);

    tableHTML += `
      <tr>
        <td><strong>${dateInsertionFormatted}</strong></td>
        <td>${collab.matricule}</td>
        <td><span class="badge ${badgeClass}">${collab.statut}</span></td>
        <td>${collab.nom}</td>
        <td>${collab.fonction}</td>
        <td>${collab.rattachement}</td>
        <td>${dateIntegrationFormatted}</td>
        <td>--</td>
        <td>--</td>
        <td><button onclick="editCollaborator(${index})" class="btn-edit">✏️ Éditer</button></td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHTML;
}

// ===============================
// ÉDITER COLLABORATEUR (Modal)
// ===============================
function editCollaborator(index) {
  const collab = allCollaborators[index];
  
  // Créer un modal pour éditer
  const modal = document.createElement("div");
  modal.id = "editModal";
  modal.className = "modal";
  


  // Convertir dateFin au format YYYY-MM-DD pour input type="date"
  let dateFinalValue = "";
  if (collab.dateFin) {
    if (typeof collab.dateFin === "string") {
      // Si c'est une chaîne ISO, garder seulement la partie date
      dateFinalValue = collab.dateFin.split("T")[0];
    } else if (collab.dateFin instanceof Date) {
      const year = collab.dateFin.getFullYear();
      const month = String(collab.dateFin.getMonth() + 1).padStart(2, '0');
      const day = String(collab.dateFin.getDate()).padStart(2, '0');
      dateFinalValue = `${year}-${month}-${day}`;
    }
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>✏️ Éditer Collaborateur</h3>
        <button onclick="closeEditModal()" class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="edit-form">
          <div class="form-group">
            <label>👤 Matricule</label>
            <input type="text" value="${collab.matricule}" disabled style="background: #f3f4f6;">
          </div>
          <div class="form-group">
            <label>👥 Nom</label>
            <input type="text" value="${collab.nom}" disabled style="background: #f3f4f6;">
          </div>
          <div class="form-group">
            <label for="editMatriculeGroupe">🔗 Matricule Groupe</label>
            <input type="text" id="editMatriculeGroupe" value="${collab.matriculeGroupe || ""}" placeholder="Ex: GROUPE001">
          </div>
          <div class="form-group">
            <label for="editDateFin">🏁 Date Fin (DD/MM/YYYY)</label>
            <input type="date" id="editDateFin" value="${dateFinalValue}">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button onclick="saveEditCollaborator(${index})" class="btn btn-primary">💾 Enregistrer</button>
        <button onclick="closeEditModal()" class="btn btn-secondary">❌ Annuler</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";

  // Écouter les touches clavier
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEditModal();
    }
  });
}

// ===============================
// FERMER LE MODAL D'ÉDITION
// ===============================
function closeEditModal() {
  const modal = document.getElementById("editModal");
  if (modal) {
    modal.remove();
  }
}

// ===============================
// ENREGISTRER LES MODIFICATIONS
// ===============================
async function saveEditCollaborator(index) {
  const matriculeGroupe = document.getElementById("editMatriculeGroupe").value.trim();
  const dateFin = document.getElementById("editDateFin").value;

  if (!matriculeGroupe) {
    alert("❌ Veuillez remplir le Matricule Groupe");
    return;
  }

  if (!dateFin) {
    alert("❌ Veuillez remplir la Date Fin");
    return;
  }

  // TODO: Ajouter un appel API pour mettre à jour le backend
  // Pour l'instant, mise à jour locale
  allCollaborators[index].matriculeGroupe = matriculeGroupe;
  allCollaborators[index].dateFin = dateFin;

  closeEditModal();
  renderCollaboratorsWithoutMatriculeGroupe();
  renderCollaboratorsTable();
  
  alert("✅ Collaborateur mis à jour. Note: Une synchronisation backend est nécessaire.");
}

// ===============================
// DIAGRAMME
// ===============================
function renderChart() {
  if (allCollaborators.length === 0) return;

  // Compter par rattachement
  const counts = {};
  const labels = [];
  const data = [];
  const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  allCollaborators.forEach(collab => {
    if (counts[collab.rattachement]) {
      counts[collab.rattachement]++;
    } else {
      counts[collab.rattachement] = 1;
    }
  });

  Object.keys(counts).sort().forEach((key, idx) => {
    labels.push(key);
    data.push(counts[key]);
  });

  const ctx = document.getElementById("collaboratorsChart").getContext("2d");
  
  if (collaboratorsChart) {
    collaboratorsChart.destroy();
  }

  collaboratorsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Nombre de collaborateurs",
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.4,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowBlur: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 20,
            usePointStyle: true
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 13,
              weight: '600'
            },
            color: '#6b7280'
          },
          grid: {
            color: 'rgba(6, 182, 212, 0.1)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            font: {
              size: 13,
              weight: '600'
            },
            color: '#6b7280'
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  });
}

// ===============================
// EXCEL IMPORT - DONNÉES TEMPORAIRES
// ===============================
let pendingImportData = [];

// ===============================
// EXCEL IMPORT - APERÇU
// ===============================
async function previewExcelFile() {
  const file = el.excelFile.files[0];

  if (!file) {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "❌ Veuillez sélectionner un fichier Excel";
    importMsg.className = "message show error";
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir en array d'objets
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      const importMsg = document.getElementById("importMessage");
      importMsg.textContent = "❌ Le fichier Excel est vide";
      importMsg.className = "message show error";
      return;
    }

    // Normaliser les noms de colonnes (trimmer et minuscule, enlever caractères spéciaux)
    const normalizedData = jsonData.map(row => {
      const normalized = {};
      for (const key in row) {
        // Nettoyer: minuscule, trim, espaces, accents, apostrophes, guillemets
        const normalizedKey = key
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "")
          .replace(/[éèêë]/g, "e")
          .replace(/[àâä]/g, "a")
          .replace(/[ùûü]/g, "u")
          .replace(/[ôö]/g, "o")
          .replace(/[ïî]/g, "i")
          .replace(/[''`"]/g, "") // Supprimer apostrophes et guillemets
          .replace(/[^\w]/g, ""); // Supprimer tous les caractères non-alphanumériques sauf underscore
        
        if (normalizedKey && normalizedKey !== "") { // Ignorer les colonnes vides
          normalized[normalizedKey] = row[key];
        }
      }
      return normalized;
    });

    // Valider les colonnes (chercher les colonnes qui contiennent les mots-clés)
    const firstRow = normalizedData[0];
    const availableColumns = Object.keys(firstRow);
    
    console.log("Colonnes disponibles:", availableColumns);

    // Chercher les colonnes de manière flexible
    let matriculeCol = availableColumns.find(col => col.includes("matricule") && !col.includes("groupe"));
    let matriculeGroupeCol = availableColumns.find(col => col.includes("matricule") && col.includes("groupe"));
    let statutCol = availableColumns.find(col => col.includes("statut"));
    let nomCol = availableColumns.find(col => col.includes("nom"));
    let fonctionCol = availableColumns.find(col => col.includes("fonction"));
    let rattachementCol = availableColumns.find(col => col.includes("rattachement"));
    let dateIntegrationCol = availableColumns.find(col => col.includes("date") && col.includes("integ"));
    let dateFinCol = availableColumns.find(col => col.includes("date") && col.includes("fin"));
    
    console.log("Colonnes trouvées:", {matriculeCol, matriculeGroupeCol, statutCol, nomCol, fonctionCol, rattachementCol, dateIntegrationCol, dateFinCol});

    // Vérifier que les colonnes obligatoires existent
    if (!matriculeCol || !statutCol || !fonctionCol || !rattachementCol || !dateIntegrationCol) {
      const importMsg = document.getElementById("importMessage");
      importMsg.textContent = "❌ Colonnes manquantes. Obligatoires: Matricule, Statut, Fonction, Rattachement, Date d'intégration";
      importMsg.className = "message show error";
      return;
    }

    // Transformer les données et valider
    pendingImportData = normalizedData.map((row, index) => {
      let errors = [];
      
      // Valider le statut
      const statut = (row[statutCol] || "").toString().trim().toUpperCase();
      if (!["INT MDJ", "CDI", "CDD"].includes(statut)) {
        errors.push(`Statut invalide "${statut}"`);
      }

      // Récupérer la fonction et rattachement
      const fonction = (row[fonctionCol] || "").toString().trim();
      const rattachement = (row[rattachementCol] || "").toString().trim();
      
      // DEBUG: afficher la première ligne
      if (index === 0) {
        console.log("Première ligne - Fonction:", `"${fonction}"`);
        console.log("Première ligne - Rattachement:", `"${rattachement}"`);
        console.log("BASE Fonctions:", baseData.fonctions);
        console.log("BASE Rattachements:", baseData.rattachements);
      }

      // ⚠️ NE PAS valider - afficher quand même
      // Les données s'afficheront même si Fonction/Rattachement sont invalides

      // Convertir la date d'intégration (si c'est un nombre, c'est un timestamp Excel)
      let dateStr = String(row[dateIntegrationCol] || "").trim();
      if (!isNaN(dateStr) && dateStr !== "") {
        // C'est un nombre Excel, convertir
        const excelDate = parseInt(dateStr);
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        dateStr = date.toISOString().split("T")[0];
      }

      // Convertir la date fin si elle existe
      let dateFinStr = "";
      if (dateFinCol) {
        dateFinStr = String(row[dateFinCol] || "").trim();
        if (!isNaN(dateFinStr) && dateFinStr !== "") {
          const excelDate = parseInt(dateFinStr);
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          dateFinStr = date.toISOString().split("T")[0];
        }
      }

      return {
        matricule: (row[matriculeCol] || "").toString().trim(),
        matriculeGroupe: matriculeGroupeCol ? (row[matriculeGroupeCol] || "").toString().trim() : "",
        statut: statut,
        nom: nomCol ? (row[nomCol] || "").toString().trim() : (row[matriculeCol] || "").toString().trim(),
        fonction: fonction,
        rattachement: rattachement,
        dateIntegration: dateStr,
        dateFin: dateFinStr,
        isValid: errors.length === 0,
        validationErrors: errors
      };
    });

    // Afficher l'aperçu
    displayPreviewTable();

  } catch (err) {
    console.error("Erreur parsing Excel:", err);
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = `❌ Erreur: ${err.message}`;
    importMsg.className = "message show error";
    pendingImportData = [];
  }
}

// ===============================
// AFFICHER APERÇU
// ===============================
function displayPreviewTable() {
  if (pendingImportData.length === 0) {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "❌ Aucune donnée à afficher";
    importMsg.className = "message show error";
    return;
  }

  // Créer les en-têtes
  el.previewHead.innerHTML = `
    <tr>
      <th>� Insertion</th>
      <th>�👤 Matricule</th>
      <th>🔗 Mat. Groupe</th>
      <th>✓ Statut</th>
      <th>👥 Nom</th>
      <th>💼 Fonction</th>
      <th>🏢 Rattachement</th>
      <th>📆 Date d'intégration</th>
      <th>🏁 Date Fin</th>
    </tr>
  `;

  // Afficher les données (max 10 lignes d'aperçu)
  el.previewBody.innerHTML = "";
  const displayData = pendingImportData.slice(0, 10);

  displayData.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Badge pour le statut
    let badgeClass = "badge-cdi";
    if (row.statut === "INT MDJ") badgeClass = "badge-int";
    if (row.statut === "CDD") badgeClass = "badge-cdd";

    // Date d'insertion (date du jour)
    const today = new Date().toISOString().split("T")[0];
    
    // Colorer en rouge si des erreurs
    if (!row.isValid) {
      tr.style.backgroundColor = "#fee2e2";
    }

    // Afficher les erreurs (max 2 lignes)
    let errorHTML = "✅";
    if (row.validationErrors && row.validationErrors.length > 0) {
      errorHTML = row.validationErrors.slice(0, 2).join("<br>");
    }

    tr.innerHTML = `
      <td><small>${today}</small></td>
      <td><strong>${row.matricule}</strong></td>
      <td><small>${row.matriculeGroupe || "--"}</small></td>
      <td><span class="badge ${badgeClass}">${row.statut}</span></td>
      <td><small>${row.nom}</small></td>
      <td><small>${row.fonction}</small></td>
      <td><small>${row.rattachement}</small></td>
      <td><small>${row.dateIntegration}</small></td>
      <td><small>${row.dateFin || "--"}</small></td>
      <td style="color: ${row.isValid ? 'green' : 'red'}; font-size: 11px; max-width: 150px; word-break: break-word;">${errorHTML}</td>
    `;

    el.previewBody.appendChild(tr);
  });

  // Afficher le conteneur
  el.previewContainer.style.display = "block";

  // Afficher un message sur le nombre de lignes
  const totalRows = pendingImportData.length;
  const validRows = pendingImportData.filter(r => r.isValid).length;
  const displayRows = displayData.length;
  
  let message = totalRows > displayRows
    ? `📊 Aperçu (${displayRows}/${totalRows} lignes)`
    : `📊 ${totalRows} ligne(s) à importer`;
  
  if (validRows < totalRows) {
    message += ` | ⚠️ ${totalRows - validRows} ligne(s) avec erreur(s)`;
  }

  const importMsg = document.getElementById("importMessage");
  importMsg.textContent = message;
  importMsg.className = "message show info";
}

// IMPORTER LES DONNÉES
// ===============================
async function importExcelFile() {
  // Filtrer les lignes valides
  const validData = pendingImportData.filter(r => r.isValid);
  
  if (validData.length === 0) {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "❌ Aucune donnée valide à importer";
    importMsg.className = "message show error";
    return;
  }

  try {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "⏳ Importation en cours...";
    importMsg.className = "message show info";

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = pendingImportData.length - validData.length;
    const errors = [];

    // Boucler sur chaque collaborateur valide et appeler addUser
    for (let i = 0; i < validData.length; i++) {
      const collab = validData[i];

      try {
        // Construire l'URL avec les paramètres GET
        const params = new URLSearchParams();
        params.append("action", "addUser");
        params.append("matricule", collab.matricule);
        params.append("matriculeGroupe", collab.matriculeGroupe);
        params.append("statut", collab.statut);
        params.append("nom", collab.nom);
        params.append("fonction", collab.fonction);
        params.append("rattachement", collab.rattachement);
        params.append("dateIntegration", collab.dateIntegration);
        params.append("dateFin", collab.dateFin);

        const response = await fetch(API_URL + "?" + params.toString());

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`Ligne ${i + 1}: ${result.error || "Erreur inconnue"}`);
        }

      } catch (err) {
        errorCount++;
        errors.push(`Ligne ${i + 1}: ${err.message}`);
      }

      // Rafraîchir le message tous les 10 lignes
      if ((i + 1) % 10 === 0) {
        importMsg.textContent = `⏳ Importation... ${i + 1}/${validData.length}`;
      }
    }

    // Afficher le résumé
    if (errorCount === 0) {
      let msg = `✅ ${successCount} collaborateur(s) importé(s) avec succès!`;
      if (skippedCount > 0) {
        msg += ` (${skippedCount} ligne(s) ignorée(s) avec erreur(s))`;
      }
      importMsg.textContent = msg;
      importMsg.className = "message show success";

      // Réinitialiser
      setTimeout(() => {
        cancelImport();
        // NE PAS réinitialiser le fichier pour garder le nom visible
        // el.excelFile.value = "";
        loadBase();
        loadCollaborators();
      }, 2000);
    } else {
      const message = `⚠️ ${successCount} importés, ${errorCount} erreurs`;
      importMsg.textContent = message;
      importMsg.className = "message show error";
    }

  } catch (err) {
    console.error("Erreur import:", err);
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = `❌ Erreur: ${err.message}`;
    importMsg.className = "message show error";
  }
}

// ===============================
// ANNULER L'IMPORT
// ===============================
function cancelImport() {
  el.previewContainer.style.display = "none";
  el.previewHead.innerHTML = "";
  el.previewBody.innerHTML = "";
  const importMsg = document.getElementById("importMessage");
  importMsg.textContent = "";
  importMsg.className = "message";
  pendingImportData = [];
  // NE PAS réinitialiser le fichier pour garder le nom visible
  // el.excelFile.value = "";
}