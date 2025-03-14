document.addEventListener("DOMContentLoaded", function () {
    handleUserSession();
    handleDashboard();
    setupTaskViewToggle();
    setupTaskFilters();
    setupTaskPopup();
    setupTaskActions();
});

/*------------------GESTION DE LA SESSION UTILISATEUR------------------*/
function handleUserSession() {
    let user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        let userNameElement = document.getElementById("userName");
        let userPhotoElement = document.getElementById("userPhoto");

        if (userNameElement && userPhotoElement) {
            userNameElement.textContent = user.NomComplet;
            userPhotoElement.src = user.photo ? `http://localhost/TaskFlow/backend/${user.photo}` : "assets/default-avatar.png";
        }
    } else {
        if (window.location.pathname.includes("dashboard.html")) {
            window.location.href = "index.html";  // Redirige vers l'accueil si non connecté
        }
    }

    let logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }
}

/*------------------DASHBOARD------------------*/
function handleDashboard() {
    if (!document.getElementById("dashboardContent")) return;

    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userName").textContent = user.NomComplet;
    document.getElementById("userPhoto").src = user.photo ? `http://localhost/TaskFlow/backend/${user.photo}` : "assets/default-avatar.png";

    fetch("http://localhost/TaskFlow/backend/dashboard.php")
        .then(response => response.json())
        .then(data => {
            document.getElementById("totalTasks").textContent = data.total;
            document.getElementById("tasksInProgress").textContent = data.inProgress;
            document.getElementById("tasksCompleted").textContent = data.completed;

            renderChart("chartTotal", data.total, "Total des tâches");
            renderChart("chartInProgress", data.inProgress, "Tâches en cours");
            renderChart("chartCompleted", data.completed, "Tâches terminées");
        })
        .catch(error => console.error("Erreur lors du chargement des stats :", error));
}

/* Fonction pour créer un graphe */
function renderChart(canvasId, value, label) {
    new Chart(document.getElementById(canvasId), {
        type: "doughnut",
        data: {
            labels: [label, "Autres"],
            datasets: [{
                data: [value, Math.max(100 - value, 0)],
                backgroundColor: ["#4CAF50", "#ddd"]
            }]
        }
    });
}

/* GESTION DE L'AFFICHAGE DES TÂCHES */
function setupTaskViewToggle() {
    const viewTasksBtn = document.getElementById("viewTasksBtn");
    const backToDashboardBtn = document.getElementById("backToDashboard");
    const dashboardContent = document.getElementById("dashboardContent");
    const tasksContent = document.getElementById("tasksContent");

    if (viewTasksBtn) {
        viewTasksBtn.addEventListener("click", function () {
            dashboardContent.style.display = "none";
            tasksContent.style.display = "block";
            viewTasksBtn.style.display = "none"; // Cache le bouton
            loadTasks();
        });
    }

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener("click", function () {
            tasksContent.style.display = "none";
            dashboardContent.style.display = "block";
            viewTasksBtn.style.display = "block"; // Affiche à nouveau le bouton
        });
    }
}

/* GESTION DU POPUP D'AJOUT DE TÂCHE */
function setupTaskPopup() {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const closePopup = document.getElementById("closePopup");
    const taskPopup = document.getElementById("taskPopup");
    const taskForm = document.getElementById("taskForm");

    addTaskBtn.addEventListener("click", function () {
        taskPopup.style.display = "flex";  // Utilisez "flex" pour activer le centrage
    });

    closePopup.addEventListener("click", function () {
        taskPopup.style.display = "none";
    });

    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = {
            action: "add",
            titre: document.getElementById("taskTitle").value,
            description: document.getElementById("taskDescription").value,
            statut: document.getElementById("taskStatus").value,
            delai: document.getElementById("taskDeadline").value,
        };

        fetch("http://localhost/TaskFlow/backend/task.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Tâche ajoutée avec succès !");
                taskPopup.style.display = "none";
                loadTasks(); // Recharger la liste des tâches
            } else {
                alert("Erreur : " + data.error);
            }
        })
        .catch(error => console.error("Erreur lors de l'ajout de la tâche :", error));
    });
}

