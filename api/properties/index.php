<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Get all properties (Public)
if ($method === 'GET' && !isset($_GET['id']) && !isset($_GET['slug'])) {
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    $sql = "SELECT * FROM properties WHERE 1=1";
    $params = [];
    
    // Filters
    if (isset($_GET['category'])) {
        $sql .= " AND category = :category";
        $params[':category'] = $_GET['category'];
    }
    
    if (isset($_GET['city'])) {
        $sql .= " AND city = :city";
        $params[':city'] = $_GET['city'];
    }
    
    if (isset($_GET['featured'])) {
        $sql .= " AND featured = :featured";
        $params[':featured'] = $_GET['featured'] === 'true' ? 1 : 0;
    }
    
    if (isset($_GET['availability'])) {
        $sql .= " AND availability = :availability";
        $params[':availability'] = $_GET['availability'];
    }
    
    if (isset($_GET['search'])) {
        $sql .= " AND (title LIKE :search OR address LIKE :search2 OR description LIKE :search3)";
        $searchTerm = '%' . $_GET['search'] . '%';
        $params[':search'] = $searchTerm;
        $params[':search2'] = $searchTerm;
        $params[':search3'] = $searchTerm;
    }
    
    $sql .= " ORDER BY featured DESC, created_at DESC";
    
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $properties = $stmt->fetchAll();
        
        // Parse JSON fields and transform to camelCase for frontend
        foreach ($properties as &$property) {
            $property['amenities'] = json_decode($property['amenities'] ?: '[]');
            $property['photos'] = json_decode($property['photos'] ?: '[]');
            $property['featured'] = (bool) $property['featured'];
            $property['priceType'] = $property['price_type']; // Add camelCase version
            // Add camelCase versions for pricing options
            $property['includeServiceFee'] = (bool) ($property['include_service_fee'] ?? false);
            $property['serviceFeePercent'] = (float) ($property['service_fee_percent'] ?? 10);
            $property['includeTax'] = (bool) ($property['include_tax'] ?? false);
            $property['taxPercent'] = (float) ($property['tax_percent'] ?? 18);
            $property['coordinates'] = ($property['latitude'] && $property['longitude']) ? [
                'lat' => (float) $property['latitude'],
                'lng' => (float) $property['longitude']
            ] : null;
        }
        
        echo json_encode([
            'success' => true,
            'properties' => $properties
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Get property by ID or slug (Public)
if ($method === 'GET' && (isset($_GET['id']) || isset($_GET['slug']))) {
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM properties WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM properties WHERE slug = :slug");
            $stmt->execute([':slug' => $_GET['slug']]);
        }
        
        $property = $stmt->fetch();
        
        if (!$property) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            exit();
        }
        
        // Parse JSON fields and transform to camelCase for frontend
        $property['amenities'] = json_decode($property['amenities'] ?: '[]');
        $property['photos'] = json_decode($property['photos'] ?: '[]');
        $property['featured'] = (bool) $property['featured'];
        $property['priceType'] = $property['price_type']; // Add camelCase version
        // Add camelCase versions for pricing options
        $property['includeServiceFee'] = (bool) ($property['include_service_fee'] ?? false);
        $property['serviceFeePercent'] = (float) ($property['service_fee_percent'] ?? 10);
        $property['includeTax'] = (bool) ($property['include_tax'] ?? false);
        $property['taxPercent'] = (float) ($property['tax_percent'] ?? 18);
        $property['coordinates'] = ($property['latitude'] && $property['longitude']) ? [
            'lat' => (float) $property['latitude'],
            'lng' => (float) $property['longitude']
        ] : null;
        
        echo json_encode([
            'success' => true,
            'property' => $property
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Legacy: Get property by SEO URL (kept for compatibility)
if ($method === 'GET' && isset($_GET['city']) && isset($_GET['category']) && isset($_GET['slug'])) {
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM properties WHERE slug = :slug AND city = :city AND category = :category");
        $stmt->execute([
            ':slug' => $_GET['slug'],
            ':city' => $_GET['city'],
            ':category' => $_GET['category']
        ]);
        $property = $stmt->fetch();
        
        if (!$property) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            exit();
        }
        
        $property['amenities'] = json_decode($property['amenities'] ?: '[]');
        $property['photos'] = json_decode($property['photos'] ?: '[]');
        $property['featured'] = (bool) $property['featured'];
        $property['coordinates'] = ($property['latitude'] && $property['longitude']) ? [
            'lat' => (float) $property['latitude'],
            'lng' => (float) $property['longitude']
        ] : null;
        
        echo json_encode([
            'success' => true,
            'property' => $property
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Create property (Admin only)
if ($method === 'POST') {
    try {
        $user = Auth::requireAdmin();
    } catch (Exception $e) {
        // Ensure CORS headers on auth failure
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['error' => 'Authentication failed', 'message' => $e->getMessage()]);
        exit();
    }
    
    if (!isset($input['title']) || !isset($input['slug']) || !isset($input['category']) || 
        !isset($input['city']) || !isset($input['address']) || !isset($input['price'])) {
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing required fields',
            'required' => ['title', 'slug', 'category', 'city', 'address', 'price'],
            'received' => array_keys($input)
        ]);
        exit();
    }
    
    $conn = getDBConnection();
    if (!$conn) {
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $propertyId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        
        $stmt = $conn->prepare("
            INSERT INTO properties (id, title, slug, category, city, address, price, price_type, 
                                  amenities, photos, description, featured, availability, rating, reviews, latitude, longitude,
                                  include_service_fee, service_fee_percent, include_tax, tax_percent)
            VALUES (:id, :title, :slug, :category, :city, :address, :price, :price_type, 
                    :amenities, :photos, :description, :featured, :availability, :rating, :reviews, :latitude, :longitude,
                    :include_service_fee, :service_fee_percent, :include_tax, :tax_percent)
        ");
        
        $stmt->execute([
            ':id' => $propertyId,
            ':title' => $input['title'],
            ':slug' => $input['slug'],
            ':category' => $input['category'],
            ':city' => $input['city'],
            ':address' => $input['address'],
            ':price' => $input['price'],
            ':price_type' => $input['price_type'] ?? 'monthly',
            ':amenities' => json_encode($input['amenities'] ?? []),
            ':photos' => json_encode($input['photos'] ?? []),
            ':description' => $input['description'] ?? '',
            ':featured' => isset($input['featured']) ? ($input['featured'] ? 1 : 0) : 0,
            ':availability' => $input['availability'] ?? 'available',
            ':rating' => $input['rating'] ?? 0,
            ':reviews' => $input['reviews'] ?? 0,
            ':latitude' => $input['latitude'] ?? null,
            ':longitude' => $input['longitude'] ?? null,
            ':include_service_fee' => isset($input['include_service_fee']) ? ($input['include_service_fee'] ? 1 : 0) : 0,
            ':service_fee_percent' => $input['service_fee_percent'] ?? 10,
            ':include_tax' => isset($input['include_tax']) ? ($input['include_tax'] ? 1 : 0) : 0,
            ':tax_percent' => $input['tax_percent'] ?? 18
        ]);
        
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Property created successfully',
            'propertyId' => $propertyId
        ]);
        
    } catch(PDOException $e) {
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(['error' => 'Property with this slug already exists']);
        } else {
            http_response_code(500);
            echo json_encode([
                'error' => 'Database error',
                'message' => $e->getMessage(),
                'code' => $e->getCode()
            ]);
        }
    }
    exit();
}

// Update property (Admin only)
if ($method === 'PUT' && isset($_GET['id'])) {
    $user = Auth::requireAdmin();
    
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $updates = [];
        $params = [':id' => $_GET['id']];
        
        $allowedFields = ['title', 'slug', 'category', 'city', 'address', 'price', 'price_type', 
                         'description', 'featured', 'availability', 'rating', 'reviews', 'latitude', 'longitude',
                         'include_service_fee', 'service_fee_percent', 'include_tax', 'tax_percent'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $input[$field];
            }
        }
        
        if (isset($input['amenities'])) {
            $updates[] = "amenities = :amenities";
            $params[':amenities'] = json_encode($input['amenities']);
        }
        
        if (isset($input['photos'])) {
            $updates[] = "photos = :photos";
            $params[':photos'] = json_encode($input['photos']);
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit();
        }
        
        $sql = "UPDATE properties SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            exit();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Property updated successfully'
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

// Delete property (Admin only)
if ($method === 'DELETE' && isset($_GET['id'])) {
    $user = Auth::requireAdmin();
    
    $conn = getDBConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    try {
        $stmt = $conn->prepare("DELETE FROM properties WHERE id = :id");
        $stmt->execute([':id' => $_GET['id']]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            exit();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Property deleted successfully'
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
?>
