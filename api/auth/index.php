<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Get action from query string or default to null
$action = isset($_GET['action']) ? $_GET['action'] : null;

// Login (POST without action, or GET to test endpoint)
if ($method === 'POST' && !$action) {
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email and password are required'
        ]);
        exit();
    }
    
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed'
        ]);
        exit();
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $input['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !Auth::verifyPassword($input['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid credentials'
            ]);
            exit();
        }
        
        $token = Auth::generateToken($user['id'], $user['email'], $user['role']);
        
        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Register
if ($method === 'POST' && $action === 'register') {
    if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, and name are required']);
        exit();
    }
    
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $input['email']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'User already exists']);
            exit();
        }
        
        // Create user
        $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        
        $hashedPassword = Auth::hashPassword($input['password']);
        $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($input['name']) . '&background=6366f1&color=fff';
        
        $stmt = $conn->prepare("INSERT INTO users (id, email, password, name, role, avatar) VALUES (:id, :email, :password, :name, 'user', :avatar)");
        $stmt->execute([
            ':id' => $userId,
            ':email' => $input['email'],
            ':password' => $hashedPassword,
            ':name' => $input['name'],
            ':avatar' => $avatar
        ]);
        
        $token = Auth::generateToken($userId, $input['email'], 'user');
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $input['email'],
                'name' => $input['name'],
                'role' => 'user',
                'avatar' => $avatar
            ]
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Get current user
if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'me') {
    $user = Auth::requireAuth();
    
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $stmt = $conn->prepare("SELECT id, email, name, role, avatar, created_at FROM users WHERE id = :id");
        $stmt->execute([':id' => $user['id']]);
        $userData = $stmt->fetch();
        
        if (!$userData) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit();
        }
        
        echo json_encode([
            'success' => true,
            'user' => $userData
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Validate token
if ($method === 'POST' && $action === 'validate') {
    $user = Auth::requireAuth();
    echo json_encode([
        'success' => true,
        'valid' => true,
        'user' => $user
    ]);
    exit();
}

// Handle GET request for testing
if ($method === 'GET') {
    echo json_encode([
        'success' => true,
        'message' => 'Auth endpoint is working',
        'endpoints' => [
            'POST /auth' => 'Login with email and password',
            'POST /auth?action=register' => 'Register new user',
            'POST /auth?action=validate' => 'Validate token'
        ]
    ]);
    exit();
}

http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => 'Endpoint not found',
    'method' => $method,
    'action' => $action
]);
?>
