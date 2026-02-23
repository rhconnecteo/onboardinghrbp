// ===============================
// CONFIG API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbwbGFrlpLgRFbXYBbtgu6SyvcmXQI-10k8H0B2PcWX4vCzrKgNf5-831v_yNJs_pELa/exec";

// ===============================
// CREDENTIALS
// ===============================
const VALID_USERS = ["malala", "chissie", "koloina", "ravo"];
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
let collaboratorsChart = null;
let isAuthenticated = false;

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
  loadCollaborators();
  setupFormListener();
  setupFileInputListener();
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
// SETUP FORMULAIRE
// ===============================
function setupFormListener() {
  el.hrbpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Récupérer les données du formulaire
    const formData = {
      matricule: document.getElementById("matricule").value.trim(),
      statut: document.getElementById("statut").value,
      nom: document.getElementById("nom").value.trim(),
      fonction: document.getElementById("fonction").value.trim(),
      rattachement: document.getElementById("rattachement").value.trim(),
      dateIntegration: document.getElementById("dateIntegration").value
    };

    // Validation
    if (!formData.matricule || !formData.statut || !formData.nom || !formData.fonction || !formData.rattachement || !formData.dateIntegration) {
      showFormMessage("❌ Veuillez remplir tous les champs", "error");
      return;
    }

    try {
      // Construire l'URL avec les paramètres GET
      const params = new URLSearchParams();
      params.append("action", "addUser");
      params.append("matricule", formData.matricule);
      params.append("statut", formData.statut);
      params.append("nom", formData.nom);
      params.append("fonction", formData.fonction);
      params.append("rattachement", formData.rattachement);
      params.append("dateIntegration", formData.dateIntegration);

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

    // Normaliser les noms de colonnes (trimmer et minuscule)
    const normalizedData = jsonData.map(row => {
      const normalized = {};
      for (const key in row) {
        const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, "");
        normalized[normalizedKey] = row[key];
      }
      return normalized;
    });

    // Valider les colonnes (chercher les colonnes qui contiennent les mots-clés)
    const firstRow = normalizedData[0];
    const availableColumns = Object.keys(firstRow);

    // Chercher les colonnes de manière flexible
    let matriculeCol = availableColumns.find(col => col.includes("matricule"));
    let statutCol = availableColumns.find(col => col.includes("statut"));
    let nomCol = availableColumns.find(col => col.includes("nom"));
    let fonctionCol = availableColumns.find(col => col.includes("fonction"));
    let rattachementCol = availableColumns.find(col => col.includes("rattachement"));
    let dateCol = availableColumns.find(col => col.includes("date") || col.includes("integration"));

    if (!matriculeCol || !statutCol || !nomCol || !fonctionCol || !rattachementCol || !dateCol) {
      const importMsg = document.getElementById("importMessage");
      importMsg.textContent = "❌ Colonnes manquantes. Attendu: Matricule, Statut, Nom, Fonction, Rattachement, Date d'intégration";
      importMsg.className = "message show error";
      return;
    }

    // Transformer les données
    pendingImportData = normalizedData.map((row, index) => {
      // Valider le statut
      const statut = (row[statutCol] || "").toString().trim().toUpperCase();
      if (!["INT MDJ", "CDI", "CDD"].includes(statut)) {
        throw new Error(
          `Ligne ${index + 1}: Statut invalide "${statut}". Doit être INT MDJ, CDI ou CDD`
        );
      }

      // Convertir la date (si c'est un nombre, c'est un timestamp Excel)
      let dateStr = String(row[dateCol] || "").trim();
      if (!isNaN(dateStr) && dateStr !== "") {
        // C'est un nombre Excel, convertir
        const excelDate = parseInt(dateStr);
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        dateStr = date.toISOString().split("T")[0];
      }

      return {
        matricule: (row[matriculeCol] || "").toString().trim(),
        statut: statut,
        nom: (row[nomCol] || "").toString().trim(),
        fonction: (row[fonctionCol] || "").toString().trim(),
        rattachement: (row[rattachementCol] || "").toString().trim(),
        dateIntegration: dateStr
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
      <th>👤 Matricule</th>
      <th>✓ Statut</th>
      <th>👥 Nom</th>
      <th>💼 Fonction</th>
      <th>🏢 Rattachement</th>
      <th>📅 Date d'intégration</th>
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

    tr.innerHTML = `
      <td><strong>${row.matricule}</strong></td>
      <td><span class="badge ${badgeClass}">${row.statut}</span></td>
      <td>${row.nom}</td>
      <td>${row.fonction}</td>
      <td>${row.rattachement}</td>
      <td>${row.dateIntegration}</td>
    `;

    el.previewBody.appendChild(tr);
  });

  // Afficher le conteneur
  el.previewContainer.style.display = "block";

  // Afficher un message sur le nombre de lignes
  const totalRows = pendingImportData.length;
  const displayRows = displayData.length;
  const message =
    totalRows > displayRows
      ? `📊 Aperçu (${displayRows}/${totalRows} lignes)`
      : `📊 ${totalRows} ligne(s) à importer`;

  const importMsg = document.getElementById("importMessage");
  importMsg.textContent = message;
  importMsg.className = "message show info";
}

// ===============================
// IMPORTER LES DONNÉES
// ===============================
async function importExcelFile() {
  if (pendingImportData.length === 0) {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "❌ Aucune donnée à importer";
    importMsg.className = "message show error";
    return;
  }

  try {
    const importMsg = document.getElementById("importMessage");
    importMsg.textContent = "⏳ Importation en cours...";
    importMsg.className = "message show info";

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Boucler sur chaque collaborateur et appeler addUser
    for (let i = 0; i < pendingImportData.length; i++) {
      const collab = pendingImportData[i];

      try {
        // Construire l'URL avec les paramètres GET
        const params = new URLSearchParams();
        params.append("action", "addUser");
        params.append("matricule", collab.matricule);
        params.append("statut", collab.statut);
        params.append("nom", collab.nom);
        params.append("fonction", collab.fonction);
        params.append("rattachement", collab.rattachement);
        params.append("dateIntegration", collab.dateIntegration);

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
        importMsg.textContent = `⏳ Importation... ${i + 1}/${pendingImportData.length}`;
      }
    }

    // Afficher le résumé
    if (errorCount === 0) {
      importMsg.textContent = `✅ ${successCount} collaborateur(s) importé(s) avec succès!`;
      importMsg.className = "message show success";

      // Réinitialiser
      setTimeout(() => {
        cancelImport();
        // NE PAS réinitialiser le fichier pour garder le nom visible
        // el.excelFile.value = "";
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