mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<EOSQL
DROP DATABASE \`${MYSQL_DATABASE}\`;

CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
use \`${MYSQL_DATABASE}\`

-- Table utilisateur
CREATE TABLE IF NOT EXISTS \`User\` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mail VARCHAR(255) NOT NULL UNIQUE,
    two_fa BOOLEAN DEFAULT FALSE,
    language VARCHAR(10),
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
	last_seen DATETIME DEFAULT NULL
);

-- Table Profile
CREATE TABLE IF NOT EXISTS Profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    xp BIGINT,
    path_img VARCHAR(255),
    bio VARCHAR(255),
    elo BIGINT,
    id_user INT NOT NULL UNIQUE,
    FOREIGN KEY(id_user) REFERENCES \`User\`(id)
);

-- Table Game
CREATE TABLE IF NOT EXISTS Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_player_one INT NOT NULL,
    id_player_second INT NOT NULL,
    nb_cuts BIGINT,
    timestamp DATETIME,
    id_winner INT NOT NULL,
    FOREIGN KEY(id_winner) REFERENCES \`User\`(id),
    FOREIGN KEY(id_player_one) REFERENCES \`User\`(id),
    FOREIGN KEY(id_player_second) REFERENCES \`User\`(id)
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
    FOREIGN KEY(id_user_1) REFERENCES \`User\`(id),
    FOREIGN KEY(id_user_2) REFERENCES \`User\`(id)
);

-- Table User_Achievements
CREATE TABLE IF NOT EXISTS User_achievements (
    id_user INT NOT NULL,
    id_achievement INT NOT NULL,
    type VARCHAR(255),
    PRIMARY KEY(id_user, id_achievement),
    FOREIGN KEY(id_user) REFERENCES \`User\`(id),
    FOREIGN KEY(id_achievement) REFERENCES Achievements(id)
);
EOSQL

echo "BASE DE DONNEE A JOUR ET VIDE"
