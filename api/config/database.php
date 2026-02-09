<?php
// Database Configuration
define('DB_HOST', 'localhost:3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'wiishdb');

// JWT Secret Key (Change this to a random string)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'secureRandomStringHereChangeItInProduction');
define('JWT_EXPIRE', 86400); // 24 hours in seconds

// CORS Settings
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: '*'); // Change to your domain in production or set env var

// API Settings
define('API_VERSION', 'v1');

// Upload Settings
define('UPLOAD_DIR', '../uploads/');
define('MAX_FILE_SIZE', 5242880); // 5MB

// Database Connection
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;

    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}
?>
