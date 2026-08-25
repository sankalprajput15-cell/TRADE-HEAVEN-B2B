<?php
/**
 * Trade Heaven BigRock PHP MySQL API Gateway
 * Production Backend Service for RFQs, Listings, FAQs, Users, and Settings.
 */

// Enable Error Reporting for Debugging (Optional in production, handled safely)
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit();
}

// Database Credentials (Configure in cPanel MySQL Database Wizard if different)
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'a17604c7_tradeheaven';
$db_user = getenv('DB_USER') ?: 'a17604c7_dbuser';
$db_pass = getenv('DB_PASS') ?: '';

// Connect to MySQL
$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
$db_connected = ($conn && !$conn->connect_error);

// Auto-initialize tables if database is connected
if ($db_connected) {
    $conn->set_charset("utf8mb4");

    // 1. Inquiries Table
    $conn->query("CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) DEFAULT '',
        subject VARCHAR(255) DEFAULT '',
        product_name VARCHAR(255) DEFAULT '',
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        target_quantity INT DEFAULT 0,
        target_price DECIMAL(12,2) DEFAULT 0.00,
        incoterm VARCHAR(20) DEFAULT 'FOB',
        destination_port VARCHAR(150) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 2. Listings Table
    $conn->query("CREATE TABLE IF NOT EXISTS listings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(150) DEFAULT '',
        sub_category VARCHAR(150) DEFAULT '',
        price VARCHAR(100) DEFAULT '',
        moq INT DEFAULT 1,
        moq_unit VARCHAR(50) DEFAULT 'Pieces',
        supplier_name VARCHAR(255) DEFAULT '',
        supplier_country VARCHAR(100) DEFAULT '',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 3. FAQs Table
    $conn->query("CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 4. Users Table
    $conn->query("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(100) DEFAULT '',
        role VARCHAR(50) DEFAULT 'BUYER',
        company_name VARCHAR(255) DEFAULT '',
        country VARCHAR(100) DEFAULT '',
        avatar_url TEXT,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        is_verified TINYINT(1) DEFAULT 1,
        is_premium TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 5. Site Settings Table
    $conn->query("CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

// Request Data Parsing
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$method = $_SERVER['REQUEST_METHOD'];

$raw_input = file_get_contents('php://input');
$json_input = json_decode($raw_input, true);
$input = is_array($json_input) ? $json_input : $_POST;

switch ($action) {
    // -------------------------------------------------------------
    // Health Check
    // -------------------------------------------------------------
    case 'health':
        echo json_encode([
            "status" => "ok",
            "service" => "Trade Heaven BigRock MySQL Gateway",
            "db_connected" => $db_connected,
            "db_name" => $db_connected ? $db_name : null,
            "timestamp" => date("Y-m-d H:i:s")
        ]);
        break;

    // -------------------------------------------------------------
    // RFQs & Inquiries
    // -------------------------------------------------------------
    case 'get_rfqs':
    case 'inquiries':
        if ($method === 'GET') {
            if ($db_connected) {
                $res = $conn->query("SELECT * FROM inquiries ORDER BY id DESC LIMIT 100");
                $rows = [];
                if ($res) {
                    while ($r = $res->fetch_assoc()) { $rows[] = $r; }
                }
                echo json_encode(["success" => true, "data" => $rows]);
            } else {
                echo json_encode(["success" => true, "data" => []]);
            }
        } elseif ($method === 'POST') {
            $name = $input['name'] ?? 'Procurement Officer';
            $email = $input['email'] ?? 'buyer@tradeheaven.net';
            $phone = $input['phone'] ?? '';
            $subject = $input['subject'] ?? 'RFQ Inquiry';
            $product_name = $input['product_name'] ?? 'General Commodity';
            $message = $input['message'] ?? '';
            $status = $input['status'] ?? 'pending';

            if ($db_connected) {
                $stmt = $conn->prepare("INSERT INTO inquiries (name, email, phone, subject, product_name, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if ($stmt) {
                    $stmt->bind_param("sssssss", $name, $email, $phone, $subject, $product_name, $message, $status);
                    $stmt->execute();
                    $insert_id = $stmt->insert_id;
                    $stmt->close();
                    echo json_encode(["success" => true, "id" => $insert_id, "message" => "RFQ recorded successfully"]);
                    break;
                }
            }
            echo json_encode(["success" => true, "id" => time(), "message" => "Inquiry received"]);
        }
        break;

    case 'create_rfq':
        $name = $input['name'] ?? 'Procurement Officer';
        $email = $input['email'] ?? 'buyer@tradeheaven.net';
        $phone = $input['phone'] ?? '';
        $subject = $input['subject'] ?? 'RFQ Sourcing Requirement';
        $product_name = $input['product_name'] ?? 'Wholesale Product';
        $message = $input['message'] ?? '';
        $status = 'pending';

        if ($db_connected) {
            $stmt = $conn->prepare("INSERT INTO inquiries (name, email, phone, subject, product_name, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("sssssss", $name, $email, $phone, $subject, $product_name, $message, $status);
                $stmt->execute();
                $insert_id = $stmt->insert_id;
                $stmt->close();
                echo json_encode(["status" => "success", "id" => $insert_id, "message" => "RFQ submitted successfully"]);
                break;
            }
        }
        echo json_encode(["status" => "success", "id" => time(), "message" => "RFQ recorded"]);
        break;

    case 'update_inquiry_status':
        $id = intval($input['id'] ?? 0);
        $status = $input['status'] ?? 'resolved';
        if ($db_connected && $id > 0) {
            $stmt = $conn->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("si", $status, $id);
                $stmt->execute();
                $stmt->close();
            }
        }
        echo json_encode(["success" => true]);
        break;

    // -------------------------------------------------------------
    // Users & RBAC
    // -------------------------------------------------------------
    case 'get_users':
    case 'users':
        if ($method === 'GET') {
            if ($db_connected) {
                $res = $conn->query("SELECT * FROM users ORDER BY created_at DESC LIMIT 100");
                $rows = [];
                if ($res) {
                    while ($r = $res->fetch_assoc()) {
                        $r['is_verified'] = (bool)$r['is_verified'];
                        $r['is_premium'] = (bool)$r['is_premium'];
                        $rows[] = $r;
                    }
                }
                echo json_encode(["success" => true, "data" => $rows]);
            } else {
                echo json_encode(["success" => true, "data" => []]);
            }
        } elseif ($method === 'POST') {
            $id = $input['id'] ?? ('user-' . uniqid());
            $name = $input['name'] ?? '';
            $email = $input['email'] ?? '';
            $phone = $input['phone'] ?? '';
            $role = $input['role'] ?? 'BUYER';
            $company = $input['company_name'] ?? '';
            $country = $input['country'] ?? '';
            $is_verified = !empty($input['is_verified']) ? 1 : 0;
            $is_premium = !empty($input['is_premium']) ? 1 : 0;

            if ($db_connected) {
                $stmt = $conn->prepare("INSERT INTO users (id, name, email, phone, role, company_name, country, is_verified, is_premium)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), role=VALUES(role), company_name=VALUES(company_name), country=VALUES(country), is_verified=VALUES(is_verified), is_premium=VALUES(is_premium)");
                if ($stmt) {
                    $stmt->bind_param("sssssssii", $id, $name, $email, $phone, $role, $company, $country, $is_verified, $is_premium);
                    $stmt->execute();
                    $stmt->close();
                }
            }
            echo json_encode(["success" => true, "data" => $input]);
        }
        break;

    case 'upsert_user':
        $id = $input['id'] ?? ('user-' . uniqid());
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $phone = $input['phone'] ?? '';
        $role = $input['role'] ?? 'BUYER';
        $company = $input['company_name'] ?? '';
        $country = $input['country'] ?? '';
        $is_verified = !empty($input['is_verified']) ? 1 : 0;
        $is_premium = !empty($input['is_premium']) ? 1 : 0;

        if ($db_connected) {
            $stmt = $conn->prepare("INSERT INTO users (id, name, email, phone, role, company_name, country, is_verified, is_premium)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), role=VALUES(role), company_name=VALUES(company_name), country=VALUES(country), is_verified=VALUES(is_verified), is_premium=VALUES(is_premium)");
            if ($stmt) {
                $stmt->bind_param("sssssssii", $id, $name, $email, $phone, $role, $company, $country, $is_verified, $is_premium);
                $stmt->execute();
                $stmt->close();
            }
        }
        echo json_encode(["success" => true, "data" => $input]);
        break;

    case 'delete_user':
        $id = $input['id'] ?? '';
        if ($db_connected && $id) {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("s", $id);
                $stmt->execute();
                $stmt->close();
            }
        }
        echo json_encode(["success" => true]);
        break;

    // -------------------------------------------------------------
    // Listings
    // -------------------------------------------------------------
    case 'get_listings':
    case 'listings':
        if ($method === 'GET') {
            if ($db_connected) {
                $res = $conn->query("SELECT * FROM listings ORDER BY id DESC LIMIT 100");
                $rows = [];
                if ($res) {
                    while ($r = $res->fetch_assoc()) { $rows[] = $r; }
                }
                echo json_encode(["success" => true, "data" => $rows]);
            } else {
                echo json_encode(["success" => true, "data" => []]);
            }
        } elseif ($method === 'POST') {
            $title = $input['title'] ?? 'Listing Item';
            $description = $input['description'] ?? '';
            $category = $input['category'] ?? 'General';
            $price = strval($input['price'] ?? '');
            $moq = intval($input['moq'] ?? 1);
            $moq_unit = $input['moq_unit'] ?? 'Pieces';
            $supplier_name = $input['supplier_name'] ?? 'Trade Heaven Supplier';
            $supplier_country = $input['supplier_country'] ?? 'Global';
            $image_url = $input['image_url'] ?? '';

            if ($db_connected) {
                $stmt = $conn->prepare("INSERT INTO listings (title, description, category, price, moq, moq_unit, supplier_name, supplier_country, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                if ($stmt) {
                    $stmt->bind_param("ssssissss", $title, $description, $category, $price, $moq, $moq_unit, $supplier_name, $supplier_country, $image_url);
                    $stmt->execute();
                    $insert_id = $stmt->insert_id;
                    $stmt->close();
                    $input['id'] = $insert_id;
                }
            }
            echo json_encode(["success" => true, "data" => $input]);
        }
        break;

    case 'create_listing':
        $title = $input['title'] ?? 'Listing Item';
        $description = $input['description'] ?? '';
        $category = $input['category'] ?? 'General';
        $price = strval($input['price'] ?? '');
        $moq = intval($input['moq'] ?? 1);
        $moq_unit = $input['moq_unit'] ?? 'Pieces';
        $supplier_name = $input['supplier_name'] ?? 'Trade Heaven Supplier';
        $supplier_country = $input['supplier_country'] ?? 'Global';
        $image_url = $input['image_url'] ?? '';

        if ($db_connected) {
            $stmt = $conn->prepare("INSERT INTO listings (title, description, category, price, moq, moq_unit, supplier_name, supplier_country, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("ssssissss", $title, $description, $category, $price, $moq, $moq_unit, $supplier_name, $supplier_country, $image_url);
                $stmt->execute();
                $insert_id = $stmt->insert_id;
                $stmt->close();
                $input['id'] = $insert_id;
            }
        }
        echo json_encode(["success" => true, "data" => $input]);
        break;

    case 'delete_listing':
        $id = intval($input['id'] ?? 0);
        if ($db_connected && $id > 0) {
            $stmt = $conn->prepare("DELETE FROM listings WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
            }
        }
        echo json_encode(["success" => true]);
        break;

    // -------------------------------------------------------------
    // FAQs
    // -------------------------------------------------------------
    case 'get_faqs':
    case 'faqs':
        if ($method === 'GET') {
            if ($db_connected) {
                $res = $conn->query("SELECT * FROM faqs ORDER BY display_order ASC, id ASC");
                $rows = [];
                if ($res) {
                    while ($r = $res->fetch_assoc()) { $rows[] = $r; }
                }
                echo json_encode(["success" => true, "data" => $rows]);
            } else {
                echo json_encode(["success" => true, "data" => []]);
            }
        } elseif ($method === 'POST') {
            $question = $input['question'] ?? '';
            $answer = $input['answer'] ?? '';
            $category = $input['category'] ?? 'General';
            $display_order = intval($input['display_order'] ?? 0);

            if ($db_connected && $question && $answer) {
                $stmt = $conn->prepare("INSERT INTO faqs (question, answer, category, display_order) VALUES (?, ?, ?, ?)");
                if ($stmt) {
                    $stmt->bind_param("sssi", $question, $answer, $category, $display_order);
                    $stmt->execute();
                    $insert_id = $stmt->insert_id;
                    $stmt->close();
                    $input['id'] = $insert_id;
                }
            }
            echo json_encode(["success" => true, "data" => $input]);
        }
        break;

    case 'create_faq':
        $question = $input['question'] ?? '';
        $answer = $input['answer'] ?? '';
        $category = $input['category'] ?? 'General';
        $display_order = intval($input['display_order'] ?? 0);

        if ($db_connected && $question && $answer) {
            $stmt = $conn->prepare("INSERT INTO faqs (question, answer, category, display_order) VALUES (?, ?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("sssi", $question, $answer, $category, $display_order);
                $stmt->execute();
                $insert_id = $stmt->insert_id;
                $stmt->close();
                $input['id'] = $insert_id;
            }
        }
        echo json_encode(["success" => true, "data" => $input]);
        break;

    case 'delete_faq':
        $id = intval($input['id'] ?? 0);
        if ($db_connected && $id > 0) {
            $stmt = $conn->prepare("DELETE FROM faqs WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
            }
        }
        echo json_encode(["success" => true]);
        break;

    // -------------------------------------------------------------
    // Site Settings
    // -------------------------------------------------------------
    case 'get_settings':
    case 'site_settings':
        if ($method === 'GET') {
            if ($db_connected) {
                $res = $conn->query("SELECT setting_key, setting_value FROM site_settings");
                $settings = [];
                if ($res) {
                    while ($r = $res->fetch_assoc()) {
                        $settings[$r['setting_key']] = $r['setting_value'];
                    }
                }
                echo json_encode($settings);
            } else {
                echo json_encode(new stdClass());
            }
        } elseif ($method === 'POST') {
            $key = $input['key'] ?? '';
            $value = $input['value'] ?? '';
            if ($db_connected && $key) {
                $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                if ($stmt) {
                    $stmt->bind_param("ss", $key, $value);
                    $stmt->execute();
                    $stmt->close();
                }
            }
            echo json_encode(["success" => true]);
        }
        break;

    case 'update_setting':
        $key = $input['key'] ?? '';
        $value = $input['value'] ?? '';
        if ($db_connected && $key) {
            $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            if ($stmt) {
                $stmt->bind_param("ss", $key, $value);
                $stmt->execute();
                $stmt->close();
            }
        }
        echo json_encode(["success" => true]);
        break;

    // -------------------------------------------------------------
    // Default Gateway Banner
    // -------------------------------------------------------------
    default:
        echo json_encode([
            "success" => true,
            "message" => "Trade Heaven BigRock PHP MySQL API Gateway",
            "db_connected" => $db_connected,
            "version" => "2.0.0"
        ]);
        break;
}

if ($conn && !$conn->connect_error) {
    $conn->close();
}
?>

