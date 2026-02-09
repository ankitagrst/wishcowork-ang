<?php
// Include CORS handler first
require_once __DIR__ . '/includes/cors.php';

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/config/database.php';

echo json_encode([
    'success' => true,
    'message' => 'WishCowork API is running',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => API_VERSION,
    'cors_enabled' => true
]);
?>
