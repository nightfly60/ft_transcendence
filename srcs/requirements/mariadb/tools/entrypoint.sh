#!/bin/sh
set -e

if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB..."

    mysql_install_db --user=mysql --datadir=/var/lib/mysql

    mysqld --user=mysql --datadir=/var/lib/mysql <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';

CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};

CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;

USE ${MYSQL_DATABASE};

-- Table utilisateur
CREATE TABLE IF NOT EXISTS `User` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mail VARCHAR(255) NOT NULL UNIQUE,
    two_fa BOOLEAN DEFAULT FALSE,
    language VARCHAR(10),
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255)
);

-- Table Profile
CREATE TABLE IF NOT EXISTS Profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    xp BIGINT,
    path_img VARCHAR(255),
    bio VARCHAR(255),
    elo BIGINT,
    id_user INT NOT NULL UNIQUE,
    FOREIGN KEY(id_user) REFERENCES `User`(id)
);

-- Table Game
CREATE TABLE IF NOT EXISTS Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nb_cuts BIGINT,
    timestamp DATETIME,
    id_winner INT NOT NULL,
    FOREIGN KEY(id_winner) REFERENCES `User`(id)
);

-- Table Achievements
CREATE TABLE IF NOT EXISTS Achievments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    objective BIGINT,
    description TEXT
);

-- Table Friends
CREATE TABLE IF NOT EXISTS friends (
    id_user_1 INT NOT NULL,
    id_user_2 INT NOT NULL,
    PRIMARY KEY(id_user_1, id_user_2),
    FOREIGN KEY(id_user_1) REFERENCES `User`(id),
    FOREIGN KEY(id_user_2) REFERENCES `User`(id)
);

-- Table User_Game
CREATE TABLE IF NOT EXISTS User_Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_player_one INT NOT NULL,
    id_player_second INT NOT NULL,
    FOREIGN KEY(id_player_one) REFERENCES `User`(id),
    FOREIGN KEY(id_player_second) REFERENCES `User`(id)
);

-- Table User_Achievments
CREATE TABLE IF NOT EXISTS User_achievments (
    id_user INT NOT NULL,
    id_achievment INT NOT NULL,
    type VARCHAR(255),
    PRIMARY KEY(id_user, id_achievment),
    FOREIGN KEY(id_user) REFERENCES `User`(id),
    FOREIGN KEY(id_achievment) REFERENCES Achievments(id)
);

EOF
fi

# MariaDB PID 1
exec mysqld_safe --user=mysql --console
