<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

$db = getDBConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Public GET access, but POST/PUT/DELETE require admin
if ($method !== 'GET') {
    Auth::requireAdmin();
}

// Route handling - parse the REQUEST_URI to get the endpoint
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_parts = array_values(array_filter(explode('/', $uri)));

// Find 'pricing' in the URI and get the next part
$endpoint = '';
$pricingIndex = array_search('pricing', $uri_parts);
if ($pricingIndex !== false && isset($uri_parts[$pricingIndex + 1])) {
    $endpoint = $uri_parts[$pricingIndex + 1];
}

switch($endpoint) {
    case 'plans':
        handlePlans($db, $method);
        break;
    case 'services':
        handleServices($db, $method);
        break;
    case 'faqs':
        handleFaqs($db, $method);
        break;
    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'debug' => [
                'uri' => $uri,
                'uri_parts' => $uri_parts,
                'endpoint' => $endpoint,
                'expected' => 'plans, services, or faqs'
            ]
        ]);
        break;
}

// Handle Pricing Plans
function handlePlans($db, $method) {
    switch($method) {
        case 'GET':
            getPlans($db);
            break;
        case 'POST':
            createPlan($db);
            break;
        case 'PUT':
            updatePlan($db);
            break;
        case 'DELETE':
            deletePlan($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getPlans($db) {
    try {
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $active_only = isset($_GET['active']) ? filter_var($_GET['active'], FILTER_VALIDATE_BOOLEAN) : true;
        
        $query = "SELECT * FROM pricing_plans WHERE 1=1";
        $params = [];
        
        if ($category) {
            $query .= " AND category = ?";
            $params[] = $category;
        }
        
        if ($active_only) {
            $query .= " AND is_active = 1";
        }
        
        $query .= " ORDER BY display_order ASC, created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $plans = $stmt->fetchAll();
        
        // Convert snake_case to camelCase and parse JSON features
        $formatted_plans = array_map(function($plan) {
            return [
                'id' => $plan['id'],
                'name' => $plan['name'],
                'category' => $plan['category'],
                'price' => (float)$plan['price'],
                'unit' => $plan['unit'],
                'description' => $plan['description'],
                'features' => json_decode($plan['features'], true),
                'isPopular' => (bool)$plan['is_popular'],
                'displayOrder' => (int)$plan['display_order'],
                'isActive' => (bool)$plan['is_active'],
                'createdAt' => $plan['created_at'],
                'updatedAt' => $plan['updated_at']
            ];
        }, $plans);
        
        http_response_code(200);
        echo json_encode($formatted_plans);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function createPlan($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['category']) || !isset($data['price']) || !isset($data['unit'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $query = "INSERT INTO pricing_plans (name, category, price, unit, description, features, is_popular, display_order, is_active) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['name'],
            $data['category'],
            $data['price'],
            $data['unit'],
            $data['description'] ?? '',
            json_encode($data['features'] ?? []),
            $data['isPopular'] ?? false,
            $data['displayOrder'] ?? 0,
            $data['isActive'] ?? true
        ]);
        
        $id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Plan created successfully',
            'id' => $id
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updatePlan($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Plan ID is required']);
            return;
        }
        
        $query = "UPDATE pricing_plans SET 
                  name = ?, category = ?, price = ?, unit = ?, description = ?, 
                  features = ?, is_popular = ?, display_order = ?, is_active = ?
                  WHERE id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['name'],
            $data['category'],
            $data['price'],
            $data['unit'],
            $data['description'] ?? '',
            json_encode($data['features'] ?? []),
            $data['isPopular'] ?? false,
            $data['displayOrder'] ?? 0,
            $data['isActive'] ?? true,
            $data['id']
        ]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Plan updated successfully']);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deletePlan($db) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Plan ID is required']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM pricing_plans WHERE id = ?");
        $stmt->execute([$id]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Plan deleted successfully']);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Handle Additional Services
function handleServices($db, $method) {
    switch($method) {
        case 'GET':
            getServices($db);
            break;
        case 'POST':
            createService($db);
            break;
        case 'PUT':
            updateService($db);
            break;
        case 'DELETE':
            deleteService($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getServices($db) {
    try {
        $active_only = isset($_GET['active']) ? filter_var($_GET['active'], FILTER_VALIDATE_BOOLEAN) : true;
        
        $query = "SELECT * FROM additional_services WHERE 1=1";
        
        if ($active_only) {
            $query .= " AND is_active = 1";
        }
        
        $query .= " ORDER BY display_order ASC, created_at DESC";
        
        $stmt = $db->query($query);
        $services = $stmt->fetchAll();
        
        // Convert snake_case to camelCase
        $formatted_services = array_map(function($service) {
            return [
                'id' => $service['id'],
                'name' => $service['name'],
                'price' => (float)$service['price'],
                'unit' => $service['unit'],
                'description' => $service['description'],
                'icon' => $service['icon'],
                'displayOrder' => (int)$service['display_order'],
                'isActive' => (bool)$service['is_active'],
                'createdAt' => $service['created_at'],
                'updatedAt' => $service['updated_at']
            ];
        }, $services);
        
        http_response_code(200);
        echo json_encode($formatted_services);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function createService($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['name']) || !isset($data['price']) || !isset($data['unit'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $query = "INSERT INTO additional_services (name, price, unit, description, icon, display_order, is_active) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['name'],
            $data['price'],
            $data['unit'],
            $data['description'] ?? '',
            $data['icon'] ?? '',
            $data['displayOrder'] ?? 0,
            $data['isActive'] ?? true
        ]);
        
        $id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'message' => 'Service created successfully',
            'id' => $id
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateService($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Service ID is required']);
            return;
        }
        
        $query = "UPDATE additional_services SET 
                  name = ?, price = ?, unit = ?, description = ?, icon = ?, 
                  display_order = ?, is_active = ?
                  WHERE id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['name'],
            $data['price'],
            $data['unit'],
            $data['description'] ?? '',
            $data['icon'] ?? '',
            $data['displayOrder'] ?? 0,
            $data['isActive'] ?? true,
            $data['id']
        ]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Service updated successfully']);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteService($db) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Service ID is required']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM additional_services WHERE id = ?");
        $stmt->execute([$id]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Service deleted successfully']);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Handle FAQs
function handleFaqs($db, $method) {
    switch($method) {
        case 'GET':
            getFaqs($db);
            break;
        case 'POST':
            createFaq($db);
            break;
        case 'PUT':
            updateFaq($db);
            break;
        case 'DELETE':
            deleteFaq($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function getFaqs($db) {
    try {
        $active_only = isset($_GET['active']) ? filter_var($_GET['active'], FILTER_VALIDATE_BOOLEAN) : true;
        
        $query = "SELECT * FROM pricing_faqs WHERE 1=1";
        
        if ($active_only) {
            $query .= " AND is_active = 1";
        }
        
        $query .= " ORDER BY display_order ASC, created_at DESC";
        
        $stmt = $db->query($query);
        $faqs = $stmt->fetchAll();
        
        // Convert snake_case to camelCase
        $formatted_faqs = array_map(function($faq) {
            return [
                'id' => $faq['id'],
                'question' => $faq['question'],
                'answer' => $faq['answer'],
                'displayOrder' => (int)$faq['display_order'],
                'isActive' => (bool)$faq['is_active'],
                'createdAt' => $faq['created_at'],
                'updatedAt' => $faq['updated_at']
            ];
        }, $faqs);
        
        http_response_code(200);
        echo json_encode($formatted_faqs);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function createFaq($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['question']) || !isset($data['answer'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $query = "INSERT INTO pricing_faqs (question, answer, display_order, is_active) 
                  VALUES (?, ?, ?, ?)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['question'],
            $data['answer'],
            $data['displayOrder'] ?? 0,
            $data['isActive'] ?? true
        ]);
        
        $id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'message' => 'FAQ created successfully',
            'id' => $id
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateFaq($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'FAQ ID is required']);
            return;
        }
        
        $query = "UPDATE pricing_faqs SET 
                  question = ?, answer = ?, display_order = ?, is_active = ?
                  WHERE id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['question'],
            $data['answer'],
            $data['displayOrder'] ?? 0,
            $data['isActive'] ?? true,
            $data['id']
        ]);
        
        http_response_code(200);
        echo json_encode(['message' => 'FAQ updated successfully']);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteFaq($db) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'FAQ ID is required']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM pricing_faqs WHERE id = ?");
        $stmt->execute([$id]);
        
        http_response_code(200);
        echo json_encode(['message' => 'FAQ deleted successfully']);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
