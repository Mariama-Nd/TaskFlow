<?php
require_once 'config.php';
header("Content-Type: application/json");

if (!isset($_SESSION["idUser"])) {
    echo json_encode(["error" => "Utilisateur non authentifié"]);
    exit;
}

$idUser = $_SESSION["idUser"];

// Récupérer les statistiques
$stmt = $pdo->prepare("SELECT COUNT(*) AS total FROM task WHERE idUser = ?");
$stmt->execute([$idUser]);
$totalTasks = $stmt->fetch(PDO::FETCH_ASSOC)["total"];

$stmt = $pdo->prepare("SELECT COUNT(*) AS completed FROM task WHERE idUser = ? AND statut = 'terminée'");
$stmt->execute([$idUser]);
$completedTasks = $stmt->fetch(PDO::FETCH_ASSOC)["completed"];

$stmt = $pdo->prepare("SELECT COUNT(*) AS inProgress FROM task WHERE idUser = ? AND statut = 'en cours'");
$stmt->execute([$idUser]);
$inProgressTasks = $stmt->fetch(PDO::FETCH_ASSOC)["inProgress"];

echo json_encode([
    "total" => $totalTasks,
    "completed" => $completedTasks,
    "inProgress" => $inProgressTasks
]);
?>
