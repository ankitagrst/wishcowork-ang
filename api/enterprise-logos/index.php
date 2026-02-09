<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$conn = getDBConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

switch ($method) {
    case 'GET':
        $sql = "SELECT id, name, logo_url as logoUrl, display_order as displayOrder, is_active as isActive FROM enterprise_logos WHERE 1=1";
        if (isset($_GET['active'])) {
            $sql .= " AND is_active = 1";
        }
        $sql .= " ORDER BY display_order ASC, created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $logos = $stmt->fetchAll();
        echo json_encode(['success' => true, 'logos' => $logos]);
        break;

    case 'POST':
        // Require Admin for write operations
        $user = Auth::requireAdmin();
        if (!$user) exit();

        if (empty($input['name']) || empty($input['logoUrl'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and logoUrl are required']);
            exit();
        }

        $sql = "INSERT INTO enterprise_logos (name, logo_url, display_order, is_active) VALUES (:name, :logo_url, :display_order, :is_active)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':name' => $input['name'],
            ':logo_url' => $input['logoUrl'],
            ':display_order' => $input['displayOrder'] ?? 0,
            ':is_active' => $input['isActive'] ?? 1
        ]);
        
        echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        break;

    case 'PUT':
        $user = Auth::requireAdmin();
        if (!$user) exit();

        if (empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Logo ID is required']);
            exit();
        }

        $sql = "UPDATE enterprise_logos SET name = :name, logo_url = :logo_url, display_order = :display_order, is_active = :is_active WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':id' => $input['id'],
            ':name' => $input['name'],
            ':logo_url' => $input['logoUrl'],
            ':display_order' => $input['displayOrder'] ?? 0,
            ':is_active' => $input['isActive'] ?? 1
        ]);
        
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        $user = Auth::requireAdmin();
        if (!$user) exit();

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Logo ID is required']);
            exit();
        }

        $sql = "DELETE FROM enterprise_logos WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
