<?php
require_once __DIR__ . '/../config/database.php';

class Auth {
    
    // Generate JWT Token
    public static function generateToken($userId, $email, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'id' => $userId,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + JWT_EXPIRE
        ]);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    // Verify JWT Token
    public static function verifyToken($token) {
        if (!$token) {
            return false;
        }
        
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return false;
        }
        
        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        if ($base64UrlSignature !== $signatureProvided) {
            return false;
        }
        
        $payloadData = json_decode($payload, true);
        
        if (!isset($payloadData['exp']) || $payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    // Get token from header
    public static function getBearerToken() {
        $headers = self::getAllHeaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    // Helper to get all headers (fallback for non-apache)
    private static function getAllHeaders() {
        if (function_exists('getallheaders')) {
            return getallheaders();
        }
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
    
    // Check if user is authenticated
    public static function requireAuth() {
        $token = self::getBearerToken();
        $decoded = self::verifyToken($token);
        
        if (!$decoded) {
            // Ensure CORS headers are sent via the shared handler
            require_once __DIR__ . '/cors.php';
            @header('Content-Type: application/json', true);
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Invalid or missing token']);
            exit();
        }
        
        return $decoded;
    }
    
    // Check if user is admin
    public static function requireAdmin() {
        $user = self::requireAuth();
        
        // Allow 'admin' or 'superuser' roles to access admin-only endpoints
        if ($user['role'] !== 'admin' && $user['role'] !== 'superuser') {
            // Ensure CORS headers are sent
            require_once __DIR__ . '/cors.php';
            @header('Content-Type: application/json', true);
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. Admin only.']);
            exit();
        }
        
        return $user;
    }

    // Check if user is superuser
    public static function requireSuperuser() {
        $user = self::requireAuth();

        if ($user['role'] !== 'superuser') {
            require_once __DIR__ . '/cors.php';
            @header('Content-Type: application/json', true);
            http_response_code(403);
            echo json_encode(['error' => 'Access denied. Superuser only.']);
            exit();
        }

        return $user;
    }
    
    // Hash password
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    
    // Verify password
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
?>
