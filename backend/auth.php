<?php
ob_start(); // Évite les erreurs de sortie avant JSON
require_once 'config.php';

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Définition du dossier d'upload
$uploadDir = __DIR__ . "/uploads/"; // Utilisation d'un chemin absolu

// Vérifier et créer le dossier s'il n'existe pas
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Inscription d'un utilisateur
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"]) && $_POST["action"] == "register") {
    $nom = trim($_POST["NomComplet"]);
    $email = trim($_POST["email"]);
    $password = password_hash($_POST["pass"], PASSWORD_BCRYPT);
    $photoPath = NULL;

    // Vérifier si l'email existe déjà
    $checkStmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $checkStmt->execute([$email]);

    if ($checkStmt->rowCount() > 0) {
        echo json_encode(["error" => "Cet email est déjà utilisé."]);
        exit;
    }

    // Gestion de l'upload de l'image
    if (!empty($_FILES["photo"]["name"])) {
        $fileName = time() . "_" . basename($_FILES["photo"]["name"]);
        $targetFilePath = $uploadDir . $fileName;
        
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
        $allowedTypes = ["jpg", "jpeg", "png", "gif"];

        if (in_array($fileType, $allowedTypes)) {
            if (is_writable($uploadDir)) { // Vérifie si le dossier est accessible en écriture
                if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetFilePath)) {
                    $photoPath = "uploads/" . $fileName; // Chemin relatif
                } else {
                    echo json_encode(["error" => "Erreur lors de l'upload de la photo."]);
                    exit;
                }
            } else {
                echo json_encode(["error" => "Le dossier d'upload n'est pas accessible en écriture."]);
                exit;
            }
        } else {
            echo json_encode(["error" => "Formats autorisés : JPG, JPEG, PNG, GIF."]);
            exit;
        }
    }

    // Insérer l'utilisateur dans la base de données
    $stmt = $pdo->prepare("INSERT INTO users (NomComplet, email, pass, photo) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$nom, $email, $password, $photoPath])) {
        echo json_encode(["message" => "Inscription réussie"]);
    } else {
        echo json_encode(["error" => "Erreur lors de l'inscription"]);
    }
    exit;
}

// Connexion d'un utilisateur
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"]) && $_POST["action"] == "login") {
    $email = trim($_POST["email"]);
    $password = $_POST["pass"];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user["pass"])) {
        $_SESSION["idUser"] = $user["idUser"];
        $_SESSION["NomComplet"] = $user["NomComplet"];
        $_SESSION["photo"] = $user["photo"];

        // Nettoie tout buffer de sortie avant d'envoyer le JSON
        ob_end_clean();

        echo json_encode([
            "message" => "Connexion réussie",
            "user" => [
                "idUser" => $user["idUser"],
                "NomComplet" => $user["NomComplet"],
                "email" => $user["email"],
                "photo" => $user["photo"]
            ]
        ]);
    } else {
        ob_end_clean();
        echo json_encode(["error" => "Email ou mot de passe incorrect"]);
    }
    exit;
}

// ✅ Vérification si l'utilisateur est connecté
if (!isset($_SESSION["idUser"])) {
    echo json_encode(["error" => "Utilisateur non authentifié"]);
    exit;
}

$idUser = $_SESSION["idUser"];
$data = $_POST;

// ✅ Mise à jour du profil utilisateur
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($data["action"]) && $data["action"] == "updateProfile") {
    $NomComplet = trim($data["NomComplet"]);
    $password = isset($data["pass"]) ? password_hash($data["pass"], PASSWORD_BCRYPT) : null;
    $photo = "";

    // Gestion du fichier image si fourni
    if (!empty($_FILES["photo"]["name"])) {
        $targetDir = "uploads/";
        $photo = $targetDir . basename($_FILES["photo"]["name"]);
        move_uploaded_file($_FILES["photo"]["tmp_name"], $photo);
    }

    // Mise à jour SQL
    if ($password) {
        $stmt = $pdo->prepare("UPDATE users SET NomComplet = ?, pass = ?, photo = IF(? != '', ?, photo) WHERE idUser = ?");
        $stmt->execute([$NomComplet, $password, $photo, $photo, $idUser]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET NomComplet = ?, photo = IF(? != '', ?, photo) WHERE idUser = ?");
        $stmt->execute([$NomComplet, $photo, $photo, $idUser]);
    }

    // Récupérer les nouvelles infos de l'utilisateur
    $stmt = $pdo->prepare("SELECT idUser, NomComplet, email, photo FROM users WHERE idUser = ?");
    $stmt->execute([$idUser]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["message" => "Profil mis à jour", "user" => $user]);
}
?>
