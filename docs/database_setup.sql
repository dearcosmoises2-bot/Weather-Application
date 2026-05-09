CREATE DATABASE weather_app;

USE weather_app;

CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100),
    temperature FLOAT,
    weather_condition VARCHAR(100),
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO search_history (city, temperature, weather_condition)
VALUES
('New York', 72, 'partly cloudy'),
('Los Angeles', 80, 'clear sky'),
('Chicago', 65, 'light rain'),
('Miami', 85, 'sunny'),
('Seattle', 58, 'overcast clouds');