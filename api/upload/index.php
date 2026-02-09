<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../includes/auth.php';

// Require Admin for uploads
$user = Auth::requireAdmin();
if (!$user) exit();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit();
}

$file = $_FILES['file'];
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

if (!in_array(strtolower($ext), $allowedExts)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Allowed: ' . implode(', ', $allowedExts)]);
    exit();
}

$filename = uniqid('img_', true) . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return the relative URL or full URL
    // Get protocol and host
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host . rtrim(dirname($_SERVER['PHP_SELF']), '/upload') . '/uploads/';
    
    echo json_encode([
        'success' => true,
        'url' => $baseUrl . $filename,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
