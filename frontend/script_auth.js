/*document.addEventListener("DOMContentLoaded", function () {
    handleRegistration();
    handleLogin();
});
*/

//inscription user

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let formData = new FormData();
        formData.append("action", "register");
        formData.append("NomComplet", document.getElementById("nomComplet").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("pass", document.getElementById("password").value);
        
        let fileInput = document.getElementById("photo");
        if (fileInput.files.length > 0) {
            formData.append("photo", fileInput.files[0]); 
        }

        fetch("http://localhost/TaskFlow/backend/auth.php", {  // ⚠️ Vérifie ce chemin !
            method: "POST",
            body: formData
        })
        .then(response => response.text()) // Permet de voir la réponse brute
        .then(text => {
            console.log("Réponse brute du serveur :", text);
            try {
                let data = JSON.parse(text);
                console.log("Réponse JSON analysée :", data);
                if (data.message) {
                    alert(data.message);
                    window.location.href = "frontend/login.html";
                } else {
                    alert(data.error);
                }
            } catch (e) {
                console.error("Erreur JSON :", e, text);
            }
        })
        .catch(error => console.error("Erreur Fetch :", error));
    });
});

//connexion user

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm"); // Vérifier si l'élément existe

    if (loginForm) { // Évite l'erreur si le formulaire n'existe pas
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let formData = new FormData();
            formData.append("action", "login");
            formData.append("email", document.getElementById("email").value);
            formData.append("pass", document.getElementById("password").value);

            fetch("http://localhost/TaskFlow/backend/auth.php", {
                method: "POST",
                body: formData
            })
            .then(response => response.text()) // Récupère d'abord la réponse brute
            .then(text => {
                console.log("Réponse brute du serveur :", text);
                try {
                    let data = JSON.parse(text);
                    console.log("Réponse JSON analysée :", data);
                    if (data.message) {
                        alert(data.message);
                        localStorage.setItem("user", JSON.stringify(data.user)); // Stocker l'utilisateur
                        window.location.href = "dashboard.html"; // Redirection après connexion
                    } else {
                        alert(data.error);
                    }
                } catch (e) {
                    console.error("Erreur JSON :", e, text);
                }
            })
            .catch(error => console.error("Erreur Fetch :", error));
        });
    }
});

