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
if (count($pathParts) >= 2 && $pathParts[0] === 'blogs' && !empty($pathParts[1])) {
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
                // Get single blog by ID or slug
                $query = $id 
                    ? "SELECT * FROM blogs WHERE id = :identifier" 
                    : "SELECT * FROM blogs WHERE slug = :identifier";
                
                $stmt = $conn->prepare($query);
                $stmt->execute(['identifier' => $id ?? $slug]);
                $blog = $stmt->fetch();
                
                if ($blog) {
                    // Increment view count
                    $updateViews = $conn->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
                    $updateViews->execute([$blog['id']]);
                    
                    // Parse JSON fields
                    if ($blog['tags']) {
                        $blog['tags'] = json_decode($blog['tags']);
                    }
                    
                    echo json_encode($blog);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Blog not found']);
                }
            } else {
                // Get all blogs with filters
                $includeUnpublished = isset($_GET['includeUnpublished']) && $_GET['includeUnpublished'] === 'true';
                $category = $_GET['category'] ?? null;
                $featured = isset($_GET['featured']) && $_GET['featured'] === 'true';
                $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
                $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
                $search = $_GET['search'] ?? null;
                
                $query = "SELECT * FROM blogs WHERE 1=1";
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
                    $query .= " AND (title LIKE :search OR excerpt LIKE :search OR content LIKE :search)";
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
                $blogs = $stmt->fetchAll();
                
                // Parse JSON fields
                foreach ($blogs as &$blog) {
                    if ($blog['tags']) {
                        $blog['tags'] = json_decode($blog['tags']);
                    }
                }
                
                echo json_encode($blogs);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (empty($data['title']) || empty($data['content']) || empty($data['author'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title, content, and author are required']);
                exit;
            }
            
            // Generate slug if not provided
            if (empty($data['slug'])) {
                $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
            }
            
            // Prepare tags as JSON
            $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
            
            $stmt = $conn->prepare("
                INSERT INTO blogs (
                    title, slug, excerpt, content, featuredImage, author, authorImage,
                    category, tags, readTime, isFeatured, isPublished, publishedAt,
                    displayOrder, metaTitle, metaDescription, metaKeywords
                ) VALUES (
                    :title, :slug, :excerpt, :content, :featuredImage, :author, :authorImage,
                    :category, :tags, :readTime, :isFeatured, :isPublished, :publishedAt,
                    :displayOrder, :metaTitle, :metaDescription, :metaKeywords
                )
            ");
            
            $result = $stmt->execute([
                'title' => $data['title'],
                'slug' => $data['slug'],
                'excerpt' => $data['excerpt'] ?? null,
                'content' => $data['content'],
                'featuredImage' => $data['featuredImage'] ?? null,
                'author' => $data['author'],
                'authorImage' => $data['authorImage'] ?? null,
                'category' => $data['category'] ?? 'General',
                'tags' => $tags,
                'readTime' => $data['readTime'] ?? 5,
                'isFeatured' => $data['isFeatured'] ?? false,
                'isPublished' => $data['isPublished'] ?? true,
                'publishedAt' => $data['publishedAt'] ?? ($data['isPublished'] ? date('Y-m-d H:i:s') : null),
                'displayOrder' => $data['displayOrder'] ?? 0,
                'metaTitle' => $data['metaTitle'] ?? null,
                'metaDescription' => $data['metaDescription'] ?? null,
                'metaKeywords' => $data['metaKeywords'] ?? null
            ]);
            
            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'message' => 'Blog created successfully',
                    'id' => $conn->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create blog']);
            }
            break;
            
        case 'PUT':
            if (!$id && !$slug) {
                http_response_code(400);
                echo json_encode(['error' => 'Blog ID or slug is required']);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Build dynamic update query
            $updateFields = [];
            $params = [];
            
            $allowedFields = [
                'title', 'slug', 'excerpt', 'content', 'featuredImage', 'author', 'authorImage',
                'category', 'readTime', 'isFeatured', 'isPublished', 'publishedAt',
                'displayOrder', 'metaTitle', 'metaDescription', 'metaKeywords'
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
            
            $query = "UPDATE blogs SET " . implode(', ', $updateFields) . " WHERE $identifierField = :identifier";
            $stmt = $conn->prepare($query);
            $result = $stmt->execute($params);
            
            if ($result) {
                echo json_encode(['message' => 'Blog updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update blog']);
            }
            break;
            
        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Blog ID is required']);
                exit;
            }
            
            $stmt = $conn->prepare("DELETE FROM blogs WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['message' => 'Blog deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete blog']);
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
