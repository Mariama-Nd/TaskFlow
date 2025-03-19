-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mer. 19 mars 2025 à 22:24
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `TaskFlow_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `task`
--

CREATE TABLE `task` (
  `idTask` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `statut` enum('Initié','En Cours','Terminé') NOT NULL,
  `idUser` int(11) DEFAULT NULL,
  `dateCreation` timestamp NOT NULL DEFAULT current_timestamp(),
  `delai` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task`
--

INSERT INTO `task` (`idTask`, `titre`, `description`, `statut`, `idUser`, `dateCreation`, `delai`) VALUES
(6, 'Rapport Financier', 'Préparer le rapport du Q1', 'Terminé', 1, '2024-03-10 08:30:00', '2024-03-20'),
(7, 'Développement API', 'Créer les endpoints pour le projet', 'En Cours', 1, '2024-03-11 14:15:00', '2024-04-05'),
(9, 'Réunion stratégique', 'Planifier la roadmap 2024', 'Initié', 1, '2024-03-13 09:00:00', '2024-03-25'),
(12, 'test1', 'test', 'En Cours', 3, '2025-03-14 00:16:14', '2025-03-16'),
(13, 'test2', 'test2', 'Initié', 3, '2025-03-14 00:18:19', '2025-03-30'),
(14, 'Développement API', 'Créer une API REST pour le projet', 'Terminé', 1, '2025-03-16 23:37:41', '2025-04-01'),
(15, 'Correction de bugs', 'Résoudre les erreurs signalées par les utilisateurs', 'Terminé', 1, '2025-03-16 23:37:41', '2025-03-10'),
(16, 'Mise à jour UI', 'Améliorer l’interface utilisateur', 'Initié', 1, '2025-03-16 23:37:41', '2025-04-05'),
(17, 'Test de performance', 'Effectuer des tests de charge', 'En Cours', 2, '2025-03-16 23:37:41', '2025-04-07'),
(18, 'Documentation', 'Rédiger la documentation du projet', 'Initié', 2, '2025-03-16 23:37:41', '2025-04-15'),
(19, 'Sécurité', 'Renforcer la sécurité du système', 'En Cours', 3, '2025-03-16 23:37:41', '2025-04-20'),
(20, 'Déploiement', 'Déployer l’application sur le serveur de production', 'Initié', 3, '2025-03-16 23:37:41', '2025-04-25'),
(21, 'tache test', 'ceci est juste pour un test', 'En Cours', 8, '2025-03-18 21:51:08', '2025-03-20'),
(22, 'test', 'cette tâche est juste pour la présentation d\'aujourd\'hui', 'Initié', 11, '2025-03-18 22:19:45', '2025-03-20');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `idUser` int(11) NOT NULL,
  `NomComplet` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`idUser`, `NomComplet`, `email`, `pass`, `photo`) VALUES
(1, 'mama', 'mama@gmail.com', '$2y$10$bGZUdhUXrlFTBT22SsUmdug/t6fO3bcW8dxVGS/nadvI.V8IRqpY6', 'uploads/1741855512_mariama.png'),
(2, '', '', '$2y$10$jPJgS21El8MKwGLr2zBuY.ZG2OLhixhnFCylGd5JePyYsstu9CM7.', NULL),
(3, 'yama', 'yama@gmail.com', '$2y$10$j8TZbkDkxCbpUrWPt84Rq.jWNNMrdEFsiAA2g2YM5l.taMBOmnVXy', 'uploads/1741910384_baba.jpeg'),
(4, 'Omar Diop', 'omar@gmail.com', '$2y$10$sMaz0j/rYQEoNSsThNOCheJ4FkanWJWFw/tBnC5XeFonAp5sEetl2', 'uploads/1741910671_moi.jpeg'),
(5, 'Pape Moussa Faye', 'papemoussa@gmail.com', '$2y$10$SgzdiPbwM6NVDWfGRzSUNeY0LVz0Kk4jjN85XbNTxF2sOemTbnlIi', 'uploads/1741910798_WhatsApp Image 2024-07-01 at 09.58.23.jpeg'),
(6, 'hgv', 'gcfhv@gmail.com', '$2y$10$4eZvCFkYsPstlN5Rciv72eVFDZrnOQ4BjjUNJVk4FxGCSGRO4et1S', 'uploads/1742332193_Capture d’écran 2025-03-18 à 19.10.24.png'),
(7, 'mmm', 'mmm@gmail.com', '$2y$10$blNigIiEpivHtlYTFp5osu5rTUd8tBVYWOcX6RyczNJxrsN1Ih90i', 'uploads/1742332361_Capture d’écran 2025-03-18 à 19.10.24.png'),
(8, 'mariama ndiaye', 'mamandiaye@gmail.com', '$2y$10$9ZsEPh1s8vjgxkj1ZsN8buIe4/HFTI2T/MYHA.B7Zc3Me1wDqMHW2', 'uploads/1742334373_internet-2.png'),
(9, 'wer', 'ef@gmail.com', '$2y$10$4jJ4HM2Dk1urE.yvzzmOPOZ1b4j0F5fWNHKUFIN0dm2HsasEm64y2', NULL),
(10, 'fhg', 'qq@gmail.com', '$2y$10$knC0uNwwks.B1yJGC4mJIuZDzraFAY6uzRnajWYjmmq.U0C7OgE4e', NULL),
(11, 'yama ndiaye', 'ndiayemama@gmail.com', '$2y$10$b8wq67dZIfNNkibXgzUgcOIiYRnI8WEreVUurM0iQ8o2bmluXqR/i', 'uploads/1742336082_internet-2.png');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`idTask`),
  ADD KEY `idUser` (`idUser`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`idUser`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `task`
--
ALTER TABLE `task`
  MODIFY `idTask` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `task_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
