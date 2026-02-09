<?php
// cors.php - Include this at the top of every API file
// This ensures CORS headers are ALWAYS sent, regardless of .htaccess

// Start output buffering to ensure headers can be sent
if (!ob_get_level()) {
    ob_start();
}

// Remove any existing headers to avoid conflicts
if (function_exists('header_remove')) {
    @header_remove('Access-Control-Allow-Origin');
    @header_remove('Access-Control-Allow-Methods');
    @header_remove('Access-Control-Allow-Headers');
}

// Get the requesting origin or use *
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

// Set CORS headers
@header("Access-Control-Allow-Origin: $origin", true);
@header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
@header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin', true);
@header('Access-Control-Max-Age: 86400', true);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit();
}

// Register shutdown function to ensure headers are sent even on errors
register_shutdown_function(function() {
    if (ob_get_level()) {
        ob_end_flush();
    }
});
?>
