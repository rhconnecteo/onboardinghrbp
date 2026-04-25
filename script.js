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
let isSubmitting = false; // Protection contre les clics multiples

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
    
    console.log(`🔐 Login attempt for user: ${username}`);
    
    if (VALID_USERS.includes(username) && password === VALID_PASSWORD) {
      // Authentification réussie
      isAuthenticated = true;
      sessionStorage.setItem("authenticated", "true");
      
      el.loginMessage.innerHTML = "✅ Connexion réussie...";
      el.loginMessage.className = "login-message show success";
      
      console.log(`✅ Authentication successful for user: ${username}`);
      
      setTimeout(() => {
        el.loginSection.classList.add("hidden");
        initApp();
      }, 1000);
    } else {
      // Authentification échouée
      el.loginMessage.innerHTML = "❌ Identifiants incorrects";
      el.loginMessage.className = "login-message show error";
      el.password.value = "";
      
      console.warn(`❌ Authentication failed for user: ${username}`);
    }
  });
}

function checkAuthentication() {
  // Vérifier si l'utilisateur est déjà connecté
  if (sessionStorage.getItem("authenticated") === "true") {
    isAuthenticated = true;
    el.loginSection.classList.add("hidden");
    console.log("✅ User already authenticated from session");
    initApp();
  } else {
    console.log("🔓 No active session, showing login form");
    setupLoginListener();
  }
}

// ===============================
// INITIALISATION
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  initializeElements();
  checkAuthentication();
  
  // Add window resize listener for responsive design
  window.addEventListener("resize", handleWindowResize);
  
  // Handle initial window size
  handleWindowResize();
});

// Handle responsive sidebar behavior on window resize
function handleWindowResize() {
  const sidebar = document.querySelector(".sidebar");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  
  if (window.innerWidth > 768) {
    // Desktop: show sidebar, hide hamburger menu styling
    if (sidebar) {
      sidebar.classList.remove("open");
    }
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove("active");
    }
  } else {
    // Mobile/Tablets: update hamburger visibility state
    // Sidebar will be hidden by CSS media query
  }
}

function initApp() {
  loadBase();
  loadCollaborators();
  setupFormListener();
  setupFileInputListener();
  setupMatriculeGroupeListener();
  
  // Initialize the layout
  switchSection("formulaire");
  
  // Log successful initialization
  console.log("✅ Application initialized successfully");
  console.log("Current viewport width:", window.innerWidth);
  console.log("Sidebar visible:", window.innerWidth > 768 ? "Yes (Desktop)" : "No (Mobile - use hamburger menu)");
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
      // Nettoyer les données BASE: trimmer chaque fonction et rattachement
      baseData = {
        fonctions: data.fonctions.map(f => String(f || "").trim()),
        rattachements: data.rattachements.map(r => String(r || "").trim())
      };
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
// ===============================
// TOGGLE SIDEBAR (Hamburger Menu)
// ===============================
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  
  if (sidebar && hamburgerBtn) {
    sidebar.classList.toggle("open");
    hamburgerBtn.classList.toggle("active");
    console.log("Sidebar toggled. Open:", sidebar.classList.contains("open"));
  } else {
    console.warn("⚠️ Sidebar or hamburger button not found!");
  }
}

// Close sidebar when a button is clicked (mobile)
function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    const sidebar = document.querySelector(".sidebar");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    
    if (sidebar && hamburgerBtn) {
      sidebar.classList.remove("open");
      hamburgerBtn.classList.remove("active");
      console.log("Sidebar closed on mobile");
    }
  }
}