/*------------------CHARGEMENT DES TÂCHES------------------*/
function loadTasks() {
    fetch("http://localhost/TaskFlow/backend/task.php")
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = "";

            let today = new Date().toISOString().split('T')[0];

            tasks.forEach(task => {
                let statusClass = task.statut === "Terminé" ? "badge bg-success" :
                                  task.statut === "En Cours" ? "badge bg-warning" :
                                  "badge bg-danger";

                let delayClass = "";
                let delayIcon = "";

                if (task.delai) {
                    let taskDueDate = new Date(task.delai).toISOString().split('T')[0];
                    if (taskDueDate >= today || task.statut === "Terminé") {
                        delayClass = "delay-green"; 
                        delayIcon = "🟢";
                    } else {
                        delayClass = "delay-red"; 
                        delayIcon = "🔴";
                    }
                } else {
                    delayIcon = "-";
                }

                taskList.innerHTML += `
                    <tr>
                        <td>${task.titre}</td>
                        <td>${task.description}</td>
                        <td>${task.dateCreation}</td>
                        <td><span class="${statusClass}">${task.statut}</span></td>
                        <td class="${delayClass}">${delayIcon}</td>
                        <td>
                            <button class="btn btn-light task-actions-btn" data-task-id="${task.idTask}">...</button>
                        </td>
                    </tr>
                `;

            });
        })
        .catch(error => console.error("Erreur de chargement des tâches :", error));
}


/*------------------ FILTRAGE ET RECHERCHE ------------------*/
function setupTaskFilters() {
    const searchInput = document.getElementById("searchTask");
    const filterStatus = document.getElementById("filterStatus");

    searchInput.addEventListener("input", filterTasks);
    filterStatus.addEventListener("change", filterTasks);
}

function filterTasks() {
    const searchValue = document.getElementById("searchTask").value.toLowerCase().trim();
    const statusValue = document.getElementById("filterStatus").value;

    document.querySelectorAll("#taskList tr").forEach(row => {
        // Vérifier que la ligne contient bien des colonnes
        if (row.children.length < 6) return;

        // Récupérer le titre (colonne 0)
        const title = row.children[0].textContent.toLowerCase().trim();

        // Récupérer le statut (colonne 3)
        const statusElement = row.children[3].querySelector("span");
        const status = statusElement ? statusElement.textContent.trim() : row.children[3].textContent.trim();

        // Vérifier si la ligne correspond aux critères de recherche et de filtre
        const matchesSearch = title.includes(searchValue);
        const matchesStatus = statusValue === "" || status === statusValue;

        // Afficher ou masquer la ligne
        row.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
}


//gestion action 
/* ------------------ FERMETURE DU POPUP MODIFICATION ------------------ */
document.getElementById("closeEditPopup").addEventListener("click", function () {
    document.getElementById("editTaskPopup").style.display = "none";
});

/* ------------------ FERMETURE DU POPUP SUPPRESSION ------------------ */
document.getElementById("cancelDeleteTask").addEventListener("click", function () {
    document.getElementById("deleteTaskPopup").style.display = "none";
});

/* ------------------ CORRECTION DE L'UPDATE DU STATUT ------------------ */
function updateTaskStatus(idTask, newStatus) {
    fetch(`http://localhost/TaskFlow/backend/task.php?idTask=${idTask}`)
        .then(response => response.json())
        .then(task => {
            const formData = {
                action: "update",
                idTask: idTask,
                titre: task.titre,
                description: task.description,
                statut: newStatus,
                delai: task.delai
            };

            fetch("http://localhost/TaskFlow/backend/task.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(() => {
                loadTasks();
            });
        });

    document.getElementById("taskActionsMenu").style.display = "none";
}

/* ------------------ GESTION DES ACTIONS ------------------ */
function setupTaskActions() {
    const taskList = document.getElementById("taskList");
    const actionsMenu = document.getElementById("taskActionsMenu");

    let selectedTaskId = null;

    // Ouvrir le menu d'actions
    taskList.addEventListener("click", function (event) {
        if (event.target.classList.contains("task-actions-btn")) {
            selectedTaskId = event.target.dataset.taskId;
            const rect = event.target.getBoundingClientRect();
            actionsMenu.style.top = `${rect.bottom + window.scrollY}px`;
            actionsMenu.style.left = `${rect.left}px`;
            actionsMenu.style.display = "block";
        }
    });

    // Fermer le menu en cliquant ailleurs
    document.addEventListener("click", function (event) {
        if (!event.target.closest("#taskActionsMenu") && !event.target.classList.contains("task-actions-btn")) {
            actionsMenu.style.display = "none";
        }
    });

    // Modifier une tâche
    document.getElementById("editTask").addEventListener("click", function () {
        fetch(`http://localhost/TaskFlow/backend/task.php?idTask=${selectedTaskId}`)
            .then(response => response.json())
            .then(task => {
                document.getElementById("editTaskId").value = task.idTask;
                document.getElementById("editTaskTitle").value = task.titre;
                document.getElementById("editTaskDescription").value = task.description;
                document.getElementById("editTaskStatus").value = task.statut;
                document.getElementById("editTaskDeadline").value = task.delai;
                document.getElementById("editTaskPopup").style.display = "flex";
            });

        actionsMenu.style.display = "none";
    });

    // Marquer comme "En cours"
    document.getElementById("markInProgress").addEventListener("click", function () {
        updateTaskStatus(selectedTaskId, "En Cours");
    });

    // Marquer comme "Terminé"
    document.getElementById("markCompleted").addEventListener("click", function () {
        updateTaskStatus(selectedTaskId, "Terminé");
    });

        // Modifier une tâche
        document.getElementById("editTask").addEventListener("click", function () {
            fetch(`http://localhost/TaskFlow/backend/task.php?idTask=${selectedTaskId}`)
                .then(response => response.json())
                .then(task => {
                    document.getElementById("editTaskId").value = task.idTask;
                    document.getElementById("editTaskTitle").value = task.titre;
                    document.getElementById("editTaskDescription").value = task.description;
                    document.getElementById("editTaskStatus").value = task.statut;
                    document.getElementById("editTaskDeadline").value = task.delai;
                    document.getElementById("editTaskPopup").style.display = "flex";
                });
    
            actionsMenu.style.display = "none";
        });
    
        // Gérer la modification
        document.getElementById("editTaskForm").addEventListener("submit", function (e) {
            e.preventDefault();
    
            const formData = {
                action: "update",
                idTask: document.getElementById("editTaskId").value,
                titre: document.getElementById("editTaskTitle").value,
                description: document.getElementById("editTaskDescription").value,
                statut: document.getElementById("editTaskStatus").value,
                delai: document.getElementById("editTaskDeadline").value,
            };
    
            fetch("http://localhost/TaskFlow/backend/task.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            }).then(response => response.json())
            .then(() => {
                document.getElementById("editTaskPopup").style.display = "none";
                alert("Tâche mise à jour avec succès !");
                loadTasks();
            });
    
            actionsMenu.style.display = "none";
        });
    
        // Supprimer une tâche
        document.getElementById("deleteTask").addEventListener("click", function () {
            document.getElementById("deleteTaskPopup").style.display = "flex";
        });
    
        document.getElementById("confirmDeleteTask").addEventListener("click", function () {
            fetch("http://localhost/TaskFlow/backend/task.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", idTask: selectedTaskId }),
            }).then(response => response.json())
            .then(() => {
                document.getElementById("deleteTaskPopup").style.display = "none";
                alert("Tâche supprimée avec succès !");
                loadTasks();
            });
    
            actionsMenu.style.display = "none";
        });
    
        document.getElementById("cancelDeleteTask").addEventListener("click", function () {
            document.getElementById("deleteTaskPopup").style.display = "none";
        });
}

