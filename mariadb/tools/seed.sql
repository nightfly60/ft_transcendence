-- Seed data for transdance database
-- Passwords are bcrypt hash of "password123"

USE `transcendence`;

-- Clear existing data (order respects foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE User_achievements;
TRUNCATE TABLE User_Game;
TRUNCATE TABLE friends;
TRUNCATE TABLE Game;
TRUNCATE TABLE Achievements;
TRUNCATE TABLE Profile;
TRUNCATE TABLE `User`;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO `User` (mail, two_fa, language, password, username) VALUES
('alice@example.com',   FALSE, 'fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Alice'),
('bob@example.com',     FALSE, 'en', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Bob'),
('charlie@example.com', FALSE, 'fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Charlie'),
('diana@example.com',   TRUE,  'en', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Diana'),
('eve@example.com',     FALSE, 'es', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Eve'),
('frank@example.com',   FALSE, 'fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Frank'),
('grace@example.com',   TRUE,  'en', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Grace'),
('heidi@example.com',   FALSE, 'de', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Heidi'),
('ivan@example.com',    FALSE, 'fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Ivan'),
('judy@example.com',    FALSE, 'en', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/APlbT/oS', 'Judy');

-- Profiles
INSERT INTO Profile (xp, path_img, bio, elo, id_user) VALUES
(1500, '/avatars/alice.png',   'Joueuse passionnée de pong',        1200, 1),
(800,  '/avatars/bob.png',     'Toujours prêt pour une partie',     950,  2),
(3200, '/avatars/charlie.png', 'Vétéran du tournoi',                1450, 3),
(550,  '/avatars/diana.png',   'Novice mais motivée',               800,  4),
(2100, '/avatars/eve.png',     'Stratège du rebond',                1300, 5),
(4500, '/avatars/frank.png',   'Champion régional 2024',            1600, 6),
(900,  '/avatars/grace.png',   'Joueuse régulière',                 1050, 7),
(120,  '/avatars/heidi.png',   'Nouvelle venue',                    700,  8),
(2800, '/avatars/ivan.png',    'Maître de la défense',              1380, 9),
(1100, '/avatars/judy.png',    'Aime les longues parties',          1100, 10);

-- Achievements
INSERT INTO Achievements (name, objective, description, type) VALUES
('Premier sang',   1,   'Gagner votre première partie', 'win'),
('Conquérant',     5,   'Gagner 5 parties', 'win'),
('Centenaire',     100, 'Jouer 100 parties', 'game'),
('Vétéran',        50,  'Jouer 50 parties', 'game'),
('Elite',          1500,  'Atteindre un elo de 1500', 'elo'),
('Clutch',         10,   'Gagner une partie en moins de 10 coups', 'under_cut'),
('Marathonien',    80,  'Jouer une partie de plus de 80 coups', 'upper_cut');

-- Games (id_winner référence un User existant)
INSERT INTO Game (nb_cuts, timestamp, id_winner) VALUES
(12, '2025-01-10 14:23:00', 1),
(8,  '2025-01-11 16:45:00', 3),
(15, '2025-01-12 10:00:00', 6),
(5,  '2025-01-13 18:30:00', 2),
(20, '2025-01-14 09:15:00', 9),
(9,  '2025-01-15 20:00:00', 5),
(11, '2025-01-16 13:10:00', 6),
(7,  '2025-01-17 11:55:00', 1),
(14, '2025-01-18 17:20:00', 3),
(6,  '2025-01-19 15:40:00', 7);

-- User_Game (qui a joué contre qui)
INSERT INTO User_Game (id_player_one, id_player_second) VALUES
(1, 2),
(3, 4),
(6, 5),
(2, 9),
(9, 7),
(5, 8),
(6, 3),
(1, 4),
(3, 10),
(7, 6);

-- Friends
INSERT INTO friends (id_user_1, id_user_2) VALUES
(1, 2),
(1, 3),
(2, 5),
(3, 6),
(4, 7),
(5, 9),
(6, 9),
(7, 10),
(8, 1),
(9, 10);

-- User_Achievements
INSERT INTO User_achievements (id_user, id_achievement, type) VALUES
(1, 1, '100'),
(1, 5, '50'),
(2, 1, '100'),
(3, 1, '20'),
(3, 2, '100'),
(3, 5, '100'),
(6, 1, '100'),
(6, 2, '100'),
(6, 3, '100'),
(6, 6, '100'),
(9, 1, '90'),
(9, 5, '100'),
(5, 1, '100'),
(5, 4, '10'),
(7, 1, '15');
