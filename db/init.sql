CREATE TABLE IF NOT EXISTS package_game (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    game_title VARCHAR(200) NOT NULL,
    platform VARCHAR(20),                
    play_date DATE,
    play_status VARCHAR(20),             
    play_time_minutes INT DEFAULT 0,
    review VARCHAR(1000),
    star_level DECIMAL(3,1) DEFAULT 5.0,  
    game_image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);