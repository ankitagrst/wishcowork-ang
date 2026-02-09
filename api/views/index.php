<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $conn = getDBConnection();
    
    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    switch($method) {
        case 'POST':
            // Track a property view
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['property_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'property_id is required']);
                exit;
            }
            
            $propertyId = $data['property_id'];
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            $stmt = $conn->prepare("
                INSERT INTO property_views (property_id, ip_address, user_agent)
                VALUES (:property_id, :ip_address, :user_agent)
            ");
            
            $stmt->execute([
                ':property_id' => $propertyId,
                ':ip_address' => $ipAddress,
                ':user_agent' => $userAgent
            ]);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'View tracked successfully'
            ]);
            break;
            
        case 'GET':
            // Get view statistics
            if (isset($_GET['property_id'])) {
                // Get views for specific property
                $propertyId = $_GET['property_id'];
                
                $stmt = $conn->prepare("
                    SELECT COUNT(*) as total_views
                    FROM property_views
                    WHERE property_id = :property_id
                ");
                
                $stmt->execute([':property_id' => $propertyId]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'property_id' => $propertyId,
                    'total_views' => (int)$result['total_views']
                ]);
            } else {
                // Get total views across all properties
                $stmt = $conn->query("
                    SELECT 
                        COUNT(*) as total_views,
                        COUNT(DISTINCT property_id) as properties_viewed,
                        COUNT(DISTINCT DATE(viewed_at)) as days_with_views
                    FROM property_views
                ");
                
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Get views by property
                $stmt = $conn->query("
                    SELECT 
                        pv.property_id,
                        p.title,
                        COUNT(*) as views
                    FROM property_views pv
                    LEFT JOIN properties p ON pv.property_id = p.id
                    GROUP BY pv.property_id
                    ORDER BY views DESC
                    LIMIT 10
                ");
                
                $topProperties = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'total_views' => (int)$result['total_views'],
                    'properties_viewed' => (int)$result['properties_viewed'],
                    'days_with_views' => (int)$result['days_with_views'],
                    'top_properties' => $topProperties
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
