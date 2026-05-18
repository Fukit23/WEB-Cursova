CREATE DATABASE IF NOT EXISTS app_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE app_store_db;

CREATE TABLE apps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_id INT,
    category VARCHAR(100)
) CHARACTER SET utf8mb4;

CREATE TABLE versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_id INT NOT NULL,
    type ENUM('official', 'repack') DEFAULT 'official',
    price DECIMAL(10, 2),
    download_link VARCHAR(255),
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

INSERT INTO apps (name, description, icon_id, category) VALUES 
('PhotoEditor Pro', 'Професійний редактор фото', 1, 'Design'),
('System Optimizer', 'Утиліта для очистки системи', 2, 'Tools');

INSERT INTO versions (app_id, type, price, download_link) VALUES 
(1, 'official', 499.00, 'https://example.com/photoshop_off'),
(1, 'repack', 0.00, 'https://example.com/photoshop_rep'),
(2, 'official', 250.00, 'https://example.com/optimizer_off'),
(2, 'repack', 0.00, 'https://example.com/optimizer_rep');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;

ALTER TABLE users ADD COLUMN role ENUM('user', 'publisher') DEFAULT 'user';

ALTER TABLE apps ADD COLUMN age_category VARCHAR(10) DEFAULT '0+';

ALTER TABLE apps ADD COLUMN icon_path VARCHAR(255) DEFAULT NULL;

CREATE TABLE downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    app_id INT NOT NULL,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE apps ADD COLUMN publisher_id INT;

ALTER TABLE versions MODIFY COLUMN type VARCHAR(50);

ALTER TABLE apps MODIFY COLUMN category VARCHAR(50);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    app_id INT NOT NULL,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    app_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE versions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DELETE FROM versions WHERE id='24';

SELECT *
FROM apps;

SELECT *
FROM versions;

SELECT *
FROM users;