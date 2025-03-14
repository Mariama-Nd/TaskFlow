<?php
session_start();

$host = "localhost";
$dbname = "TaskFlow_db";
$username = "root"; // À modifier si besoin
$password = ""; // À modifier si besoin

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
