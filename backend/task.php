<?php
require_once 'config.php';
session_start();
header("Content-Type: application/json");

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION["idUser"])) {
    echo json_encode(["error" => "Utilisateur non authentifié"]);
    exit;
}

$idUser = $_SESSION["idUser"];
$data = json_decode(file_get_contents("php://input"), true);

// Ajouter une tâche
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($data["action"]) && $data["action"] == "add") {
    $titre = trim($data["titre"]);
    $description = trim($data["description"]);
    $statut = $data["statut"] ?? "Initié";
    $delai = !empty($data["delai"]) ? $data["delai"] : NULL;

    $stmt = $pdo->prepare("INSERT INTO task (titre, description, statut, delai, idUser) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$titre, $description, $statut, $delai, $idUser])) {
        echo json_encode(["message" => "Tâche ajoutée avec succès"]);
    } else {
        echo json_encode(["error" => "Erreur lors de l'ajout de la tâche"]);
    }
}

// Récupérer toutes les tâches de l'utilisateur connecté
if ($_SERVER["REQUEST_METHOD"] === "GET" && !isset($_GET["idTask"])) {
    $stmt = $pdo->prepare("SELECT idTask, titre, description, statut, dateCreation, delai FROM task WHERE idUser = ?");
    $stmt->execute([$idUser]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// Récupérer une tâche spécifique (pour la modification)
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["idTask"])) {
    $idTask = $_GET["idTask"];
    $stmt = $pdo->prepare("SELECT idTask, titre, description, statut, delai FROM task WHERE idTask = ? AND idUser = ?");
    $stmt->execute([$idTask, $idUser]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($task ? $task : ["error" => "Tâche introuvable"]);
}

// Modifier une tâche
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($data["action"]) && $data["action"] == "update") {
    $idTask = $data["idTask"];

    $stmt = $pdo->prepare("SELECT titre, description, delai FROM task WHERE idTask = ? AND idUser = ?");
    $stmt->execute([$idTask, $idUser]);
    $task = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$task) {
        echo json_encode(["error" => "Tâche introuvable"]);
        exit;
    }

    $titre = !empty($data["titre"]) ? trim($data["titre"]) : $task["titre"];
    $description = !empty($data["description"]) ? trim($data["description"]) : $task["description"];
    $delai = !empty($data["delai"]) ? $data["delai"] : $task["delai"];
    $statut = $data["statut"];

    $stmt = $pdo->prepare("UPDATE task SET titre = ?, description = ?, statut = ?, delai = ? WHERE idTask = ? AND idUser = ?");
    if ($stmt->execute([$titre, $description, $statut, $delai, $idTask, $idUser])) {
        echo json_encode(["message" => "Tâche mise à jour"]);
    } else {
        echo json_encode(["error" => "Erreur lors de la mise à jour"]);
    }
}

// Supprimer une tâche
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($data["action"]) && $data["action"] == "delete") {
    $idTask = $data["idTask"];

    $stmt = $pdo->prepare("DELETE FROM task WHERE idTask = ? AND idUser = ?");
    if ($stmt->execute([$idTask, $idUser])) {
        echo json_encode(["message" => "Tâche supprimée"]);
    } else {
        echo json_encode(["error" => "Erreur lors de la suppression"]);
    }
}
?>
