-- テーブル作成
CREATE TABLE IF NOT EXISTS package_game (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    game_title VARCHAR(200) NOT NULL,
    platform ENUM('Steam','Switch','PS4','PS5'),
    play_date DATE,
    play_status ENUM('未開封','プレイ中','クリア済み'),
    play_time_minutes INT DEFAULT 0,
    review VARCHAR(1000),
    star_level INT DEFAULT 5,
    game_image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);