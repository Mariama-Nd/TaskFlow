<?php
session_start();
session_destroy();
echo json_encode(["message" => "Déconnexion réussie"]);
?>
