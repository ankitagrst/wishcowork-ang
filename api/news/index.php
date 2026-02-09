<?php
require_once __DIR__ . '/../includes/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

$conn = getDBConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Public GET access, but POST/PUT/DELETE require admin
if ($method !== 'GET') {
    Auth::requireAdmin();
}
$path = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));

// Extract ID or slug from URL
$id = null;
$slug = null;
if (count($pathParts) >= 2 && $pathParts[0] === 'news' && !empty($pathParts[1])) {
    if (is_numeric($pathParts[1])) {
        $id = intval($pathParts[1]);
    } else {
        $slug = $pathParts[1];
    }
}

try {
    switch ($method) {
        case 'GET':
            if ($id || $slug) {
                // Get single news by ID or slug
                $query = $id 
                    ? "SELECT * FROM news WHERE id = :identifier" 
                    : "SELECT * FROM news WHERE slug = :identifier";
                
                $stmt = $conn->prepare($query);
                $stmt->execute(['identifier' => $id ?? $slug]);
                $news = $stmt->fetch();
                
                if ($news) {
                    // Increment view count
                    $updateViews = $conn->prepare("UPDATE news SET views = views + 1 WHERE id = ?");
                    $updateViews->execute([$news['id']]);
                    
                    // Parse JSON fields
                    if ($news['tags']) {
                        $news['tags'] = json_decode($news['tags']);
                    }
                    
                    echo json_encode($news);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'News not found']);
                }
            } else {
                // Get all news with filters
                $includeUnpublished = isset($_GET['includeUnpublished']) && $_GET['includeUnpublished'] === 'true';
                $category = $_GET['category'] ?? null;
                $featured = isset($_GET['featured']) && $_GET['featured'] === 'true';
                $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
                $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
                $search = $_GET['search'] ?? null;
                
                $query = "SELECT * FROM news WHERE 1=1";
                $params = [];
                
                if (!$includeUnpublished) {
                    $query .= " AND isPublished = 1";
                }
                
                if ($category) {
                    $query .= " AND category = :category";
                    $params['category'] = $category;
                }
                
                if ($featured) {
                    $query .= " AND isFeatured = 1";
                }
                
                if ($search) {
                    $query .= " AND (title LIKE :search OR summary LIKE :search OR content LIKE :search)";
                    $params['search'] = "%$search%";
                }
                
                $query .= " ORDER BY displayOrder ASC, publishedAt DESC";
                
                if ($limit) {
                    $query .= " LIMIT :limit OFFSET :offset";
                }
                
                $stmt = $conn->prepare($query);
                
                foreach ($params as $key => $value) {
                    $stmt->bindValue(":$key", $value);
                }
                
                if ($limit) {
                    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                }
                
                $stmt->execute();
                $newsList = $stmt->fetchAll();
                
                // Parse JSON fields
                foreach ($newsList as &$newsItem) {
                    if ($newsItem['tags']) {
                        $newsItem['tags'] = json_decode($newsItem['tags']);
                    }
                }
                
                echo json_encode($newsList);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (empty($data['title']) || empty($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and content are required']);
                exit;
            }
            
            // Generate slug if not provided
            if (empty($data['slug'])) {
                $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
            }
            
            // Prepare tags as JSON
            $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
            
            $stmt = $conn->prepare("
                INSERT INTO news (
                    title, slug, summary, content, image, source, sourceUrl,
                    category, tags, isFeatured, isPublished, publishedAt, displayOrder
                ) VALUES (
                    :title, :slug, :summary, :content, :image, :source, :sourceUrl,
                    :category, :tags, :isFeatured, :isPublished, :publishedAt, :displayOrder
                )
            ");
            
            $result = $stmt->execute([
                'title' => $data['title'],
                'slug' => $data['slug'],
                'summary' => $data['summary'] ?? null,
                'content' => $data['content'],
                'image' => $data['image'] ?? null,
                'source' => $data['source'] ?? 'WishCoWork',
                'sourceUrl' => $data['sourceUrl'] ?? null,
                'category' => $data['category'] ?? 'General',
                'tags' => $tags,
                'isFeatured' => $data['isFeatured'] ?? false,
                'isPublished' => $data['isPublished'] ?? true,
                'publishedAt' => $data['publishedAt'] ?? ($data['isPublished'] ? date('Y-m-d H:i:s') : null),
                'displayOrder' => $data['displayOrder'] ?? 0
            ]);
            
            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'message' => 'News created successfully',
                    'id' => $conn->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create news']);
            }
            break;
            
        case 'PUT':
            if (!$id && !$slug) {
                http_response_code(400);
                echo json_encode(['error' => 'News ID or slug is required']);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Build dynamic update query
            $updateFields = [];
            $params = [];
            
            $allowedFields = [
                'title', 'slug', 'summary', 'content', 'image', 'source', 'sourceUrl',
                'category', 'isFeatured', 'isPublished', 'publishedAt', 'displayOrder'
            ];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $params[$field] = $data[$field];
                }
            }
            
            // Handle tags separately
            if (isset($data['tags'])) {
                $updateFields[] = "tags = :tags";
                $params['tags'] = json_encode($data['tags']);
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }
            
            $identifier = $id ?? $slug;
            $identifierField = $id ? 'id' : 'slug';
            $params['identifier'] = $identifier;
            
            $query = "UPDATE news SET " . implode(', ', $updateFields) . " WHERE $identifierField = :identifier";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute($params);
            
            if ($result) {
                echo json_encode(['message' => 'News updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update news']);
            }
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'News ID is required']);
                exit;
            }
            
            $stmt = $conn->prepare("DELETE FROM news WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['message' => 'News deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete news']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
