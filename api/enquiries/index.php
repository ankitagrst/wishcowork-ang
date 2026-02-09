<?php
// Include CORS handler first
require_once __DIR__ . '/../includes/cors.php';

// Additional Headers
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Get all enquiries (Admin only)
if ($method === 'GET') {
    // Check authentication
    $user = Auth::requireAdmin();

    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $sql = "SELECT e.*, p.title as property_title 
                FROM enquiries e 
                LEFT JOIN properties p ON e.property_id = p.id 
                ORDER BY e.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $enquiries = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'enquiries' => $enquiries
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
    exit();
}

// Create new enquiry (Public)
if ($method === 'POST') {
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    // Validate required fields
    $required = ['type', 'name', 'email', 'phone'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit();
        }
    }
    
    try {
        $sql = "INSERT INTO enquiries (
                    property_id, type, name, email, phone, 
                    guests, check_in, check_out, message, status
                ) VALUES (
                    :property_id, :type, :name, :email, :phone, 
                    :guests, :check_in, :check_out, :message, 'pending'
                )";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':property_id' => $input['property_id'] ?? null,
            ':type' => $input['type'],
            ':name' => $input['name'],
            ':email' => $input['email'],
            ':phone' => $input['phone'],
            ':guests' => $input['guests'] ?? null,
            ':check_in' => $input['check_in'] ?? null,
            ':check_out' => $input['check_out'] ?? null,
            ':message' => $input['message'] ?? null
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Enquiry submitted successfully',
            'enquiryId' => $conn->lastInsertId()
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
    exit();
}

// Update enquiry status (Admin only)
if ($method === 'PUT') {
    // Check authentication
    $user = Auth::requireAdmin();

    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing enquiry ID']);
        exit();
    }

    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $sql = "UPDATE enquiries SET status = :status WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':status' => $input['status'],
            ':id' => $_GET['id']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Enquiry updated successfully'
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
    exit();
}

// Delete enquiry (Admin only)
if ($method === 'DELETE') {
    // Check authentication
    $user = Auth::requireAdmin();

    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing enquiry ID']);
        exit();
    }

    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $sql = "DELETE FROM enquiries WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':id' => $_GET['id']]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Enquiry deleted successfully'
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
