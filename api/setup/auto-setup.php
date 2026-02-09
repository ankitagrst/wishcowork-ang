<?php
/**
 * Automated Setup Script
 * Handles all database table creation and data seeding automatically
 * Run this once to set up the entire database
 */

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';

// Initialize response
$response = [
    'success' => true,
    'message' => 'Setup completed successfully',
    'steps' => [],
    'errors' => []
];

// Get database connection
try {
    $conn = getDBConnection();
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Database connection failed: ' . $e->getMessage();
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

// Define all table creation scripts
$tableScripts = [
    'properties' => "
        CREATE TABLE IF NOT EXISTS properties (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            category VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            address TEXT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            price_type ENUM('hourly', 'daily', 'monthly') DEFAULT 'monthly',
            amenities JSON,
            photos JSON,
            description TEXT,
            featured BOOLEAN DEFAULT FALSE,
            availability ENUM('available', 'limited', 'full') DEFAULT 'available',
            rating DECIMAL(3, 2) DEFAULT 0,
            reviews INT DEFAULT 0,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            include_service_fee BOOLEAN DEFAULT FALSE,
            service_fee_percent DECIMAL(5, 2) DEFAULT 10.00,
            include_tax BOOLEAN DEFAULT FALSE,
            tax_percent DECIMAL(5, 2) DEFAULT 18.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_slug (slug),
            INDEX idx_category (category),
            INDEX idx_city (city),
            INDEX idx_featured (featured)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'pricing_plans' => "
        CREATE TABLE IF NOT EXISTS pricing_plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category ENUM('coworking', 'private', 'virtual', 'meeting') NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            unit ENUM('hour', 'day', 'month', 'year') NOT NULL,
            features JSON,
            is_popular BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_active (is_active),
            INDEX idx_popular (is_popular)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'additional_services' => "
        CREATE TABLE IF NOT EXISTS additional_services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            unit ENUM('hour', 'day', 'month', 'one-time') NOT NULL,
            icon VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'pricing_faqs' => "
        CREATE TABLE IF NOT EXISTS pricing_faqs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'events' => "
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            eventDate DATE NOT NULL,
            eventTime TIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            image VARCHAR(500),
            category VARCHAR(100),
            registrationLink VARCHAR(500),
            isFeatured BOOLEAN DEFAULT FALSE,
            isActive BOOLEAN DEFAULT TRUE,
            displayOrder INT DEFAULT 0,
            maxAttendees INT DEFAULT 0,
            currentAttendees INT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_date (eventDate),
            INDEX idx_category (category),
            INDEX idx_active (isActive),
            INDEX idx_featured (isFeatured)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'users' => "
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user', 'superuser') DEFAULT 'user',
            phone VARCHAR(20),
            company VARCHAR(255),
            avatar VARCHAR(500),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'blogs' => "
        CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            excerpt TEXT,
            content LONGTEXT NOT NULL,
            featuredImage VARCHAR(500),
            author VARCHAR(255) NOT NULL,
            authorImage VARCHAR(500),
            category VARCHAR(100),
            tags JSON,
            readTime INT DEFAULT 5,
            views INT DEFAULT 0,
            isFeatured BOOLEAN DEFAULT FALSE,
            isPublished BOOLEAN DEFAULT TRUE,
            publishedAt TIMESTAMP NULL,
            displayOrder INT DEFAULT 0,
            metaTitle VARCHAR(255),
            metaDescription TEXT,
            metaKeywords VARCHAR(500),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_slug (slug),
            INDEX idx_category (category),
            INDEX idx_published (isPublished),
            INDEX idx_featured (isFeatured),
            INDEX idx_published_at (publishedAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'news' => "
        CREATE TABLE IF NOT EXISTS news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            summary TEXT,
            content TEXT NOT NULL,
            image VARCHAR(500),
            source VARCHAR(255),
            sourceUrl VARCHAR(500),
            category VARCHAR(100),
            tags JSON,
            isFeatured BOOLEAN DEFAULT FALSE,
            isPublished BOOLEAN DEFAULT TRUE,
            publishedAt TIMESTAMP NULL,
            displayOrder INT DEFAULT 0,
            views INT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_slug (slug),
            INDEX idx_category (category),
            INDEX idx_published (isPublished),
            INDEX idx_featured (isFeatured),
            INDEX idx_published_at (publishedAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'enquiries' => "
        CREATE TABLE IF NOT EXISTS enquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            property_id VARCHAR(36),
            type ENUM('booking', 'tour') NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            guests VARCHAR(50),
            check_in DATE,
            check_out DATE,
            message TEXT,
            status ENUM('pending', 'contacted', 'closed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
            INDEX idx_property (property_id),
            INDEX idx_status (status),
            INDEX idx_type (type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ",
    
    'enterprise_logos' => "
        CREATE TABLE IF NOT EXISTS enterprise_logos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logo_url VARCHAR(500) NOT NULL,
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    "
];

// Ensure all tables exist
foreach ($tableScripts as $tableName => $sql) {
    try {
        $conn->exec($sql);
        $response['steps'][] = "✅ Table '$tableName' created/verified successfully";
        
        // Special check for properties table to ensure it matches the new schema
        if ($tableName === 'properties') {
            $idCol = $conn->query("SHOW COLUMNS FROM properties WHERE Field = 'id'")->fetch();
            if ($idCol && strpos(strtolower($idCol['Type']), 'int') !== false) {
                $conn->exec("DROP TABLE properties");
                $conn->exec($tableScripts['properties']);
                $response['steps'][] = "✅ Recreated 'properties' table with new schema (UUID support)";
            }
        }
        
        // Special check for users table to ensure it matches the new schema
        if ($tableName === 'users') {
            $columns = $conn->query("DESCRIBE users")->fetchAll(PDO::FETCH_COLUMN);
            
            // Check if ID is INT (old schema) - if so, we must recreate to support UUIDs
            $idCol = $conn->query("SHOW COLUMNS FROM users WHERE Field = 'id'")->fetch();
            if ($idCol && strpos(strtolower($idCol['Type']), 'int') !== false) {
                $conn->exec("DROP TABLE users");
                $conn->exec($tableScripts['users']);
                $response['steps'][] = "✅ Recreated 'users' table with new schema (UUID support)";
            } else {
                // Just add missing columns if they don't exist
                if (!in_array('is_active', $columns)) {
                    $conn->exec("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
                    $response['steps'][] = "✅ Added 'is_active' column to 'users' table";
                }
                if (!in_array('avatar', $columns)) {
                    $conn->exec("ALTER TABLE users ADD COLUMN avatar VARCHAR(500)");
                    $response['steps'][] = "✅ Added 'avatar' column to 'users' table";
                }
            }
        }
    } catch (PDOException $e) {
        $response['errors'][] = "❌ Error creating table '$tableName': " . $e->getMessage();
        $response['success'] = false;
    }
}

// Seed data for each table
$seedData = [
    // Properties
    'properties' => [
        [
            'id' => 'prop-001',
            'title' => 'WishCoWork Premium Hub',
            'slug' => 'wishcowork-premium-hub',
            'category' => 'coworking',
            'city' => 'Noida',
            'address' => 'Sector 62, Noida, Uttar Pradesh 201301',
            'price' => 6999,
            'price_type' => 'monthly',
            'amenities' => json_encode(['High-speed WiFi', 'Coffee/Tea', 'Meeting Rooms', 'Parking']),
            'photos' => json_encode(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']),
            'description' => 'Our flagship location in Noida offering premium coworking spaces.',
            'featured' => 1,
            'availability' => 'available',
            'rating' => 4.8,
            'reviews' => 124,
            'latitude' => 28.6282,
            'longitude' => 77.3649,
            'include_service_fee' => 0,
            'service_fee_percent' => 10,
            'include_tax' => 0,
            'tax_percent' => 18
        ],
        [
            'id' => 'prop-002',
            'title' => 'WishCoWork Cyber City',
            'slug' => 'wishcowork-cyber-city',
            'category' => 'private',
            'city' => 'Gurgaon',
            'address' => 'DLF Cyber City, Phase 2, Gurgaon, Haryana 122002',
            'price' => 15999,
            'price_type' => 'monthly',
            'amenities' => json_encode(['24/7 Access', 'Private Cabins', 'Reception', 'Lounge Area']),
            'photos' => json_encode(['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800']),
            'description' => 'Strategic location in the heart of Gurgaon\'s business district.',
            'featured' => 1,
            'availability' => 'available',
            'rating' => 4.9,
            'reviews' => 86,
            'latitude' => 28.4951,
            'longitude' => 77.0891,
            'include_service_fee' => 1,
            'service_fee_percent' => 10,
            'include_tax' => 1,
            'tax_percent' => 18
        ],
        [
            'id' => 'prop-003',
            'title' => 'WishCoWork Tech Park',
            'slug' => 'wishcowork-tech-park',
            'category' => 'coworking',
            'city' => 'Bangalore',
            'address' => 'Whitefield, Bangalore, Karnataka 560066',
            'price' => 8999,
            'price_type' => 'monthly',
            'amenities' => json_encode(['High-speed WiFi', 'Gaming Zone', 'Cafeteria', 'Nap Pods']),
            'photos' => json_encode(['https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800']),
            'description' => 'Modern workspace designed for tech startups and innovators.',
            'featured' => 0,
            'availability' => 'available',
            'rating' => 4.7,
            'reviews' => 52,
            'latitude' => 12.9698,
            'longitude' => 77.7499,
            'include_service_fee' => 0,
            'service_fee_percent' => 10,
            'include_tax' => 0,
            'tax_percent' => 18
        ]
    ],
    
    // Pricing Plans
    'pricing_plans' => [
        [
            'name' => 'Hot Desk',
            'description' => 'Flexible workspace, first come first served',
            'category' => 'coworking',
            'price' => 199,
            'unit' => 'day',
            'features' => json_encode(['High-speed WiFi', 'Printing Credits', 'Tea/Coffee', 'Community Events']),
            'is_popular' => false,
            'is_active' => true,
            'display_order' => 1
        ],
        [
            'name' => 'Dedicated Desk',
            'description' => 'Your own desk in shared space',
            'category' => 'coworking',
            'price' => 6999,
            'unit' => 'month',
            'features' => json_encode(['Personal Storage', '24/7 Access', 'High-speed WiFi', 'Meeting Room Credits', 'Mail Handling']),
            'is_popular' => true,
            'is_active' => true,
            'display_order' => 2
        ],
        [
            'name' => 'Private Cabin',
            'description' => 'Fully private office for 1-2 people',
            'category' => 'private',
            'price' => 15999,
            'unit' => 'month',
            'features' => json_encode(['Private Office', '24/7 Access', 'Customizable Space', 'Priority Support', 'Mail Handling', 'Meeting Room Access']),
            'is_popular' => true,
            'is_active' => true,
            'display_order' => 3
        ],
        [
            'name' => 'Team Office',
            'description' => 'Private office for 3-10 people',
            'category' => 'private',
            'price' => 35999,
            'unit' => 'month',
            'features' => json_encode(['Private Office', '24/7 Access', 'Dedicated Workspace', 'Conference Room Access', 'Priority Support', 'Custom Branding']),
            'is_popular' => false,
            'is_active' => true,
            'display_order' => 4
        ],
        [
            'name' => 'Virtual Office',
            'description' => 'Professional business address',
            'category' => 'virtual',
            'price' => 2999,
            'unit' => 'month',
            'features' => json_encode(['Business Address', 'Mail Handling', 'GST Registration', 'Call Forwarding', 'Day Pass Credits']),
            'is_popular' => false,
            'is_active' => true,
            'display_order' => 5
        ],
        [
            'name' => 'Meeting Room',
            'description' => 'Professional meeting space',
            'category' => 'meeting',
            'price' => 500,
            'unit' => 'hour',
            'features' => json_encode(['Projector/TV', 'Whiteboard', 'High-speed WiFi', 'Video Conferencing', 'Tea/Coffee']),
            'is_popular' => false,
            'is_active' => true,
            'display_order' => 6
        ]
    ],
    
    // Additional Services
    'additional_services' => [
        [
            'name' => 'Printing & Scanning',
            'description' => 'B&W and Color printing, scanning services',
            'price' => 5,
            'unit' => 'one-time',
            'icon' => 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
            'is_active' => true,
            'display_order' => 1
        ],
        [
            'name' => 'Locker Facility',
            'description' => 'Secure storage locker',
            'price' => 500,
            'unit' => 'month',
            'icon' => 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
            'is_active' => true,
            'display_order' => 2
        ],
        [
            'name' => 'Dedicated Phone Number',
            'description' => 'Professional phone line with call handling',
            'price' => 999,
            'unit' => 'month',
            'icon' => 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
            'is_active' => true,
            'display_order' => 3
        ],
        [
            'name' => 'Premium Refreshments',
            'description' => 'Unlimited premium tea, coffee, and snacks',
            'price' => 1500,
            'unit' => 'month',
            'icon' => 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
            'is_active' => true,
            'display_order' => 4
        ]
    ],
    
    // Pricing FAQs
    'pricing_faqs' => [
        [
            'question' => 'What payment methods do you accept?',
            'answer' => 'We accept all major credit/debit cards, UPI, net banking, and cash. We also offer monthly invoicing for corporate clients.',
            'display_order' => 1,
            'is_active' => true
        ],
        [
            'question' => 'Is there a security deposit?',
            'answer' => 'Yes, we require a refundable security deposit equal to one month\'s rent for dedicated desks and private offices. Day passes and hot desks don\'t require a deposit.',
            'display_order' => 2,
            'is_active' => true
        ],
        [
            'question' => 'Can I upgrade or downgrade my plan?',
            'answer' => 'Absolutely! You can upgrade anytime. For downgrades, we require 30 days notice. The pricing difference will be adjusted in your next billing cycle.',
            'display_order' => 3,
            'is_active' => true
        ],
        [
            'question' => 'Do you offer trial days?',
            'answer' => 'Yes! We offer a free trial day for first-time visitors. Contact us to schedule your visit and experience our workspace.',
            'display_order' => 4,
            'is_active' => true
        ],
        [
            'question' => 'Are there any hidden charges?',
            'answer' => 'No hidden charges! All our pricing is transparent. The only additional costs would be for optional add-on services you choose to use.',
            'display_order' => 5,
            'is_active' => true
        ]
    ],
    
    // Events
    'events' => [
        [
            'title' => 'Startup Networking Mix',
            'description' => 'Join fellow entrepreneurs, freelancers, and innovators for an evening of networking and knowledge sharing. Connect with like-minded professionals over refreshments.',
            'eventDate' => date('Y-m-d', strtotime('+15 days')),
            'eventTime' => '18:00:00',
            'location' => 'WishCoWork Hub, Sector 62, Noida',
            'image' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            'category' => 'Networking',
            'registrationLink' => 'https://forms.gle/example1',
            'isFeatured' => true,
            'isActive' => true,
            'displayOrder' => 1,
            'maxAttendees' => 50,
            'currentAttendees' => 23
        ],
        [
            'title' => 'Digital Marketing Workshop',
            'description' => 'Learn the latest digital marketing strategies from industry experts. Topics include SEO, social media marketing, content strategy, and analytics.',
            'eventDate' => date('Y-m-d', strtotime('+20 days')),
            'eventTime' => '14:00:00',
            'location' => 'WishCoWork Hub, Sector 62, Noida',
            'image' => 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800',
            'category' => 'Workshop',
            'registrationLink' => 'https://forms.gle/example2',
            'isFeatured' => true,
            'isActive' => true,
            'displayOrder' => 2,
            'maxAttendees' => 30,
            'currentAttendees' => 18
        ],
        [
            'title' => 'Pitch Perfect: Investor Meetup',
            'description' => 'Practice your startup pitch in front of real investors and get valuable feedback. Limited slots available for startups seeking funding.',
            'eventDate' => date('Y-m-d', strtotime('+25 days')),
            'eventTime' => '16:00:00',
            'location' => 'WishCoWork Hub, Sector 62, Noida',
            'image' => 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800',
            'category' => 'Networking',
            'registrationLink' => 'https://forms.gle/example3',
            'isFeatured' => true,
            'isActive' => true,
            'displayOrder' => 3,
            'maxAttendees' => 20,
            'currentAttendees' => 15
        ],
        [
            'title' => 'Women in Tech Leadership Summit',
            'description' => 'Celebrating and empowering women leaders in technology. Panel discussions, workshops, and networking opportunities.',
            'eventDate' => date('Y-m-d', strtotime('+30 days')),
            'eventTime' => '10:00:00',
            'location' => 'WishCoWork Hub, Sector 62, Noida',
            'image' => 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
            'category' => 'Summit',
            'registrationLink' => 'https://forms.gle/example4',
            'isFeatured' => false,
            'isActive' => true,
            'displayOrder' => 4,
            'maxAttendees' => 100,
            'currentAttendees' => 45
        ],
        [
            'title' => 'Freelancer Friday: Tax & Legal Workshop',
            'description' => 'Essential tax planning and legal compliance tips for freelancers and independent professionals. CA and legal experts will answer your questions.',
            'eventDate' => date('Y-m-d', strtotime('+35 days')),
            'eventTime' => '15:00:00',
            'location' => 'WishCoWork Hub, Sector 62, Noida',
            'image' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
            'category' => 'Workshop',
            'registrationLink' => 'https://forms.gle/example5',
            'isFeatured' => false,
            'isActive' => true,
            'displayOrder' => 5,
            'maxAttendees' => 40,
            'currentAttendees' => 12
        ]
    ],
    
    // Admin User
    'users' => [
        [
            'id' => 'admin-001',
            'email' => 'admin@wishcowork.com',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'name' => 'Admin User',
            'role' => 'admin',
            'phone' => '+91-9876543210',
            'company' => 'WishCoWork',
            'avatar' => 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
            'is_active' => true
        ]
    ],
    
    // Blogs
    'blogs' => [
        [
            'title' => '10 Productivity Hacks for Remote Workers',
            'slug' => '10-productivity-hacks-remote-workers',
            'excerpt' => 'Discover proven strategies to boost your productivity while working from home or coworking spaces.',
            'content' => '<h2>Introduction</h2><p>Working remotely offers incredible flexibility, but it also comes with unique challenges. Here are 10 proven productivity hacks that will help you stay focused and efficient.</p><h2>1. Create a Dedicated Workspace</h2><p>Having a specific area for work helps your brain switch into work mode...</p>',
            'featuredImage' => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200',
            'author' => 'Sarah Johnson',
            'authorImage' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
            'category' => 'Productivity',
            'tags' => json_encode(['remote work', 'productivity', 'tips', 'work from home']),
            'readTime' => 8,
            'views' => 1250,
            'isFeatured' => true,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-5 days')),
            'displayOrder' => 1,
            'metaTitle' => '10 Productivity Hacks for Remote Workers | WishCoWork Blog',
            'metaDescription' => 'Discover proven strategies to boost your productivity while working remotely.',
            'metaKeywords' => 'remote work, productivity, work from home, coworking'
        ],
        [
            'title' => 'The Future of Coworking Spaces in 2025',
            'slug' => 'future-of-coworking-spaces-2025',
            'excerpt' => 'Explore the latest trends and innovations shaping the coworking industry in 2025 and beyond.',
            'content' => '<h2>The Evolution of Coworking</h2><p>The coworking industry has undergone massive transformation in recent years. Here\'s what to expect in 2025...</p>',
            'featuredImage' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
            'author' => 'Michael Chen',
            'authorImage' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            'category' => 'Industry Trends',
            'tags' => json_encode(['coworking', 'trends', 'future', 'workplace']),
            'readTime' => 10,
            'views' => 980,
            'isFeatured' => true,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-10 days')),
            'displayOrder' => 2,
            'metaTitle' => 'The Future of Coworking Spaces in 2025 | WishCoWork',
            'metaDescription' => 'Explore the latest trends and innovations shaping the coworking industry.',
            'metaKeywords' => 'coworking trends, future of work, workspace innovation'
        ],
        [
            'title' => 'How to Network Effectively in Coworking Spaces',
            'slug' => 'networking-effectively-coworking-spaces',
            'excerpt' => 'Master the art of professional networking in shared workspaces with these proven strategies.',
            'content' => '<h2>Why Networking Matters</h2><p>Coworking spaces are goldmines for professional connections. Here\'s how to make the most of them...</p>',
            'featuredImage' => 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200',
            'author' => 'Emily Rodriguez',
            'authorImage' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
            'category' => 'Networking',
            'tags' => json_encode(['networking', 'coworking', 'professional growth', 'community']),
            'readTime' => 6,
            'views' => 720,
            'isFeatured' => false,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-15 days')),
            'displayOrder' => 3,
            'metaTitle' => 'Networking Tips for Coworking Spaces | WishCoWork Blog',
            'metaDescription' => 'Master the art of professional networking in shared workspaces.',
            'metaKeywords' => 'networking tips, coworking community, professional connections'
        ],
        [
            'title' => 'Setting Up Your Home Office on a Budget',
            'slug' => 'setting-up-home-office-budget',
            'excerpt' => 'Create an ergonomic and productive home office without breaking the bank with these budget-friendly tips.',
            'content' => '<h2>Budget-Friendly Setup</h2><p>You don\'t need to spend a fortune to create a productive home office...</p>',
            'featuredImage' => 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200',
            'author' => 'David Kumar',
            'authorImage' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
            'category' => 'Home Office',
            'tags' => json_encode(['home office', 'budget', 'setup', 'workspace']),
            'readTime' => 7,
            'views' => 1100,
            'isFeatured' => false,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-20 days')),
            'displayOrder' => 4,
            'metaTitle' => 'Budget Home Office Setup Guide | WishCoWork',
            'metaDescription' => 'Create an ergonomic home office without breaking the bank.',
            'metaKeywords' => 'home office setup, budget workspace, ergonomic office'
        ],
        [
            'title' => 'The Benefits of Flexible Workspace Solutions',
            'slug' => 'benefits-flexible-workspace-solutions',
            'excerpt' => 'Discover why flexible workspaces are becoming the preferred choice for modern businesses and freelancers.',
            'content' => '<h2>Why Flexibility Matters</h2><p>Traditional office leases are giving way to flexible workspace solutions...</p>',
            'featuredImage' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200',
            'author' => 'Priya Sharma',
            'authorImage' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            'category' => 'Business',
            'tags' => json_encode(['flexible workspace', 'coworking', 'business', 'flexibility']),
            'readTime' => 5,
            'views' => 890,
            'isFeatured' => true,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-25 days')),
            'displayOrder' => 5,
            'metaTitle' => 'Benefits of Flexible Workspaces | WishCoWork Blog',
            'metaDescription' => 'Why flexible workspaces are the preferred choice for modern businesses.',
            'metaKeywords' => 'flexible workspace, coworking benefits, modern office'
        ]
    ],
    
    // News
    'news' => [
        [
            'title' => 'WishCoWork Expands to 5 New Cities Across India',
            'slug' => 'wishcowork-expands-5-new-cities',
            'summary' => 'WishCoWork announces major expansion plan with new locations in Bangalore, Mumbai, Pune, Hyderabad, and Chennai.',
            'content' => 'WishCoWork, India\'s leading coworking space provider, today announced its ambitious expansion plan to open state-of-the-art facilities in five major metropolitan cities. The expansion will create over 5,000 new workstations and is expected to be completed by Q2 2026.',
            'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
            'source' => 'WishCoWork',
            'sourceUrl' => 'https://wishcowork.com/press-release',
            'category' => 'Company News',
            'tags' => json_encode(['expansion', 'coworking', 'india', 'business growth']),
            'isFeatured' => true,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-2 days')),
            'displayOrder' => 1,
            'views' => 2150
        ],
        [
            'title' => 'Coworking Industry Sees 40% Growth in Post-Pandemic Era',
            'slug' => 'coworking-industry-40-percent-growth',
            'summary' => 'New report reveals coworking spaces are experiencing unprecedented growth as hybrid work models become mainstream.',
            'content' => 'According to a recent industry report by Global Workspace Association, the coworking sector has grown by 40% since 2023, with flexible workspaces becoming the preferred choice for 60% of companies adopting hybrid work models.',
            'image' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
            'source' => 'Business Today',
            'sourceUrl' => 'https://businesstoday.in',
            'category' => 'Industry News',
            'tags' => json_encode(['coworking growth', 'industry trends', 'hybrid work']),
            'isFeatured' => true,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-5 days')),
            'displayOrder' => 2,
            'views' => 1820
        ],
        [
            'title' => 'WishCoWork Launches Sustainability Initiative',
            'slug' => 'wishcowork-launches-sustainability-initiative',
            'summary' => 'New green workspace program aims to reduce carbon footprint by 50% across all locations.',
            'content' => 'WishCoWork has launched its ambitious "Green Workspace 2025" initiative, committing to reduce carbon emissions, implement solar power, and achieve zero-waste operations across all facilities by the end of 2025.',
            'image' => 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200',
            'source' => 'WishCoWork',
            'sourceUrl' => 'https://wishcowork.com/sustainability',
            'category' => 'Company News',
            'tags' => json_encode(['sustainability', 'green initiative', 'environment']),
            'isFeatured' => false,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-8 days')),
            'displayOrder' => 3,
            'views' => 950
        ],
        [
            'title' => 'Remote Work Adoption Reaches All-Time High in 2025',
            'slug' => 'remote-work-adoption-all-time-high-2025',
            'summary' => 'Survey shows 75% of companies now offer remote or hybrid work options to employees.',
            'content' => 'A comprehensive survey by Future of Work Institute reveals that remote and hybrid work models have become the norm, with 75% of organizations offering flexible work arrangements. This shift has driven increased demand for coworking spaces.',
            'image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
            'source' => 'The Economic Times',
            'sourceUrl' => 'https://economictimes.com',
            'category' => 'Industry News',
            'tags' => json_encode(['remote work', 'hybrid work', 'workplace trends']),
            'isFeatured' => true,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-12 days')),
            'displayOrder' => 4,
            'views' => 1650
        ],
        [
            'title' => 'WishCoWork Partners with Tech Giants for Startup Program',
            'slug' => 'wishcowork-partners-tech-giants-startup-program',
            'summary' => 'Strategic partnership with Google and Microsoft to provide free workspace and mentorship to 100 startups.',
            'content' => 'WishCoWork announces strategic partnerships with Google and Microsoft to launch the "Startup Launchpad" program, offering free coworking space, mentorship, and resources to 100 selected early-stage startups across India.',
            'image' => 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200',
            'source' => 'WishCoWork',
            'sourceUrl' => 'https://wishcowork.com/startup-program',
            'category' => 'Company News',
            'tags' => json_encode(['startup', 'partnership', 'mentorship', 'innovation']),
            'isFeatured' => false,
            'isPublished' => true,
            'publishedAt' => date('Y-m-d H:i:s', strtotime('-15 days')),
            'displayOrder' => 5,
            'views' => 1420
        ]
    ],
    'enterprise_logos' => [
        ['name' => 'OYO', 'logo_url' => 'https://companieslogo.com/img/orig/OYO_BIG.D-8d655f4a.png', 'display_order' => 1],
        ['name' => 'BharatPe', 'logo_url' => 'https://companieslogo.com/img/orig/BHARATPE.BO-5f5d9d1a.png', 'display_order' => 2],
        ['name' => 'CARS24', 'logo_url' => 'https://companieslogo.com/img/orig/CARS24.BO-4f5d9d1a.png', 'display_order' => 3],
        ['name' => 'JioSaavn', 'logo_url' => 'https://companieslogo.com/img/orig/JIOSAAVN.BO-8a5871f7.png', 'display_order' => 4],
        ['name' => 'Flipkart', 'logo_url' => 'https://companieslogo.com/img/orig/FLIPKART.BO-f6f3629e.png', 'display_order' => 5],
        ['name' => 'Rebel Foods', 'logo_url' => 'https://companieslogo.com/img/orig/REBELFOODS.BO-3f5d9d1a.png', 'display_order' => 6],
        ['name' => 'Trulymadly', 'logo_url' => 'https://companieslogo.com/img/orig/TRULYMADLY.BO-5f5d9d1a.png', 'display_order' => 7],
        ['name' => 'MagicBricks', 'logo_url' => 'https://companieslogo.com/img/orig/MAGICBRICKS.BO-4f5d9d1a.png', 'display_order' => 8],
        ['name' => 'Toppr', 'logo_url' => 'https://companieslogo.com/img/orig/TOPPR.BO-2f5d9d1a.png', 'display_order' => 9],
        ['name' => 'SanDisk', 'logo_url' => 'https://companieslogo.com/img/orig/SNDK-7a5871f7.png', 'display_order' => 10],
        ['name' => 'Swiggy', 'logo_url' => 'https://companieslogo.com/img/orig/SWIGGY.BO-f6f3629e.png', 'display_order' => 11],
        ['name' => 'Zoomcar', 'logo_url' => 'https://companieslogo.com/img/orig/ZOOMCAR.BO-8a5871f7.png', 'display_order' => 12]
    ]
];

// Ensure at least one superuser exists (use env vars or defaults)
$initialSuperEmail = getenv('INITIAL_SUPERUSER_EMAIL') ?: 'admin@example.com';
$initialSuperPassword = getenv('INITIAL_SUPERUSER_PASSWORD') ?: 'ChangeMe123!';
$initialSuperName = getenv('INITIAL_SUPERUSER_NAME') ?: 'Superuser';

try {
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $initialSuperEmail]);
    if (!$stmt->fetch()) {
        $hashed = password_hash($initialSuperPassword, PASSWORD_BCRYPT);
        $superId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($initialSuperName) . '&background=6366f1&color=fff';
        
        $insert = $conn->prepare("INSERT INTO users (id, email, password, name, role, avatar, is_active) VALUES (:id, :email, :password, :name, 'superuser', :avatar, 1)");
        $insert->execute([
            ':id' => $superId,
            ':email' => $initialSuperEmail,
            ':password' => $hashed,
            ':name' => $initialSuperName,
            ':avatar' => $avatar
        ]);
        $response['steps'][] = "✅ Superuser '{$initialSuperEmail}' created (default password may need to be changed)";
    } else {
        $response['steps'][] = "ℹ️ Superuser '{$initialSuperEmail}' already exists";
    }
} catch (PDOException $e) {
    $response['errors'][] = 'Error ensuring initial superuser: ' . $e->getMessage();
}

// Insert seed data
foreach ($seedData as $tableName => $records) {
    foreach ($records as $record) {
        // Build INSERT query
        $columns = array_keys($record);
        $placeholders = array_map(function($col) { return ":$col"; }, $columns);
        
        $sql = "INSERT INTO $tableName (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        // Check if record already exists (simple check for email or title)
        $checkColumn = isset($record['email']) ? 'email' : (isset($record['title']) ? 'title' : (isset($record['name']) ? 'name' : null));
        
        if ($checkColumn) {
            $checkSql = "SELECT COUNT(*) FROM $tableName WHERE $checkColumn = :checkValue";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->execute(['checkValue' => $record[$checkColumn]]);
            
            if ($checkStmt->fetchColumn() > 0) {
                continue; // Skip if already exists
            }
        }
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute($record);
        } catch (PDOException $e) {
            // Silently continue if duplicate or other minor error
            if ($e->getCode() != 23000) { // Not a duplicate entry error
                $response['errors'][] = "Warning: Could not insert into '$tableName': " . $e->getMessage();
            }
        }
    }
    
    $response['steps'][] = "✅ Data seeded for '$tableName'";
}

// Count records in each table
$stats = [];
foreach (array_keys($seedData) as $tableName) {
    try {
        $stmt = $conn->query("SELECT COUNT(*) FROM $tableName");
        $count = $stmt->fetchColumn();
        $stats[$tableName] = $count;
    } catch (PDOException $e) {
        $stats[$tableName] = 'Error';
    }
}

$response['statistics'] = $stats;
$response['timestamp'] = date('Y-m-d H:i:s');

// Output response
echo json_encode($response, JSON_PRETTY_PRINT);