//profile
document.addEventListener("DOMContentLoaded", function () {
    setupProfilePopup();
});

function setupProfilePopup() {
    const profileButton = document.getElementById("profile");
    const profilePopup = document.getElementById("profilePopup");
    const closeProfilePopup = document.getElementById("closeProfilePopup");
    const profileForm = document.getElementById("profileForm");

    if (profileButton) {
        profileButton.addEventListener("click", function () {
            loadUserProfile();
            profilePopup.style.display = "flex";
        });
    }

    if (closeProfilePopup) {
        closeProfilePopup.addEventListener("click", function () {
            profilePopup.style.display = "none";
        });
    }

    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        updateUserProfile();
    });
}

// ✅ Charger les infos du profil dans le formulaire
function loadUserProfile() {
    let user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        document.getElementById("profileId").value = user.idUser;
        document.getElementById("profileName").value = user.NomComplet;
        document.getElementById("profileEmail").value = user.email;
    }
}

// ✅ Mise à jour du profil utilisateur
function updateUserProfile() {
    let formData = new FormData();
    formData.append("action", "updateProfile");
    formData.append("idUser", document.getElementById("profileId").value);
    formData.append("NomComplet", document.getElementById("profileName").value);

    let password = document.getElementById("profilePassword").value;
    if (password) formData.append("pass", password); // Ajout du mot de passe seulement si rempli

    let fileInput = document.getElementById("profilePhoto");
    if (fileInput.files.length > 0) {
        formData.append("photo", fileInput.files[0]); // Ajout de la photo si choisie
    }

    fetch("http://localhost/TaskFlow/backend/auth.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("Profil mis à jour avec succès !");
            localStorage.setItem("user", JSON.stringify(data.user)); // Mise à jour locale
            document.getElementById("profilePopup").style.display = "none";
            location.reload(); // Recharge la page pour voir les changements
        } else {
            alert("Erreur : " + data.error);
        }
    })
    .catch(error => console.error("Erreur Fetch :", error));
}