// ===============================
// SWITCH SECTION (Sidebar + Content)
// ===============================
function switchSection(sectionName) {
  console.log(`🔄 Switching to section: ${sectionName}`);
  
  // Hide all sidebar sections
  const sidebarSections = document.querySelectorAll(".sidebar-section");
  sidebarSections.forEach(section => section.classList.remove("active"));
  
  // Hide all content sections
  const contentSections = document.querySelectorAll(".content-section");
  contentSections.forEach(section => section.classList.remove("active"));
  
  // Deactivate all sidebar nav buttons
  const navBtns = document.querySelectorAll(".sidebar-nav-btn");
  navBtns.forEach(btn => btn.classList.remove("active"));
  
  // Show the selected sidebar section
  const selectedSidebarSection = document.querySelector(`[data-section="${sectionName}"]`);
  if (selectedSidebarSection) {
    selectedSidebarSection.classList.add("active");
    console.log(`✅ Sidebar section '${sectionName}' made active`);
  } else {
    console.warn(`⚠️ Sidebar section '${sectionName}' not found`);
  }
  
  // Show the corresponding content section
  const selectedContentSection = document.getElementById(`${sectionName}-content`);
  if (selectedContentSection) {
    selectedContentSection.classList.add("active");
    console.log(`✅ Content section '${sectionName}' made active`);
  } else {
    console.warn(`⚠️ Content section '${sectionName}' not found`);
  }
  
  // Activate the corresponding nav button
  const selectedBtn = document.querySelector(`.sidebar-nav-btn[data-section="${sectionName}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("active");
  }

  // Close sidebar on mobile
  closeSidebarOnMobile();

  // If statistics, refresh chart
  if (sectionName === "details") {
    setTimeout(() => {
      if (collaboratorsChart) {
        collaboratorsChart.resize();
      }
    }, 100);
  }
}

// ===============================
// SWITCH TAB (Legacy - for compatibility)
// ===============================
function switchTab(tabName) {
  switchSection(tabName);
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

    // Protection contre les clics multiples
    if (isSubmitting) return;
    isSubmitting = true;
    e.target.querySelector("button[type='submit']").disabled = true;

    // Récupérer les données du formulaire
    const formData = {
      matricule: document.getElementById("matricule").value.trim(),
      matriculeGroupe: document.getElementById("matriculeGroupe")?.value.trim() || "",
      statut: document.getElementById("statut").value,
      nom: document.getElementById("nom").value.trim(),
      fonction: document.getElementById("fonction").value.trim(),
      rattachement: document.getElementById("rattachement").value.trim(),
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
    } finally {
      // Réactiver le bouton
      isSubmitting = false;
      e.target.querySelector("button[type='submit']").disabled = false;
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
            <input type="text" id="editMatriculeGroupe" value="" placeholder="Ex: GROUPE001">
          </div>
          <div class="form-group">
            <label for="editDateFin">🏁 Date Fin (DD/MM/YYYY)</label>
            <input type="date" id="editDateFin" value="">
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
  // Protection contre les clics multiples
  if (isSubmitting) return;
  isSubmitting = true;

  const matriculeGroupe = document.getElementById("editMatriculeGroupe").value.trim();
  const dateFin = document.getElementById("editDateFin").value;

  if (!matriculeGroupe) {
    alert("❌ Veuillez remplir le Matricule Groupe");
    isSubmitting = false;
    return;
  }

  if (!dateFin) {
    alert("❌ Veuillez remplir la Date Fin");
    isSubmitting = false;
    return;
  }

  try {
    // TODO: Ajouter un appel API pour mettre à jour le backend
    // Pour l'instant, mise à jour locale
    allCollaborators[index].matriculeGroupe = matriculeGroupe;
    allCollaborators[index].dateFin = dateFin;

    closeEditModal();
    renderCollaboratorsWithoutMatriculeGroupe();
    renderCollaboratorsTable();
    
    alert("✅ Collaborateur mis à jour. Note: Une synchronisation backend est nécessaire.");
  } finally {
    isSubmitting = false;
  }
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

    // Lire les données en format brut (par position de colonnes)
    const rows = [];
    for (let i = 1; i <= worksheet['!ref'].split('!')[1].slice(-1); i++) {
      const row = [];
      for (let j = 0; j < 6; j++) {
        const cellRef = String.fromCharCode(65 + j) + i; // A, B, C, D, E, F
        const cell = worksheet[cellRef];
        row.push(cell ? cell.v : "");
      }
      if (row.some(cell => cell !== "")) { // Ignorer les lignes vides
        rows.push(row);
      }
    }

    if (rows.length === 0) {
      const importMsg = document.getElementById("importMessage");
      importMsg.textContent = "❌ Le fichier Excel est vide";
      importMsg.className = "message show error";
      return;
    }

    // Transformer les données par position de colonnes
    // A=Matricule, B=Nom, C=Fonction, D=Rattachement, E=Statut, F=Date d'intégration
    pendingImportData = rows.map((row, index) => {
      let errors = [];
      
      const matricule = String(row[0] || "").trim();
      const nom = String(row[1] || "").trim();
      const fonction = String(row[2] || "").trim();
      const rattachement = String(row[3] || "").trim();
      const statut = String(row[4] || "").trim().toUpperCase();
      let dateIntegration = String(row[5] || "").trim();

      // Valider les champs obligatoires
      if (!matricule) errors.push("Matricule vide");
      if (!nom) errors.push("Nom vide");
      if (!fonction) errors.push("Fonction vide");
      if (!rattachement) errors.push("Rattachement vide");
      if (!statut) errors.push("Statut vide");
      if (!dateIntegration) errors.push("Date d'intégration vide");

      // Valider le statut
      if (statut && !["INT MDJ", "CDI", "CDD"].includes(statut)) {
        errors.push(`Statut invalide "${statut}"`);
      }

      // Valider fonction et rattachement contre la BASE
      if (fonction && !baseData.fonctions.includes(fonction)) {
        errors.push(`Fonction "${fonction}" n'existe pas`);
      }
      if (rattachement && !baseData.rattachements.includes(rattachement)) {
        errors.push(`Rattachement "${rattachement}" n'existe pas`);
      }

      // Convertir la date d'intégration (si c'est un nombre, c'est un timestamp Excel)
      if (dateIntegration && !isNaN(dateIntegration)) {
        const excelDate = parseInt(dateIntegration);
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        dateIntegration = date.toISOString().split("T")[0];
      }

      return {
        matricule: matricule,
        nom: nom,
        fonction: fonction,
        rattachement: rattachement,
        statut: statut,
        dateIntegration: dateIntegration,
        dateFin: "", // Pas de date fin dans l'import
        isValid: errors.length === 0,
        validationErrors: errors
      };
    });

    console.log("Données importées:", pendingImportData);

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
      <th> Matricule</th>
      <th>🔗 Mat. Groupe</th>
      <th>✓ Statut</th>
      <th>👥 Nom</th>
      <th>💼 Fonction</th>
      <th>🏢 Rattachement</th>
      <th>📆 Date d'intégration</th>
      <th>🏁 Date Fin</th>
      <th>✓ Valider</th>
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
    
    // Colorer en rouge si des erreurs
    if (!row.isValid) {
      tr.style.backgroundColor = "#fee2e2";
    }

    // Icône de validation
    const validationIcon = row.isValid ? "✅" : "❌";
    const errorTooltip = row.validationErrors && row.validationErrors.length > 0 
      ? `title="${row.validationErrors.join(', ')}"` 
      : "";

    tr.innerHTML = `
      <td><strong>${row.matricule}</strong></td>
      <td><small>${row.matriculeGroupe || "--"}</small></td>
      <td><span class="badge ${badgeClass}">${row.statut}</span></td>
      <td><small>${row.nom}</small></td>
      <td><small>${row.fonction}</small></td>
      <td><small>${row.rattachement}</small></td>
      <td><small>${row.dateIntegration}</small></td>
      <td><small>${row.dateFin || "--"}</small></td>
      <td style="text-align: center; font-size: 18px; cursor: help;" ${errorTooltip}>${validationIcon}</td>
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
  // Protection contre les clics multiples
  if (isSubmitting) return;
  isSubmitting = true;

  // Filtrer les lignes valides
  const validData = pendingImportData.filter(r => r.isValid);
  
  if (validData.length === 0) {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "❌ Aucune donnée valide à importer";
    importMsg.className = "message show error";
    isSubmitting = false;
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
  } finally {
    isSubmitting = false;
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