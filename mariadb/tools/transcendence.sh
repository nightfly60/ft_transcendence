mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<EOSQL
DROP DATABASE \`${MYSQL_DATABASE}\`;

CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
use \`${MYSQL_DATABASE}\`;

-- Table utilisateur
CREATE TABLE IF NOT EXISTS \`User\` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mail VARCHAR(255) NOT NULL UNIQUE,
    two_fa BOOLEAN DEFAULT FALSE,
    language VARCHAR(10),
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
	last_seen DATETIME DEFAULT NULL,
	two_fa_secret VARCHAR(255)
);

-- Table Profile
CREATE TABLE IF NOT EXISTS Profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    xp BIGINT,
    path_img VARCHAR(255),
    bio VARCHAR(255),
    elo BIGINT,
    id_user INT NOT NULL UNIQUE,
    FOREIGN KEY(id_user) REFERENCES \`User\`(id) ON DELETE CASCADE
);

-- Table Achievements
CREATE TABLE IF NOT EXISTS Achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    objective BIGINT,
    type VARCHAR(255),
    description TEXT
);

-- Table Friends
CREATE TABLE IF NOT EXISTS friends (
    id_user_1 INT NOT NULL,
    id_user_2 INT NOT NULL,
    PRIMARY KEY(id_user_1, id_user_2),
    FOREIGN KEY(id_user_1) REFERENCES \`User\`(id) ON DELETE CASCADE,
    FOREIGN KEY(id_user_2) REFERENCES \`User\`(id) ON DELETE CASCADE
);

-- Table User_Achievements
CREATE TABLE IF NOT EXISTS User_achievements (
    id_user INT NOT NULL,
    id_achievement INT NOT NULL,
    progression VARCHAR(255),
    PRIMARY KEY(id_user, id_achievement),
    FOREIGN KEY(id_user) REFERENCES \`User\`(id) ON DELETE CASCADE,
    FOREIGN KEY(id_achievement) REFERENCES Achievements(id) ON DELETE CASCADE
);

-- Table User_API
CREATE TABLE IF NOT EXISTS User_API (
    id_user INT NOT NULL,
    usages INT DEFAULT 0,
    reset_date DATETIME,
	secret_key VARCHAR(255),
    PRIMARY KEY(id_user),
	FOREIGN KEY(id_user) REFERENCES \`User\`(id) ON DELETE CASCADE
);

INSERT INTO Achievements (name, objective, description, type) VALUES
('Premier sang',   1,   'Gagner votre première partie', 'win'),
('Conquérant',     5,   'Gagner 5 parties', 'win'),
('Centenaire',     100, 'Jouer 100 parties', 'game'),
('Vétéran',        50,  'Jouer 50 parties', 'game'),
('Elite',          1500,  'Atteindre un elo de 1500', 'elo'),
('Clutch',         20,   'Jouer une partie de plus de 20 coups', 'upper_cut'),
('Marathonien',    80,  'Jouer une partie de plus de 80 coups', 'upper_cut');

-- Table Conversation
CREATE TABLE IF NOT EXISTS Conversation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user_1 INT NOT NULL,
    id_user_2 INT NOT NULL,
    type ENUM('game', 'dm'),
    created_at TIMESTAMP,
    FOREIGN KEY(id_user_1) REFERENCES \`User\`(id) ON DELETE CASCADE,
    FOREIGN KEY(id_user_2) REFERENCES \`User\`(id) ON DELETE CASCADE
);

-- Table Message
CREATE TABLE IF NOT EXISTS Message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_conversation INT NOT NULL,
    id_sender INT NOT NULL,
    content VARCHAR(255),
    sent_at TIMESTAMP,
    FOREIGN KEY(id_conversation) REFERENCES \`Conversation\`(id),
    FOREIGN KEY(id_sender) REFERENCES \`User\`(id) ON DELETE CASCADE
);

-- Table Game
CREATE TABLE IF NOT EXISTS Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nb_cuts BIGINT,
    timestamp DATETIME,
    id_player_one INT NOT NULL,
    id_player_second INT,
    id_winner INT,
    id_conversation INT NULL,
    FOREIGN KEY(id_player_one) REFERENCES \`User\`(id) ON DELETE CASCADE,
    FOREIGN KEY(id_player_second) REFERENCES \`User\`(id) ON DELETE CASCADE,
    FOREIGN KEY(id_winner) REFERENCES \`User\`(id) ON DELETE CASCADE,
    FOREIGN KEY(id_conversation) REFERENCES \`Conversation\`(id)

EOSQL


echo "BASE DE DONNEE A JOUR ET VIDE"
