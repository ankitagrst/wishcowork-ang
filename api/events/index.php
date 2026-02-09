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

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];

// Public GET access, but POST/PUT/DELETE require admin
if ($method !== 'GET') {
    Auth::requireAdmin();
}
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_parts = array_values(array_filter(explode('/', $uri)));

// Find 'events' in URI and get endpoint
$eventsIndex = array_search('events', $uri_parts);
$endpoint = isset($uri_parts[$eventsIndex + 1]) ? $uri_parts[$eventsIndex + 1] : '';

// Handle different endpoints
switch ($endpoint) {
    case '':
    case 'list':
        handleEvents($db, $method);
        break;
    default:
        // Check if endpoint is numeric (ID)
        if (is_numeric($endpoint)) {
            handleEventById($db, $method, $endpoint);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        break;
}

function handleEvents($db, $method) {
    switch ($method) {
        case 'GET':
            getEvents($db);
            break;
        case 'POST':
            createEvent($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

function handleEventById($db, $method, $id) {
    switch ($method) {
        case 'GET':
            getEventById($db, $id);
            break;
        case 'PUT':
            updateEvent($db, $id);
            break;
        case 'DELETE':
            deleteEvent($db, $id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

// GET all events
function getEvents($db) {
    try {
        $includeInactive = isset($_GET['includeInactive']) && $_GET['includeInactive'] === 'true';
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $upcoming = isset($_GET['upcoming']) && $_GET['upcoming'] === 'true';
        
        $query = "SELECT * FROM events WHERE 1=1";
        $params = [];
        
        if (!$includeInactive) {
            $query .= " AND isActive = 1";
        }
        
        if ($category) {
            $query .= " AND category = :category";
            $params[':category'] = $category;
        }
        
        if ($upcoming) {
            $query .= " AND eventDate >= CURDATE()";
        }
        
        $query .= " ORDER BY displayOrder ASC, eventDate ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $events = $stmt->fetchAll();
        
        echo json_encode($events);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch events: ' . $e->getMessage()]);
    }
}

// GET event by ID
function getEventById($db, $id) {
    try {
        $query = "SELECT * FROM events WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $event = $stmt->fetch();
        
        if ($event) {
            echo json_encode($event);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch event: ' . $e->getMessage()]);
    }
}

// CREATE new event
function createEvent($db) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['title']) || !isset($data['description']) || !isset($data['eventDate'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $query = "INSERT INTO events (title, description, eventDate, eventTime, location, image, category, registrationLink, isFeatured, isActive, displayOrder, maxAttendees, currentAttendees) 
                  VALUES (:title, :description, :eventDate, :eventTime, :location, :image, :category, :registrationLink, :isFeatured, :isActive, :displayOrder, :maxAttendees, :currentAttendees)";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':eventDate' => $data['eventDate'],
            ':eventTime' => $data['eventTime'] ?? '00:00:00',
            ':location' => $data['location'] ?? '',
            ':image' => $data['image'] ?? null,
            ':category' => $data['category'] ?? 'General',
            ':registrationLink' => $data['registrationLink'] ?? null,
            ':isFeatured' => isset($data['isFeatured']) ? (int)$data['isFeatured'] : 0,
            ':isActive' => isset($data['isActive']) ? (int)$data['isActive'] : 1,
            ':displayOrder' => $data['displayOrder'] ?? 0,
            ':maxAttendees' => $data['maxAttendees'] ?? null,
            ':currentAttendees' => $data['currentAttendees'] ?? 0
        ]);
        
        if ($result) {
            $data['id'] = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(['message' => 'Event created successfully', 'event' => $data]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create event: ' . $e->getMessage()]);
    }
}

// UPDATE event
function updateEvent($db, $id) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request data']);
            return;
        }
        
        $query = "UPDATE events SET 
                  title = :title, 
                  description = :description, 
                  eventDate = :eventDate, 
                  eventTime = :eventTime, 
                  location = :location, 
                  image = :image, 
                  category = :category, 
                  registrationLink = :registrationLink, 
                  isFeatured = :isFeatured, 
                  isActive = :isActive, 
                  displayOrder = :displayOrder,
                  maxAttendees = :maxAttendees,
                  currentAttendees = :currentAttendees
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':eventDate' => $data['eventDate'],
            ':eventTime' => $data['eventTime'] ?? '00:00:00',
            ':location' => $data['location'] ?? '',
            ':image' => $data['image'] ?? null,
            ':category' => $data['category'] ?? 'General',
            ':registrationLink' => $data['registrationLink'] ?? null,
            ':isFeatured' => isset($data['isFeatured']) ? (int)$data['isFeatured'] : 0,
            ':isActive' => isset($data['isActive']) ? (int)$data['isActive'] : 1,
            ':displayOrder' => $data['displayOrder'] ?? 0,
            ':maxAttendees' => $data['maxAttendees'] ?? null,
            ':currentAttendees' => $data['currentAttendees'] ?? 0
        ]);
        
        if ($result) {
            echo json_encode(['message' => 'Event updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update event: ' . $e->getMessage()]);
    }
}

// DELETE event
function deleteEvent($db, $id) {
    try {
        $query = "DELETE FROM events WHERE id = :id";
        $stmt = $db->prepare($query);
        $result = $stmt->execute([':id' => $id]);
        
        if ($result && $stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Event deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete event: ' . $e->getMessage()]);
    }
}
?>
