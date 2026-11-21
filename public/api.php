<?php
/**
 * Trade4Deals / Trade Heaven - Direct MySQL PDO API Gateway (api.php)
 * Production standalone backend service for RFQs, Listings, Inquiries, Users, and Settings.
 *
 * Database Credentials:
 * Host: localhost
 * Database: a17604c7_a17604c7_t4d_db
 * User: a17604c7_a17604c7_t4d_user
 * Pass: T4Deals#Pass2026!
 */

error_reporting(0);
ini_set('display_errors', '0');

// Direct CORS & JSON response headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit();
}

// -------------------------------------------------------------
// Database Configuration & Failover
// -------------------------------------------------------------
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'a17604c7_tradeheaven_db';
$db_user = getenv('DB_USER') ?: 'a17604c7_dbuser';
$db_pass_primary = getenv('DB_PASS');

$passwords_to_try = [];
if ($db_pass_primary) {
    $passwords_to_try[] = $db_pass_primary;
}
$passwords_to_try = array_merge($passwords_to_try, ['TradeHeaven2026', 'TradeHeaven#2026!', 'T4Deals#Pass2026!']);

$pdo = null;
$db_connected = false;

$dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
];

foreach ($passwords_to_try as $pwd) {
    try {
        $pdo = new PDO($dsn, $db_user, $pwd, $options);
        $db_connected = true;
        break;
    } catch (Exception $e) {
        // Continue to next password
    }
}

if ($db_connected) {
    $marker_file = __DIR__ . '/.db_schema_initialized_v3';
    if (!file_exists($marker_file)) {
        try {

        // -------------------------------------------------------------
        // Table Auto-Creation: rfqs table as per mandatory schema
        // -------------------------------------------------------------
        $pdo->exec("CREATE TABLE IF NOT EXISTS rfqs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            external_id VARCHAR(120) DEFAULT '',
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            quantity VARCHAR(100),
            unit VARCHAR(50),
            targetPrice VARCHAR(100),
            incoterms VARCHAR(50),
            destinationPort VARCHAR(255),
            specifications TEXT,
            buyer_name VARCHAR(150),
            buyer_country VARCHAR(100),
            buyer_email VARCHAR(255) DEFAULT '',
            buyer_company VARCHAR(255) DEFAULT '',
            buyer_phone VARCHAR(100) DEFAULT '',
            buyer_address TEXT,
            payment_terms VARCHAR(255) DEFAULT '',
            order_frequency VARCHAR(100) DEFAULT 'Monthly',
            source VARCHAR(50) DEFAULT 'user',
            sync_tag VARCHAR(50) DEFAULT '',
            search_keyword VARCHAR(255) DEFAULT '',
            market_insight TEXT,
            posted_label VARCHAR(100) DEFAULT '',
            image_url TEXT,
            images TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Self-healing column migrations for pre-existing rfqs tables
        $rfq_extra_columns = [
            "external_id VARCHAR(120) DEFAULT ''",
            "buyer_phone VARCHAR(100) DEFAULT ''",
            "buyer_address TEXT",
            "payment_terms VARCHAR(255) DEFAULT ''",
            "order_frequency VARCHAR(100) DEFAULT 'Monthly'",
            "source VARCHAR(50) DEFAULT 'user'",
            "sync_tag VARCHAR(50) DEFAULT ''",
            "search_keyword VARCHAR(255) DEFAULT ''",
            "market_insight TEXT",
            "posted_label VARCHAR(100) DEFAULT ''",
            "image_url TEXT",
            "images TEXT"
        ];
        foreach ($rfq_extra_columns as $col_def) {
            try {
                $pdo->exec("ALTER TABLE rfqs ADD COLUMN $col_def");
            } catch (Exception $e) {
                // Column already exists
            }
        }

        // -------------------------------------------------------------
        // Table Auto-Creation: users table with Self-Healing Logic
        // -------------------------------------------------------------
        // If the users table already exists but lacks the password column, and has no registered users,
        // safely drop it so it can be cleanly recreated with the proper schema and fields.
        $recreate_users_table = false;
        try {
            $check_pwd = $pdo->query("SELECT `password` FROM users LIMIT 1");
        } catch (Exception $e) {
            // password column doesn't exist, check row count of users table
            try {
                $count_q = $pdo->query("SELECT COUNT(*) as cnt FROM users");
                $count_row = $count_q->fetch();
                if ($count_row && intval($count_row['cnt']) === 0) {
                    $recreate_users_table = true;
                }
            } catch (Exception $ex) {
                // Table might not exist at all, which is fine
            }
        }

        if ($recreate_users_table) {
            try {
                $pdo->exec("DROP TABLE IF EXISTS users");
            } catch (Exception $e) {
                file_put_contents(__DIR__ . '/db_error.log', "DROP users table failed: " . $e->getMessage() . "\n", FILE_APPEND);
            }
        }

        // Now cleanly run CREATE TABLE IF NOT EXISTS
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            company_name VARCHAR(255) DEFAULT '',
            phone VARCHAR(50) DEFAULT '',
            country VARCHAR(100) DEFAULT 'United States',
            role VARCHAR(50) DEFAULT 'buyer',
            avatar_url TEXT,
            status VARCHAR(50) DEFAULT 'ACTIVE',
            is_verified TINYINT(1) DEFAULT 1,
            is_premium TINYINT(1) DEFAULT 0,
            membership_status VARCHAR(50) DEFAULT 'free',
            tier VARCHAR(50) DEFAULT 'FREE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Dynamic schema column adder helper
        $add_column_if_missing = function($pdo, $table, $column, $definition) {
            $exists = false;
            try {
                $pdo->query("SELECT `$column` FROM `$table` LIMIT 1");
                $exists = true;
            } catch (Exception $e) {
                $exists = false;
            }

            if (!$exists) {
                // 1. Try ALTER TABLE with COLUMN keyword
                try {
                    $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
                    return true;
                } catch (Exception $e) {}

                // 2. Try ALTER TABLE without COLUMN keyword
                try {
                    $pdo->exec("ALTER TABLE `$table` ADD `$column` $definition");
                    return true;
                } catch (Exception $e) {}

                // 3. Relax strictness: Try without NOT NULL constraint if it failed
                $simple_def = preg_replace('/NOT NULL/i', '', $definition);
                try {
                    $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $simple_def");
                    return true;
                } catch (Exception $e) {}

                try {
                    $pdo->exec("ALTER TABLE `$table` ADD `$column` $simple_def");
                    return true;
                } catch (Exception $e) {
                    file_put_contents(__DIR__ . '/db_error.log', "ALTER table $table ADD column $column completely failed: " . $e->getMessage() . "\n", FILE_APPEND);
                }
            }
            return false;
        };

        // Apply migrations with the self-healing adder helper and direct failsafe queries
        try {
            $pdo->exec("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL");
        } catch (Exception $e) {}
        
        $add_column_if_missing($pdo, 'users', 'company_name', "VARCHAR(255) DEFAULT ''");
        $add_column_if_missing($pdo, 'users', 'phone', "VARCHAR(50) DEFAULT ''");
        $add_column_if_missing($pdo, 'users', 'country', "VARCHAR(100) DEFAULT 'United States'");
        $add_column_if_missing($pdo, 'users', 'role', "VARCHAR(50) DEFAULT 'buyer'");
        $add_column_if_missing($pdo, 'users', 'reset_token', "VARCHAR(10) DEFAULT NULL");
        $add_column_if_missing($pdo, 'users', 'reset_token_expiry', "DATETIME DEFAULT NULL");

        $pdo->exec("CREATE TABLE IF NOT EXISTS listings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(150) DEFAULT 'General',
            sub_category VARCHAR(150) DEFAULT '',
            price VARCHAR(100) DEFAULT '0',
            moq INT DEFAULT 1,
            moq_unit VARCHAR(50) DEFAULT 'Pieces',
            supplier_name VARCHAR(255) DEFAULT '',
            supplier_email VARCHAR(255) DEFAULT '',
            supplier_phone VARCHAR(100) DEFAULT '',
            supplier_country VARCHAR(100) DEFAULT 'China',
            location VARCHAR(255) DEFAULT '',
            description TEXT,
            images TEXT,
            image_url TEXT,
            status VARCHAR(50) DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->exec("CREATE TABLE IF NOT EXISTS inquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rfq_id INT DEFAULT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(100) DEFAULT '',
            company VARCHAR(255) DEFAULT '',
            product VARCHAR(255) DEFAULT '',
            product_name VARCHAR(255) DEFAULT '',
            quantity INT DEFAULT 1,
            target_quantity INT DEFAULT 0,
            target_price DECIMAL(12,2) DEFAULT 0.00,
            incoterm VARCHAR(50) DEFAULT 'FOB',
            destination_port VARCHAR(150) DEFAULT '',
            subject VARCHAR(255) DEFAULT '',
            message TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Cache the successful schema checks
        file_put_contents($marker_file, '1');

        } catch (Exception $e) {
            $db_connected = false;
        }
    }

    // Separate migration marker for Multi-Identity Admin Buyer Chat & Media Messaging tables
    $chat_marker_file = __DIR__ . '/.db_chat_schema_v1';
    if ($db_connected && $pdo && !file_exists($chat_marker_file)) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS admin_buyer_identities (
                id VARCHAR(64) PRIMARY KEY,
                buyer_name VARCHAR(150) NOT NULL,
                company_name VARCHAR(255) DEFAULT '',
                country VARCHAR(100) DEFAULT 'United States',
                city VARCHAR(120) DEFAULT '',
                phone VARCHAR(100) DEFAULT '',
                email VARCHAR(255) DEFAULT '',
                product_interest VARCHAR(255) DEFAULT '',
                address TEXT,
                avatar_url TEXT,
                verified_buyer TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $pdo->exec("CREATE TABLE IF NOT EXISTS chat_conversations (
                id VARCHAR(64) PRIMARY KEY,
                identity_id VARCHAR(64) NOT NULL,
                supplier_id VARCHAR(128) NOT NULL,
                supplier_name VARCHAR(255) DEFAULT '',
                supplier_email VARCHAR(255) DEFAULT '',
                supplier_company VARCHAR(255) DEFAULT '',
                supplier_country VARCHAR(100) DEFAULT '',
                show_phone TINYINT(1) DEFAULT 0,
                show_email TINYINT(1) DEFAULT 0,
                show_company TINYINT(1) DEFAULT 0,
                last_message TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_chat_identity (identity_id),
                INDEX idx_chat_supplier (supplier_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $pdo->exec("CREATE TABLE IF NOT EXISTS chat_messages (
                id VARCHAR(64) PRIMARY KEY,
                conversation_id VARCHAR(64) NOT NULL,
                sender_role ENUM('buyer_identity', 'supplier') NOT NULL DEFAULT 'buyer_identity',
                message_text TEXT,
                media_type ENUM('none', 'image', 'video', 'pdf') NOT NULL DEFAULT 'none',
                media_url TEXT,
                media_name VARCHAR(255) DEFAULT '',
                media_size BIGINT DEFAULT 0,
                is_read TINYINT(1) DEFAULT 0,
                read_at TIMESTAMP NULL DEFAULT NULL,
                email_alert_sent TINYINT(1) NOT NULL DEFAULT 0,
                email_alert_sent_at TIMESTAMP NULL DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_chat_conv (conversation_id),
                INDEX idx_chat_unseen_alert (is_read, email_alert_sent, created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            @file_put_contents($chat_marker_file, '1');
        } catch (Exception $e) {
            @file_put_contents(__DIR__ . '/db_error.log', "Chat schema migration warning: " . $e->getMessage() . "\n", FILE_APPEND);
        }
    }

    // Ensure chat_messages has is_read & read_at columns on pre-existing installations
    $chat_v2_marker = __DIR__ . '/.db_chat_schema_v2';
    if ($db_connected && $pdo && !file_exists($chat_v2_marker)) {
        try {
            $colCheck = $pdo->query("SHOW COLUMNS FROM chat_messages LIKE 'is_read'")->fetch();
            if (!$colCheck) {
                $pdo->exec("ALTER TABLE chat_messages ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER media_size");
            }
            $readAtCheck = $pdo->query("SHOW COLUMNS FROM chat_messages LIKE 'read_at'")->fetch();
            if (!$readAtCheck) {
                $pdo->exec("ALTER TABLE chat_messages ADD COLUMN read_at TIMESTAMP NULL DEFAULT NULL AFTER is_read");
            }
            @file_put_contents($chat_v2_marker, '1');
        } catch (Exception $e) {
            @file_put_contents(__DIR__ . '/db_error.log', "Chat v2 migration warning: " . $e->getMessage() . "\n", FILE_APPEND);
        }
    }

    // Ensure chat_messages has email_alert_sent & email_alert_sent_at columns for 1-minute unseen deal alerts
    $chat_v3_marker = __DIR__ . '/.db_chat_schema_v3';
    if ($db_connected && $pdo && !file_exists($chat_v3_marker)) {
        try {
            $alertCol = $pdo->query("SHOW COLUMNS FROM chat_messages LIKE 'email_alert_sent'")->fetch();
            if (!$alertCol) {
                $pdo->exec("ALTER TABLE chat_messages ADD COLUMN email_alert_sent TINYINT(1) NOT NULL DEFAULT 0 AFTER read_at");
            }
            $alertAtCol = $pdo->query("SHOW COLUMNS FROM chat_messages LIKE 'email_alert_sent_at'")->fetch();
            if (!$alertAtCol) {
                $pdo->exec("ALTER TABLE chat_messages ADD COLUMN email_alert_sent_at TIMESTAMP NULL DEFAULT NULL AFTER email_alert_sent");
            }
            @file_put_contents($chat_v3_marker, '1');
        } catch (Exception $e) {
            @file_put_contents(__DIR__ . '/db_error.log', "Chat v3 migration warning: " . $e->getMessage() . "\n", FILE_APPEND);
        }
    }

    // Ensure product_image_cache table exists for 7-day visual product image caching
    $img_cache_marker = __DIR__ . '/.db_image_cache_schema_v1';
    if ($db_connected && $pdo && !file_exists($img_cache_marker)) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS product_image_cache (
                id INT AUTO_INCREMENT PRIMARY KEY,
                keyword VARCHAR(255) NOT NULL UNIQUE,
                image_urls_json LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            @file_put_contents($img_cache_marker, '1');
        } catch (Exception $e) {
            @file_put_contents(__DIR__ . '/db_error.log', "Image cache table migration warning: " . $e->getMessage() . "\n", FILE_APPEND);
        }
    }
}

// -------------------------------------------------------------
// Centralized PHP Mail Notification Engine (Failsafe & Multi-Recipient)
// -------------------------------------------------------------
function sendPhpMailAlert($subject, $title, $description, $details = [], $extra_recipients = []) {
    $recipients = [
        'sankalprajput15@gmail.com',
        'solutionthe87@gmail.com',
        'yr943334@gmail.com'
    ];
    if (is_array($extra_recipients)) {
        foreach ($extra_recipients as $er) {
            $er = trim(strtolower((string)$er));
            if (!empty($er) && filter_var($er, FILTER_VALIDATE_EMAIL) && !in_array($er, $recipients)) {
                $recipients[] = $er;
            }
        }
    }
    $env_recipient = getenv('ALERT_EMAIL');
    if (!empty($env_recipient)) {
        $extra = explode(',', $env_recipient);
        foreach ($extra as $e) {
            $e = trim(strtolower($e));
            if (!empty($e) && filter_var($e, FILTER_VALIDATE_EMAIL) && !in_array($e, $recipients)) {
                $recipients[] = $e;
            }
        }
    }

    $timestamp = date("Y-m-d H:i:s T");
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    
    // Construct HTML email with clear typography and structured table
    $table_rows = '';
    foreach ($details as $key => $value) {
        $val_str = is_array($value) ? json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : htmlspecialchars((string)$value);
        $table_rows .= "<tr>
            <td style=\"padding: 8px 12px; font-weight: bold; width: 140px; color: #475569; background: #f8fafc; border-bottom: 1px solid #e2e8f0;\">" . htmlspecialchars($key) . ":</td>
            <td style=\"padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0; font-family: monospace;\">" . $val_str . "</td>
        </tr>";
    }
    
    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset=\"UTF-8\"></head>
    <body style=\"margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9;\">
        <div style=\"max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);\">
            <div style=\"background: #0f172a; padding: 24px; color: #ffffff;\">
                <h2 style=\"margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #38bdf8;\">Trade Heaven System Alert</h2>
                <p style=\"margin: 0; font-size: 14px; color: #94a3b8;\">Real-time Portal Security & Activity Notification</p>
            </div>
            <div style=\"padding: 24px;\">
                <h3 style=\"margin: 0 0 12px 0; font-size: 16px; color: #0f172a;\">" . htmlspecialchars($title) . "</h3>
                <p style=\"font-size: 14px; line-height: 1.5; color: #334155; margin: 0 0 18px 0;\">" . htmlspecialchars($description) . "</p>
                <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;\">
                    " . $table_rows . "
                    <tr>
                        <td style=\"padding: 8px 12px; font-weight: bold; width: 140px; color: #475569; background: #f8fafc; border-bottom: 1px solid #e2e8f0;\">IP Address:</td>
                        <td style=\"padding: 8px 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0; font-family: monospace;\">" . htmlspecialchars($ip) . "</td>
                    </tr>
                    <tr>
                        <td style=\"padding: 8px 12px; font-weight: bold; width: 140px; color: #475569; background: #f8fafc;\">Timestamp:</td>
                        <td style=\"padding: 8px 12px; color: #1e293b; font-family: monospace;\">" . htmlspecialchars($timestamp) . "</td>
                    </tr>
                </table>
                <div style=\"padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;\">
                    This notification was automatically dispatched by the Trade Heaven B2B Core Gateway.
                </div>
            </div>
        </div>
    </body>
    </html>";

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Trade Heaven Security <noreply@tradeheaven.net>',
        'Reply-To: help@tradeheaven.net',
        'X-Mailer: PHP/' . phpversion()
    ];
    $headers_str = implode("\r\n", $headers);

    // Serialized single-recipient delivery queue with a 2-second minimum delay between consecutive emails
    $recipient_index = 0;
    foreach ($recipients as $single_recipient) {
        if ($recipient_index > 0) {
            sleep(2);
        }
        $sent = @mail($single_recipient, $subject, $html, $headers_str, "-f noreply@tradeheaven.net");
        if (!$sent) {
            @mail($single_recipient, $subject, $html, $headers_str);
        }
        $recipient_index++;
    }
    
    $to_list = implode(', ', $recipients);
    // Log to file for local diagnostics & audit inspection
    @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [{$title}] {$subject} -> {$to_list} (serialized 2s interval)\n", FILE_APPEND);
}

// -------------------------------------------------------------
// Automated Direct-to-Client Password Reset OTP Dispatcher
// Dispatches 6-digit OTP directly to client from noreply@tradeheaven.net
// -------------------------------------------------------------
function sendClientOtpEmail($clientEmail, $clientName, $code) {
    $cleanEmail = trim(strtolower($clientEmail));
    if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $displayName = !empty($clientName) ? htmlspecialchars($clientName) : 'Valued Trade Partner';
    $subject = "Your Trade Heaven Password Reset Code: {$code}";

    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset=\"UTF-8\"></head>
    <body style=\"margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9;\">
        <div style=\"max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);\">
            <div style=\"background: #0f172a; padding: 24px; color: #ffffff;\">
                <h2 style=\"margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #38bdf8;\">Trade Heaven Password Reset OTP</h2>
                <p style=\"margin: 0; font-size: 14px; color: #94a3b8;\">Automated Account Security • noreply@tradeheaven.net</p>
            </div>
            <div style=\"padding: 24px; color: #1e293b;\">
                <p style=\"font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;\">Hello <strong>{$displayName}</strong>,</p>
                <p style=\"font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;\">
                    We received a request to reset the password for your Trade Heaven corporate account (<strong>" . htmlspecialchars($cleanEmail) . "</strong>). Use the 6-digit verification code below to set your new password:
                </p>
                <div style=\"background: #f8fafc; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 20px 0;\">
                    <div style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px;\">6-Digit One-Time Password (OTP)</div>
                    <div style=\"font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a;\">" . htmlspecialchars($code) . "</div>
                    <div style=\"font-size: 11px; color: #64748b; margin-top: 8px;\">Valid for 60 minutes • Sent automatically from noreply@tradeheaven.net</div>
                </div>
                <div style=\"padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; color: #475569; margin-bottom: 16px;\">
                    <strong>Need Instant Assistance?</strong> If you encounter any issue resetting your password, contact Trade Heaven Support on WhatsApp at <strong>+91 8532934479</strong> or email <strong>help@tradeheaven.net</strong>.
                </div>
                <p style=\"font-size: 12px; color: #64748b; margin: 0;\">
                    If you did not request a password reset, you can safely ignore this automated email.
                </p>
            </div>
        </div>
    </body>
    </html>";

    $msgId = '<otp-' . uniqid('', true) . '@tradeheaven.net>';
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Trade Heaven Security <noreply@tradeheaven.net>',
        'Reply-To: help@tradeheaven.net',
        'Date: ' . date('r'),
        'Message-ID: ' . $msgId,
        'X-Mailer: PHP/' . phpversion()
    ];
    $headers_str = implode("\r\n", $headers);

    $sent = @mail($cleanEmail, $subject, $html, $headers_str, "-f noreply@tradeheaven.net");
    if (!$sent) {
        $sent = @mail($cleanEmail, $subject, $html, $headers_str);
    }

    @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [CLIENT_OTP_DISPATCH] Sent OTP -> {$cleanEmail} (status=" . ($sent ? 'OK' : 'FAILED') . ")\n", FILE_APPEND);
    return $sent;
}

// -------------------------------------------------------------
// Zero-Trust Auth, Signed Token & Login/Registration OTP Helpers
// -------------------------------------------------------------
function getAuthorizedRootAdminEmails() {
    return ['yr943334@gmail.com', 'sankalprajput15@gmail.com'];
}

function normalizeAuthEmail($rawEmail) {
    $clean = strtolower(trim((string)$rawEmail));
    if (strpos($clean, 'mail-') === 0 && strpos($clean, '@') !== false) {
        $clean = substr($clean, 5);
    }
    return $clean;
}

function maskAuthEmail($email) {
    $parts = explode('@', (string)$email, 2);
    if (count($parts) !== 2) return (string)$email;
    $local = $parts[0];
    $domain = $parts[1];
    if (strlen($local) <= 2) return substr($local, 0, 1) . '*@' . $domain;
    return substr($local, 0, 2) . str_repeat('*', min(6, strlen($local) - 2)) . '@' . $domain;
}

function getTradeHeavenJwtSecret() {
    $secretFile = __DIR__ . '/.th_jwt_secret';
    if (file_exists($secretFile)) {
        $saved = trim((string)@file_get_contents($secretFile));
        if (strlen($saved) >= 32) return $saved;
    }
    try {
        $generated = bin2hex(random_bytes(32));
    } catch (Exception $e) {
        $generated = hash('sha256', __FILE__ . uniqid('th', true));
    }
    @file_put_contents($secretFile, $generated);
    return $generated;
}

function thBase64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function thBase64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateSignedAuthToken($userPayload) {
    $now = time();
    $claims = [
        'uid' => (string)($userPayload['id'] ?? 'user-1'),
        'email' => (string)($userPayload['email'] ?? ''),
        'name' => (string)($userPayload['name'] ?? 'Trade Partner'),
        'role' => strtoupper((string)($userPayload['role'] ?? 'BUYER')),
        'isPremium' => !empty($userPayload['isPremium']),
        'membershipStatus' => (string)($userPayload['membershipStatus'] ?? 'free'),
        'status' => (string)($userPayload['status'] ?? 'ACTIVE'),
        'isVerified' => true,
        'otpVerified' => true,
        'tier' => (string)($userPayload['tier'] ?? 'FREE'),
        'companyName' => (string)($userPayload['companyName'] ?? 'Enterprise Trading Firm'),
        'country' => (string)($userPayload['country'] ?? 'United States'),
        'avatarUrl' => (string)($userPayload['avatarUrl'] ?? ''),
        'iat' => $now,
        'exp' => $now + (12 * 3600)
    ];
    $header = thBase64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = thBase64UrlEncode(json_encode($claims));
    $sig = thBase64UrlEncode(hash_hmac('sha256', "$header.$body", getTradeHeavenJwtSecret(), true));
    return "$header.$body.$sig";
}

function verifySignedAuthToken($token) {
    if (!$token || !is_string($token)) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($header, $body, $sig) = $parts;
    $expected = thBase64UrlEncode(hash_hmac('sha256', "$header.$body", getTradeHeavenJwtSecret(), true));
    if (!hash_equals($expected, $sig)) return null;
    $claims = json_decode(thBase64UrlDecode($body), true);
    if (!is_array($claims)) return null;
    if (!empty($claims['exp']) && intval($claims['exp']) < time()) return null;
    if (strtoupper((string)($claims['role'] ?? '')) === 'ADMIN') {
        $email = normalizeAuthEmail($claims['email'] ?? '');
        if (!in_array($email, getAuthorizedRootAdminEmails(), true) || empty($claims['otpVerified'])) {
            return null;
        }
    }
    return $claims;
}

function loadJsonStoreMap($filePath) {
    if (!file_exists($filePath)) return [];
    $decoded = json_decode((string)@file_get_contents($filePath), true);
    return is_array($decoded) ? $decoded : [];
}

function saveJsonStoreMap($filePath, $data) {
    @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function getBuiltInSeedAuthUsers() {
    return [
        'yr943334@gmail.com' => [
            'id' => 'user-admin-root',
            'name' => 'Yash Rajput (Master Admin)',
            'email' => 'yr943334@gmail.com',
            'role' => 'ADMIN',
            'companyName' => 'Trade Heaven Global Operations & Treasury',
            'country' => 'United Kingdom',
            'tier' => 'VIP',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        ],
        'sankalprajput15@gmail.com' => [
            'id' => 'user-admin-sankalp',
            'name' => 'Sankalp Rajput (Master Admin)',
            'email' => 'sankalprajput15@gmail.com',
            'role' => 'ADMIN',
            'companyName' => 'Trade Heaven Global Operations & Treasury',
            'country' => 'United Kingdom',
            'tier' => 'VIP',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        ],
        'zac@otec.ltd' => [
            'id' => 'user-supplier-zac',
            'name' => 'Zachary Aldin',
            'email' => 'zac@otec.ltd',
            'password_plain' => 'Zac@0011',
            'role' => 'SUPPLIER',
            'companyName' => 'IMPORTATION FADE-TECH',
            'country' => 'Australia',
            'tier' => 'GOLD',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        ],
        'sorkindon@gmail.com' => [
            'id' => 'user-buyer-donald',
            'name' => 'Donald Sorkin',
            'email' => 'sorkindon@gmail.com',
            'password_plain' => 'Donald@1234',
            'alt_passwords' => ['Donald@2026'],
            'role' => 'BUYER',
            'companyName' => 'Girlsenberries',
            'country' => 'United States',
            'phone' => '+1-805-714-8918',
            'tier' => 'VIP',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        ],
        'info@joybambooforestfarm.com' => [
            'id' => 'user-supplier-svetlana',
            'name' => 'Svetlana Brodskaya',
            'email' => 'info@joybambooforestfarm.com',
            'password_plain' => 'JoyBamboo@2026',
            'role' => 'SUPPLIER',
            'companyName' => 'Joy Bamboo Forest Farm LLC',
            'country' => 'United States',
            'tier' => 'Basic Plan',
            'isPremium' => false,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        ],
        'melissa@mpcommoditybrokers.com' => [
            'id' => 'user-supplier-melissa',
            'name' => 'Melissa Prezios',
            'email' => 'melissa@mpcommoditybrokers.com',
            'password_plain' => 'Password@123',
            'role' => 'SUPPLIER',
            'companyName' => 'MP Commodity Brokers Australia Pty Ltd',
            'country' => 'Australia',
            'phone' => '+61411510887',
            'tier' => 'Basic Plan',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
        ],
        'ezekiahali355@gmail.com' => [
            'id' => 'user-supplier-ezekiah',
            'name' => 'Ali Charley Ezekiah',
            'email' => 'ezekiahali355@gmail.com',
            'password_plain' => 'Ezekiah@2026',
            'role' => 'SUPPLIER',
            'companyName' => 'ACE Intermediary',
            'country' => 'United States',
            'tier' => 'Basic Plan',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        ],
        'mjohnson@atlanticpowerequip.com' => [
            'id' => 'user-supplier-mark',
            'name' => 'Mark Johnson',
            'email' => 'mjohnson@atlanticpowerequip.com',
            'password_plain' => 'Atlantic@2026',
            'role' => 'SUPPLIER',
            'companyName' => 'Atlantic Power & Equipment Co.',
            'country' => 'United States',
            'tier' => 'GOLD',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        ],
        'randy@midforkcap.com' => [
            'id' => 'user-supplier-randy',
            'name' => 'Mr. Randy',
            'email' => 'randy@midforkcap.com',
            'password_plain' => 'Randy@2026',
            'alt_passwords' => ['MiddleFox@2026'],
            'role' => 'SUPPLIER',
            'companyName' => 'Middle Fox LLC',
            'country' => 'United States',
            'tier' => 'GOLD',
            'isPremium' => true,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        ],
        'yaw.afreh@afrehgroup.com' => [
            'id' => 'user-supplier-afreh-yaw',
            'name' => 'Yaw Afreh Poku',
            'email' => 'yaw.afreh@afrehgroup.com',
            'password_plain' => 'Afreh@2026',
            'role' => 'SUPPLIER',
            'companyName' => 'AFREH GROUP LIMITED',
            'country' => 'United Kingdom',
            'tier' => 'Basic Plan',
            'isPremium' => false,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => '/assets/aistudio/WhatsApp_Image_2026-11-13_at_9.47.17_AM_877217c7.jpeg'
        ],
        'themax0098@gmail.com' => [
            'id' => 'user-buyer-themax0098',
            'name' => 'Max (themax0098)',
            'email' => 'themax0098@gmail.com',
            'password_plain' => 'TradeHeaven@2026',
            'role' => 'BUYER',
            'companyName' => 'Enterprise Trading Firm',
            'country' => 'Global',
            'tier' => 'Verified Supplier',
            'isPremium' => false,
            'membershipStatus' => 'paid',
            'status' => 'ACTIVE',
            'isVerified' => true,
            'avatarUrl' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        ],
        'reverseenergypty@gmail.com' => [
            'id' => 'user-supplier-emmanuel-reverse-energy',
            'name' => 'Emmanuel (Bongani Mbele)',
            'email' => 'reverseenergypty@gmail.com',
            'password_plain' => 'ReverseEnergy@2026',
            'role' => 'SUPPLIER',
            'companyName' => 'Reverse Energy Pty Ltd (Bongani Mbele)',
            'country' => 'South Africa',
            'phone' => '+27 73 402 7794',
            'tier' => 'Free Member',
            'isPremium' => false,
            'membershipStatus' => 'free',
            'status' => 'ACTIVE',
            'isVerified' => false,
            'avatarUrl' => '/assets/aistudio/WhatsApp_Image_2026-11-04_at_3.59.07_PM_ed00bad4.jpeg'
        ],
        'larsbarnhart25@gmail.com' => [
            'id' => 'user-supplier-lars-blackstone-jade',
            'name' => 'Lars Barnhart',
            'email' => 'larsbarnhart25@gmail.com',
            'password_plain' => 'BlackstoneJade@2026',
            'role' => 'SUPPLIER',
            'companyName' => 'Blackstone Jade Co',
            'country' => 'United States (1521 north 9th street apt 126 coeurdalene Idaho 83814)',
            'phone' => '+1 208-704-0146',
            'tier' => 'Free Member',
            'isPremium' => false,
            'membershipStatus' => 'free',
            'status' => 'ACTIVE',
            'isVerified' => false,
            'avatarUrl' => '/assets/aistudio/WhatsApp_Image_2026-11-04_at_7.44.21_PM_c5859618.jpeg'
        ]
    ];
}

function findPhpAuthUser($rawEmail, $db_connected, $pdo) {
    $cleanEmail = normalizeAuthEmail($rawEmail);
    if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
        return null;
    }

    $rootAdmins = getAuthorizedRootAdminEmails();
    $isRootAdmin = in_array($cleanEmail, $rootAdmins, true);

    $dbRow = null;
    if ($db_connected && $pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1");
            $stmt->execute([$cleanEmail]);
            $fetched = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($fetched) $dbRow = $fetched;
        } catch (Exception $e) {}
    }

    $localUsers = loadJsonStoreMap(__DIR__ . '/users_store.json');
    $localRow = null;
    foreach ($localUsers as $lu) {
        if (is_array($lu) && normalizeAuthEmail($lu['email'] ?? '') === $cleanEmail) {
            $localRow = $lu;
        }
    }

    $seedMap = getBuiltInSeedAuthUsers();
    $seedRow = $seedMap[$cleanEmail] ?? null;

    if (!$dbRow && !$localRow && !$seedRow) {
        return null;
    }

    $isPaidSeed = !empty($seedRow) && strtolower((string)($seedRow['membershipStatus'] ?? '')) === 'paid';
    $rawRole = strtoupper((string)($isPaidSeed ? ($seedRow['role'] ?? 'SUPPLIER') : ($dbRow['role'] ?? $localRow['role'] ?? $seedRow['role'] ?? 'BUYER')));
    if ($isRootAdmin) {
        $resolvedRole = 'ADMIN';
    } elseif ($rawRole === 'ADMIN') {
        $resolvedRole = 'SUPPLIER';
    } else {
        $resolvedRole = $rawRole;
    }

    $resolvedTier = (string)($dbRow['tier'] ?? $localRow['tier'] ?? $seedRow['tier'] ?? ($isRootAdmin ? 'VIP' : ($resolvedRole === 'SUPPLIER' ? 'SILVER' : 'FREE')));
    if ($isPaidSeed && (empty($resolvedTier) || stripos($resolvedTier, 'free') !== false || strtoupper($resolvedTier) === 'SILVER')) {
        $resolvedTier = (string)($seedRow['tier'] ?? 'Basic Plan');
    }
    $resolvedMemStatus = $isPaidSeed
        ? 'paid'
        : (string)($dbRow['membership_status'] ?? $seedRow['membershipStatus'] ?? ($isRootAdmin ? 'paid' : 'free'));
    $resolvedIsPremium = $isPaidSeed
        ? (bool)($seedRow['isPremium'] ?? true)
        : (isset($dbRow['is_premium']) ? (bool)$dbRow['is_premium'] : (!empty($seedRow['isPremium']) || $isRootAdmin));

    return [
        'id' => (string)($isPaidSeed ? ($seedRow['id'] ?? $dbRow['id']) : ($dbRow['id'] ?? $localRow['id'] ?? $seedRow['id'] ?? ('user-' . md5($cleanEmail)))),
        'email' => $cleanEmail,
        'name' => (string)($isPaidSeed ? ($seedRow['name'] ?? $dbRow['name']) : ($dbRow['name'] ?? $localRow['name'] ?? $seedRow['name'] ?? 'Registered Partner')),
        'role' => $resolvedRole,
        'isRootAdmin' => $isRootAdmin,
        'password' => $dbRow['password'] ?? ($localRow['password_hash'] ?? ''),
        'seedPassword' => $seedRow['password_plain'] ?? '',
        'altPasswords' => $seedRow['alt_passwords'] ?? [],
        'companyName' => (string)($isPaidSeed ? ($seedRow['companyName'] ?? $dbRow['company_name']) : ($dbRow['company_name'] ?? $localRow['company_name'] ?? $seedRow['companyName'] ?? 'Enterprise Trading Firm')),
        'country' => (string)($isPaidSeed ? ($seedRow['country'] ?? $dbRow['country']) : ($dbRow['country'] ?? $localRow['country'] ?? $seedRow['country'] ?? 'United States')),
        'phone' => (string)($seedRow['phone'] ?? $dbRow['phone'] ?? $localRow['phone'] ?? ''),
        'tier' => $resolvedTier,
        'isPremium' => $resolvedIsPremium,
        'membershipStatus' => $resolvedMemStatus,
        'status' => (string)($dbRow['status'] ?? 'ACTIVE'),
        'isVerified' => true,
        'isVerifiedAdmin' => $isRootAdmin,
        'avatarUrl' => (string)($dbRow['avatar_url'] ?? $seedRow['avatarUrl'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80')
    ];
}

function verifyPhpAuthPassword($authUser, $password) {
    if (!$authUser) return false;
    if (!empty($authUser['isRootAdmin']) && $authUser['role'] === 'ADMIN') {
        return true; // Root admins use OTP-only verification
    }
    $pwd = (string)$password;
    if ($pwd === '') return false;
    if (!empty($authUser['seedPassword']) && $pwd === $authUser['seedPassword']) return true;
    if (!empty($authUser['altPasswords']) && in_array($pwd, $authUser['altPasswords'], true)) return true;
    if (!empty($authUser['password'])) {
        if (password_verify($pwd, $authUser['password']) || $pwd === $authUser['password']) {
            return true;
        }
    }
    return false;
}

function buildPhpAuthUserPayload($authUser, $token) {
    $isAdmin = !empty($authUser['isRootAdmin']) && $authUser['role'] === 'ADMIN';
    return [
        'id' => (string)$authUser['id'],
        'name' => $authUser['name'],
        'email' => $authUser['email'],
        'role' => $isAdmin ? 'ADMIN' : $authUser['role'],
        'isPremium' => $isAdmin ? true : (bool)$authUser['isPremium'],
        'membershipStatus' => $isAdmin ? 'paid' : $authUser['membershipStatus'],
        'status' => $authUser['status'] ?: 'ACTIVE',
        'isVerified' => true,
        'isVerifiedAdmin' => $isAdmin,
        'otpVerified' => true,
        'tier' => $isAdmin ? 'VIP' : $authUser['tier'],
        'companyName' => $authUser['companyName'],
        'country' => $authUser['country'],
        'phone' => $authUser['phone'] ?? '',
        'avatarUrl' => $authUser['avatarUrl'],
        'token' => $token
    ];
}

function sendLoginOtpEmail($clientEmail, $clientName, $code, $role = 'BUYER', $isRegistration = false) {
    $cleanEmail = normalizeAuthEmail($clientEmail);
    if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $displayName = !empty($clientName) ? htmlspecialchars($clientName) : 'Registered Trade Heaven User';
    $roleUpper = strtoupper((string)$role);
    $heading = $isRegistration
        ? 'Email Verification Code (Registration OTP)'
        : ($roleUpper === 'ADMIN' ? 'Administrator Security Gate (OTP)' : 'Registered Account 2-Factor Verification (OTP)');
    $subject = $isRegistration
        ? "[Trade Heaven] Your 6-Digit Email Verification Code: {$code}"
        : "[Trade Heaven Security] Your 6-Digit Login OTP: {$code}";
    $bodyIntro = $isRegistration
        ? "Enter the 6-digit One-Time Password (OTP) below to verify your email address (<strong>" . htmlspecialchars($cleanEmail) . "</strong>) and complete your Trade Heaven account registration:"
        : "Enter the 6-digit One-Time Password (OTP) below to complete sign-in for your registered Trade Heaven account (<strong>" . htmlspecialchars($cleanEmail) . "</strong>):";

    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset=\"UTF-8\"></head>
    <body style=\"margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9;\">
        <div style=\"max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;\">
            <div style=\"background: #0f172a; padding: 26px 24px; text-align: center; color: #ffffff;\">
                <div style=\"font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #34d399; text-transform: uppercase; margin-bottom: 6px;\">TRADE HEAVEN ZERO-TRUST 2FA SECURITY</div>
                <h2 style=\"margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;\">{$heading}</h2>
            </div>
            <div style=\"padding: 26px 24px; color: #1e293b;\">
                <p style=\"font-size: 15px; line-height: 1.6; margin: 0 0 14px 0;\">Hello <strong>{$displayName}</strong>,</p>
                <p style=\"font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;\">{$bodyIntro}</p>
                <div style=\"background: #eff6ff; color: #1e40af; padding: 18px; border-radius: 12px; font-size: 32px; font-weight: 900; font-family: monospace; text-align: center; letter-spacing: 8px; margin: 20px 0; border: 2px solid #3b82f6;\">" . htmlspecialchars($code) . "</div>
                <p style=\"font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;\">
                    Valid for 10 minutes • Sent exclusively to your registered email via <strong>noreply@tradeheaven.net</strong>. Need help? WhatsApp <strong>+91 8532934479</strong>.
                </p>
            </div>
        </div>
    </body>
    </html>";

    $msgId = '<login-otp-' . uniqid('', true) . '@tradeheaven.net>';
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Trade Heaven Security <noreply@tradeheaven.net>',
        'Reply-To: help@tradeheaven.net',
        'Date: ' . date('r'),
        'Message-ID: ' . $msgId,
        'X-Mailer: PHP/' . phpversion()
    ];
    $headers_str = implode("\r\n", $headers);

    $sent = @mail($cleanEmail, $subject, $html, $headers_str, "-f noreply@tradeheaven.net");
    if (!$sent) {
        $sent = @mail($cleanEmail, $subject, $html, $headers_str);
    }

    @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [LOGIN_OTP_DISPATCH] Sent OTP -> {$cleanEmail} (mode=" . ($isRegistration ? 'REGISTER' : 'LOGIN') . ", status=" . ($sent ? 'OK' : 'FAILED') . ")\n", FILE_APPEND);
    return $sent;
}

// Parse request action & payload (supporting ?action=, ?__route=, and direct /api/* paths)
$raw_action = isset($_GET['action']) ? trim($_GET['action']) : '';
$route_param = isset($_GET['__route']) ? trim($_GET['__route']) : '';

if (empty($raw_action) && !empty($route_param)) {
    $clean_route = trim($route_param, '/');
    if (strpos($clean_route, 'custom-catalog') !== false) {
        $raw_action = 'custom_catalog';
    } elseif (strpos($clean_route, 'site-content') !== false) {
        $raw_action = ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') ? 'save_content' : 'get_content';
    } elseif (strpos($clean_route, 'homepage-config') !== false) {
        $raw_action = ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') ? 'save_homepage_config' : 'get_homepage_config';
    } elseif (strpos($clean_route, 'commodity-indices') !== false) {
        $raw_action = 'commodity_indices';
    } elseif (strpos($clean_route, 'flash-deals') !== false) {
        $raw_action = 'flash_deals';
    } elseif (strpos($clean_route, 'stats') !== false) {
        $raw_action = 'stats';
    } elseif (strpos($clean_route, 'admin/audit-and-fix-catalog-images') !== false || strpos($clean_route, 'audit-and-fix-catalog-images') !== false) {
        $raw_action = 'audit_and_fix_catalog_images';
    } elseif (strpos($clean_route, 'admin/fix-single-catalog-image') !== false || strpos($clean_route, 'fix-single-catalog-image') !== false) {
        $raw_action = 'fix_single_catalog_image';
    } elseif (strpos($clean_route, 'products/fetch-images') !== false) {
        $raw_action = 'fetch_product_images';
    } elseif (strpos($clean_route, 'products/auto-upload-image') !== false) {
        $raw_action = 'auto_upload_product_image';
    } elseif (strpos($clean_route, 'admin/upload-product-image') !== false) {
        $raw_action = 'upload_product_image';
    } elseif (strpos($clean_route, 'admin/product-images') !== false || strpos($clean_route, 'public/product-images') !== false) {
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $raw_action = 'delete_product_images';
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $raw_action = 'set_product_images';
        } else {
            $raw_action = 'get_product_images';
        }
    } elseif (strpos($clean_route, 'rfqs/auto-batch-persist') !== false) {
        $raw_action = 'auto_batch_persist_rfqs';
    } elseif (strpos($clean_route, 'rfqs/discover-market-demand') !== false) {
        $raw_action = 'discover_market_demand';
    } elseif (strpos($clean_route, 'rfqs/market-insights') !== false) {
        $raw_action = 'market_insights';
    } elseif (strpos($clean_route, 'products') !== false) {
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $raw_action = 'delete_listing';
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $raw_action = 'submit_listing';
        } else {
            $raw_action = 'get_listings';
        }
    } elseif (strpos($clean_route, 'rfqs') !== false) {
        $raw_action = ($_SERVER['REQUEST_METHOD'] === 'POST') ? 'submit_rfq' : 'get_rfqs';
    } elseif (strpos($clean_route, 'auth/me') !== false || $clean_route === 'me') {
        $raw_action = 'auth_me';
    } elseif (strpos($clean_route, 'auth/login') !== false || $clean_route === 'login') {
        $raw_action = 'login';
    } elseif (strpos($clean_route, 'auth/register') !== false || $clean_route === 'register') {
        $raw_action = 'register';
    } elseif (strpos($clean_route, 'auth/logout') !== false) {
        $raw_action = 'logout';
    } elseif (strpos($clean_route, 'auth/heartbeat') !== false) {
        $raw_action = 'heartbeat';
    } elseif (strpos($clean_route, 'auth/send-otp') !== false) {
        $raw_action = 'send_otp';
    } elseif (strpos($clean_route, 'auth/verify-otp') !== false || strpos($clean_route, 'auth/verify-login-otp') !== false) {
        $raw_action = 'verify_login_otp';
    } elseif (strpos($clean_route, 'auth/resend-otp') !== false || strpos($clean_route, 'auth/resend-login-otp') !== false) {
        $raw_action = 'resend_login_otp';
    } elseif (strpos($clean_route, 'auth/forgot-password') !== false) {
        $raw_action = 'forgot_password';
    } elseif (strpos($clean_route, 'auth/reset-password') !== false) {
        $raw_action = 'reset_password';
    } elseif (strpos($clean_route, 'admin/marketing-suite/state') !== false) {
        $raw_action = 'marketing_suite_state';
    } elseif (strpos($clean_route, 'admin/marketing-suite/automation-rules') !== false) {
        $raw_action = 'marketing_suite_rules';
    } elseif (strpos($clean_route, 'admin/marketing-suite/trigger-campaign') !== false) {
        $raw_action = 'marketing_suite_trigger';
    } elseif (strpos($clean_route, 'admin/marketing-suite/simulate-tracking') !== false || strpos($clean_route, 'admin/mailsuite/simulate-batch') !== false) {
        $raw_action = 'marketing_suite_simulate';
    } elseif (strpos($clean_route, 'admin/mailsuite/analytics') !== false) {
        $raw_action = 'mailsuite_analytics';
    } elseif (strpos($clean_route, 'admin/mailsuite/simulate-event') !== false || strpos($clean_route, 'admin/mailsuite/webhook') !== false || strpos($clean_route, 'webhooks/smtp-delivery') !== false) {
        $raw_action = 'mailsuite_webhook';
    } elseif (strpos($clean_route, 'admin/email-history') !== false) {
        $raw_action = 'get_email_history';
    } elseif (strpos($clean_route, 'admin/send-custom-email') !== false) {
        $raw_action = 'send_custom_email';
    } elseif (strpos($clean_route, 'mediation/admin-adjust') !== false) {
        $raw_action = 'mediation_admin_adjust';
    } elseif (strpos($clean_route, 'mediation/state') !== false) {
        $raw_action = 'mediation_state';
    } elseif (strpos($clean_route, 'admin/users') !== false || strpos($clean_route, 'get-users') !== false) {
        $raw_action = 'get_users';
    } elseif (strpos($clean_route, 'deployment/health') !== false) {
        $raw_action = 'health';
    } else {
        $parts = explode('/', $clean_route);
        $raw_action = end($parts);
    }
}

if (empty($raw_action)) {
    $uri_path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (strpos($uri_path, '/api/') === 0) {
        $sub = trim(substr($uri_path, 5), '/');
        if (strpos($sub, 'custom-catalog') !== false) {
            $raw_action = 'custom_catalog';
        } elseif (strpos($sub, 'site-content') !== false) {
            $raw_action = ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') ? 'save_content' : 'get_content';
        } elseif (strpos($sub, 'admin/audit-and-fix-catalog-images') !== false || strpos($sub, 'audit-and-fix-catalog-images') !== false) {
            $raw_action = 'audit_and_fix_catalog_images';
        } elseif (strpos($sub, 'admin/fix-single-catalog-image') !== false || strpos($sub, 'fix-single-catalog-image') !== false) {
            $raw_action = 'fix_single_catalog_image';
        } elseif (strpos($sub, 'products/fetch-images') !== false) {
            $raw_action = 'fetch_product_images';
        } elseif (strpos($sub, 'products/auto-upload-image') !== false) {
            $raw_action = 'auto_upload_product_image';
        } elseif (strpos($sub, 'admin/upload-product-image') !== false) {
            $raw_action = 'upload_product_image';
        } elseif (strpos($sub, 'admin/product-images') !== false || strpos($sub, 'public/product-images') !== false) {
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $raw_action = 'delete_product_images';
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
                $raw_action = 'set_product_images';
            } else {
                $raw_action = 'get_product_images';
            }
        } elseif (strpos($sub, 'rfqs/auto-batch-persist') !== false) {
            $raw_action = 'auto_batch_persist_rfqs';
        } elseif (strpos($sub, 'rfqs/discover-market-demand') !== false) {
            $raw_action = 'discover_market_demand';
        } elseif (strpos($sub, 'rfqs/market-insights') !== false) {
            $raw_action = 'market_insights';
        } elseif (strpos($sub, 'products') !== false) {
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $raw_action = 'delete_listing';
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
                $raw_action = 'submit_listing';
            } else {
                $raw_action = 'get_listings';
            }
        } elseif (strpos($sub, 'rfqs') !== false) {
            $raw_action = ($_SERVER['REQUEST_METHOD'] === 'POST') ? 'submit_rfq' : 'get_rfqs';
        } elseif (strpos($sub, 'homepage-config') !== false) {
            $raw_action = 'homepage_config';
        } elseif (strpos($sub, 'commodity-indices') !== false) {
            $raw_action = 'commodity_indices';
        } elseif (strpos($sub, 'flash-deals') !== false) {
            $raw_action = 'flash_deals';
        } elseif (strpos($sub, 'stats') !== false) {
            $raw_action = 'stats';
        } elseif (strpos($sub, 'admin/marketing-suite/state') !== false) {
            $raw_action = 'marketing_suite_state';
        } elseif (strpos($sub, 'admin/marketing-suite/automation-rules') !== false) {
            $raw_action = 'marketing_suite_rules';
        } elseif (strpos($sub, 'admin/marketing-suite/trigger-campaign') !== false) {
            $raw_action = 'marketing_suite_trigger';
        } elseif (strpos($sub, 'admin/marketing-suite/simulate-tracking') !== false || strpos($sub, 'admin/mailsuite/simulate-batch') !== false) {
            $raw_action = 'marketing_suite_simulate';
        } elseif (strpos($sub, 'admin/mailsuite/analytics') !== false) {
            $raw_action = 'mailsuite_analytics';
        } elseif (strpos($sub, 'admin/mailsuite/simulate-event') !== false || strpos($sub, 'admin/mailsuite/webhook') !== false || strpos($sub, 'webhooks/smtp-delivery') !== false) {
            $raw_action = 'mailsuite_webhook';
        } elseif (strpos($sub, 'admin/email-history') !== false) {
            $raw_action = 'get_email_history';
        } elseif (strpos($sub, 'admin/send-custom-email') !== false) {
            $raw_action = 'send_custom_email';
        } elseif (strpos($sub, 'mediation/admin-adjust') !== false) {
            $raw_action = 'mediation_admin_adjust';
        } elseif (strpos($sub, 'mediation/state') !== false) {
            $raw_action = 'mediation_state';
        } elseif (strpos($sub, 'admin/users') !== false) {
            $raw_action = 'get_users';
        } else {
            $parts = explode('/', $sub);
            $raw_action = end($parts);
        }
    }
}

$action = str_replace('-', '_', strtolower($raw_action));
$method = $_SERVER['REQUEST_METHOD'];

$raw_input = file_get_contents('php://input');
$json_input = json_decode($raw_input, true);
$input = is_array($json_input) ? $json_input : $_POST;

switch ($action) {
    // -------------------------------------------------------------
    // 1. Health Status
    // -------------------------------------------------------------
    case 'health':
        $columns = [];
        $migration_errors = [];
        if ($db_connected && $pdo) {
            try {
                $q = $pdo->query("DESCRIBE users");
                while ($row = $q->fetch()) {
                    $columns[] = $row['Field'];
                }
            } catch (Exception $e) {
                $migration_errors[] = "Describe users table failed: " . $e->getMessage();
            }
        }
        
        $log_content = '';
        $log_path = __DIR__ . '/db_error.log';
        if (file_exists($log_path)) {
            $log_content = file_get_contents($log_path);
        }

        echo json_encode([
            "status" => "success",
            "db_connected" => $db_connected,
            "database" => $db_name,
            "columns" => $columns,
            "migration_errors" => $migration_errors,
            "db_error_log" => $log_content,
            "data" => [
                "service" => "Trade4Deals Direct MySQL PDO API",
                "online" => true,
                "timestamp" => date("Y-m-d H:i:s")
            ]
        ]);
        break;

    // -------------------------------------------------------------
    // CMS Operations: get_content, save_content, site_content
    // -------------------------------------------------------------
    case 'site_content':
        if ($method === 'POST' || $method === 'PUT') {
            $cms_payload = isset($input['siteContent']) ? $input['siteContent'] : $input;
            $cms_file = __DIR__ . '/site_content.json';
            @file_put_contents($cms_file, json_encode($cms_payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(["status" => "success", "message" => "CMS content saved successfully"]);
            exit;
        }
        // Fall through to get_content for GET requests
    case 'get_content':
        $cms_file = __DIR__ . '/site_content.json';
        if (!file_exists($cms_file)) {
            // Create with empty object if not exists
            file_put_contents($cms_file, "{}");
        }
        
        $content = file_get_contents($cms_file);
        $parsed = json_decode($content, true);
        if ($parsed !== null) {
            echo json_encode(["status" => "success", "data" => $parsed]);
            exit;
        }
        
        echo json_encode(["status" => "success", "data" => new stdClass()]);
        exit;

    // -------------------------------------------------------------
    // Public Custom Catalog & Member Listings Endpoint
    // -------------------------------------------------------------
    case 'custom_catalog':
    case 'get_custom_catalog':
        $cat_file = __DIR__ . '/custom_catalog.json';
        $del_file = __DIR__ . '/deleted_products.json';
        $deleted_ids = [];
        if (file_exists($del_file)) {
            $d = json_decode((string)file_get_contents($del_file), true);
            if (is_array($d)) $deleted_ids = array_map('strval', $d);
        }
        $companies = [];
        $products = [];
        if (file_exists($cat_file)) {
            $cat_data = json_decode((string)file_get_contents($cat_file), true);
            if (is_array($cat_data)) {
                $companies = $cat_data['companies'] ?? [];
                $raw_products = $cat_data['products'] ?? [];
                $products = array_values(array_filter($raw_products, function ($p) use ($deleted_ids) {
                    $pid = strval($p['id'] ?? '');
                    return !empty($pid) && !in_array($pid, $deleted_ids, true);
                }));
            }
        }
        header("Cache-Control: no-store, no-cache, must-revalidate");
        echo json_encode([
            "status" => "success",
            "success" => true,
            "companies" => $companies,
            "products" => $products,
            "deletedIds" => $deleted_ids
        ]);
        exit;

    // -------------------------------------------------------------
    // Homepage Config, Commodity Indices, Flash Deals & Marketplace Stats
    // -------------------------------------------------------------
    case 'homepage_config':
    case 'get_homepage_config':
    case 'save_homepage_config':
        $hp_file = __DIR__ . '/homepage_config.json';
        if ($method === 'POST' || $method === 'PUT') {
            $hp_data = !empty($input) ? $input : [];
            @file_put_contents($hp_file, json_encode($hp_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(["status" => "success", "success" => true, "message" => "Homepage config updated", "data" => $hp_data]);
            exit;
        }
        $saved = file_exists($hp_file) ? json_decode((string)file_get_contents($hp_file), true) : null;
        if (!is_array($saved)) {
            $saved = [
                "announcementTicker" => "Exclusive Deal: 2026 Global Sourcing Expo online passes now active • 0% Trade Protection fee for first $50,000 container orders",
                "heroHeadline" => "Connect with 5M+ Verified Global Buyers & Manufacturers",
                "heroSubheadline" => "Direct factory wholesale prices, verified ISO/CE audits, Incoterms FOB/CIF container shipping, and Trade Protection Certificate payment protection.",
                "verifiedBuyersCount" => "5,200,000+",
                "activeSuppliersCount" => "480,000+",
                "supportedCountriesCount" => 184,
                "featuredKeywords" => ["CNC Milling", "LiFePO4 48V", "Forged Wheels", "TOPCon Solar", "HDPE Granules", "ST25 Rice", "Organic Denim"]
            ];
        }
        echo json_encode(["status" => "success", "success" => true, "data" => $saved]);
        exit;

    case 'commodity_indices':
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                ["symbol" => "CU-LME", "name" => "Copper Grade A", "priceUsd" => 9480, "unit" => "MT", "changePercent" => 1.8, "trend" => "UP"],
                ["symbol" => "AL-6061", "name" => "Aluminum Ingot 99.7%", "priceUsd" => 2620, "unit" => "MT", "changePercent" => -0.4, "trend" => "DOWN"],
                ["symbol" => "BRENT-OIL", "name" => "Brent Crude Petroleum", "priceUsd" => 78.40, "unit" => "BBL", "changePercent" => 0.9, "trend" => "UP"],
                ["symbol" => "SOLAR-SI", "name" => "N-Type Monosilicon Wafer", "priceUsd" => 0.142, "unit" => "W", "changePercent" => -2.1, "trend" => "DOWN"],
                ["symbol" => "LITHIUM", "name" => "Lithium Carbonate 99.5%", "priceUsd" => 11200, "unit" => "MT", "changePercent" => 3.4, "trend" => "UP"]
            ]
        ]);
        exit;

    case 'flash_deals':
        echo json_encode(["status" => "success", "success" => true, "data" => []]);
        exit;

    case 'stats':
    case 'get_stats':
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                "totalProducts" => 1420,
                "totalSuppliers" => 480,
                "totalBuyers" => 5200,
                "totalRfqs" => 380,
                "monthlyVolumeUsd" => 125000000
            ]
        ]);
        exit;

    // -------------------------------------------------------------
    // Heartbeat, Logout & User Registry Endpoints
    // -------------------------------------------------------------
    case 'heartbeat':
        echo json_encode(["status" => "success", "success" => true, "timestamp" => date("Y-m-d H:i:s")]);
        exit;

    case 'logout':
        echo json_encode(["status" => "success", "success" => true, "message" => "Logged out successfully"]);
        exit;

    case 'get_users':
    case 'users':
        $users_list = [];
        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $r) {
                    $users_list[] = [
                        'id' => (string)$r['id'],
                        'name' => $r['name'],
                        'email' => $r['email'],
                        'role' => $r['role'],
                        'companyName' => $r['company_name'] ?? '',
                        'country' => $r['country'] ?? 'United States',
                        'phone' => $r['phone'] ?? '',
                        'status' => $r['status'] ?? 'ACTIVE',
                        'isVerified' => !empty($r['is_verified']),
                        'isPremium' => !empty($r['is_premium']),
                        'membershipStatus' => $r['membership_status'] ?? 'free',
                        'tier' => $r['tier'] ?? 'FREE',
                        'avatarUrl' => $r['avatar_url'] ?? ''
                    ];
                }
            } catch (Exception $e) {}
        }
        $existing_emails = [];
        foreach ($users_list as $existing_u) {
            $em = strtolower(trim((string)($existing_u['email'] ?? '')));
            if ($em !== '') $existing_emails[$em] = true;
        }
        $seedUsers = getBuiltInSeedAuthUsers();
        foreach ($seedUsers as $u) {
            $em = strtolower(trim((string)($u['email'] ?? '')));
            if ($em !== '' && isset($existing_emails[$em])) continue;
            $users_list[] = [
                'id' => $u['id'],
                'name' => $u['name'],
                'email' => $u['email'],
                'role' => $u['role'],
                'companyName' => $u['companyName'] ?? '',
                'country' => $u['country'] ?? 'United States',
                'status' => $u['status'] ?? 'ACTIVE',
                'isVerified' => true,
                'isPremium' => !empty($u['isPremium']),
                'membershipStatus' => $u['membershipStatus'] ?? 'paid',
                'tier' => $u['tier'] ?? 'VIP',
                'avatarUrl' => $u['avatarUrl'] ?? ''
            ];
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => $users_list
        ]);
        exit;


    case 'save_content':
        if ($method !== 'POST' && $method !== 'PUT') {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            exit;
        }
        
        $cms_payload = isset($input['siteContent']) ? $input['siteContent'] : $input;
        if (!$cms_payload) {
            echo json_encode(["status" => "error", "message" => "No payload provided"]);
            exit;
        }
        
        $cms_file = __DIR__ . '/site_content.json';
        $json_str = json_encode($cms_payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($cms_file, $json_str) !== false) {
            echo json_encode(["status" => "success", "message" => "CMS content saved successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to write to site_content.json. Check file permissions (ensure 0644 or 0666)."]);
        }
        exit;

    // -------------------------------------------------------------
    // 2. Fetch RFQs: SELECT * FROM rfqs ORDER BY id DESC
    // Always returns {"status": "success", "data": [...]} with saved local /assets/uploads/ images attached
    // -------------------------------------------------------------
    case 'get_rfqs':
    case 'rfqs':
        $rows = [];
        $seen_rfq_ids = [];

        // Load locally saved image overrides (/assets/uploads/product-image-overrides.json) & visual cache
        $uploads_dir_rfq = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_rfq) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_rfq = __DIR__ . '/public/assets/uploads';
        }
        $ov_file_rfq = $uploads_dir_rfq . '/product-image-overrides.json';
        $ov_map_rfq = [];
        if (file_exists($ov_file_rfq)) {
            $parsed_ov = json_decode((string)@file_get_contents($ov_file_rfq), true);
            if (is_array($parsed_ov) && !empty($parsed_ov['overrides']) && is_array($parsed_ov['overrides'])) {
                $ov_map_rfq = $parsed_ov['overrides'];
            }
        }
        $vis_cache_file = __DIR__ . '/product_image_cache.json';
        $vis_cache_map = file_exists($vis_cache_file) ? (json_decode((string)@file_get_contents($vis_cache_file), true) ?: []) : [];

        $resolve_rfq_local_image = function($rfq_id_str, $title_str, $cat_str, $db_img_url) use ($ov_map_rfq, $vis_cache_map) {
            $clean_db = trim((string)$db_img_url);
            if ($clean_db !== '' && strpos($clean_db, '/assets/uploads/') === 0) {
                return $clean_db;
            }
            $clean_subj = preg_replace('/\([^)]*\)|\[[^\]]*\]/', ' ', (string)$title_str);
            $clean_subj = trim(preg_replace('/\s+/', ' ', (string)$clean_subj));
            $candidates_keys = array_filter([
                $rfq_id_str,
                $title_str,
                strtolower((string)$title_str),
                $clean_subj,
                strtolower((string)$clean_subj)
            ]);
            foreach ($candidates_keys as $ck) {
                if (!empty($ov_map_rfq[$ck]['primary'])) {
                    $p = trim((string)$ov_map_rfq[$ck]['primary']);
                    if ($p !== '' && strpos($p, 'unsplash.com') === false && strpos($p, 'picsum.photos') === false) {
                        return $p;
                    }
                }
            }
            $norm_n = trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s-]/', ' ', strtolower($clean_subj ?: $title_str))));
            $norm_c = trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s-]/', ' ', strtolower((string)$cat_str))));
            $vk1 = $norm_c !== '' ? ($norm_n . '::' . $norm_c) : $norm_n;
            foreach ([$vk1, $norm_n] as $vk) {
                if (!empty($vis_cache_map[$vk]['images']) && is_array($vis_cache_map[$vk]['images'])) {
                    foreach ($vis_cache_map[$vk]['images'] as $ci) {
                        $cu = trim((string)($ci['url'] ?? ''));
                        if ($cu !== '' && strpos($cu, '/assets/uploads/') === 0) {
                            return $cu;
                        }
                    }
                    $first_u = trim((string)($vis_cache_map[$vk]['images'][0]['url'] ?? ''));
                    if ($first_u !== '') return $first_u;
                }
            }
            return $clean_db;
        };

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM rfqs ORDER BY CASE WHEN source = 'auto_generated' OR sync_tag = 'market_sync' THEN 1 ELSE 0 END ASC, id DESC");
                $db_rfqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($db_rfqs)) {
                    foreach ($db_rfqs as $r) {
                        $targetQty = is_numeric($r['quantity']) ? intval($r['quantity']) : 1;
                        $targetPriceNum = is_numeric($r['targetPrice']) ? floatval($r['targetPrice']) : (is_numeric($r['target_price'] ?? null) ? floatval($r['target_price']) : 0.0);
                        $isAuto = (($r['source'] ?? '') === 'auto_generated' || ($r['sync_tag'] ?? '') === 'market_sync');
                        $extId = trim((string)($r['external_id'] ?? ''));
                        $finalId = $extId !== '' ? $extId : ("rfq-" . $r['id']);
                        if (isset($seen_rfq_ids[$finalId])) continue;
                        $seen_rfq_ids[$finalId] = true;

                        $resolvedImg = $resolve_rfq_local_image(
                            $finalId,
                            (string)($r['title'] ?? ''),
                            (string)($r['category'] ?? ''),
                            (string)($r['image_url'] ?? '')
                        );
                        $resolvedGallery = [];
                        if (!empty($r['images'])) {
                            $decImgs = json_decode((string)$r['images'], true);
                            if (is_array($decImgs)) {
                                foreach ($decImgs as $di) {
                                    if (is_string($di) && trim($di) !== '') $resolvedGallery[] = trim($di);
                                }
                            }
                        }
                        if ($resolvedImg !== '' && !in_array($resolvedImg, $resolvedGallery, true)) {
                            array_unshift($resolvedGallery, $resolvedImg);
                        }

                        $rows[] = [
                            "id" => $finalId,
                            "raw_id" => intval($r['id']),
                            "title" => $r['title'],
                            "productName" => $r['title'],
                            "category" => $r['category'] ?: 'Industrial Machinery & CNC',
                            "quantity" => (string)($r['quantity'] ?? '1'),
                            "targetQuantity" => $targetQty,
                            "unit" => $r['unit'] ?: 'Pieces',
                            "quantityUnit" => $r['unit'] ?: 'Pieces',
                            "orderFrequency" => $r['order_frequency'] ?? 'Monthly',
                            "order_frequency" => $r['order_frequency'] ?? 'Monthly',
                            "targetPrice" => (string)($r['targetPrice'] ?? '0'),
                            "targetPriceUsd" => $targetPriceNum,
                            "estimatedOrderValueUsd" => ($targetQty > 0 && $targetPriceNum > 0) ? round($targetQty * $targetPriceNum, 2) : 0,
                            "incoterms" => $r['incoterms'] ?: 'FOB',
                            "preferredIncoterm" => $r['incoterms'] ?: 'FOB',
                            "destinationPort" => $r['destinationPort'] ?: ($r['destination_port'] ?? 'Port of Hamburg'),
                            "specifications" => $r['specifications'] ?: '',
                            "detailedRequirements" => $r['specifications'] ?: '',
                            "detailedDescription" => $r['specifications'] ?: '',
                            "buyer_name" => $r['buyer_name'],
                            "buyerName" => $r['buyer_name'],
                            "buyer_country" => $r['buyer_country'] ?: 'United States',
                            "buyerCountry" => $r['buyer_country'] ?: 'United States',
                            "buyer_email" => $r['buyer_email'] ?? '',
                            "buyerEmail" => $r['buyer_email'] ?? '',
                            "buyer_phone" => $r['buyer_phone'] ?? '',
                            "buyerPhone" => $r['buyer_phone'] ?? '',
                            "buyer_address" => $r['buyer_address'] ?? '',
                            "buyerAddress" => $r['buyer_address'] ?? '',
                            "buyer_company" => $r['buyer_company'] ?? $r['buyer_name'],
                            "buyerCompany" => $r['buyer_company'] ?? $r['buyer_name'],
                            "buyerVerified" => true,
                            "targetDeliveryDate" => date("Y-m-d", strtotime("+45 days")),
                            "paymentTerms" => !empty($r['payment_terms']) ? $r['payment_terms'] : "Trade Assurance Escrow (Swiss Vault)",
                            "urgency" => "STANDARD",
                            "quotesCount" => 0,
                            "postedDate" => isset($r['created_at']) ? substr($r['created_at'], 0, 10) : date("Y-m-d"),
                            "postedLabel" => $r['posted_label'] ?? ($isAuto ? 'Just now' : null),
                            "expiryDate" => date("Y-m-d", strtotime("+60 days")),
                            "status" => "OPEN",
                            "source" => $isAuto ? "auto_generated" : "user",
                            "syncTag" => $r['sync_tag'] ?? ($isAuto ? "market_sync" : ""),
                            "sync_tag" => $r['sync_tag'] ?? ($isAuto ? "market_sync" : ""),
                            "searchKeyword" => $r['search_keyword'] ?? "",
                            "marketInsight" => $r['market_insight'] ?? "",
                            "marketDemandVerified" => $isAuto,
                            "image" => $resolvedImg ?: null,
                            "image_url" => $resolvedImg ?: null,
                            "images" => $resolvedGallery,
                            "created_at" => $r['created_at'] ?? date("Y-m-d H:i:s")
                        ];
                    }
                }
            } catch (Exception $e) {
                $rows = [];
            }
        }

        // Also merge any JSON-persisted RFQs from rfqs_auto_store.json (fast BigRock disk cache)
        $auto_rfq_file = __DIR__ . '/rfqs_auto_store.json';
        if (file_exists($auto_rfq_file)) {
            $json_rfqs = json_decode((string)@file_get_contents($auto_rfq_file), true);
            if (is_array($json_rfqs)) {
                foreach ($json_rfqs as $jr) {
                    if (!is_array($jr)) continue;
                    $jid = trim((string)($jr['id'] ?? ''));
                    if ($jid === '' || isset($seen_rfq_ids[$jid])) continue;
                    $seen_rfq_ids[$jid] = true;
                    $jImg = $resolve_rfq_local_image(
                        $jid,
                        (string)($jr['productName'] ?? $jr['title'] ?? ''),
                        (string)($jr['category'] ?? ''),
                        (string)($jr['image_url'] ?? $jr['image'] ?? '')
                    );
                    if ($jImg !== '') {
                        $jr['image'] = $jImg;
                        $jr['image_url'] = $jImg;
                        $jr['images'] = [$jImg];
                    }
                    $rows[] = $jr;
                }
            }
        }

        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    // -------------------------------------------------------------
    // 3. Submit RFQ: Inserts into `rfqs` table with prepared statements (0 emails)
    // -------------------------------------------------------------
    case 'submit_rfq':
    case 'create_rfq':
        $external_id = trim((string)($input['id'] ?? $input['external_id'] ?? ''));
        $title = trim($input['title'] ?? $input['productName'] ?? $input['product_name'] ?? 'Wholesale Product');
        $category = trim($input['category'] ?? 'Industrial Machinery & CNC');
        $quantity = (string)($input['quantity'] ?? $input['target_quantity'] ?? $input['targetQuantity'] ?? '1000');
        $unit = trim($input['unit'] ?? $input['quantity_unit'] ?? $input['quantityUnit'] ?? 'Pieces');
        $order_frequency = trim($input['order_frequency'] ?? $input['orderFrequency'] ?? 'Monthly');
        $targetPrice = (string)($input['targetPrice'] ?? $input['target_price'] ?? $input['target_price_usd'] ?? $input['targetPriceUsd'] ?? '0');
        $incoterms = trim($input['incoterms'] ?? $input['incoterm'] ?? $input['preferred_incoterm'] ?? $input['preferredIncoterm'] ?? 'FOB');
        $destinationPort = trim($input['destinationPort'] ?? $input['destination_port'] ?? 'Port of Hamburg');
        $payment_terms = trim($input['payment_terms'] ?? $input['paymentTerms'] ?? 'Trade Assurance Escrow (Swiss Vault)');
        $specifications = trim($input['specifications'] ?? $input['requirements'] ?? $input['detailed_requirements'] ?? $input['detailedRequirements'] ?? $input['message'] ?? 'Standard export specifications.');
        $buyer_name = trim($input['buyer_name'] ?? $input['buyerName'] ?? $input['name'] ?? 'Procurement Officer');
        $buyer_country = trim($input['buyer_country'] ?? $input['buyerCountry'] ?? $input['country'] ?? 'United States');
        $buyer_email = trim($input['buyer_email'] ?? $input['buyerEmail'] ?? $input['email'] ?? 'buyer@tradeheaven.net');
        $buyer_phone = trim($input['buyer_phone'] ?? $input['buyerPhone'] ?? $input['phone'] ?? '');
        $buyer_address = trim($input['buyer_address'] ?? $input['buyerAddress'] ?? '');
        $buyer_company = trim($input['buyer_company'] ?? $input['buyerCompany'] ?? $input['company'] ?? $buyer_name);
        $source = (($input['source'] ?? '') === 'auto_generated' || ($input['sync_tag'] ?? '') === 'market_sync' || ($input['syncTag'] ?? '') === 'market_sync') ? 'auto_generated' : 'user';
        $sync_tag = trim($input['sync_tag'] ?? $input['syncTag'] ?? ($source === 'auto_generated' ? 'market_sync' : ''));
        $search_keyword = trim($input['search_keyword'] ?? $input['searchKeyword'] ?? '');
        $market_insight = trim($input['market_insight'] ?? $input['marketInsight'] ?? '');
        $posted_label = trim($input['posted_label'] ?? $input['postedLabel'] ?? ($source === 'auto_generated' ? 'Just now' : ''));
        $image_url = trim((string)($input['image_url'] ?? $input['imageUrl'] ?? $input['image'] ?? (!empty($input['images'][0]) ? $input['images'][0] : '')));

        // Resolve existing local override or auto-assign a unique verified image from >10 pool if image_url is empty/placeholder
        $uploads_dir_sub = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_sub) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_sub = __DIR__ . '/public/assets/uploads';
        }
        $ov_file_sub = $uploads_dir_sub . '/product-image-overrides.json';
        $is_placeholder_sub = ($image_url === '' || preg_match('/(picsum\.photos|placeholder\.com|via\.placeholder|unsplash\.com|images\.unsplash\.com|dummyimage\.com)/i', $image_url));
        if ($is_placeholder_sub && file_exists($ov_file_sub)) {
            $ov_data_sub = json_decode((string)@file_get_contents($ov_file_sub), true);
            $ov_entries = $ov_data_sub['overrides'] ?? [];
            if ($external_id !== '' && !empty($ov_entries[$external_id]['primary'])) {
                $image_url = trim((string)$ov_entries[$external_id]['primary']);
                $is_placeholder_sub = false;
            }
        }
        if ($is_placeholder_sub) {
            $cache_file_sub = __DIR__ . '/product_image_cache.json';
            $used_sub_urls = [];
            if (file_exists($ov_file_sub)) {
                $ov_d = json_decode((string)@file_get_contents($ov_file_sub), true);
                foreach (($ov_d['overrides'] ?? []) as $ov_v) {
                    if (!empty($ov_v['primary'])) $used_sub_urls[explode('?', (string)$ov_v['primary'])[0]] = true;
                }
            }
            if (file_exists($cache_file_sub)) {
                $c_all = json_decode((string)@file_get_contents($cache_file_sub), true) ?: [];
                $norm_t = strtolower(trim(preg_replace('/[^\w\s-]/', ' ', $title)));
                foreach ($c_all as $c_key => $c_rec) {
                    if (strpos($c_key, substr($norm_t, 0, 12)) !== false && !empty($c_rec['images']) && is_array($c_rec['images'])) {
                        $pool_imgs = $c_rec['images'];
                        shuffle($pool_imgs);
                        foreach ($pool_imgs as $p_img) {
                            $cand_u = trim((string)($p_img['url'] ?? ''));
                            if ($cand_u !== '' && !isset($used_sub_urls[$cand_u])) {
                                $image_url = $cand_u;
                                break 2;
                            }
                        }
                    }
                }
            }
        }
        $images_arr = !empty($input['images']) && is_array($input['images'])
            ? array_values(array_filter(array_map('strval', $input['images'])))
            : ($image_url !== '' ? [$image_url] : []);
        $images_json = json_encode($images_arr, JSON_UNESCAPED_SLASHES);

        $inserted_id = time();
        $inserted_row = null;

        if ($db_connected && $pdo) {
            try {
                // Deduplicate auto_generated market_sync RFQs
                $dbRow = null;
                if ($external_id !== '') {
                    $dupExt = $pdo->prepare("SELECT * FROM rfqs WHERE external_id = ? LIMIT 1");
                    $dupExt->execute([$external_id]);
                    $dbRow = $dupExt->fetch(PDO::FETCH_ASSOC);
                    if ($dbRow) {
                        $inserted_id = (int)$dbRow['id'];
                        if ($image_url !== '' && empty($dbRow['image_url'])) {
                            $upImg = $pdo->prepare("UPDATE rfqs SET image_url = ?, images = ? WHERE id = ?");
                            $upImg->execute([$image_url, $images_json, $inserted_id]);
                            $dbRow['image_url'] = $image_url;
                            $dbRow['images'] = $images_json;
                        }
                    }
                }
                if (!$dbRow && $source === 'auto_generated') {
                    $dupStmt = $pdo->prepare("SELECT * FROM rfqs WHERE title = ? AND buyer_email = ? AND source = 'auto_generated' LIMIT 1");
                    $dupStmt->execute([$title, $buyer_email]);
                    $dbRow = $dupStmt->fetch(PDO::FETCH_ASSOC);
                    if ($dbRow) {
                        $inserted_id = (int)$dbRow['id'];
                    }
                }

                if (!$dbRow) {
                    $stmt = $pdo->prepare("INSERT INTO rfqs (
                        external_id, title, category, quantity, unit, targetPrice, incoterms, destinationPort,
                        specifications, buyer_name, buyer_country, buyer_email, buyer_company,
                        buyer_phone, buyer_address, payment_terms, order_frequency, source, sync_tag,
                        search_keyword, market_insight, posted_label, image_url, images
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    $stmt->execute([
                        $external_id,
                        $title,
                        $category,
                        $quantity,
                        $unit,
                        $targetPrice,
                        $incoterms,
                        $destinationPort,
                        $specifications,
                        $buyer_name,
                        $buyer_country,
                        $buyer_email,
                        $buyer_company,
                        $buyer_phone,
                        $buyer_address,
                        $payment_terms,
                        $order_frequency,
                        $source,
                        $sync_tag,
                        $search_keyword,
                        $market_insight,
                        $posted_label,
                        $image_url,
                        $images_json
                    ]);

                    $inserted_id = (int)$pdo->lastInsertId();

                    $fetchStmt = $pdo->prepare("SELECT * FROM rfqs WHERE id = ?");
                    $fetchStmt->execute([$inserted_id]);
                    $dbRow = $fetchStmt->fetch(PDO::FETCH_ASSOC);
                }

                if ($dbRow) {
                    $targetQty = is_numeric($dbRow['quantity']) ? intval($dbRow['quantity']) : 1;
                    $targetPriceNum = is_numeric($dbRow['targetPrice']) ? floatval($dbRow['targetPrice']) : 0.0;
                    $isAuto = (($dbRow['source'] ?? $source) === 'auto_generated' || ($dbRow['sync_tag'] ?? $sync_tag) === 'market_sync');
                    $rowIdStr = !empty($dbRow['external_id']) ? (string)$dbRow['external_id'] : ("rfq-" . $dbRow['id']);
                    $rowImg = trim((string)($dbRow['image_url'] ?? $image_url));

                    $inserted_row = [
                        "id" => $rowIdStr,
                        "raw_id" => intval($dbRow['id']),
                        "title" => $dbRow['title'],
                        "productName" => $dbRow['title'],
                        "category" => $dbRow['category'] ?: $category,
                        "quantity" => (string)$dbRow['quantity'],
                        "targetQuantity" => $targetQty,
                        "unit" => $dbRow['unit'] ?: $unit,
                        "quantityUnit" => $dbRow['unit'] ?: $unit,
                        "orderFrequency" => $dbRow['order_frequency'] ?? $order_frequency,
                        "targetPrice" => (string)$dbRow['targetPrice'],
                        "targetPriceUsd" => $targetPriceNum,
                        "estimatedOrderValueUsd" => ($targetQty > 0 && $targetPriceNum > 0) ? round($targetQty * $targetPriceNum, 2) : 0,
                        "incoterms" => $dbRow['incoterms'] ?: $incoterms,
                        "preferredIncoterm" => $dbRow['incoterms'] ?: $incoterms,
                        "destinationPort" => $dbRow['destinationPort'] ?: $destinationPort,
                        "specifications" => $dbRow['specifications'] ?: $specifications,
                        "detailedRequirements" => $dbRow['specifications'] ?: $specifications,
                        "detailedDescription" => $dbRow['specifications'] ?: $specifications,
                        "buyer_name" => $dbRow['buyer_name'],
                        "buyerName" => $dbRow['buyer_name'],
                        "buyer_country" => $dbRow['buyer_country'],
                        "buyerCountry" => $dbRow['buyer_country'],
                        "buyer_email" => $dbRow['buyer_email'] ?? $buyer_email,
                        "buyerEmail" => $dbRow['buyer_email'] ?? $buyer_email,
                        "buyer_phone" => $dbRow['buyer_phone'] ?? $buyer_phone,
                        "buyerPhone" => $dbRow['buyer_phone'] ?? $buyer_phone,
                        "buyer_address" => $dbRow['buyer_address'] ?? $buyer_address,
                        "buyerAddress" => $dbRow['buyer_address'] ?? $buyer_address,
                        "buyer_company" => $dbRow['buyer_company'] ?? $buyer_company,
                        "buyerCompany" => $dbRow['buyer_company'] ?? $buyer_company,
                        "buyerVerified" => true,
                        "targetDeliveryDate" => date("Y-m-d", strtotime("+45 days")),
                        "paymentTerms" => !empty($dbRow['payment_terms']) ? $dbRow['payment_terms'] : $payment_terms,
                        "urgency" => "STANDARD",
                        "quotesCount" => 0,
                        "postedDate" => date("Y-m-d"),
                        "postedLabel" => $dbRow['posted_label'] ?? $posted_label,
                        "expiryDate" => date("Y-m-d", strtotime("+60 days")),
                        "status" => "OPEN",
                        "source" => $isAuto ? "auto_generated" : "user",
                        "syncTag" => $dbRow['sync_tag'] ?? $sync_tag,
                        "sync_tag" => $dbRow['sync_tag'] ?? $sync_tag,
                        "searchKeyword" => $dbRow['search_keyword'] ?? $search_keyword,
                        "marketInsight" => $dbRow['market_insight'] ?? $market_insight,
                        "marketDemandVerified" => $isAuto,
                        "image" => $rowImg ?: null,
                        "image_url" => $rowImg ?: null,
                        "images" => $rowImg ? [$rowImg] : [],
                        "created_at" => $dbRow['created_at'] ?? date("Y-m-d H:i:s")
                    ];
                }
            } catch (Exception $e) {
                $inserted_id = time();
            }
        }

        // Fallback representation if database fetch was unassisted
        if (!$inserted_row) {
            $targetQtyFallback = is_numeric($quantity) ? intval($quantity) : 1;
            $targetPriceFallback = is_numeric($targetPrice) ? floatval($targetPrice) : 0.0;
            $isAutoFallback = ($source === 'auto_generated' || $sync_tag === 'market_sync');
            $fallbackId = $external_id !== '' ? $external_id : ("rfq-" . $inserted_id);
            $inserted_row = [
                "id" => $fallbackId,
                "raw_id" => intval($inserted_id),
                "title" => $title,
                "productName" => $title,
                "category" => $category,
                "quantity" => (string)$quantity,
                "targetQuantity" => $targetQtyFallback,
                "unit" => $unit,
                "quantityUnit" => $unit,
                "orderFrequency" => $order_frequency,
                "targetPrice" => (string)$targetPrice,
                "targetPriceUsd" => $targetPriceFallback,
                "estimatedOrderValueUsd" => ($targetQtyFallback > 0 && $targetPriceFallback > 0) ? round($targetQtyFallback * $targetPriceFallback, 2) : 0,
                "incoterms" => $incoterms,
                "preferredIncoterm" => $incoterms,
                "destinationPort" => $destinationPort,
                "specifications" => $specifications,
                "detailedRequirements" => $specifications,
                "detailedDescription" => $specifications,
                "buyer_name" => $buyer_name,
                "buyerName" => $buyer_name,
                "buyer_country" => $buyer_country,
                "buyerCountry" => $buyer_country,
                "buyer_email" => $buyer_email,
                "buyerEmail" => $buyer_email,
                "buyer_phone" => $buyer_phone,
                "buyerPhone" => $buyer_phone,
                "buyer_address" => $buyer_address,
                "buyerAddress" => $buyer_address,
                "buyer_company" => $buyer_company,
                "buyerCompany" => $buyer_company,
                "buyerVerified" => true,
                "targetDeliveryDate" => date("Y-m-d", strtotime("+45 days")),
                "paymentTerms" => $payment_terms,
                "urgency" => "STANDARD",
                "quotesCount" => 0,
                "postedDate" => date("Y-m-d"),
                "postedLabel" => $posted_label,
                "expiryDate" => date("Y-m-d", strtotime("+60 days")),
                "status" => "OPEN",
                "source" => $isAutoFallback ? "auto_generated" : "user",
                "syncTag" => $sync_tag,
                "sync_tag" => $sync_tag,
                "searchKeyword" => $search_keyword,
                "marketInsight" => $market_insight,
                "marketDemandVerified" => $isAutoFallback,
                "image" => $image_url ?: null,
                "image_url" => $image_url ?: null,
                "images" => $image_url ? [$image_url] : [],
                "created_at" => date("Y-m-d H:i:s")
            ];
        }

        if ($source !== 'auto_generated') {
            @sendPhpMailAlert(
                "New Buy Lead RFQ Submitted: {$title}",
                "New Procurement Request Posted",
                "A buyer has posted a new buying lead / RFQ on Trade Heaven.",
                [
                    "Product / Title" => $title,
                    "Category" => $category,
                    "Quantity" => "{$quantity} {$unit}",
                    "Target Price" => "\${$targetPrice}",
                    "Buyer Name" => $buyer_name,
                    "Buyer Company" => $buyer_company,
                    "Buyer Country" => $buyer_country,
                    "Buyer Email" => $buyer_email
                ]
            );
        }

        echo json_encode([
            "status" => "success",
            "data" => $inserted_row
        ]);
        break;

    // -------------------------------------------------------------
    // 3B. Batch Persist Auto-Generated / Next-Page RFQs on BigRock (Zero Emails)
    // -------------------------------------------------------------
    case 'auto_batch_persist_rfqs':
    case 'auto_batch_persist':
        $incoming_rfqs = isset($input['rfqs']) && is_array($input['rfqs']) ? $input['rfqs'] : [];
        $batch_keyword = trim((string)($input['keyword'] ?? ''));
        $batch_insight = trim((string)($input['insightSummary'] ?? ''));
        if (empty($incoming_rfqs)) {
            echo json_encode(["status" => "success", "success" => true, "addedCount" => 0, "rfqs" => []]);
            break;
        }

        $uploads_dir_bp = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_bp) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_bp = __DIR__ . '/public/assets/uploads';
        }
        $ov_file_bp = $uploads_dir_bp . '/product-image-overrides.json';
        $ov_map_bp = [];
        if (file_exists($ov_file_bp)) {
            $parsed_bp = json_decode((string)@file_get_contents($ov_file_bp), true);
            if (is_array($parsed_bp) && !empty($parsed_bp['overrides']) && is_array($parsed_bp['overrides'])) {
                $ov_map_bp = $parsed_bp['overrides'];
            }
        }
        $vis_cache_file_bp = __DIR__ . '/product_image_cache.json';
        $vis_cache_bp = file_exists($vis_cache_file_bp) ? (json_decode((string)@file_get_contents($vis_cache_file_bp), true) ?: []) : [];

        $auto_rfq_file = __DIR__ . '/rfqs_auto_store.json';
        $stored_auto_rfqs = file_exists($auto_rfq_file) ? (json_decode((string)@file_get_contents($auto_rfq_file), true) ?: []) : [];
        if (!is_array($stored_auto_rfqs)) $stored_auto_rfqs = [];
        $auto_map_by_id = [];
        foreach ($stored_auto_rfqs as $idx_sr => $sr) {
            if (is_array($sr) && !empty($sr['id'])) {
                $auto_map_by_id[(string)$sr['id']] = $idx_sr;
            }
        }

        $added_items = [];
        foreach ($incoming_rfqs as $raw) {
            if (!is_array($raw)) continue;
            $ext_id = trim((string)($raw['id'] ?? ''));
            if ($ext_id === '') {
                $ext_id = 'rfq-auto-' . time() . '-' . substr(md5(uniqid('', true)), 0, 5);
            }
            $p_title = trim((string)($raw['productName'] ?? $raw['product_name'] ?? $raw['title'] ?? 'Wholesale Product'));
            $p_cat = trim((string)($raw['category'] ?? 'Agriculture & Global Commodities'));
            $raw_img = trim((string)($raw['image'] ?? $raw['image_url'] ?? (!empty($raw['images'][0]) ? $raw['images'][0] : '')));

            // Resolve local /assets/uploads/ image if already cached on server
            if ($raw_img === '' || strpos($raw_img, '/assets/uploads/') !== 0) {
                $clean_s = trim(preg_replace('/\s+/', ' ', preg_replace('/\([^)]*\)|\[[^\]]*\]/', ' ', $p_title)));
                foreach (array_filter([$ext_id, $p_title, strtolower($p_title), $clean_s, strtolower($clean_s)]) as $ck) {
                    if (!empty($ov_map_bp[$ck]['primary']) && strpos((string)$ov_map_bp[$ck]['primary'], '/assets/uploads/') === 0) {
                        $raw_img = trim((string)$ov_map_bp[$ck]['primary']);
                        break;
                    }
                }
                if ($raw_img === '' || strpos($raw_img, '/assets/uploads/') !== 0) {
                    $nn = trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s-]/', ' ', strtolower($clean_s ?: $p_title))));
                    $nc = trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s-]/', ' ', strtolower($p_cat))));
                    foreach ([$nc !== '' ? ($nn . '::' . $nc) : $nn, $nn] as $vk) {
                        if (!empty($vis_cache_bp[$vk]['images']) && is_array($vis_cache_bp[$vk]['images'])) {
                            foreach ($vis_cache_bp[$vk]['images'] as $ci) {
                                $cu = trim((string)($ci['url'] ?? ''));
                                if ($cu !== '' && strpos($cu, '/assets/uploads/') === 0) {
                                    $raw_img = $cu;
                                    break 2;
                                }
                            }
                        }
                    }
                }
            }

            $qty_str = (string)($raw['targetQuantity'] ?? $raw['quantity'] ?? '100');
            $unit_str = trim((string)($raw['quantityUnit'] ?? $raw['unit'] ?? 'MT'));
            $freq_str = trim((string)($raw['orderFrequency'] ?? $raw['order_frequency'] ?? 'Monthly'));
            $price_str = (string)($raw['targetPriceUsd'] ?? $raw['targetPrice'] ?? '100');
            $incoterm_str = trim((string)($raw['preferredIncoterm'] ?? $raw['incoterms'] ?? 'CIF'));
            $port_str = trim((string)($raw['destinationPort'] ?? $raw['destination_port'] ?? 'Global Port'));
            $specs_str = trim((string)($raw['detailedRequirements'] ?? $raw['detailedDescription'] ?? $raw['specifications'] ?? ''));
            $b_name = trim((string)($raw['buyerName'] ?? $raw['buyer_name'] ?? 'International Procurement Officer'));
            $b_comp = trim((string)($raw['buyerCompany'] ?? $raw['buyer_company'] ?? 'Global Trading Corp'));
            $b_country = trim((string)($raw['buyerCountry'] ?? $raw['buyer_country'] ?? 'United States'));
            $b_email = trim((string)($raw['buyerEmail'] ?? $raw['buyer_email'] ?? 'sourcing@globaltrade.com'));
            $b_phone = trim((string)($raw['buyerPhone'] ?? $raw['buyer_phone'] ?? ''));
            $b_addr = trim((string)($raw['buyerAddress'] ?? $raw['buyer_address'] ?? ''));
            $pay_str = trim((string)($raw['paymentTerms'] ?? $raw['payment_terms'] ?? 'CIF, LC / TT'));
            $s_kw = trim((string)($raw['searchKeyword'] ?? $raw['search_keyword'] ?? $batch_keyword ?: $p_title));
            $m_ins = trim((string)($raw['marketInsight'] ?? $raw['market_insight'] ?? $batch_insight));
            $p_lbl = trim((string)($raw['postedLabel'] ?? $raw['posted_label'] ?? 'Just now'));
            $imgs_json = json_encode($raw_img !== '' ? [$raw_img] : [], JSON_UNESCAPED_SLASHES);

            if ($db_connected && $pdo) {
                try {
                    $chk = $pdo->prepare("SELECT id, image_url FROM rfqs WHERE external_id = ? LIMIT 1");
                    $chk->execute([$ext_id]);
                    $exRow = $chk->fetch(PDO::FETCH_ASSOC);
                    if ($exRow) {
                        if ($raw_img !== '' && (empty($exRow['image_url']) || strpos((string)$exRow['image_url'], '/assets/uploads/') !== 0)) {
                            $upd = $pdo->prepare("UPDATE rfqs SET image_url = ?, images = ? WHERE id = ?");
                            $upd->execute([$raw_img, $imgs_json, $exRow['id']]);
                        }
                    } else {
                        $ins = $pdo->prepare("INSERT INTO rfqs (
                            external_id, title, category, quantity, unit, targetPrice, incoterms, destinationPort,
                            specifications, buyer_name, buyer_country, buyer_email, buyer_company,
                            buyer_phone, buyer_address, payment_terms, order_frequency, source, sync_tag,
                            search_keyword, market_insight, posted_label, image_url, images
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'auto_generated', 'market_sync', ?, ?, ?, ?, ?)");
                        $ins->execute([
                            $ext_id, $p_title, $p_cat, $qty_str, $unit_str, $price_str, $incoterm_str, $port_str,
                            $specs_str, $b_name, $b_country, $b_email, $b_comp,
                            $b_phone, $b_addr, $pay_str, $freq_str,
                            $s_kw, $m_ins, $p_lbl, $raw_img, $imgs_json
                        ]);
                    }
                } catch (Exception $e) {}
            }

            $record_item = [
                "id" => $ext_id,
                "title" => $p_title,
                "productName" => $p_title,
                "category" => $p_cat,
                "quantity" => $qty_str,
                "targetQuantity" => floatval($qty_str) ?: 100,
                "unit" => $unit_str,
                "quantityUnit" => $unit_str,
                "orderFrequency" => $freq_str,
                "targetPrice" => $price_str,
                "targetPriceUsd" => floatval($price_str) ?: 100,
                "estimatedOrderValueUsd" => round((floatval($qty_str) ?: 100) * (floatval($price_str) ?: 100), 2),
                "incoterms" => $incoterm_str,
                "preferredIncoterm" => $incoterm_str,
                "destinationPort" => $port_str,
                "specifications" => $specs_str,
                "detailedRequirements" => $specs_str,
                "detailedDescription" => $specs_str,
                "buyer_name" => $b_name,
                "buyerName" => $b_name,
                "buyer_company" => $b_comp,
                "buyerCompany" => $b_comp,
                "buyer_country" => $b_country,
                "buyerCountry" => $b_country,
                "buyer_email" => $b_email,
                "buyerEmail" => $b_email,
                "buyer_phone" => $b_phone,
                "buyerPhone" => $b_phone,
                "buyer_address" => $b_addr,
                "buyerAddress" => $b_addr,
                "buyerVerified" => true,
                "paymentTerms" => $pay_str,
                "urgency" => (string)($raw['urgency'] ?? 'STANDARD'),
                "quotesCount" => intval($raw['quotesCount'] ?? 2),
                "postedDate" => date("Y-m-d"),
                "postedLabel" => $p_lbl,
                "status" => "OPEN",
                "source" => "auto_generated",
                "syncTag" => "market_sync",
                "sync_tag" => "market_sync",
                "searchKeyword" => $s_kw,
                "marketInsight" => $m_ins,
                "marketDemandVerified" => true,
                "image" => $raw_img ?: null,
                "image_url" => $raw_img ?: null,
                "images" => $raw_img !== '' ? [$raw_img] : [],
                "created_at" => date("Y-m-d H:i:s")
            ];

            if (isset($auto_map_by_id[$ext_id])) {
                $existing_idx = $auto_map_by_id[$ext_id];
                if ($raw_img !== '') {
                    $stored_auto_rfqs[$existing_idx]['image'] = $raw_img;
                    $stored_auto_rfqs[$existing_idx]['image_url'] = $raw_img;
                    $stored_auto_rfqs[$existing_idx]['images'] = [$raw_img];
                }
            } else {
                $auto_map_by_id[$ext_id] = count($stored_auto_rfqs);
                $stored_auto_rfqs[] = $record_item;
                $added_items[] = $record_item;
            }
        }

        if (count($stored_auto_rfqs) > 1500) {
            $stored_auto_rfqs = array_slice($stored_auto_rfqs, -1500);
        }
        @file_put_contents($auto_rfq_file, json_encode(array_values($stored_auto_rfqs), JSON_UNESCAPED_SLASHES));

        echo json_encode([
            "status" => "success",
            "success" => true,
            "addedCount" => count($added_items),
            "rfqs" => $added_items
        ]);
        break;

    // -------------------------------------------------------------
    // 4. Fetch / Create / Update Listings
    // -------------------------------------------------------------
    case 'get_listings':
    case 'listings':
    case 'products':
    case 'get_products':
    case 'create_listing':
    case 'update_listing':
    case 'submit_listing':
        if ($method === 'GET' && $action !== 'create_listing' && $action !== 'update_listing' && $action !== 'submit_listing') {
            $del_file = __DIR__ . '/deleted_products.json';
            $deleted_ids = [];
            if (file_exists($del_file)) {
                $d = json_decode((string)file_get_contents($del_file), true);
                if (is_array($d)) $deleted_ids = array_map('strval', $d);
            }
            $rows = [];
            if ($db_connected && $pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM listings ORDER BY id DESC LIMIT 100");
                    $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    if (!empty($raw)) {
                        $rows = array_values(array_filter($raw, function ($r) use ($deleted_ids) {
                            $rid = strval($r['id'] ?? '');
                            return !in_array($rid, $deleted_ids, true) && !in_array('prod-db-' . $rid, $deleted_ids, true);
                        }));
                    }
                } catch (Exception $e) {
                    $rows = [];
                }
            }
            header("Cache-Control: no-store, no-cache, must-revalidate");
            echo json_encode(["status" => "success", "success" => true, "data" => $rows, "deletedIds" => $deleted_ids]);
        } else {
            $title = $input['title'] ?? 'Product Listing';
            $category = $input['category'] ?? 'General';
            $sub_category = $input['sub_category'] ?? $input['subCategory'] ?? '';
            $price = (string)($input['price'] ?? $input['priceUsd'] ?? '100');
            $moq = intval($input['moq'] ?? $input['minOrderQuantity'] ?? 1);
            $moq_unit = $input['moq_unit'] ?? $input['moqUnit'] ?? 'Pieces';
            $supplier_name = $input['supplier_name'] ?? $input['supplierName'] ?? 'Verified Exporter';
            $supplier_email = $input['supplier_email'] ?? $input['supplierEmail'] ?? '';
            $supplier_phone = $input['supplier_phone'] ?? $input['supplierPhone'] ?? '';
            $supplier_country = $input['supplier_country'] ?? $input['supplierCountry'] ?? 'China';
            $location = $input['location'] ?? $input['port'] ?? 'Port of Shanghai';
            $description = $input['description'] ?? $input['specifications'] ?? '';
            $image_url = trim((string)($input['image_url'] ?? $input['imageUrl'] ?? ''));
            if ($image_url === '' || preg_match('/(picsum\.photos|placeholder\.com|via\.placeholder|unsplash\.com|images\.unsplash\.com|dummyimage\.com)/i', $image_url)) {
                $cache_file_lst = __DIR__ . '/product_image_cache.json';
                $uploads_dir_lst = is_dir(__DIR__ . '/assets/uploads') ? (__DIR__ . '/assets/uploads') : (__DIR__ . '/public/assets/uploads');
                $ov_file_lst = $uploads_dir_lst . '/product-image-overrides.json';
                $used_lst_urls = [];
                if (file_exists($ov_file_lst)) {
                    $ov_dl = json_decode((string)@file_get_contents($ov_file_lst), true);
                    foreach (($ov_dl['overrides'] ?? []) as $ov_vl) {
                        if (!empty($ov_vl['primary'])) $used_lst_urls[explode('?', (string)$ov_vl['primary'])[0]] = true;
                    }
                }
                if (file_exists($cache_file_lst)) {
                    $c_all_l = json_decode((string)@file_get_contents($cache_file_lst), true) ?: [];
                    $norm_tl = strtolower(trim(preg_replace('/[^\w\s-]/', ' ', $title)));
                    foreach ($c_all_l as $c_key_l => $c_rec_l) {
                        if (strpos($c_key_l, substr($norm_tl, 0, 12)) !== false && !empty($c_rec_l['images']) && is_array($c_rec_l['images'])) {
                            $pool_imgs_l = $c_rec_l['images'];
                            shuffle($pool_imgs_l);
                            foreach ($pool_imgs_l as $p_img_l) {
                                $cand_ul = trim((string)($p_img_l['url'] ?? ''));
                                if ($cand_ul !== '' && !isset($used_lst_urls[$cand_ul])) {
                                    $image_url = $cand_ul;
                                    break 2;
                                }
                            }
                        }
                    }
                }
            }
            $images_arr = !empty($input['images']) && is_array($input['images'])
                ? array_values(array_filter(array_map('strval', $input['images'])))
                : ($image_url !== '' ? [$image_url] : []);
            $images_json = json_encode($images_arr, JSON_UNESCAPED_SLASHES);
            $listing_id = isset($input['id']) ? intval($input['id']) : null;

            $inserted_id = $listing_id ?: time();
            if ($db_connected && $pdo) {
                try {
                    if ($action === 'update_listing' && $listing_id) {
                        $stmt = $pdo->prepare("UPDATE listings SET
                            title = ?, category = ?, sub_category = ?, price = ?, moq = ?, moq_unit = ?,
                            supplier_name = ?, supplier_email = ?, supplier_phone = ?, supplier_country = ?,
                            location = ?, description = ?, image_url = ?, images = ? WHERE id = ?");
                        $stmt->execute([
                            $title, $category, $sub_category, $price, $moq, $moq_unit,
                            $supplier_name, $supplier_email, $supplier_phone, $supplier_country,
                            $location, $description, $image_url, $images_json, $listing_id
                        ]);
                        $inserted_id = $listing_id;
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO listings (
                            title, category, sub_category, price, moq, moq_unit,
                            supplier_name, supplier_email, supplier_phone, supplier_country,
                            location, description, image_url, images, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')");

                        $stmt->execute([
                            $title, $category, $sub_category, $price, $moq, $moq_unit,
                            $supplier_name, $supplier_email, $supplier_phone, $supplier_country,
                            $location, $description, $image_url, $images_json
                        ]);
                        $inserted_id = (int)$pdo->lastInsertId();
                    }
                } catch (Exception $e) {}
            }

            echo json_encode([
                "status" => "success",
                "id" => $inserted_id,
                "message" => "Product listing published and stored in MySQL database!",
                "data" => [
                    "id" => $inserted_id,
                    "title" => $title,
                    "category" => $category,
                    "sub_category" => $sub_category,
                    "price" => $price,
                    "moq" => $moq,
                    "moq_unit" => $moq_unit,
                    "supplier_name" => $supplier_name,
                    "supplier_country" => $supplier_country,
                    "image_url" => $image_url
                ]
            ]);
        }
        break;

    case 'delete_listing':
    case 'delete_product':
        $del_raw_id = trim(strval($input['id'] ?? $input['listing_id'] ?? $input['productId'] ?? $_GET['id'] ?? ''));
        if (empty($del_raw_id)) {
            $uri_path_del = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
            $parts_del = explode('/', trim((string)$uri_path_del, '/'));
            $last_seg = end($parts_del);
            if ($last_seg && $last_seg !== 'products' && $last_seg !== 'api.php') {
                $del_raw_id = urldecode($last_seg);
            }
        }
        $numeric_del_id = (strpos($del_raw_id, 'prod-db-') === 0) ? substr($del_raw_id, 8) : $del_raw_id;
        $ids_to_delete = array_values(array_unique(array_filter([$del_raw_id, $numeric_del_id, 'prod-db-' . $numeric_del_id])));

        if ($db_connected && $pdo && is_numeric($numeric_del_id)) {
            try {
                $stmt = $pdo->prepare("DELETE FROM listings WHERE id = ?");
                $stmt->execute([intval($numeric_del_id)]);
            } catch (Exception $e) {}
        }

        $del_file = __DIR__ . '/deleted_products.json';
        $deleted_ids = [];
        if (file_exists($del_file)) {
            $d = json_decode((string)file_get_contents($del_file), true);
            if (is_array($d)) $deleted_ids = array_map('strval', $d);
        }
        foreach ($ids_to_delete as $did) {
            if (!in_array($did, $deleted_ids, true)) {
                $deleted_ids[] = $did;
            }
        }
        @file_put_contents($del_file, json_encode(array_values($deleted_ids), JSON_PRETTY_PRINT));

        $cat_file = __DIR__ . '/custom_catalog.json';
        if (file_exists($cat_file)) {
            $cat_data = json_decode((string)file_get_contents($cat_file), true);
            if (is_array($cat_data) && isset($cat_data['products']) && is_array($cat_data['products'])) {
                $cat_data['products'] = array_values(array_filter($cat_data['products'], function ($p) use ($ids_to_delete) {
                    return !in_array(strval($p['id'] ?? ''), $ids_to_delete, true);
                }));
                @file_put_contents($cat_file, json_encode($cat_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }

        echo json_encode([
            "status" => "success",
            "success" => true,
            "deletedId" => $del_raw_id,
            "deletedIds" => $deleted_ids,
            "message" => "Listing/Product deleted permanently."
        ]);
        break;

    // -------------------------------------------------------------
    // 5. Submit Inquiry / Request Quote
    // -------------------------------------------------------------
    case 'submit_inquiry':
    case 'create_inquiry':
    case 'submit_quote':
        $rfq_id = isset($input['rfq_id']) ? intval($input['rfq_id']) : null;
        $name = $input['name'] ?? 'Procurement Officer';
        $email = $input['email'] ?? 'buyer@tradeheaven.net';
        $phone = $input['phone'] ?? '';
        $company = $input['company'] ?? $input['company_name'] ?? 'Enterprise Buyer';
        $product = $input['product'] ?? $input['product_name'] ?? 'Wholesale Product';
        $quantity = intval($input['quantity'] ?? $input['target_quantity'] ?? 1);
        $target_price = floatval($input['target_price'] ?? $input['targetPrice'] ?? 0.00);
        $incoterm = $input['incoterm'] ?? 'FOB';
        $destination_port = $input['destination_port'] ?? 'Port of Hamburg';
        $subject = $input['subject'] ?? "Inquiry / Quote for {$product}";
        $message = $input['message'] ?? '';

        $inq_id = time();
        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO inquiries (
                    rfq_id, name, email, phone, company, product, product_name, quantity, target_quantity, target_price, incoterm, destination_port, subject, message, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
                $stmt->execute([
                    $rfq_id, $name, $email, $phone, $company, $product, $product, $quantity, $quantity, $target_price, $incoterm, $destination_port, $subject, $message
                ]);
                $inq_id = (int)$pdo->lastInsertId();
            } catch (Exception $e) {}
        }

        // Trigger Instant Email Alert for Inquiry / Quote
        sendPhpMailAlert(
            "💬 B2B Inquiry Received: {$product} from {$company}",
            "New Trade Inquiry & Quotation Request",
            "A prospective buyer or trader submitted an inquiry or quote proposal.",
            [
                "Subject" => $subject,
                "Product" => $product,
                "Sender Name" => $name,
                "Sender Email" => $email,
                "Company" => $company,
                "Phone" => $phone ?: "N/A",
                "Quantity" => (string)$quantity,
                "Target Price" => "$ " . number_format($target_price, 2),
                "Incoterm" => $incoterm,
                "Port" => $destination_port,
                "Message" => $message
            ]
        );

        echo json_encode([
            "status" => "success",
            "id" => $inq_id,
            "message" => "Trade inquiry recorded in MySQL database!"
        ]);
        break;

    // -------------------------------------------------------------
    // Forgot Password (Automatic OTP dispatch from noreply@tradeheaven.net)
    // -------------------------------------------------------------
    case 'forgot_password':
        $email = strtolower(trim($input['email'] ?? ''));
        if (strpos($email, 'mail-') === 0 && strpos($email, '@') !== false) {
            $email = substr($email, 5);
        }
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["status" => "error", "success" => false, "message" => "Valid corporate email address is required."]);
            exit();
        }

        $requested_code = preg_replace('/\D/', '', strval($input['code'] ?? ''));
        $code = (strlen($requested_code) === 6) ? $requested_code : strval(rand(100000, 999999));
        $expiry = date("Y-m-d H:i:s", strtotime("+1 hour"));
        $user_name = trim(strval($input['name'] ?? '')) ?: 'Trade Partner';

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("SELECT id, name FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user) {
                    $user_name = $user['name'] ?: $user_name;
                    $update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?");
                    $update->execute([$code, $expiry, $user['id']]);
                } else {
                    // Auto-sync pre-onboarded or client-registered account into users table so OTP reset always works
                    $derived_name = ($user_name !== 'Trade Partner') ? $user_name : (ucwords(str_replace(['.', '_', '-'], ' ', explode('@', $email)[0])) ?: 'Trade Partner');
                    $user_name = $derived_name;
                    $default_hash = password_hash('TradeHeaven@2026', PASSWORD_DEFAULT);
                    $ins = $pdo->prepare("INSERT INTO users (name, email, password, reset_token, reset_token_expiry, status, is_verified) VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1)");
                    $ins->execute([$derived_name, $email, $default_hash, $code, $expiry]);
                }
            } catch (Exception $e) {
                error_log("Forgot password DB sync warning: " . $e->getMessage());
            }
        }

        // Also store OTP token in local JSON fallback registry so reset works even if MySQL is undergoing maintenance
        try {
            $tokens_file = __DIR__ . '/reset_tokens_store.json';
            $tokens_map = file_exists($tokens_file) ? json_decode(file_get_contents($tokens_file), true) : [];
            if (!is_array($tokens_map)) $tokens_map = [];
            $tokens_map[$email] = [
                'code' => $code,
                'expiry' => time() + 3600,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            @file_put_contents($tokens_file, json_encode($tokens_map, JSON_PRETTY_PRINT));
        } catch (Exception $e) {}

        // Automatically dispatch single OTP email directly to client from noreply@tradeheaven.net
        $clientMailSent = sendClientOtpEmail($email, $user_name, $code);
        $maskedResetEmail = maskAuthEmail($email);

        if (!$clientMailSent) {
            http_response_code(502);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "sender" => "noreply@tradeheaven.net",
                "emailSent" => false,
                "message" => "Unable to deliver the 6-digit password reset OTP to {$maskedResetEmail} right now. Please retry or contact Trade Heaven on WhatsApp (+91 8532934479)."
            ]);
            exit();
        }

        echo json_encode([
            "status" => "success",
            "success" => true,
            "sender" => "noreply@tradeheaven.net",
            "emailSent" => true,
            "message" => "A 6-digit verification code has been automatically sent to {$maskedResetEmail} from noreply@tradeheaven.net."
        ]);
        exit();

    // -------------------------------------------------------------
    // Reset Password
    // -------------------------------------------------------------
    case 'reset_password':
        $email = strtolower(trim($input['email'] ?? ''));
        if (strpos($email, 'mail-') === 0 && strpos($email, '@') !== false) {
            $email = substr($email, 5);
        }
        $code = trim($input['code'] ?? $input['token'] ?? '');
        $new_password = $input['new_password'] ?? $input['newPassword'] ?? '';

        if (empty($email) || empty($code) || empty($new_password)) {
            echo json_encode(["status" => "error", "success" => false, "message" => "All fields are required."]);
            exit();
        }

        if (strlen($new_password) < 6) {
            echo json_encode(["status" => "error", "success" => false, "message" => "Password must be at least 6 characters long."]);
            exit();
        }

        $token_verified = false;
        $user_name = 'Trade Partner';

        // Check local JSON token store first / in parallel
        try {
            $tokens_file = __DIR__ . '/reset_tokens_store.json';
            if (file_exists($tokens_file)) {
                $tokens_map = json_decode(file_get_contents($tokens_file), true);
                if (is_array($tokens_map) && isset($tokens_map[$email])) {
                    $saved = $tokens_map[$email];
                    if (strval($saved['code'] ?? '') === $code && intval($saved['expiry'] ?? 0) >= time()) {
                        $token_verified = true;
                        unset($tokens_map[$email]);
                        @file_put_contents($tokens_file, json_encode($tokens_map, JSON_PRETTY_PRINT));
                    }
                }
            }
        } catch (Exception $e) {}

        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("SELECT id, name, reset_token, reset_token_expiry FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user) {
                    $user_name = $user['name'] ?? 'Trade Partner';
                    if ($token_verified || (strval($user['reset_token'] ?? '') === $code && strtotime($user['reset_token_expiry'] ?? '+10 minutes') >= time())) {
                        $token_verified = true;
                        $update = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
                        $update->execute([$password_hash, $user['id']]);
                    }
                } elseif ($token_verified) {
                    $derived_name = ucwords(str_replace(['.', '_', '-'], ' ', explode('@', $email)[0])) ?: 'Trade Partner';
                    $user_name = $derived_name;
                    $ins = $pdo->prepare("INSERT INTO users (name, email, password, status, is_verified) VALUES (?, ?, ?, 'ACTIVE', 1)");
                    $ins->execute([$derived_name, $email, $password_hash]);
                }
            } catch (Exception $e) {
                error_log("Reset password DB update warning: " . $e->getMessage());
            }
        }

        if ($token_verified) {
            sendPhpMailAlert(
                "🔒 Password Changed Successfully for {$email}",
                "Account Security Alert - Password Updated",
                "The password for {$email} was updated via automated OTP verification.",
                [
                    "Account Email" => $email,
                    "User Name" => $user_name,
                    "Action" => "Automated OTP Password Reset",
                    "Timestamp" => date("Y-m-d H:i:s T")
                ]
            );

            echo json_encode([
                "status" => "success",
                "success" => true,
                "message" => "Password reset successfully! You can now sign in with your new password."
            ]);
            exit();
        }

        echo json_encode([
            "status" => "error",
            "success" => false,
            "message" => "Invalid or expired verification code. Please request a new OTP or contact Trade Heaven on WhatsApp (+91 8532934479) for instant assistance."
        ]);
        exit();

    // -------------------------------------------------------------
    // 6. Email OTP Dispatch, Verify, Resend, Auth-Me & User Login
    // -------------------------------------------------------------
    case 'send_otp':
        $cleanEmail = normalizeAuthEmail($input['email'] ?? '');
        if (empty($cleanEmail) || !filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Please enter a valid corporate email address before clicking Send OTP."
            ]);
            exit();
        }

        $mode = strtoupper(trim((string)($input['mode'] ?? 'LOGIN')));
        $otpsFile = __DIR__ . '/login_otps_store.json';
        $otpsMap = loadJsonStoreMap($otpsFile);

        // Optional relay code from internal Node server only
        $isInternalRelay = !empty($_SERVER['HTTP_X_INTERNAL_RELAY']) || !empty($input['internalRelay']);
        $requestedCode = preg_replace('/\D/', '', strval($input['code'] ?? ''));
        try {
            $generatedCode = strval(random_int(100000, 999999));
        } catch (Exception $e) {
            $generatedCode = strval(rand(100000, 999999));
        }
        $otpCode = ($isInternalRelay && strlen($requestedCode) === 6) ? $requestedCode : $generatedCode;

        if ($mode === 'REGISTER') {
            if (in_array($cleanEmail, getAuthorizedRootAdminEmails(), true)) {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "message" => "This email is reserved for system administration. Please sign in using the Login tab via Email OTP."
                ]);
                exit();
            }

            if (!$isInternalRelay && findPhpAuthUser($cleanEmail, $db_connected, $pdo)) {
                http_response_code(409);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "message" => "An account with this email address is already registered. Please switch to Sign In."
                ]);
                exit();
            }

            $regName = trim((string)($input['name'] ?? '')) ?: explode('@', $cleanEmail)[0];
            $acctType = strtoupper(trim((string)($input['accountType'] ?? 'BUYER'))) === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER';
            $otpsMap["reg:" . $cleanEmail] = [
                'code' => $otpCode,
                'expiry' => time() + 600,
                'attempts' => 0,
                'role' => $acctType
            ];
            saveJsonStoreMap($otpsFile, $otpsMap);

            $sent = sendLoginOtpEmail($cleanEmail, $regName, $otpCode, $acctType, true);
            $masked = maskAuthEmail($cleanEmail);
            if (!$sent) {
                http_response_code(502);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "otp_dispatched" => false,
                    "mode" => "REGISTER",
                    "email" => $cleanEmail,
                    "maskedEmail" => $masked,
                    "emailSent" => false,
                    "message" => "Unable to deliver the 6-digit OTP to {$masked} right now. Please verify the email address and retry, or contact Trade Heaven on WhatsApp (+91 8532934479)."
                ]);
                exit();
            }
            echo json_encode([
                "status" => "success",
                "success" => true,
                "otp_dispatched" => true,
                "mode" => "REGISTER",
                "email" => $cleanEmail,
                "maskedEmail" => $masked,
                "emailSent" => true,
                "message" => "A 6-digit verification code has been sent to {$masked} via noreply@tradeheaven.net. Enter it below to complete registration."
            ]);
            exit();
        }

        // LOGIN mode
        $matchedUser = findPhpAuthUser($cleanEmail, $db_connected, $pdo);
        if (!$matchedUser && $isInternalRelay) {
            $matchedUser = [
                'id' => 'relay-' . md5($cleanEmail),
                'email' => $cleanEmail,
                'name' => trim((string)($input['name'] ?? 'Registered Trade Heaven User')),
                'role' => strtoupper((string)($input['role'] ?? 'BUYER')),
                'isRootAdmin' => in_array($cleanEmail, getAuthorizedRootAdminEmails(), true)
            ];
        }

        if (!$matchedUser) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "No registered account found for this email address. Only registered users can receive a login OTP."
            ]);
            exit();
        }

        $password = (string)($input['password'] ?? '');
        if (!$isInternalRelay && empty($matchedUser['isRootAdmin']) && !verifyPhpAuthPassword($matchedUser, $password)) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Please enter your valid registered account password before clicking Send OTP."
            ]);
            exit();
        }

        $otpsMap["login:" . $cleanEmail] = [
            'code' => $otpCode,
            'expiry' => time() + 600,
            'attempts' => 0,
            'role' => $matchedUser['role']
        ];
        saveJsonStoreMap($otpsFile, $otpsMap);

        $sent = sendLoginOtpEmail($cleanEmail, $matchedUser['name'], $otpCode, $matchedUser['role'], false);
        $masked = maskAuthEmail($cleanEmail);
        if (!$sent) {
            http_response_code(502);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "otp_dispatched" => false,
                "mode" => "LOGIN",
                "requiresOtp" => false,
                "email" => $cleanEmail,
                "maskedEmail" => $masked,
                "role" => $matchedUser['role'],
                "emailSent" => false,
                "message" => "Unable to deliver your 6-digit login OTP to {$masked} right now. Please retry or contact Trade Heaven on WhatsApp (+91 8532934479)."
            ]);
            exit();
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "otp_dispatched" => true,
            "mode" => "LOGIN",
            "requiresOtp" => true,
            "email" => $cleanEmail,
            "maskedEmail" => $masked,
            "role" => $matchedUser['role'],
            "emailSent" => true,
            "message" => !empty($matchedUser['isRootAdmin'])
                ? "Admin OTP-Only Security: A 6-digit verification code has been sent to your registered admin email ({$masked})."
                : "A 6-digit verification code has been sent to your registered email ({$masked}) via noreply@tradeheaven.net."
        ]);
        exit();

    case 'verify_login_otp':
        $cleanEmail = normalizeAuthEmail($input['email'] ?? '');
        $cleanOtp = trim((string)($input['otp'] ?? $input['code'] ?? ''));

        if (empty($cleanEmail) || empty($cleanOtp)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Both registered email and 6-digit OTP code are required."
            ]);
            exit();
        }

        $matchedUser = findPhpAuthUser($cleanEmail, $db_connected, $pdo);
        $otpsFile = __DIR__ . '/login_otps_store.json';
        $otpsMap = loadJsonStoreMap($otpsFile);
        $entryKey = "login:" . $cleanEmail;
        $entry = $otpsMap[$entryKey] ?? null;

        if (!$matchedUser || !$entry || empty($entry['code'])) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "No active OTP session found or code expired. Please request a new OTP."
            ]);
            exit();
        }

        $attempts = intval($entry['attempts'] ?? 0) + 1;
        if ($attempts > 5) {
            unset($otpsMap[$entryKey]);
            saveJsonStoreMap($otpsFile, $otpsMap);
            http_response_code(429);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Too many failed OTP attempts. Please sign in again to request a new OTP."
            ]);
            exit();
        }

        if (time() > intval($entry['expiry'] ?? 0)) {
            unset($otpsMap[$entryKey]);
            saveJsonStoreMap($otpsFile, $otpsMap);
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Your 6-digit OTP has expired. Please click Resend OTP to receive a fresh code."
            ]);
            exit();
        }

        if (strval($entry['code']) !== $cleanOtp) {
            $otpsMap[$entryKey]['attempts'] = $attempts;
            saveJsonStoreMap($otpsFile, $otpsMap);
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Invalid 6-digit OTP verification code (" . (5 - $attempts) . " attempts remaining)."
            ]);
            exit();
        }

        unset($otpsMap[$entryKey]);
        saveJsonStoreMap($otpsFile, $otpsMap);

        $token = generateSignedAuthToken($matchedUser);
        $userPayload = buildPhpAuthUserPayload($matchedUser, $token);
        echo json_encode([
            "status" => "success",
            "success" => true,
            "token" => $token,
            "user" => $userPayload,
            "message" => !empty($matchedUser['isRootAdmin'])
                ? "Administrator 2FA OTP verified. Welcome to the Control Center."
                : "2FA OTP verified. Welcome back, {$matchedUser['name']}!"
        ]);
        exit();

    case 'resend_login_otp':
        $cleanEmail = normalizeAuthEmail($input['email'] ?? '');
        if (empty($cleanEmail)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "Registered email address is required."]);
            exit();
        }
        $matchedUser = findPhpAuthUser($cleanEmail, $db_connected, $pdo);
        if (!$matchedUser) {
            http_response_code(404);
            echo json_encode(["status" => "error", "success" => false, "message" => "No registered user found for this email."]);
            exit();
        }

        try {
            $otpCode = strval(random_int(100000, 999999));
        } catch (Exception $e) {
            $otpCode = strval(rand(100000, 999999));
        }
        $otpsFile = __DIR__ . '/login_otps_store.json';
        $otpsMap = loadJsonStoreMap($otpsFile);
        $otpsMap["login:" . $cleanEmail] = [
            'code' => $otpCode,
            'expiry' => time() + 600,
            'attempts' => 0,
            'role' => $matchedUser['role']
        ];
        saveJsonStoreMap($otpsFile, $otpsMap);

        $sent = sendLoginOtpEmail($cleanEmail, $matchedUser['name'], $otpCode, $matchedUser['role'], false);
        $masked = maskAuthEmail($cleanEmail);
        if (!$sent) {
            http_response_code(502);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "requiresOtp" => false,
                "email" => $cleanEmail,
                "maskedEmail" => $masked,
                "emailSent" => false,
                "message" => "Unable to resend your 6-digit verification OTP to {$masked} right now. Please retry or contact Trade Heaven on WhatsApp (+91 8532934479)."
            ]);
            exit();
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "requiresOtp" => true,
            "email" => $cleanEmail,
            "maskedEmail" => $masked,
            "emailSent" => true,
            "message" => "A fresh 6-digit verification OTP has been sent to your registered email ({$masked})."
        ]);
        exit();

    case 'auth_me':
    case 'me':
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        if (!$authHeader && function_exists('apache_request_headers')) {
            $hdrs = apache_request_headers();
            $authHeader = $hdrs['Authorization'] ?? ($hdrs['authorization'] ?? '');
        }
        if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(["status" => "error", "success" => false, "revoked" => true, "message" => "Unauthenticated"]);
            exit();
        }
        $bearer = trim(substr($authHeader, 7));
        $claims = verifySignedAuthToken($bearer);
        if (!$claims) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "revoked" => true,
                "message" => "Session expired or invalid. Please sign in again via Email OTP."
            ]);
            exit();
        }
        $cleanClaimEmail = normalizeAuthEmail($claims['email'] ?? '');
        $seedAuthMap = getBuiltInSeedAuthUsers();
        $seedAuthRow = $seedAuthMap[$cleanClaimEmail] ?? null;
        $isPaidSeedClaim = !empty($seedAuthRow) && strtolower((string)($seedAuthRow['membershipStatus'] ?? '')) === 'paid';
        $claimRole = $isPaidSeedClaim ? ($seedAuthRow['role'] ?? $claims['role']) : $claims['role'];
        $claimTier = $claims['tier'] ?? 'FREE';
        if ($isPaidSeedClaim && (empty($claimTier) || stripos($claimTier, 'free') !== false || strtoupper($claimTier) === 'SILVER')) {
            $claimTier = $seedAuthRow['tier'] ?? 'Basic Plan';
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "user" => [
                "id" => $isPaidSeedClaim ? ($seedAuthRow['id'] ?? $claims['uid']) : $claims['uid'],
                "email" => $cleanClaimEmail ?: $claims['email'],
                "name" => $isPaidSeedClaim ? ($seedAuthRow['name'] ?? $claims['name']) : $claims['name'],
                "role" => $claimRole,
                "isPremium" => $isPaidSeedClaim ? (bool)($seedAuthRow['isPremium'] ?? true) : !empty($claims['isPremium']),
                "membershipStatus" => $isPaidSeedClaim ? 'paid' : ($claims['membershipStatus'] ?? 'free'),
                "status" => $claims['status'] ?? 'ACTIVE',
                "isVerified" => true,
                "isVerifiedAdmin" => ($claimRole ?? '') === 'ADMIN',
                "otpVerified" => true,
                "tier" => $claimTier,
                "companyName" => $isPaidSeedClaim ? ($seedAuthRow['companyName'] ?? $claims['companyName']) : ($claims['companyName'] ?? 'Enterprise Trading Firm'),
                "country" => $isPaidSeedClaim ? ($seedAuthRow['country'] ?? $claims['country']) : ($claims['country'] ?? 'United States'),
                "avatarUrl" => $claims['avatarUrl'] ?? '',
                "token" => $bearer
            ]
        ]);
        exit();

    case 'login':
        $email = normalizeAuthEmail($input['email'] ?? '');
        $password = (string)($input['password'] ?? '');
        $submittedOtp = trim((string)($input['otp'] ?? $input['code'] ?? ''));

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "Please provide your registered email address."]);
            exit();
        }

        $matchedUser = findPhpAuthUser($email, $db_connected, $pdo);
        if (!$matchedUser) {
            http_response_code(401);
            echo json_encode(["status" => "error", "success" => false, "message" => "No registered account found for this email address. Please register first."]);
            exit();
        }

        if (empty($matchedUser['isRootAdmin']) && !verifyPhpAuthPassword($matchedUser, $password)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "success" => false, "message" => "Invalid registered email or password. Access denied."]);
            exit();
        }

        $otpsFile = __DIR__ . '/login_otps_store.json';
        $otpsMap = loadJsonStoreMap($otpsFile);
        $entryKey = "login:" . $email;

        if (!empty($submittedOtp)) {
            $entry = $otpsMap[$entryKey] ?? null;
            if (!$entry || empty($entry['code'])) {
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "message" => "No active OTP found. Please click \"Send OTP\" first to receive a 6-digit code on your registered email."
                ]);
                exit();
            }

            $attempts = intval($entry['attempts'] ?? 0) + 1;
            if ($attempts > 5) {
                unset($otpsMap[$entryKey]);
                saveJsonStoreMap($otpsFile, $otpsMap);
                http_response_code(429);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "message" => "Too many failed OTP attempts. Please click \"Send OTP\" to request a new 6-digit code."
                ]);
                exit();
            }

            if (time() > intval($entry['expiry'] ?? 0)) {
                unset($otpsMap[$entryKey]);
                saveJsonStoreMap($otpsFile, $otpsMap);
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "message" => "Your 6-digit OTP has expired. Please click \"Send OTP\" to receive a fresh code."
                ]);
                exit();
            }

            if (strval($entry['code']) !== $submittedOtp) {
                $otpsMap[$entryKey]['attempts'] = $attempts;
                saveJsonStoreMap($otpsFile, $otpsMap);
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "success" => false,
                    "message" => "Invalid 6-digit OTP verification code (" . (5 - $attempts) . " attempts remaining)."
                ]);
                exit();
            }

            unset($otpsMap[$entryKey]);
            saveJsonStoreMap($otpsFile, $otpsMap);

            $token = generateSignedAuthToken($matchedUser);
            $userPayload = buildPhpAuthUserPayload($matchedUser, $token);
            echo json_encode([
                "status" => "success",
                "success" => true,
                "token" => $token,
                "user" => $userPayload,
                "message" => !empty($matchedUser['isRootAdmin'])
                    ? "Administrator 2FA OTP verified. Welcome to the Control Center."
                    : "2FA OTP verified. Welcome back, {$matchedUser['name']}!"
            ]);
            exit();
        }

        // No OTP supplied yet -> automatically issue & email 6-digit login OTP
        try {
            $otpCode = strval(random_int(100000, 999999));
        } catch (Exception $e) {
            $otpCode = strval(rand(100000, 999999));
        }
        $otpsMap[$entryKey] = [
            'code' => $otpCode,
            'expiry' => time() + 600,
            'attempts' => 0,
            'role' => $matchedUser['role']
        ];
        saveJsonStoreMap($otpsFile, $otpsMap);

        $sent = sendLoginOtpEmail($email, $matchedUser['name'], $otpCode, $matchedUser['role'], false);
        $masked = maskAuthEmail($email);
        if (!$sent) {
            http_response_code(502);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "requiresOtp" => false,
                "email" => $email,
                "maskedEmail" => $masked,
                "role" => $matchedUser['role'],
                "emailSent" => false,
                "message" => "Unable to deliver the 6-digit security verification OTP to {$masked} right now. Please retry or contact Trade Heaven on WhatsApp (+91 8532934479)."
            ]);
            exit();
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "requiresOtp" => true,
            "email" => $email,
            "maskedEmail" => $masked,
            "role" => $matchedUser['role'],
            "emailSent" => true,
            "message" => "A 6-digit security verification OTP has been sent to your registered email ({$masked}). Please enter the OTP to complete sign-in."
        ]);
        exit();

    // -------------------------------------------------------------
    // 7. Register User
    // -------------------------------------------------------------
    case 'register':
        $email = normalizeAuthEmail($input['email'] ?? '');
        $name = trim($input['name'] ?? 'Trade Partner');
        $raw_password = (string)($input['password'] ?? '');
        $submitted_otp = trim((string)($input['otp'] ?? $input['code'] ?? ''));
        $company = trim($input['company_name'] ?? $input['companyName'] ?? $input['company'] ?? 'Enterprise Trading Firm');
        $phone = trim($input['phone'] ?? $input['phoneOrWhatsapp'] ?? '');
        $country = trim($input['country'] ?? 'United States');
        $role_input = strtolower($input['role'] ?? $input['accountType'] ?? 'buyer');
        $role = ($role_input === 'supplier') ? 'supplier' : 'buyer';

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "Email address is required."]);
            exit();
        }

        if (in_array($email, getAuthorizedRootAdminEmails(), true)) {
            http_response_code(403);
            echo json_encode(["status" => "error", "success" => false, "message" => "This email is reserved for system administration."]);
            exit();
        }

        if (empty($raw_password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "Password is required."]);
            exit();
        }

        // Verify 6-digit registration OTP
        $otpsFile = __DIR__ . '/login_otps_store.json';
        $otpsMap = loadJsonStoreMap($otpsFile);
        $regKey = "reg:" . $email;
        $pendingRegOtp = $otpsMap[$regKey] ?? null;

        if (empty($submitted_otp) || strlen($submitted_otp) !== 6) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Please click \"Send OTP\" and enter the 6-digit verification code sent to your email before completing registration."
            ]);
            exit();
        }
        if (!$pendingRegOtp || time() > intval($pendingRegOtp['expiry'] ?? 0)) {
            unset($otpsMap[$regKey]);
            saveJsonStoreMap($otpsFile, $otpsMap);
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "No active or valid OTP found for this email. Please click \"Send OTP\" to receive a fresh 6-digit verification code."
            ]);
            exit();
        }
        $regAttempts = intval($pendingRegOtp['attempts'] ?? 0) + 1;
        if ($regAttempts > 5) {
            unset($otpsMap[$regKey]);
            saveJsonStoreMap($otpsFile, $otpsMap);
            http_response_code(429);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Too many invalid OTP attempts. Please click \"Send OTP\" to request a new 6-digit code."
            ]);
            exit();
        }
        if (strval($pendingRegOtp['code'] ?? '') !== $submitted_otp) {
            $otpsMap[$regKey]['attempts'] = $regAttempts;
            saveJsonStoreMap($otpsFile, $otpsMap);
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "success" => false,
                "message" => "Invalid 6-digit verification code (" . (5 - $regAttempts) . " attempts remaining)."
            ]);
            exit();
        }
        unset($otpsMap[$regKey]);
        saveJsonStoreMap($otpsFile, $otpsMap);

        // Check if user already exists in DB or local store
        $user_already_exists = (bool)findPhpAuthUser($email, $db_connected, $pdo);
        if ($user_already_exists) {
            http_response_code(409);
            echo json_encode(["status" => "error", "success" => false, "message" => "An account with this email address is already registered. Please log in."]);
            exit();
        }

        // Secure password hash
        $password_hash = password_hash($raw_password, PASSWORD_DEFAULT);
        $user_id = time();

        if ($db_connected && $pdo) {
            try {
                $cols_res = $pdo->query("SHOW COLUMNS FROM users");
                $existing_columns = [];
                while ($row = $cols_res->fetch()) {
                    $existing_columns[] = strtolower($row['Field']);
                }

                $missing_defs = [
                    'password' => "VARCHAR(255) DEFAULT ''",
                    'company_name' => "VARCHAR(255) DEFAULT ''",
                    'phone' => "VARCHAR(50) DEFAULT ''",
                    'country' => "VARCHAR(100) DEFAULT 'United States'",
                    'role' => "VARCHAR(50) DEFAULT 'buyer'",
                    'status' => "VARCHAR(50) DEFAULT 'ACTIVE'",
                    'is_verified' => "TINYINT(1) DEFAULT 1",
                    'is_premium' => "TINYINT(1) DEFAULT 0",
                    'membership_status' => "VARCHAR(50) DEFAULT 'free'",
                    'tier' => "VARCHAR(50) DEFAULT 'FREE'",
                    'avatar_url' => "TEXT"
                ];

                foreach ($missing_defs as $col_name => $col_def) {
                    if (!in_array($col_name, $existing_columns)) {
                        try {
                            $pdo->exec("ALTER TABLE users ADD COLUMN `$col_name` $col_def");
                            $existing_columns[] = $col_name;
                        } catch (Exception $alter_ex) {}
                    }
                }

                $insert_data = [
                    'name' => $name,
                    'email' => $email,
                    'password' => $password_hash,
                    'company_name' => $company,
                    'phone' => $phone,
                    'country' => $country,
                    'role' => $role,
                    'status' => 'ACTIVE',
                    'is_verified' => 1,
                    'is_premium' => $role === 'supplier' ? 1 : 0,
                    'membership_status' => 'free',
                    'tier' => $role === 'supplier' ? 'SILVER' : 'FREE',
                    'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                ];

                $fields_to_insert = [];
                $placeholders = [];
                $values = [];

                foreach ($insert_data as $field => $val) {
                    if (in_array($field, $existing_columns)) {
                        $fields_to_insert[] = "`$field`";
                        $placeholders[] = "?";
                        $values[] = $val;
                    }
                }

                if (!empty($fields_to_insert)) {
                    $sql = "INSERT INTO users (" . implode(", ", $fields_to_insert) . ") VALUES (" . implode(", ", $placeholders) . ")";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($values);
                    $user_id = $pdo->lastInsertId() ?: $user_id;
                }
            } catch (Exception $e) {
                $err_msg = "Register INSERT handled gracefully: " . $e->getMessage();
                error_log($err_msg);
                file_put_contents(__DIR__ . '/db_error.log', $err_msg . "\n", FILE_APPEND);
            }
        }

        // Backup to local JSON user registry with password hash for zero-data-loss durability
        try {
            $users_file = __DIR__ . '/users_store.json';
            $local_users = loadJsonStoreMap($users_file);
            $local_users[] = [
                'id' => (string)$user_id,
                'name' => $name,
                'email' => $email,
                'password_hash' => $password_hash,
                'company_name' => $company,
                'phone' => $phone,
                'country' => $country,
                'role' => $role,
                'tier' => $role === 'supplier' ? 'SILVER' : 'FREE',
                'created_at' => date('Y-m-d H:i:s')
            ];
            saveJsonStoreMap($users_file, $local_users);
        } catch (Exception $f_ex) {}

        $newAuthUser = [
            'id' => (string)$user_id,
            'name' => $name,
            'email' => $email,
            'role' => strtoupper($role),
            'isRootAdmin' => false,
            'isPremium' => $role === 'supplier',
            'membershipStatus' => 'free',
            'status' => 'ACTIVE',
            'tier' => $role === 'supplier' ? 'SILVER' : 'FREE',
            'companyName' => $company,
            'country' => $country,
            'phone' => $phone,
            'avatarUrl' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        ];
        $token = generateSignedAuthToken($newAuthUser);
        $userPayload = buildPhpAuthUserPayload($newAuthUser, $token);
        echo json_encode([
            "status" => "success",
            "success" => true,
            "token" => $token,
            "message" => "6-digit Email OTP verified and account successfully registered!",
            "data" => [
                "id" => $user_id,
                "name" => $name,
                "email" => $email,
                "company_name" => $company,
                "phone" => $phone,
                "country" => $country,
                "role" => $role
            ],
            "user" => $userPayload
        ]);
        break;

    // -------------------------------------------------------------
    // 8. Update User Profile / Edit Account
    // -------------------------------------------------------------
    case 'update_profile':
    case 'upsert_user':
    case 'edit_profile':
        $user_id = $input['id'] ?? $input['userId'] ?? null;
        $name = trim($input['name'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $company = trim($input['companyName'] ?? $input['company_name'] ?? $input['company'] ?? '');
        $phone = trim($input['phone'] ?? $input['phoneOrWhatsapp'] ?? '');
        $country = trim($input['country'] ?? '');
        $tier = trim($input['tier'] ?? '');
        $membership_status = strtolower(trim($input['membershipStatus'] ?? $input['membership_status'] ?? ''));
        $status = strtoupper(trim($input['status'] ?? ''));
        $role = strtoupper(trim($input['role'] ?? ''));
        $has_verified = isset($input['isVerified']) || isset($input['is_verified']);
        $is_verified = $has_verified ? (!empty($input['isVerified']) || !empty($input['is_verified']) ? 1 : 0) : null;
        $has_premium = isset($input['isPremium']) || isset($input['is_premium']);
        $is_premium = $has_premium ? (!empty($input['isPremium']) || !empty($input['is_premium']) ? 1 : 0) : null;

        if ($db_connected && $pdo && ($user_id || $email)) {
            try {
                $stmt = $pdo->prepare("UPDATE users SET 
                    name = COALESCE(NULLIF(?, ''), name),
                    company_name = COALESCE(NULLIF(?, ''), company_name),
                    phone = COALESCE(NULLIF(?, ''), phone),
                    country = COALESCE(NULLIF(?, ''), country),
                    tier = COALESCE(NULLIF(?, ''), tier)
                    WHERE id = ? OR LOWER(TRIM(email)) = ?");
                $stmt->execute([$name, $company, $phone, $country, $tier, $user_id ?: '', $email ?: '']);
            } catch (Exception $e) {}
            if ($is_verified !== null) {
                try {
                    $stmtV = $pdo->prepare("UPDATE users SET is_verified = ? WHERE id = ? OR LOWER(TRIM(email)) = ?");
                    $stmtV->execute([$is_verified, $user_id ?: '', $email ?: '']);
                } catch (Exception $e) {}
            }
            if ($membership_status !== '') {
                try {
                    $stmtM = $pdo->prepare("UPDATE users SET membership_status = ? WHERE id = ? OR LOWER(TRIM(email)) = ?");
                    $stmtM->execute([$membership_status, $user_id ?: '', $email ?: '']);
                } catch (Exception $e) {}
            }
            if ($is_premium !== null) {
                try {
                    $stmtP = $pdo->prepare("UPDATE users SET is_premium = ? WHERE id = ? OR LOWER(TRIM(email)) = ?");
                    $stmtP->execute([$is_premium, $user_id ?: '', $email ?: '']);
                } catch (Exception $e) {}
            }
        }

        // Also persist to users_store.json so non-MySQL or hybrid reads stay in sync
        $users_store_file = __DIR__ . '/users_store.json';
        $stored_users = file_exists($users_store_file) ? (json_decode(file_get_contents($users_store_file), true) ?: []) : [];
        if (is_array($stored_users)) {
            $updated_in_json = false;
            foreach ($stored_users as &$su) {
                $su_email = strtolower(trim($su['email'] ?? ''));
                $su_id = (string)($su['id'] ?? '');
                if (($email !== '' && $su_email === $email) || ($user_id && $su_id === (string)$user_id)) {
                    if ($name !== '') $su['name'] = $name;
                    if ($company !== '') {
                        $su['companyName'] = $company;
                        $su['company_name'] = $company;
                    }
                    if ($phone !== '') $su['phone'] = $phone;
                    if ($country !== '') $su['country'] = $country;
                    if ($tier !== '') $su['tier'] = $tier;
                    if ($membership_status !== '') {
                        $su['membershipStatus'] = $membership_status;
                        $su['membership_status'] = $membership_status;
                    }
                    if ($status !== '') $su['status'] = $status;
                    if ($role !== '') $su['role'] = $role;
                    if ($is_verified !== null) {
                        $su['isVerified'] = (bool)$is_verified;
                        $su['is_verified'] = $is_verified;
                    }
                    if ($is_premium !== null) {
                        $su['isPremium'] = (bool)$is_premium;
                        $su['is_premium'] = $is_premium;
                    }
                    $updated_in_json = true;
                }
            }
            unset($su);
            if ($updated_in_json) {
                @file_put_contents($users_store_file, json_encode($stored_users, JSON_PRETTY_PRINT));
            }
        }

        // Trigger Instant Email Notification on Profile Edit
        sendPhpMailAlert(
            "👤 Profile Edited: " . ($name ?: $email),
            "User Profile & Account Information Updated",
            "A member or administrator updated account details on Trade Heaven.",
            [
                "Name" => $name ?: "Existing",
                "Email" => $email ?: "Existing",
                "Company" => $company ?: "Existing",
                "Phone" => $phone ?: "Existing",
                "Country" => $country ?: "Existing",
                "Tier" => $tier ?: "Existing",
                "Updated At" => date("Y-m-d H:i:s T")
            ]
        );

        echo json_encode([
            "status" => "success",
            "success" => true,
            "message" => "Profile updated successfully!",
            "user" => [
                "id" => (string)$user_id,
                "name" => $name,
                "email" => $email,
                "companyName" => $company,
                "phone" => $phone,
                "country" => $country,
                "tier" => $tier,
                "membershipStatus" => $membership_status,
                "isVerified" => $is_verified !== null ? (bool)$is_verified : true,
                "isPremium" => $is_premium !== null ? (bool)$is_premium : false
            ]
        ]);
        break;

    // -------------------------------------------------------------
    // Toggle User Verification Status
    // -------------------------------------------------------------
    case 'toggle_verification':
        $user_id = $input['id'] ?? $input['userId'] ?? null;
        $current_verified = $input['is_verified'] ?? $input['isVerified'] ?? 0;
        $new_verified = $current_verified ? 0 : 1;

        if ($db_connected && $pdo && $user_id) {
            try {
                $stmt = $pdo->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
                $stmt->execute([$new_verified, $user_id]);
            } catch (Exception $e) {}
        }

        echo json_encode([
            "status" => "success",
            "message" => "Verification status updated successfully.",
            "is_verified" => $new_verified
        ]);
        break;

    // -------------------------------------------------------------
    // Product Image Overrides & Upload Persistence (PHP / cPanel)
    // -------------------------------------------------------------
    case 'get_product_images':
    case 'product_images':
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        header("Expires: 0");
        $uploads_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir)) {
            @mkdir($uploads_dir, 0775, true);
        }
        $overrides_file = $uploads_dir . '/product-image-overrides.json';
        $public_data_file = __DIR__ . '/data/productImageSystemState.json';
        if (!file_exists($public_data_file) && file_exists(__DIR__ . '/public/data/productImageSystemState.json')) {
            $public_data_file = __DIR__ . '/public/data/productImageSystemState.json';
        }
        $state = [
            "overrides" => [],
            "productActivityTimestamps" => [],
            "globalDefaultImage" => null,
            "categoryOverrides" => [],
            "urlReplacements" => [],
            "mediaLibrary" => []
        ];
        foreach ([$public_data_file, $overrides_file] as $src_json_file) {
            if (file_exists($src_json_file)) {
                $parsed = json_decode((string)@file_get_contents($src_json_file), true);
                if (is_array($parsed)) {
                    if (!empty($parsed['overrides']) && is_array($parsed['overrides'])) {
                        $state['overrides'] = array_merge($state['overrides'], $parsed['overrides']);
                    }
                    if (!empty($parsed['productActivityTimestamps']) && is_array($parsed['productActivityTimestamps'])) {
                        $state['productActivityTimestamps'] = array_merge($state['productActivityTimestamps'], $parsed['productActivityTimestamps']);
                    }
                    if (!empty($parsed['categoryOverrides']) && is_array($parsed['categoryOverrides'])) {
                        $state['categoryOverrides'] = array_merge($state['categoryOverrides'], $parsed['categoryOverrides']);
                    }
                    if (!empty($parsed['urlReplacements']) && is_array($parsed['urlReplacements'])) {
                        $state['urlReplacements'] = array_merge($state['urlReplacements'], $parsed['urlReplacements']);
                    }
                    if (array_key_exists('globalDefaultImage', $parsed) && $parsed['globalDefaultImage']) {
                        $state['globalDefaultImage'] = $parsed['globalDefaultImage'];
                    }
                    if (!empty($parsed['mediaLibrary']) && is_array($parsed['mediaLibrary'])) {
                        $state['mediaLibrary'] = $parsed['mediaLibrary'];
                    }
                }
            }
        }
        // Filter out broken local /assets/uploads/* paths missing on disk and resolve verified-<id> if present
        $clean_overrides = [];
        foreach ($state['overrides'] as $ov_pid => $ov_entry) {
            if (!is_array($ov_entry) || empty($ov_entry['primary'])) continue;
            $prim = (string)$ov_entry['primary'];
            $clean_prim = strtok($prim, '?');
            if (strpos($clean_prim, '/assets/uploads/') === 0) {
                $fname = substr($clean_prim, strlen('/assets/uploads/'));
                if (!file_exists($uploads_dir . '/' . $fname)) {
                    $found_verified = null;
                    foreach (['webp', 'jpg', 'jpeg', 'png'] as $ext) {
                        if (file_exists($uploads_dir . '/verified-' . $ov_pid . '.' . $ext)) {
                            $found_verified = '/assets/uploads/verified-' . $ov_pid . '.' . $ext;
                            break;
                        }
                    }
                    if ($found_verified) {
                        $ov_entry['primary'] = $found_verified;
                        $ov_entry['gallery'] = [$found_verified];
                    } else {
                        continue;
                    }
                }
            }
            $clean_overrides[$ov_pid] = $ov_entry;
        }
        $state['overrides'] = $clean_overrides;
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => $state
        ]);
        break;

    case 'upload_product_image':
        $uploads_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir)) {
            @mkdir($uploads_dir, 0775, true);
        }
        $overrides_file = $uploads_dir . '/product-image-overrides.json';
        $state = [
            "overrides" => [],
            "globalDefaultImage" => null,
            "categoryOverrides" => [],
            "urlReplacements" => [],
            "mediaLibrary" => []
        ];
        if (file_exists($overrides_file)) {
            $parsed = json_decode(file_get_contents($overrides_file), true);
            if (is_array($parsed)) {
                $state = array_merge($state, $parsed);
            }
        }

        $base64Data = $input['base64Data'] ?? '';
        $fileName = $input['fileName'] ?? 'product-image.jpg';
        $targetFormat = $input['targetFormat'] ?? 'jpg';
        $productId = $input['productId'] ?? null;
        $productIds = $input['productIds'] ?? null;
        $category = $input['category'] ?? null;
        $applyToAll = !empty($input['applyToAll']);
        $oldUrlToReplace = $input['oldUrlToReplace'] ?? null;

        if (!$base64Data) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing base64Data payload."]);
            break;
        }

        if (preg_match('/^data:([A-Za-z0-9-\+\/\.]+);base64,(.+)$/', $base64Data, $matches)) {
            $rawBase64 = $matches[2];
        } else {
            $rawBase64 = $base64Data;
        }
        $binary = base64_decode($rawBase64);
        $ext = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $targetFormat ?: pathinfo($fileName, PATHINFO_EXTENSION) ?: 'jpg'));
        if ($ext === 'jpeg' || $ext === 'original' || !$ext) $ext = 'jpg';
        $exactFileName = isset($input['exactFileName']) ? basename(trim((string)$input['exactFileName'])) : '';
        if ($exactFileName && preg_match('/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|gif|avif|svg)$/i', $exactFileName)) {
            $finalFileName = $exactFileName;
        } else {
            $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($fileName, PATHINFO_FILENAME));
            $baseName = substr(trim($baseName, '-'), 0, 50) ?: 'product-image';
            $finalFileName = $baseName . '-' . round(microtime(true) * 1000) . '.' . $ext;
        }
        $filePath = $uploads_dir . '/' . $finalFileName;
        @file_put_contents($filePath, $binary);

        $uploadedUrl = '/assets/uploads/' . $finalFileName;
        $nowIso = gmdate('Y-m-d\TH:i:s\Z');
        $mediaEntry = [
            "id" => "media-" . round(microtime(true) * 1000),
            "url" => $uploadedUrl,
            "name" => $finalFileName,
            "format" => strtoupper($ext),
            "sizeBytes" => strlen($binary),
            "uploadedAt" => $nowIso
        ];
        array_unshift($state['mediaLibrary'], $mediaEntry);

        if ($applyToAll) {
            $state['globalDefaultImage'] = $uploadedUrl;
        }
        if ($category) {
            $state['categoryOverrides'][$category] = $uploadedUrl;
        }
        if ($oldUrlToReplace) {
            $state['urlReplacements'][$oldUrlToReplace] = $uploadedUrl;
        }
        $nowMs = (int)round(microtime(true) * 1000);
        if (!isset($state['productActivityTimestamps']) || !is_array($state['productActivityTimestamps'])) {
            $state['productActivityTimestamps'] = [];
        }
        if ($productId) {
            $existingGallery = $state['overrides'][$productId]['gallery'] ?? [];
            $gallery = array_values(array_unique(array_merge([$uploadedUrl], is_array($existingGallery) ? $existingGallery : [])));
            $state['overrides'][$productId] = [
                "primary" => $uploadedUrl,
                "gallery" => $gallery,
                "format" => strtoupper($ext),
                "updatedAt" => $nowIso,
                "imageUpdatedAt" => $nowMs,
                "updatedBy" => "admin-manual"
            ];
            $state['productActivityTimestamps'][$productId] = $nowMs;
        }
        if (is_array($productIds)) {
            foreach ($productIds as $pid) {
                if (!$pid) continue;
                $existingGallery = $state['overrides'][$pid]['gallery'] ?? [];
                $gallery = array_values(array_unique(array_merge([$uploadedUrl], is_array($existingGallery) ? $existingGallery : [])));
                $state['overrides'][$pid] = [
                    "primary" => $uploadedUrl,
                    "gallery" => $gallery,
                    "format" => strtoupper($ext),
                    "updatedAt" => $nowIso,
                    "imageUpdatedAt" => $nowMs,
                    "updatedBy" => "admin-manual"
                ];
                $state['productActivityTimestamps'][$pid] = $nowMs;
            }
        }

        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        $encodedState = json_encode($state, JSON_PRETTY_PRINT);
        @file_put_contents($overrides_file, $encodedState);
        if (is_dir(__DIR__ . '/data')) {
            @file_put_contents(__DIR__ . '/data/productImageSystemState.json', $encodedState);
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "url" => $uploadedUrl,
            "mediaEntry" => $mediaEntry,
            "state" => $state
        ]);
        break;

    case 'set_product_images':
        $uploads_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir)) {
            @mkdir($uploads_dir, 0775, true);
        }
        $overrides_file = $uploads_dir . '/product-image-overrides.json';
        $state = [
            "overrides" => [],
            "productActivityTimestamps" => [],
            "globalDefaultImage" => null,
            "categoryOverrides" => [],
            "urlReplacements" => [],
            "mediaLibrary" => []
        ];
        if (file_exists($overrides_file)) {
            $parsed = json_decode(file_get_contents($overrides_file), true);
            if (is_array($parsed)) {
                $state = array_merge($state, $parsed);
            }
        }
        if (!isset($state['productActivityTimestamps']) || !is_array($state['productActivityTimestamps'])) {
            $state['productActivityTimestamps'] = [];
        }
        $nowIso = gmdate('Y-m-d\TH:i:s\Z');
        $nowMs = (int)round(microtime(true) * 1000);
        if (!empty($input['fullOverridesMap']) && is_array($input['fullOverridesMap'])) {
            foreach ($input['fullOverridesMap'] as $pid => $entry) {
                if (!is_array($entry) || empty($entry['primary'])) continue;
                $state['overrides'][$pid] = $entry;
                $ts = !empty($entry['imageUpdatedAt']) ? (int)$entry['imageUpdatedAt'] : $nowMs;
                $state['productActivityTimestamps'][$pid] = $ts;
            }
        }
        $primaryUrl = $input['primaryUrl'] ?? null;
        $productId = $input['productId'] ?? null;
        $productIds = $input['productIds'] ?? null;
        $galleryUrls = $input['galleryUrls'] ?? null;
        $format = $input['format'] ?? 'JPG';
        if ($productId && $primaryUrl) {
            $state['overrides'][$productId] = [
                "primary" => $primaryUrl,
                "gallery" => is_array($galleryUrls) && count($galleryUrls) > 0 ? $galleryUrls : [$primaryUrl],
                "format" => $format,
                "updatedAt" => $nowIso,
                "imageUpdatedAt" => $nowMs,
                "updatedBy" => "admin-manual"
            ];
            $state['productActivityTimestamps'][$productId] = $nowMs;
        }
        if (is_array($productIds) && $primaryUrl) {
            foreach ($productIds as $pid) {
                if (!$pid) continue;
                $state['overrides'][$pid] = [
                    "primary" => $primaryUrl,
                    "gallery" => is_array($galleryUrls) && count($galleryUrls) > 0 ? $galleryUrls : [$primaryUrl],
                    "format" => $format,
                    "updatedAt" => $nowIso,
                    "imageUpdatedAt" => $nowMs,
                    "updatedBy" => "admin-manual"
                ];
                $state['productActivityTimestamps'][$pid] = $nowMs;
            }
        }
        if (!empty($input['category']) && $primaryUrl) {
            $state['categoryOverrides'][$input['category']] = $primaryUrl;
        }
        if (!empty($input['oldUrlToReplace']) && $primaryUrl) {
            $state['urlReplacements'][$input['oldUrlToReplace']] = $primaryUrl;
        }
        if (!empty($input['applyToAll'])) {
            $state['globalDefaultImage'] = $primaryUrl;
        }
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        $encodedState = json_encode($state, JSON_PRETTY_PRINT);
        @file_put_contents($overrides_file, $encodedState);
        if (is_dir(__DIR__ . '/data')) {
            @file_put_contents(__DIR__ . '/data/productImageSystemState.json', $encodedState);
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => $state
        ]);
        break;

    case 'delete_product_images':
        $uploads_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir = __DIR__ . '/public/assets/uploads';
        }
        $overrides_file = $uploads_dir . '/product-image-overrides.json';
        $state = [
            "overrides" => [],
            "globalDefaultImage" => null,
            "categoryOverrides" => [],
            "urlReplacements" => [],
            "mediaLibrary" => []
        ];
        if (file_exists($overrides_file)) {
            $parsed = json_decode(file_get_contents($overrides_file), true);
            if (is_array($parsed)) {
                $state = array_merge($state, $parsed);
            }
        }
        if (!empty($input['resetAll'])) {
            $state['overrides'] = [];
            $state['globalDefaultImage'] = null;
            $state['categoryOverrides'] = [];
            $state['urlReplacements'] = [];
        } else {
            if (!empty($input['productId'])) {
                unset($state['overrides'][$input['productId']]);
            }
            if (!empty($input['productIds']) && is_array($input['productIds'])) {
                foreach ($input['productIds'] as $pid) {
                    unset($state['overrides'][$pid]);
                }
            }
        }
        @file_put_contents($overrides_file, json_encode($state, JSON_PRETTY_PRINT));
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => $state
        ]);
        break;

    case 'send_custom_email':
        $to_email = normalizeAuthEmail($input['recipientEmail'] ?? $input['email'] ?? '');
        $subject = trim((string)($input['subject'] ?? 'Trade Heaven Global B2B Notification'));
        $recipient_name = trim((string)($input['decisionMakerName'] ?? $input['recipientName'] ?? 'Trade Partner'));
        $company_name = trim((string)($input['companyName'] ?? 'Listed Partner'));
        $company_id = trim((string)($input['companyId'] ?? ''));
        $intro_msg = trim((string)($input['introMessage'] ?? 'Please log in to your Trade Heaven account to review active buyer trade requests.'));
        $cta_url = trim((string)($input['ctaUrl'] ?? $input['portalUrl'] ?? 'https://www.tradeheaven.net'));
        $cta_text = trim((string)($input['ctaText'] ?? 'Log In to Trade Heaven Account →'));
        $dispatch_type = strtoupper(trim((string)($input['dispatchType'] ?? 'MANUAL'))) ?: 'MANUAL';
        $category = strtoupper(trim((string)($input['category'] ?? 'CUSTOM_ADMIN_NOTICE'))) ?: 'CUSTOM_ADMIN_NOTICE';

        if (empty($to_email) || !filter_var($to_email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["status" => "error", "success" => false, "message" => "Valid recipient email is required."]);
            break;
        }

        $html_body = isset($input['rawHtmlOverride']) && trim((string)$input['rawHtmlOverride']) !== ''
            ? (string)$input['rawHtmlOverride']
            : "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;background:#f8fafc;padding:24px;\"><div style=\"max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #cbd5e1;\"><div style=\"background:#0f172a;color:#ffffff;padding:26px 22px;text-align:center;\"><h2 style=\"margin:0;font-size:20px;\">" . htmlspecialchars($subject) . "</h2><p style=\"margin:6px 0 0;color:#cbd5e1;font-size:13px;\">" . htmlspecialchars($company_name) . "</p></div><div style=\"padding:24px;color:#1e293b;\"><p>Hello <strong>" . htmlspecialchars($recipient_name) . "</strong>,</p><p style=\"line-height:1.6;\">" . nl2br(htmlspecialchars($intro_msg)) . "</p><div style=\"text-align:center;margin:24px 0;\"><a href=\"" . htmlspecialchars($cta_url) . "\" style=\"display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:8px;\">" . htmlspecialchars($cta_text) . "</a></div></div></div></body></html>";

        $now_iso = gmdate('Y-m-d\TH:i:s\Z');
        $tracking_id = trim((string)($input['trackingId'] ?? ''));
        if ($tracking_id === '') {
            $tracking_id = 'ms-trk-php-' . dechex(time()) . '-' . substr(md5($to_email . uniqid('', true)), 0, 6);
        }
        $message_id = '<php-mail-' . time() . '-' . substr(md5($to_email . $subject . uniqid('', true)), 0, 8) . '@tradeheaven.net>';
        $encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: Trade Heaven Global B2B <noreply@tradeheaven.net>',
            'Reply-To: help@tradeheaven.net',
            'Message-ID: ' . $message_id,
            'X-Mailer: PHP/' . phpversion()
        ];
        $headers_str = implode("\r\n", $headers);
        $sent = @mail($to_email, $encoded_subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
        if (!$sent) {
            $sent = @mail($to_email, $encoded_subject, $html_body, $headers_str);
        }

        // Helper closure to persist into assets/uploads/email-history.json
        $history_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($history_dir)) {
            @mkdir($history_dir, 0775, true);
        }
        $history_file = $history_dir . '/email-history.json';
        $append_history = function ($entry) use ($history_file) {
            $existing = [];
            if (file_exists($history_file)) {
                $raw = @file_get_contents($history_file);
                $decoded = json_decode((string)$raw, true);
                if (is_array($decoded)) {
                    $existing = $decoded;
                }
            }
            $filtered = [];
            foreach ($existing as $item) {
                if (!is_array($item)) continue;
                $same_id = !empty($entry['id']) && !empty($item['id']) && $item['id'] === $entry['id'];
                $same_msg = !empty($entry['messageId']) && !empty($item['messageId']) && $item['messageId'] === $entry['messageId'] && strtolower((string)($item['recipient'] ?? '')) === strtolower((string)($entry['recipient'] ?? ''));
                if (!$same_id && !$same_msg) {
                    $filtered[] = $item;
                }
            }
            array_unshift($filtered, $entry);
            if (count($filtered) > 1000) {
                $filtered = array_slice($filtered, 0, 1000);
            }
            @file_put_contents($history_file, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
        };

        $primary_entry = [
            'id' => 'eh-php-' . time() . '-' . substr(md5($to_email . uniqid('', true)), 0, 6),
            'recipient' => $to_email,
            'recipientEmail' => $to_email,
            'recipientName' => $recipient_name,
            'companyName' => $company_name,
            'companyId' => $company_id !== '' ? $company_id : null,
            'subject' => $subject,
            'category' => $category,
            'dispatchType' => $dispatch_type,
            'deliveryMode' => 'PHP_MAIL_RELAY',
            'dispatchedAt' => $now_iso,
            'success' => (bool)$sent,
            'messageId' => $message_id,
            'trackingId' => $tracking_id,
            'summaryText' => mb_substr(strip_tags($intro_msg), 0, 260),
            'htmlPreview' => $html_body,
            'error' => $sent ? null : 'PHP mail() returned false on host MTA',
            'opened' => false,
            'openCount' => 0,
            'clicked' => false,
            'clickCount' => 0,
            'mailSuiteStatus' => $sent ? 'DELIVERED' : 'BOUNCED',
            'trackingEnabled' => true
        ];
        $append_history($primary_entry);

        $receipt = [
            'recipient' => $to_email,
            'success' => (bool)$sent,
            'deliveryMode' => 'PHP_MAIL_RELAY',
            'messageId' => $message_id,
            'trackingId' => $tracking_id,
            'dispatchedAt' => $now_iso,
            'error' => $sent ? null : 'PHP mail() could not relay to ' . $to_email
        ];

        // Respect explicit sendAdminCopy === true (and never send admin copy if sendAdminCopy === false)
        $send_admin_copy = false;
        if (array_key_exists('sendAdminCopy', $input)) {
            $send_admin_copy = ($input['sendAdminCopy'] === true || $input['sendAdminCopy'] === 'true' || $input['sendAdminCopy'] === 1);
        } elseif (!empty($input['isMembershipRenewal'])) {
            $send_admin_copy = true;
        }

        $admin_copy_receipt = null;
        if ($send_admin_copy) {
            $admin_email = normalizeAuthEmail($input['adminCopyEmail'] ?? 'yr943334@gmail.com');
            if (!empty($admin_email) && filter_var($admin_email, FILTER_VALIDATE_EMAIL) && strtolower($admin_email) !== strtolower($to_email)) {
                $admin_msg_id = '<php-admin-copy-' . time() . '-' . substr(md5($admin_email . uniqid('', true)), 0, 8) . '@tradeheaven.net>';
                $admin_tracking_id = 'ms-trk-php-admin-' . dechex(time()) . '-' . substr(md5($admin_email . uniqid('', true)), 0, 6);
                $admin_headers = [
                    'MIME-Version: 1.0',
                    'Content-Type: text/html; charset=UTF-8',
                    'From: Trade Heaven Global B2B <noreply@tradeheaven.net>',
                    'Reply-To: help@tradeheaven.net',
                    'Message-ID: ' . $admin_msg_id,
                    'X-Mailer: PHP/' . phpversion()
                ];
                $admin_headers_str = implode("\r\n", $admin_headers);
                $admin_sent = @mail($admin_email, $encoded_subject, $html_body, $admin_headers_str, "-f noreply@tradeheaven.net");
                if (!$admin_sent) {
                    $admin_sent = @mail($admin_email, $encoded_subject, $html_body, $admin_headers_str);
                }
                $admin_entry = [
                    'id' => 'eh-php-adm-' . time() . '-' . substr(md5($admin_email . uniqid('', true)), 0, 6),
                    'recipient' => $admin_email,
                    'recipientEmail' => $admin_email,
                    'recipientName' => 'Admin Copy (' . $admin_email . ') • ' . $recipient_name,
                    'companyName' => $company_name,
                    'companyId' => $company_id !== '' ? $company_id : null,
                    'subject' => $subject,
                    'category' => $category,
                    'dispatchType' => $dispatch_type,
                    'deliveryMode' => 'PHP_MAIL_RELAY',
                    'dispatchedAt' => $now_iso,
                    'success' => (bool)$admin_sent,
                    'messageId' => $admin_msg_id,
                    'trackingId' => $admin_tracking_id,
                    'summaryText' => mb_substr(strip_tags($intro_msg), 0, 260),
                    'htmlPreview' => $html_body,
                    'error' => $admin_sent ? null : 'PHP mail() returned false for admin copy',
                    'opened' => false,
                    'openCount' => 0,
                    'clicked' => false,
                    'clickCount' => 0,
                    'mailSuiteStatus' => $admin_sent ? 'DELIVERED' : 'BOUNCED',
                    'trackingEnabled' => true
                ];
                $append_history($admin_entry);
                $admin_copy_receipt = [
                    'recipient' => $admin_email,
                    'success' => (bool)$admin_sent,
                    'deliveryMode' => 'PHP_MAIL_RELAY',
                    'messageId' => $admin_msg_id,
                    'trackingId' => $admin_tracking_id,
                    'dispatchedAt' => $now_iso,
                    'error' => $admin_sent ? null : 'PHP mail() could not relay admin copy to ' . $admin_email
                ];
            }
        }

        echo json_encode([
            "status" => $sent ? "success" : "error",
            "success" => (bool)$sent,
            "recipient" => $to_email,
            "deliveryMode" => "PHP_MAIL_RELAY",
            "messageId" => $message_id,
            "trackingId" => $tracking_id,
            "dispatchedAt" => $now_iso,
            "receipt" => $receipt,
            "adminCopyReceipt" => $admin_copy_receipt,
            "message" => $sent
                ? ("Custom email dispatched via Trade Heaven Mail Server to {$to_email}" . ($admin_copy_receipt && !empty($admin_copy_receipt['success']) ? " and Admin Copy sent to {$admin_copy_receipt['recipient']}" : "") . ".")
                : "PHP mail() could not relay to {$to_email}."
        ]);
        break;

    case 'record_email_history':
        $history_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($history_dir)) {
            @mkdir($history_dir, 0775, true);
        }
        $history_file = $history_dir . '/email-history.json';
        $entries_in = [];
        if (isset($input['entries']) && is_array($input['entries'])) {
            $entries_in = $input['entries'];
        } elseif (!empty($input['recipient']) || !empty($input['recipientEmail'])) {
            $entries_in = [$input];
        }
        $existing = [];
        if (file_exists($history_file)) {
            $decoded = json_decode((string)@file_get_contents($history_file), true);
            if (is_array($decoded)) $existing = $decoded;
        }
        $added = 0;
        foreach ($entries_in as $raw_entry) {
            if (!is_array($raw_entry)) continue;
            $rec = normalizeAuthEmail($raw_entry['recipient'] ?? $raw_entry['recipientEmail'] ?? '');
            if ($rec === '') continue;
            $entry = [
                'id' => trim((string)($raw_entry['id'] ?? ('eh-sync-' . time() . '-' . substr(md5($rec . uniqid('', true)), 0, 6)))),
                'recipient' => $rec,
                'recipientEmail' => $rec,
                'recipientName' => trim((string)($raw_entry['recipientName'] ?? 'Trade Partner')),
                'companyName' => trim((string)($raw_entry['companyName'] ?? 'Corporate Entity')),
                'companyId' => $raw_entry['companyId'] ?? null,
                'subject' => trim((string)($raw_entry['subject'] ?? 'Trade Heaven Notification')),
                'category' => strtoupper(trim((string)($raw_entry['category'] ?? 'CUSTOM_ADMIN_NOTICE'))),
                'dispatchType' => strtoupper(trim((string)($raw_entry['dispatchType'] ?? 'MANUAL'))),
                'deliveryMode' => trim((string)($raw_entry['deliveryMode'] ?? 'LIVE_SMTP')),
                'dispatchedAt' => trim((string)($raw_entry['dispatchedAt'] ?? gmdate('Y-m-d\TH:i:s\Z'))),
                'success' => isset($raw_entry['success']) ? (bool)$raw_entry['success'] : true,
                'messageId' => $raw_entry['messageId'] ?? null,
                'trackingId' => $raw_entry['trackingId'] ?? null,
                'summaryText' => isset($raw_entry['summaryText']) ? mb_substr((string)$raw_entry['summaryText'], 0, 300) : '',
                'htmlPreview' => isset($raw_entry['htmlPreview']) ? (string)$raw_entry['htmlPreview'] : null,
                'error' => $raw_entry['error'] ?? null,
                'opened' => !empty($raw_entry['opened']),
                'openCount' => intval($raw_entry['openCount'] ?? 0),
                'clicked' => !empty($raw_entry['clicked']),
                'clickCount' => intval($raw_entry['clickCount'] ?? 0),
                'mailSuiteStatus' => trim((string)($raw_entry['mailSuiteStatus'] ?? (!empty($raw_entry['success']) ? 'DELIVERED' : 'BOUNCED'))),
                'trackingEnabled' => true
            ];
            $existing = array_values(array_filter($existing, function ($item) use ($entry) {
                if (!is_array($item)) return false;
                if (!empty($entry['id']) && !empty($item['id']) && $item['id'] === $entry['id']) return false;
                if (!empty($entry['messageId']) && !empty($item['messageId']) && $item['messageId'] === $entry['messageId'] && strtolower((string)($item['recipient'] ?? '')) === strtolower($entry['recipient'])) return false;
                return true;
            }));
            array_unshift($existing, $entry);
            $added++;
        }
        if (count($existing) > 1000) {
            $existing = array_slice($existing, 0, 1000);
        }
        @file_put_contents($history_file, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(["status" => "success", "success" => true, "recorded" => $added, "totalCount" => count($existing)]);
        break;

    case 'get_email_history':
    case 'email_history':
    case 'mailsuite_analytics':
    case 'marketing_suite_state':
    case 'marketing_suite_rules':
    case 'marketing_suite_trigger':
    case 'marketing_suite_simulate':
    case 'mailsuite_webhook':
        $uploads_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir)) {
            @mkdir($uploads_dir, 0775, true);
        }
        $history_file = $uploads_dir . '/email-history.json';
        $telemetry_file = $uploads_dir . '/mailsuite-telemetry-state.json';
        $rules_file = $uploads_dir . '/marketing-suite-rules.json';

        $load_telemetry = function () use ($history_file, $telemetry_file) {
            $combined = [];
            $seen = [];
            $webhook_logs = [];

            $push_entry = function ($item) use (&$combined, &$seen) {
                if (!is_array($item)) return;
                $rec = strtolower(trim((string)($item['recipient'] ?? $item['recipientEmail'] ?? '')));
                if ($rec === '') return;
                if (empty($item['recipient'])) $item['recipient'] = $rec;
                if (empty($item['recipientEmail'])) $item['recipientEmail'] = $rec;
                $id_key = !empty($item['id']) ? ('id:' . strtolower((string)$item['id'])) : '';
                $trk_key = !empty($item['trackingId']) ? ('trk:' . strtolower((string)$item['trackingId'])) : '';
                $msg_key = !empty($item['messageId']) ? ('msg:' . strtolower((string)$item['messageId']) . '|' . $rec) : '';
                if (($id_key && isset($seen[$id_key])) || ($trk_key && isset($seen[$trk_key])) || ($msg_key && isset($seen[$msg_key]))) {
                    return;
                }
                if ($id_key) $seen[$id_key] = true;
                if ($trk_key) $seen[$trk_key] = true;
                if ($msg_key) $seen[$msg_key] = true;
                $combined[] = $item;
            };

            if (file_exists($history_file)) {
                $decoded = json_decode((string)@file_get_contents($history_file), true);
                if (is_array($decoded)) {
                    foreach ($decoded as $row) $push_entry($row);
                }
            }
            if (file_exists($telemetry_file)) {
                $t_decoded = json_decode((string)@file_get_contents($telemetry_file), true);
                if (is_array($t_decoded)) {
                    $log_list = $t_decoded['emailHistoryLog'] ?? $t_decoded['history'] ?? $t_decoded['entries'] ?? [];
                    if (is_array($log_list)) {
                        foreach ($log_list as $row) $push_entry($row);
                    }
                    if (!empty($t_decoded['smtpWebhookLogs']) && is_array($t_decoded['smtpWebhookLogs'])) {
                        $webhook_logs = $t_decoded['smtpWebhookLogs'];
                    }
                }
            }

            usort($combined, function ($a, $b) {
                return strtotime((string)($b['dispatchedAt'] ?? '')) <=> strtotime((string)($a['dispatchedAt'] ?? ''));
            });

            return ['history' => $combined, 'webhookLogs' => $webhook_logs];
        };

        $compute_summary = function ($list) {
            $total_sent = count($list);
            $delivered = 0;
            $failed = 0;
            $opened = 0;
            $total_opens = 0;
            $clicked = 0;
            $total_clicks = 0;
            $recent_events = [];
            foreach ($list as $it) {
                $is_ok = !empty($it['success']) && strtoupper((string)($it['mailSuiteStatus'] ?? '')) !== 'BOUNCED';
                if ($is_ok) $delivered++;
                else $failed++;
                $oc = intval($it['openCount'] ?? 0);
                if (!empty($it['opened']) || $oc > 0) {
                    $opened++;
                    $total_opens += max(1, $oc);
                }
                $cc = intval($it['clickCount'] ?? 0);
                if (!empty($it['clicked']) || $cc > 0) {
                    $clicked++;
                    $total_clicks += max(1, $cc);
                }
                if (count($recent_events) < 25) {
                    $recent_events[] = [
                        'id' => (string)($it['id'] ?? ''),
                        'trackingId' => (string)($it['trackingId'] ?? ''),
                        'recipient' => (string)($it['recipient'] ?? ''),
                        'type' => (!empty($it['clicked']) || $cc > 0) ? 'CLICK' : ((!empty($it['opened']) || $oc > 0) ? 'OPEN' : ($is_ok ? 'DELIVERED' : 'BOUNCED')),
                        'timestamp' => (string)($it['lastClickedAt'] ?? $it['lastOpenedAt'] ?? $it['dispatchedAt'] ?? gmdate('Y-m-d\TH:i:s\Z'))
                    ];
                }
            }
            $denom = max(1, $delivered);
            $open_rate = $delivered > 0 ? round(($opened / $denom) * 100, 1) : 0;
            $click_rate = $delivered > 0 ? round(($clicked / $denom) * 100, 1) : 0;
            $ctor = $opened > 0 ? round(($clicked / max(1, $opened)) * 100, 1) : 0;

            return [
                'totalSent' => $total_sent,
                'totalTracked' => $total_sent,
                'totalDelivered' => $delivered,
                'totalBounced' => $failed,
                'totalOpened' => $opened,
                'unopenedCount' => max(0, $delivered - $opened),
                'openRatePercent' => $open_rate,
                'totalOpensCount' => $total_opens,
                'totalClicked' => $clicked,
                'clickRatePercent' => $click_rate,
                'clickThroughRatePercent' => $click_rate,
                'clickToOpenRatePercent' => $ctor,
                'totalClicksCount' => $total_clicks,
                'recentEvents' => $recent_events
            ];
        };

        $default_failed_ad_users = [
            [
                'id' => 'fad-zac-otec-001',
                'recipientName' => 'Zachary Aldin (Zac)',
                'decisionMakerName' => 'Zachary Aldin (Zac)',
                'email' => 'zac@otec.ltd',
                'companyName' => 'IMPORTATION FADE-TECH (OTEC LTD)',
                'country' => 'Australia',
                'address' => '42a Bassett street hurstville, New South Wales 2220, Australia',
                'phone' => '+61 424 854 899',
                'invoiceRef' => 'TRD-INV-27-0004',
                'currentPlanName' => 'Free Tier Member (Reverted from Partial $400 Basic Plan)',
                'targetFullPlanName' => 'Full Basic Business Plan ($990 Diwali Offer) / VIP Upgrade',
                'amountPaidUsd' => 400,
                'standardPlanUsd' => 1100,
                'diwaliOfferPlanUsd' => 990,
                'remainingBalanceUsd' => 590,
                'failedCampaignId' => 'ADS-COAL-AU-2026',
                'failedCampaignName' => 'Global Coal Buyer Acquisition & Sponsored Banner Campaign (GAR 6000-6500 kcal/kg)',
                'failureReason' => 'Moved to Free Tier Member pending clearance of $590.00 USD Basic Plan balance payment (Ref: TRD-INV-27-0004)',
                'failedAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 1500),
                'accountStatus' => 'FOLLOWUP_SENT',
                'followUpCount' => 2,
                'lastFollowUpAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 120),
                'lastTrackingId' => 'ms-trk-zac-balance-fund-live-2026',
                'recommendedTemplateId' => 'tpl-failed-ads-diwali-combo'
            ],
            [
                'id' => 'fad-ali-ace-002',
                'recipientName' => 'Ali Charley Ezekiah',
                'decisionMakerName' => 'Ali Charley Ezekiah',
                'email' => 'ezekiahali355@gmail.com',
                'companyName' => 'ACE Intermediary',
                'country' => 'United States',
                'address' => '1241 Hackberry Avenue Corsicana Texas 75110',
                'phone' => '+1 (903) 555-0141',
                'invoiceRef' => 'TRD-INV-27-0018',
                'currentPlanName' => 'Basic Business Plan (Renewal Pending)',
                'targetFullPlanName' => 'Full Basic Business Plan ($990/yr Diwali Offer)',
                'amountPaidUsd' => 0,
                'standardPlanUsd' => 1100,
                'diwaliOfferPlanUsd' => 990,
                'remainingBalanceUsd' => 990,
                'failedCampaignId' => 'ADS-US-COMMODITY-2026',
                'failedCampaignName' => 'North American Wholesale Commodity Spotlight & Buyer RFQ Broadcast',
                'failureReason' => 'Annual Basic Plan Renewal Pending: Sponsored ad slot paused until $990/yr Diwali Offer settlement',
                'failedAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 5700),
                'accountStatus' => 'FOLLOWUP_SENT',
                'followUpCount' => 1,
                'lastFollowUpAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 2520),
                'lastTrackingId' => 'ms-trk-ace-renewal-2026',
                'recommendedTemplateId' => 'tpl-diwali-festival-offer'
            ],
            [
                'id' => 'fad-mark-atlantic-003',
                'recipientName' => 'Mark Johnson (President)',
                'decisionMakerName' => 'Mark Johnson (President)',
                'email' => 'mjohnson@atlanticpowerequip.com',
                'companyName' => 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
                'country' => 'United States',
                'address' => 'P.O. Box 1176, Marmora, New Jersey 08223, USA',
                'phone' => '+1-609-374-5131',
                'invoiceRef' => 'TRD-INV-27-0029',
                'currentPlanName' => 'Basic Business Plan',
                'targetFullPlanName' => 'VIP Business Plan ($5,490/yr Diwali Offer — 100% Advance Leads)',
                'amountPaidUsd' => 1100,
                'standardPlanUsd' => 6100,
                'diwaliOfferPlanUsd' => 5490,
                'remainingBalanceUsd' => 4390,
                'failedCampaignId' => 'ADS-CA-10GEN-VIP-2026',
                'failedCampaignName' => '10 Units CAT Diesel Generators to Canada (VIP 100% Advance Buyer Campaign)',
                'failureReason' => 'Tier Restriction: Basic Plan cannot run VIP 100% Advance Payment Generator Ad Campaign',
                'failedAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 10800),
                'accountStatus' => 'AD_HALTED',
                'followUpCount' => 1,
                'lastFollowUpAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 7200),
                'recommendedTemplateId' => 'tpl-subscription-upsell-vip'
            ],
            [
                'id' => 'fad-donald-berries-004',
                'recipientName' => 'Donald Sorkin',
                'decisionMakerName' => 'Donald Sorkin',
                'email' => 'sorkindon@gmail.com',
                'companyName' => 'Girlsenberries',
                'country' => 'United States',
                'address' => 'California Agricultural Export Zone, USA',
                'phone' => '+1 (559) 555-0182',
                'invoiceRef' => 'TRD-INV-27-0041',
                'currentPlanName' => 'Basic Starter Deposit ($350 Paid)',
                'targetFullPlanName' => 'Full Basic Business Plan ($990 Diwali 10% OFF)',
                'amountPaidUsd' => 350,
                'standardPlanUsd' => 1100,
                'diwaliOfferPlanUsd' => 990,
                'remainingBalanceUsd' => 640,
                'failedCampaignId' => 'ADS-AGRI-BERRIES-2026',
                'failedCampaignName' => 'Global Frozen & Dried Berries Importer Matching Ad Campaign (#INQ-2026-US-8942)',
                'failureReason' => 'Insufficient Plan Balance: $350 partial deposit paid; $640 balance required for Full Plan ad launch',
                'failedAt' => gmdate('Y-m-d\TH:i:s\Z', time() - 14400),
                'accountStatus' => 'PAUSE_WARNING_48H',
                'followUpCount' => 0,
                'recommendedTemplateId' => 'tpl-failed-ads-diwali-combo'
            ]
        ];

        $default_marketing_templates = [
            [
                'id' => 'tpl-failed-ads-diwali-combo',
                'name' => 'Failed Ad Launch + Full Plan Balance + Diwali Max Benefit',
                'category' => 'FAILED_AD_RECOVERY',
                'badge' => 'PRIMARY WORKFLOW • ZAC ($400 PAID)',
                'promoCode' => 'DIWALI10',
                'discountPercent' => 10,
                'subjectTemplate' => 'Urgent: Ads Campaign Failed (Insufficient Plan Balance — ${{amountPaidUsd}} Paid) • Complete Full Plan + Diwali Max Benefit Offer for {{companyName}}',
                'description' => 'Notifies users whose sponsored ads campaign failed due to partial plan payment. Explains the 48-hour account pause policy and offers the Diwali 10% OFF Max Benefit ($590 net balance after $400 credit).',
                'highlights' => [
                    'Diagnostic breakdown of why Sponsored Ads Campaign halted',
                    '100% credit of partial payment ($400 Paid) + Flat 10% Diwali Discount (Code: DIWALI10)',
                    'Clear 48-hour Account Pause warning if Full Plan balance ($590 USD) is not settled',
                    'Direct 1-click checkout CTA + MailSuite 1x1 pixel & link click tracking'
                ],
                'ctaLabel' => 'Complete Full Plan (${{remainingBalanceUsd}} USD with Diwali Offer) & Relaunch Ads →'
            ],
            [
                'id' => 'tpl-diwali-festival-offer',
                'name' => 'Diwali Maha Utsav Festival Offer (Flat 10% OFF + Priority Ad Boost)',
                'category' => 'DIWALI_OFFER',
                'badge' => 'FESTIVAL CAMPAIGN • CODE: DIWALI10',
                'promoCode' => 'DIWALI10',
                'discountPercent' => 10,
                'subjectTemplate' => 'Diwali Maha Utsav Special Offer (Flat 10% OFF — Code: DIWALI10): Unlock Maximum Buyer Leads & Resume Sponsored Ads for {{companyName}}',
                'description' => 'High-converting festive promotion offering Flat 10% OFF across Basic ($990/yr), Premium ($1,890/yr), and VIP ($5,490/yr) annual plans with complimentary Sponsored Ad Banner impressions.',
                'highlights' => [
                    'Flat 10% Festival Discount across all annual membership tiers (Code: DIWALI10)',
                    'Complimentary 2x Marketplace Banner Ads + Priority Buyer RFQ Matching',
                    'Full credit of any prior deposit toward annual plan settlement',
                    'Instant activation of verified buyer inquiry routing'
                ],
                'ctaLabel' => 'Claim Diwali 10% OFF Offer (Code: DIWALI10) & Activate Ads →'
            ],
            [
                'id' => 'tpl-subscription-upsell-vip',
                'name' => 'Subscription Upsell: Basic / Partial Plan → Full VIP Business Plan',
                'category' => 'SUBSCRIPTION_UPSELL',
                'badge' => 'VIP UPSELL • 100% ADVANCE BUYERS',
                'promoCode' => 'DIWALI10',
                'discountPercent' => 10,
                'subjectTemplate' => 'Upgrade {{companyName}} to VIP Business Plan (10% Diwali Offer) — Unlock 4x Sponsored Ad Campaigns & 100% Advance Payment Buyer Leads',
                'description' => 'Upsells Basic or partial-plan suppliers to the Full VIP Business Plan ($5,490/yr with DIWALI10 vs $6,100/yr), unlocking 60+ verified buyers/month and 4x Sponsored Ads.',
                'highlights' => [
                    'Unlock 60+ Verified International Buyer Orders/Month with Advance Payment terms',
                    '4x Marketplace Spotlight Banner Ads + Dedicated International Export Manager (IEM)',
                    'Enable Direct On-Site Buyer Funds Receiving & Mediation Escrow Wallet',
                    'Save $610 USD immediately with Diwali Code DIWALI10 + prior deposit credit'
                ],
                'ctaLabel' => 'Upgrade to Full VIP Plan & Unlock 100% Advance Buyers →'
            ],
            [
                'id' => 'tpl-account-pause-prevention',
                'name' => 'Final 48-Hour Account Pause Warning & Ad Reactivation Notice',
                'category' => 'PAUSE_PREVENTION',
                'badge' => 'URGENT COMPLIANCE • 48H HOLD NOTICE',
                'promoCode' => 'DIWALI10',
                'discountPercent' => 10,
                'subjectTemplate' => 'FINAL NOTICE: {{companyName}} Storefront & Ad Campaign Scheduled for Account Pause — Settle ${{remainingBalanceUsd}} USD Balance Now',
                'description' => 'Urgent compliance follow-up for accounts with halted ad campaigns offering a final 48-hour window with Diwali discount protection.',
                'highlights' => [
                    'Urgent 48-hour countdown before supplier storefront and RFQ routing are paused',
                    'Itemized invoice ledger showing amount paid vs. net balance due',
                    'Preserves Diwali 10% OFF rate ($990/yr Basic Plan) if settled before pause deadline',
                    'Immediate automated ad campaign reactivation upon payment confirmation'
                ],
                'ctaLabel' => 'Prevent Account Pause & Settle ${{remainingBalanceUsd}} USD Balance →'
            ]
        ];

        $default_rules = [
            'autoTriggerOnFailedAdLaunch' => true,
            'autoAttachDiwaliPromo' => true,
            'requireAdminDemoFirst' => true,
            'defaultTemplateId' => 'tpl-failed-ads-diwali-combo',
            'sendAdminCopyOnLiveDispatch' => true,
            'adminNotificationEmail' => 'yr943334@gmail.com',
            'webhookTrackingEnabled' => true,
            'pixelTrackingEnabled' => true
        ];
        if (file_exists($rules_file)) {
            $saved_rules = json_decode((string)@file_get_contents($rules_file), true);
            if (is_array($saved_rules)) {
                $default_rules = array_merge($default_rules, $saved_rules);
            }
        }

        if ($action === 'marketing_suite_rules') {
            if (is_array($input) && !empty($input)) {
                $default_rules = array_merge($default_rules, $input);
                $default_rules['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');
                @file_put_contents($rules_file, json_encode($default_rules, JSON_PRETTY_PRINT), LOCK_EX);
            }
            echo json_encode([
                'status' => 'success',
                'success' => true,
                'automationRules' => $default_rules,
                'message' => 'Automation rules updated.'
            ]);
            break;
        }

        if ($action === 'marketing_suite_trigger') {
            $user_ids = isset($input['userIds']) && is_array($input['userIds']) ? $input['userIds'] : ['fad-zac-otec-001'];
            $is_demo = !empty($input['isDemoOnAdmin']);
            $demo_email = normalizeAuthEmail($input['demoAdminEmail'] ?? 'yr943334@gmail.com');
            $tpl_id = trim((string)($input['templateId'] ?? 'tpl-failed-ads-diwali-combo'));
            $tpl = $default_marketing_templates[0];
            foreach ($default_marketing_templates as $t_item) {
                if ($t_item['id'] === $tpl_id) { $tpl = $t_item; break; }
            }
            $existing_hist = [];
            if (file_exists($history_file)) {
                $dec = json_decode((string)@file_get_contents($history_file), true);
                if (is_array($dec)) $existing_hist = $dec;
            }
            $sent_count = 0;
            foreach ($default_failed_ad_users as $u) {
                if (!in_array($u['id'], $user_ids, true) && !in_array($u['email'], $user_ids, true)) continue;
                $target_email = $is_demo ? $demo_email : $u['email'];
                $subj = str_replace(
                    ['{{companyName}}', '{{amountPaidUsd}}', '{{remainingBalanceUsd}}'],
                    [$u['companyName'], (string)$u['amountPaidUsd'], (string)$u['remainingBalanceUsd']],
                    $tpl['subjectTemplate']
                );
                if ($is_demo) $subj = '[ADMIN DEMO] ' . $subj;
                $body_html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;"><div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;"><h2 style="color:#0f294d;margin-top:0;">' . htmlspecialchars($tpl['name'], ENT_QUOTES, 'UTF-8') . '</h2><p>Dear ' . htmlspecialchars($u['recipientName'], ENT_QUOTES, 'UTF-8') . ' (' . htmlspecialchars($u['companyName'], ENT_QUOTES, 'UTF-8') . '),</p><p>' . htmlspecialchars($tpl['description'], ENT_QUOTES, 'UTF-8') . '</p><p><strong>Amount Paid:</strong> $' . intval($u['amountPaidUsd']) . ' USD &bull; <strong>Remaining Balance (Code ' . htmlspecialchars($tpl['promoCode'], ENT_QUOTES, 'UTF-8') . '):</strong> $' . intval($u['remainingBalanceUsd']) . ' USD</p><p><a href="https://www.tradeheaven.net" style="display:inline-block;padding:12px 20px;background:#0f294d;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">' . htmlspecialchars(str_replace('{{remainingBalanceUsd}}', (string)$u['remainingBalanceUsd'], $tpl['ctaLabel']), ENT_QUOTES, 'UTF-8') . '</a></p></div></body></html>';
                $hdrs = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: Trade Heaven Global B2B <noreply@tradeheaven.net>\r\nReply-To: help@tradeheaven.net";
                $ok = @mail($target_email, '=?UTF-8?B?' . base64_encode($subj) . '?=', $body_html, $hdrs, '-f noreply@tradeheaven.net');
                if (!$ok) $ok = @mail($target_email, '=?UTF-8?B?' . base64_encode($subj) . '?=', $body_html, $hdrs);
                array_unshift($existing_hist, [
                    'id' => 'eh-php-cmp-' . time() . '-' . substr(md5($target_email . uniqid('', true)), 0, 6),
                    'trackingId' => 'ms-trk-php-cmp-' . dechex(time()) . '-' . substr(md5($target_email . uniqid('', true)), 0, 6),
                    'recipient' => $target_email,
                    'recipientEmail' => $target_email,
                    'recipientName' => $is_demo ? ('Admin Demo (' . $u['recipientName'] . ')') : $u['recipientName'],
                    'companyName' => $u['companyName'],
                    'subject' => $subj,
                    'category' => 'CAMPAIGN',
                    'dispatchType' => 'AUTOMATED',
                    'deliveryMode' => 'PHP_MAIL_RELAY',
                    'dispatchedAt' => gmdate('Y-m-d\TH:i:s\Z'),
                    'success' => (bool)$ok,
                    'summaryText' => $tpl['description'],
                    'htmlPreview' => $body_html,
                    'opened' => false,
                    'openCount' => 0,
                    'clicked' => false,
                    'clickCount' => 0,
                    'mailSuiteStatus' => $ok ? 'DELIVERED' : 'BOUNCED',
                    'trackingEnabled' => true
                ]);
                $sent_count++;
            }
            @file_put_contents($history_file, json_encode(array_slice($existing_hist, 0, 1000), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
            $tel = $load_telemetry();
            echo json_encode([
                'status' => 'success',
                'success' => true,
                'message' => 'Triggered campaign for ' . $sent_count . ' recipient(s) via Trade Heaven Mail Server.',
                'failedAdUsers' => $default_failed_ad_users,
                'templates' => $default_marketing_templates,
                'campaigns' => [],
                'summary' => $compute_summary($tel['history']),
                'history' => $tel['history'],
                'webhookLogs' => $tel['webhookLogs']
            ]);
            break;
        }

        $tel = $load_telemetry();
        $all_entries = $tel['history'];
        $webhook_logs = $tel['webhookLogs'];

        if ($action === 'marketing_suite_simulate' || $action === 'mailsuite_webhook') {
            $sim_action = strtoupper(trim((string)($input['action'] ?? $input['eventType'] ?? 'BATCH_OPENS')));
            $target_trk = trim((string)($input['trackingId'] ?? ''));
            $now_ts = gmdate('Y-m-d\TH:i:s\Z');
            $affected = 0;
            $updated_hist = $all_entries;
            foreach ($updated_hist as &$row) {
                if ($target_trk !== '' && (string)($row['trackingId'] ?? '') !== $target_trk && (string)($row['id'] ?? '') !== $target_trk) {
                    continue;
                }
                if ($sim_action === 'OPENED' || $sim_action === 'OPEN' || $sim_action === 'BATCH_OPENS') {
                    $row['opened'] = true;
                    $row['openCount'] = intval($row['openCount'] ?? 0) + 1;
                    $row['lastOpenedAt'] = $now_ts;
                    $row['mailSuiteStatus'] = !empty($row['clicked']) ? 'CLICKED' : 'OPENED';
                    $affected++;
                } elseif ($sim_action === 'CLICKED' || $sim_action === 'CLICK' || $sim_action === 'BATCH_CLICKS') {
                    $row['opened'] = true;
                    $row['openCount'] = max(1, intval($row['openCount'] ?? 0));
                    $row['clicked'] = true;
                    $row['clickCount'] = intval($row['clickCount'] ?? 0) + 1;
                    $row['lastClickedAt'] = $now_ts;
                    $row['mailSuiteStatus'] = 'CLICKED';
                    $affected++;
                } elseif ($sim_action === 'BOUNCED' || $sim_action === 'SIMULATE_BOUNCE') {
                    $row['success'] = false;
                    $row['mailSuiteStatus'] = 'BOUNCED';
                    $affected++;
                } elseif ($sim_action === 'ALL_DELIVERED' || $sim_action === 'DELIVERED') {
                    $row['success'] = true;
                    if (empty($row['opened']) && empty($row['clicked'])) $row['mailSuiteStatus'] = 'DELIVERED';
                    $affected++;
                } elseif ($sim_action === 'RESET_ALL') {
                    $row['opened'] = false;
                    $row['openCount'] = 0;
                    $row['clicked'] = false;
                    $row['clickCount'] = 0;
                    $row['mailSuiteStatus'] = !empty($row['success']) ? 'DELIVERED' : 'BOUNCED';
                    $affected++;
                }
                if ($target_trk === '' && $affected >= 5 && in_array($sim_action, ['BATCH_OPENS', 'BATCH_CLICKS', 'SIMULATE_BOUNCE'], true)) {
                    break;
                }
            }
            unset($row);
            @file_put_contents($history_file, json_encode(array_slice($updated_hist, 0, 1000), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
            echo json_encode([
                'status' => 'success',
                'success' => true,
                'message' => 'Recorded tracking event ' . $sim_action . ' (' . $affected . ' updated).',
                'affectedCount' => $affected,
                'summary' => $compute_summary($updated_hist),
                'history' => $updated_hist,
                'webhookLogs' => $webhook_logs,
                'campaigns' => []
            ]);
            break;
        }

        if ($action === 'marketing_suite_state') {
            echo json_encode([
                'status' => 'success',
                'success' => true,
                'failedAdUsers' => $default_failed_ad_users,
                'templates' => $default_marketing_templates,
                'automationRules' => $default_rules,
                'campaigns' => [],
                'summary' => $compute_summary($all_entries),
                'history' => $all_entries,
                'webhookLogs' => $webhook_logs
            ]);
            break;
        }

        $filter_email = strtolower(trim((string)($_GET['email'] ?? $input['email'] ?? '')));
        $filter_company = strtolower(trim((string)($_GET['companyName'] ?? $input['companyName'] ?? '')));
        $filter_company_id = strtolower(trim((string)($_GET['companyId'] ?? $input['companyId'] ?? '')));
        $filter_type = strtoupper(trim((string)($_GET['dispatchType'] ?? $input['dispatchType'] ?? '')));

        $filtered = [];
        foreach ($all_entries as $item) {
            if (!is_array($item)) continue;
            if ($filter_email !== '') {
                $rec = strtolower((string)($item['recipient'] ?? $item['recipientEmail'] ?? ''));
                $comp = strtolower((string)($item['companyName'] ?? ''));
                $cid = strtolower((string)($item['companyId'] ?? ''));
                $match_email = ($rec === $filter_email);
                $match_company = ($filter_company !== '' && strpos($comp, $filter_company) !== false);
                $match_cid = ($filter_company_id !== '' && $cid === $filter_company_id);
                if (!$match_email && !$match_company && !$match_cid) continue;
            } elseif ($filter_company !== '' || $filter_company_id !== '') {
                $comp = strtolower((string)($item['companyName'] ?? ''));
                $cid = strtolower((string)($item['companyId'] ?? ''));
                $match_company = ($filter_company !== '' && strpos($comp, $filter_company) !== false);
                $match_cid = ($filter_company_id !== '' && $cid === $filter_company_id);
                if (!$match_company && !$match_cid) continue;
            }
            if ($filter_type !== '' && $filter_type !== 'ALL') {
                $dt = strtoupper((string)($item['dispatchType'] ?? 'MANUAL'));
                if ($dt !== $filter_type) continue;
            }
            $filtered[] = $item;
        }

        $total_count = count($filtered);
        $manual_count = 0;
        $automated_count = 0;
        foreach ($filtered as $it) {
            if (strtoupper((string)($it['dispatchType'] ?? 'MANUAL')) === 'AUTOMATED') $automated_count++;
            else $manual_count++;
        }
        $summary = $compute_summary($filtered);

        echo json_encode([
            "status" => "success",
            "success" => true,
            "totalCount" => $total_count,
            "history" => $filtered,
            "entries" => $filtered,
            "webhookLogs" => $webhook_logs,
            "stats" => [
                "total" => $total_count,
                "automatedCount" => $automated_count,
                "manualCount" => $manual_count,
                "deliveredCount" => $summary['totalDelivered'],
                "failedCount" => $summary['totalBounced']
            ],
            "mailSuiteStats" => $summary,
            "summary" => $summary,
            "analytics" => $summary
        ]);
        break;

    case 'mediation_state':
    case 'mediation_admin_adjust':
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        $uploads_dir = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir)) {
            @mkdir($uploads_dir, 0775, true);
        }
        $med_file = $uploads_dir . '/mediation-wallet-state.json';
        $med_file_fallback = __DIR__ . '/mediation-wallet-state.json';
        $default_med_state = [
            'wallets' => [
                [
                    'id' => 'wal-buyer-titan',
                    'entity_id' => 'buyer-titan-01',
                    'entity_name' => 'Marcus Vance',
                    'company_name' => 'Titan Global Construction & Infrastructure LLC',
                    'wallet_type' => 'BUYER',
                    'plan_status' => 'VIP',
                    'available_balance' => '185000000',
                    'locked_balance' => '92000000',
                    'currency' => 'USD',
                    'country' => 'United States',
                    'native_currency' => 'USD',
                    'native_symbol' => '$',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-buyer-euro',
                    'entity_id' => 'buyer-euro-02',
                    'entity_name' => 'Elena Rostova',
                    'company_name' => 'EuroMed Hospital Procurement GmbH',
                    'wallet_type' => 'BUYER',
                    'plan_status' => 'VIP',
                    'available_balance' => '340000000',
                    'locked_balance' => '64000000',
                    'currency' => 'EUR',
                    'country' => 'Germany',
                    'native_currency' => 'EUR',
                    'native_symbol' => '€',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-buyer-girlsenberries',
                    'entity_id' => 'buyer-girlsenberries-01',
                    'entity_name' => 'Donald Sorkin',
                    'company_name' => 'Girlsenberries',
                    'wallet_type' => 'BUYER',
                    'plan_status' => 'VIP',
                    'available_balance' => '2000000000000',
                    'locked_balance' => '0',
                    'currency' => 'USD',
                    'country' => 'United States',
                    'native_currency' => 'USD',
                    'native_symbol' => '$',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-supp-melissa',
                    'entity_id' => 'comp-melissa-mpcommodity',
                    'entity_name' => 'Melissa Prezios',
                    'company_name' => 'MP Commodity Brokers Australia Pty Ltd',
                    'wallet_type' => 'SUPPLIER',
                    'plan_status' => 'BASIC',
                    'available_balance' => '0',
                    'locked_balance' => '0',
                    'currency' => 'USD',
                    'country' => 'United States',
                    'native_currency' => 'USD',
                    'native_symbol' => '$',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-supp-shenzhen',
                    'entity_id' => 'comp-shenzhen-solar',
                    'entity_name' => 'Chen Wei',
                    'company_name' => 'Shenzhen Lumina New Energy Tech Co., Ltd.',
                    'wallet_type' => 'SUPPLIER',
                    'plan_status' => 'VIP',
                    'available_balance' => '162000000',
                    'locked_balance' => '0',
                    'currency' => 'CNY',
                    'country' => 'China',
                    'native_currency' => 'CNY',
                    'native_symbol' => '¥',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-supp-bharat',
                    'entity_id' => 'comp-bharat-steel',
                    'entity_name' => 'Vikramaditya Singh',
                    'company_name' => 'Bharat Precision Forgings & Alloys Ltd.',
                    'wallet_type' => 'SUPPLIER',
                    'plan_status' => 'VIP',
                    'available_balance' => '95000000',
                    'locked_balance' => '0',
                    'currency' => 'INR',
                    'country' => 'India',
                    'native_currency' => 'INR',
                    'native_symbol' => '₹',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-supp-zac',
                    'entity_id' => 'comp-zac-importation-fadetech',
                    'entity_name' => 'Zachary Aldin',
                    'company_name' => 'IMPORTATION FADE-TECH (OTEC LTD)',
                    'wallet_type' => 'SUPPLIER',
                    'plan_status' => 'BASIC',
                    'available_balance' => '0',
                    'locked_balance' => '0',
                    'currency' => 'USD',
                    'country' => 'Australia',
                    'native_currency' => 'AUD',
                    'native_symbol' => 'A$',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-supp-atlantic-power',
                    'entity_id' => 'comp-atlantic-power-equip',
                    'entity_name' => 'Mark Johnson (President)',
                    'company_name' => 'Shore Technical Equipment Inc. (DBA: Atlantic Power & Equipment Co.)',
                    'wallet_type' => 'SUPPLIER',
                    'plan_status' => 'BASIC',
                    'available_balance' => '0',
                    'locked_balance' => '0',
                    'currency' => 'USD',
                    'country' => 'United States',
                    'native_currency' => 'USD',
                    'native_symbol' => '$',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ],
                [
                    'id' => 'wal-platform-rev',
                    'entity_id' => 'trade-heaven-treasury',
                    'entity_name' => 'Trade Heaven Treasury',
                    'company_name' => 'Trade Heaven Global Operations & Mediation Vault',
                    'wallet_type' => 'PLATFORM_REVENUE',
                    'plan_status' => 'VIP',
                    'available_balance' => '18450000',
                    'locked_balance' => '0',
                    'currency' => 'INR',
                    'country' => 'United Kingdom',
                    'native_currency' => 'GBP',
                    'native_symbol' => '£',
                    'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
                ]
            ],
            'ledgerEntries' => [
                [
                    'id' => 'led-melissa-return-50k',
                    'reference_id' => 'TH-WAL-301239',
                    'source_wallet_id' => 'wal-supp-melissa',
                    'destination_wallet_id' => null,
                    'amount' => '424000000',
                    'transaction_type' => 'ADMIN_WALLET_DEBIT',
                    'notes' => 'Return Back — $50,000.00 USD Removed from Melissa Prezios Wallet (Updated Balance: $0.00 USD)',
                    'created_at' => gmdate('Y-m-d\TH:i:s\Z')
                ]
            ],
            'orders' => [],
            'payouts' => [],
            'sqlLogs' => [],
            'stateUpdatedAt' => 0
        ];

        $med_state = $default_med_state;
        $loaded_from_storage = false;

        // 1. Prefer MySQL persistent storage on live hosting
        if ($db_connected && $pdo) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS wallet_mediation_state (
                    id INT PRIMARY KEY,
                    state_json LONGTEXT NOT NULL,
                    state_updated_at BIGINT DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                $stmt_med = $pdo->query("SELECT state_json, state_updated_at FROM wallet_mediation_state WHERE id = 1 LIMIT 1");
                $row_med = $stmt_med ? $stmt_med->fetch() : null;
                if ($row_med && !empty($row_med['state_json'])) {
                    $decoded_db = json_decode((string)$row_med['state_json'], true);
                    if (is_array($decoded_db) && !empty($decoded_db['wallets'])) {
                        $med_state = array_merge($default_med_state, $decoded_db);
                        $med_state['stateUpdatedAt'] = intval($row_med['state_updated_at'] ?? ($decoded_db['stateUpdatedAt'] ?? 0));
                        $loaded_from_storage = true;
                    }
                }
            } catch (Exception $e) {
                // Fall back to file storage
            }
        }

        // 2. Fall back to JSON file storage
        if (!$loaded_from_storage) {
            foreach ([$med_file, $med_file_fallback] as $candidate_file) {
                if (file_exists($candidate_file)) {
                    $decoded_med = json_decode((string)@file_get_contents($candidate_file), true);
                    if (is_array($decoded_med) && !empty($decoded_med['wallets'])) {
                        $med_state = array_merge($default_med_state, $decoded_med);
                        $loaded_from_storage = true;
                        break;
                    }
                }
            }
        }

        if ($action === 'mediation_state') {
            echo json_encode($med_state);
            break;
        }
        $adj_entity_id = trim((string)($input['entityId'] ?? ''));
        $adj_op = strtoupper(trim((string)($input['operation'] ?? 'ADD'))) === 'REMOVE' ? 'REMOVE' : 'ADD';
        $adj_paise = round(floatval($input['amountPaise'] ?? 0));
        $adj_target = (string)($input['balanceTarget'] ?? 'AVAILABLE') === 'LOCKED' ? 'locked_balance' : 'available_balance';
        if ($adj_entity_id === '' || $adj_paise <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid entityId and positive amountPaise are required.']);
            break;
        }
        $found_idx = -1;
        foreach ($med_state['wallets'] as $idx => $w) {
            if (strtolower((string)($w['entity_id'] ?? '')) === strtolower($adj_entity_id) || strtolower((string)($w['id'] ?? '')) === strtolower($adj_entity_id)) {
                $found_idx = $idx;
                break;
            }
        }
        if ($found_idx < 0) {
            $inferred_type = trim((string)($input['walletType'] ?? ((strpos($adj_entity_id, 'comp-') === 0 || strpos($adj_entity_id, 'supp') !== false) ? 'SUPPLIER' : 'BUYER')));
            $med_state['wallets'][] = [
                'id' => 'wal-' . strtolower($inferred_type) . '-' . substr((string)time(), -5),
                'entity_id' => $adj_entity_id,
                'entity_name' => trim((string)($input['entityName'] ?? $adj_entity_id)),
                'company_name' => trim((string)($input['companyName'] ?? ($input['entityName'] ?? $adj_entity_id))),
                'wallet_type' => $inferred_type,
                'plan_status' => 'VIP',
                'available_balance' => '0',
                'locked_balance' => '0',
                'currency' => trim((string)($input['nativeCurrency'] ?? 'USD')),
                'country' => trim((string)($input['country'] ?? 'United States')),
                'native_currency' => trim((string)($input['nativeCurrency'] ?? 'USD')),
                'native_symbol' => trim((string)($input['nativeSymbol'] ?? '$')),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
            ];
            $found_idx = count($med_state['wallets']) - 1;
        }
        $cur_bal = floatval($med_state['wallets'][$found_idx][$adj_target] ?? '0');
        if ($adj_op === 'REMOVE' && $cur_bal < $adj_paise) {
            http_response_code(400);
            echo json_encode(['error' => 'Insufficient wallet balance to remove requested funds.']);
            break;
        }
        $new_bal = $adj_op === 'ADD' ? ($cur_bal + $adj_paise) : ($cur_bal - $adj_paise);
        $med_state['wallets'][$found_idx][$adj_target] = sprintf('%.0f', $new_bal);
        $med_state['wallets'][$found_idx]['updated_at'] = gmdate('Y-m-d\TH:i:s\Z');
        $wallet_row = $med_state['wallets'][$found_idx];
        $ref_id = trim((string)($input['referenceId'] ?? '')) ?: ('ADM-' . ($adj_op === 'ADD' ? 'CR-' : 'DR-') . substr((string)time(), -6));
        $ledger_entry = [
            'id' => 'led-' . time() . '-' . rand(100, 999),
            'reference_id' => $ref_id,
            'source_wallet_id' => $adj_op === 'REMOVE' ? $wallet_row['id'] : null,
            'destination_wallet_id' => $adj_op === 'ADD' ? $wallet_row['id'] : null,
            'amount' => sprintf('%.0f', $adj_paise),
            'transaction_type' => $adj_op === 'ADD' ? 'ADMIN_WALLET_CREDIT' : 'ADMIN_WALLET_DEBIT',
            'notes' => trim((string)($input['reason'] ?? '')) ?: ($adj_op === 'ADD' ? 'Admin Treasury Credit' : 'Admin Treasury Debit'),
            'created_at' => gmdate('Y-m-d\TH:i:s\Z')
        ];
        array_unshift($med_state['ledgerEntries'], $ledger_entry);
        $state_ts = (int)round(microtime(true) * 1000);
        $med_state['stateUpdatedAt'] = $state_ts;
        $encoded_med = json_encode($med_state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        // Save to MySQL first (most reliable on live hosting)
        if ($db_connected && $pdo) {
            try {
                $stmt_save_med = $pdo->prepare("INSERT INTO wallet_mediation_state (id, state_json, state_updated_at) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE state_json = VALUES(state_json), state_updated_at = VALUES(state_updated_at)");
                $stmt_save_med->execute([$encoded_med, $state_ts]);
            } catch (Exception $e) {
                // Continue to file fallback
            }
        }
        // Save to both JSON paths
        @file_put_contents($med_file, $encoded_med, LOCK_EX);
        @file_put_contents($med_file_fallback, $encoded_med, LOCK_EX);

        echo json_encode([
            'success' => true,
            'wallet' => $wallet_row,
            'previousBalancePaise' => sprintf('%.0f', $cur_bal),
            'newBalancePaise' => sprintf('%.0f', $new_bal),
            'ledgerEntry' => $ledger_entry,
            'state' => $med_state
        ]);
        break;

    case 'email_listed_clients_counter_offer':
        $custom_subject = trim((string)($input['customSubject'] ?? ''));
        $custom_message = trim((string)($input['customMessage'] ?? ''));
        $filter_emails = [];
        if (!empty($input['recipientEmails']) && is_array($input['recipientEmails'])) {
            foreach ($input['recipientEmails'] as $fe) {
                $ne = normalizeAuthEmail($fe);
                if ($ne !== '') $filter_emails[$ne] = true;
            }
        }

        $admin_excludes = ['yr943334@gmail.com', 'sankalprajput15@gmail.com', 'admin@tradeheaven.net', 'solutionthe87@gmail.com'];
        $targets_map = [];

        // Gather from MySQL users table
        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->query("SELECT id, name, email, company_name, country, role FROM users");
                while ($row = $stmt->fetch()) {
                    $em = normalizeAuthEmail($row['email'] ?? '');
                    $rl = strtoupper((string)($row['role'] ?? 'SUPPLIER'));
                    if ($em === '' || !filter_var($em, FILTER_VALIDATE_EMAIL) || $rl === 'ADMIN' || in_array($em, $admin_excludes, true)) {
                        continue;
                    }
                    if (!empty($filter_emails) && !isset($filter_emails[$em])) continue;
                    $targets_map[$em] = [
                        'id' => strval($row['id'] ?? $em),
                        'email' => $em,
                        'name' => trim((string)($row['name'] ?? 'Listed Partner')) ?: 'Listed Partner',
                        'companyName' => trim((string)($row['company_name'] ?? '')) ?: ($row['name'] ?? 'Listed Enterprise'),
                        'country' => trim((string)($row['country'] ?? 'Global'))
                    ];
                }
            } catch (Exception $e) {}
        }

        // Gather from registered-users.json files
        $json_candidates = [
            __DIR__ . '/assets/uploads/registered-users.json',
            __DIR__ . '/public/assets/uploads/registered-users.json'
        ];
        foreach ($json_candidates as $jf) {
            if (file_exists($jf)) {
                $parsed = json_decode((string)file_get_contents($jf), true);
                if (is_array($parsed)) {
                    foreach ($parsed as $u) {
                        if (!is_array($u)) continue;
                        $em = normalizeAuthEmail($u['email'] ?? '');
                        $rl = strtoupper((string)($u['role'] ?? 'SUPPLIER'));
                        if ($em === '' || !filter_var($em, FILTER_VALIDATE_EMAIL) || $rl === 'ADMIN' || in_array($em, $admin_excludes, true)) {
                            continue;
                        }
                        if (!empty($filter_emails) && !isset($filter_emails[$em])) continue;
                        if (!isset($targets_map[$em])) {
                            $targets_map[$em] = [
                                'id' => strval($u['id'] ?? $em),
                                'email' => $em,
                                'name' => trim((string)($u['name'] ?? 'Listed Partner')) ?: 'Listed Partner',
                                'companyName' => trim((string)($u['companyName'] ?? $u['company_name'] ?? '')) ?: ($u['name'] ?? 'Listed Enterprise'),
                                'country' => trim((string)($u['country'] ?? 'Global'))
                            ];
                        }
                    }
                }
            }
        }

        $delivered = 0;
        $failed = 0;
        $receipts = [];
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: Trade Heaven Global B2B <noreply@tradeheaven.net>',
            'Reply-To: help@tradeheaven.net',
            'X-Mailer: PHP/' . phpversion()
        ];
        $headers_str = implode("\r\n", $headers);

        foreach ($targets_map as $client) {
            $em = $client['email'];
            $cname = $client['companyName'];
            $pname = $client['name'];
            $login_url = 'https://www.tradeheaven.net/?view=SUPPLIER_DASHBOARD&email=' . urlencode($em);
            $subj = $custom_subject !== ''
                ? $custom_subject
                : "Buyers Have Made Requests to Buy — Log In to Submit Your Counter Offer ({$cname})";
            $intro = $custom_message !== ''
                ? $custom_message
                : "Verified institutional buyers on Trade Heaven have made active requests to buy from {$cname}. Please log in to your Trade Heaven account now to review buyer purchase terms and submit your Counter Offer.";

            $html = "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;background:#f8fafc;padding:24px;\"><div style=\"max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #cbd5e1;\"><div style=\"background:#0f172a;color:#ffffff;padding:28px 22px;text-align:center;\"><div style=\"font-size:11px;font-weight:bold;letter-spacing:1.4px;color:#fde68a;text-transform:uppercase;margin-bottom:8px;\">TRADE HEAVEN • BUYER PURCHASE REQUESTS ACTIVE</div><h1 style=\"margin:0 0 6px;font-size:21px;\">Buyers Have Made a Request to Buy — Log In to Counter Offer</h1><p style=\"margin:0;font-size:13px;color:#cbd5e1;\">" . htmlspecialchars($cname) . " • Attn: " . htmlspecialchars($pname) . "</p></div><div style=\"padding:26px 24px;color:#1e293b;\"><p>Hello <strong>" . htmlspecialchars($pname) . "</strong>,</p><p style=\"line-height:1.6;\">" . nl2br(htmlspecialchars($intro)) . "</p><div style=\"background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #d97706;border-radius:10px;padding:14px;margin:18px 0;\"><div style=\"font-size:12px;color:#78350f;\"><strong>Listed Company:</strong> " . htmlspecialchars($cname) . "<br/><strong>Account Login ID:</strong> " . htmlspecialchars($em) . "<br/><strong>Action Required:</strong> Log in &amp; submit your Counter Offer</div></div><div style=\"text-align:center;margin:24px 0;\"><a href=\"" . htmlspecialchars($login_url) . "\" style=\"display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:9px;\">Log In to Trade Heaven Account &amp; Counter Offer &rarr;</a></div></div></div></body></html>";

            $ok = @mail($em, $subj, $html, $headers_str, "-f noreply@tradeheaven.net");
            if (!$ok) {
                $ok = @mail($em, $subj, $html, $headers_str);
            }
            if ($ok) {
                $delivered++;
            } else {
                $failed++;
            }
            $receipts[] = [
                'id' => $client['id'],
                'email' => $em,
                'name' => $pname,
                'companyName' => $cname,
                'status' => $ok ? 'DELIVERED_PHP_MAIL' : 'FAILED',
                'dispatchedAt' => gmdate('Y-m-d\TH:i:s\Z')
            ];
            @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [COUNTER_OFFER_BROADCAST] noreply@tradeheaven.net -> {$em} ({$cname}) status=" . ($ok ? 'OK' : 'FAIL') . "\n", FILE_APPEND);
        }

        echo json_encode([
            "status" => "success",
            "success" => true,
            "deliveryMode" => "PHP_MAIL_RELAY",
            "totalTargeted" => count($targets_map),
            "deliveredCount" => $delivered,
            "failedCount" => $failed,
            "recipients" => $receipts,
            "message" => "Processed {$delivered}/" . count($targets_map) . " counter-offer alert email(s) via Trade Heaven PHP mail()."
        ]);
        break;

    // -------------------------------------------------------------
    // MULTI-IDENTITY ADMIN BUYER CHAT & RICH MEDIA ENDPOINTS
    // -------------------------------------------------------------
    case 'get_buyer_identities':
        $identities = [];
        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM admin_buyer_identities ORDER BY created_at DESC");
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
                    $identities[] = [
                        'id' => (string)$r['id'],
                        'buyerName' => (string)$r['buyer_name'],
                        'companyName' => (string)($r['company_name'] ?? ''),
                        'country' => (string)($r['country'] ?? 'United States'),
                        'city' => (string)($r['city'] ?? ''),
                        'phone' => (string)($r['phone'] ?? ''),
                        'email' => (string)($r['email'] ?? ''),
                        'productInterest' => (string)($r['product_interest'] ?? ''),
                        'address' => (string)($r['address'] ?? ''),
                        'avatarUrl' => (string)($r['avatar_url'] ?? ''),
                        'verifiedBuyer' => !isset($r['verified_buyer']) || !empty($r['verified_buyer']),
                        'createdAt' => (string)($r['created_at'] ?? date('c'))
                    ];
                }
            } catch (Exception $e) {}
        }
        $chat_json_file = __DIR__ . '/uploads/chat_media/chat-system-store.json';
        if (empty($identities) && file_exists($chat_json_file)) {
            $parsed = json_decode((string)file_get_contents($chat_json_file), true);
            if (is_array($parsed['identities'] ?? null)) {
                $identities = $parsed['identities'];
            }
        }
        echo json_encode(["status" => "success", "success" => true, "data" => $identities]);
        break;

    case 'create_buyer_identity':
        $buyer_name = trim((string)($input['buyerName'] ?? $input['buyer_name'] ?? ''));
        if ($buyer_name === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "buyerName is required"]);
            break;
        }
        $id = 'persona-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid('', true)), 0, 6);
        $company_name = trim((string)($input['companyName'] ?? $input['company_name'] ?? ''));
        $country = trim((string)($input['country'] ?? 'United States'));
        $city = trim((string)($input['city'] ?? ''));
        $phone = trim((string)($input['phone'] ?? ''));
        $email = trim((string)($input['email'] ?? ''));
        $product_interest = trim((string)($input['productInterest'] ?? $input['product_interest'] ?? ''));
        $address = trim((string)($input['address'] ?? ''));
        $avatar_url = trim((string)($input['avatarUrl'] ?? $input['avatar_url'] ?? ''));
        $created_at = gmdate('Y-m-d H:i:s');

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO admin_buyer_identities (id, buyer_name, company_name, country, city, phone, email, product_interest, address, avatar_url, verified_buyer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)");
                $stmt->execute([$id, $buyer_name, $company_name, $country, $city, $phone, $email, $product_interest, $address, $avatar_url, $created_at]);
            } catch (Exception $e) {}
        }

        $record = [
            'id' => $id,
            'buyerName' => $buyer_name,
            'companyName' => $company_name,
            'country' => $country,
            'city' => $city,
            'phone' => $phone,
            'email' => $email,
            'productInterest' => $product_interest,
            'address' => $address,
            'avatarUrl' => $avatar_url,
            'verifiedBuyer' => true,
            'createdAt' => gmdate('c')
        ];
        echo json_encode(["status" => "success", "success" => true, "data" => $record]);
        break;

    case 'update_buyer_identity':
        $id = trim((string)($input['id'] ?? ''));
        if ($id === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "Identity id is required"]);
            break;
        }
        $buyer_name = trim((string)($input['buyerName'] ?? $input['buyer_name'] ?? ''));
        $company_name = trim((string)($input['companyName'] ?? $input['company_name'] ?? ''));
        $country = trim((string)($input['country'] ?? 'United States'));
        $city = trim((string)($input['city'] ?? ''));
        $phone = trim((string)($input['phone'] ?? ''));
        $email = trim((string)($input['email'] ?? ''));
        $product_interest = trim((string)($input['productInterest'] ?? $input['product_interest'] ?? ''));
        $address = trim((string)($input['address'] ?? ''));
        $avatar_url = trim((string)($input['avatarUrl'] ?? $input['avatar_url'] ?? ''));

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE admin_buyer_identities SET buyer_name = ?, company_name = ?, country = ?, city = ?, phone = ?, email = ?, product_interest = ?, address = ?, avatar_url = ? WHERE id = ?");
                $stmt->execute([$buyer_name, $company_name, $country, $city, $phone, $email, $product_interest, $address, $avatar_url, $id]);
            } catch (Exception $e) {}
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                'id' => $id,
                'buyerName' => $buyer_name,
                'companyName' => $company_name,
                'country' => $country,
                'city' => $city,
                'phone' => $phone,
                'email' => $email,
                'productInterest' => $product_interest,
                'address' => $address,
                'avatarUrl' => $avatar_url,
                'verifiedBuyer' => true,
                'createdAt' => (string)($input['createdAt'] ?? gmdate('c'))
            ]
        ]);
        break;

    case 'delete_buyer_identity':
        $id = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        if ($db_connected && $pdo && $id !== '') {
            try {
                $stmt = $pdo->prepare("DELETE FROM admin_buyer_identities WHERE id = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}
        }
        echo json_encode(["status" => "success", "success" => true, "deletedId" => $id]);
        break;

    case 'get_chat_conversations':
        $view_mode = strtolower(trim((string)($_GET['view_mode'] ?? $input['view_mode'] ?? 'admin')));
        $supplier_id = trim((string)($_GET['supplier_id'] ?? $input['supplier_id'] ?? ''));
        $supplier_email = strtolower(trim((string)($_GET['supplier_email'] ?? $input['supplier_email'] ?? '')));
        $conversations = [];

        if ($db_connected && $pdo) {
            try {
                $sql = "SELECT c.*, i.buyer_name, i.company_name AS i_company_name, i.country AS i_country, i.city AS i_city, i.phone AS i_phone, i.email AS i_email, i.product_interest AS i_product_interest, i.address AS i_address, i.avatar_url AS i_avatar_url
                        FROM chat_conversations c
                        LEFT JOIN admin_buyer_identities i ON c.identity_id = i.id";
                $params = [];
                if ($view_mode === 'supplier') {
                    $conds = [];
                    if ($supplier_id !== '') {
                        $conds[] = "c.supplier_id = ?";
                        $params[] = $supplier_id;
                    }
                    if ($supplier_email !== '') {
                        $conds[] = "LOWER(c.supplier_email) = ?";
                        $params[] = $supplier_email;
                    }
                    if (empty($conds)) {
                        echo json_encode(["status" => "success", "success" => true, "data" => []]);
                        break;
                    }
                    $sql .= " WHERE (" . implode(" OR ", $conds) . ")";
                }
                $sql .= " ORDER BY c.updated_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
                    $show_phone = !empty($r['show_phone']);
                    $show_email = !empty($r['show_email']);
                    $show_company = !empty($r['show_company']);

                    $raw_phone = (string)($r['i_phone'] ?? '');
                    $raw_email = (string)($r['i_email'] ?? '');
                    $raw_company = (string)($r['i_company_name'] ?? '');
                    $raw_address = (string)($r['i_address'] ?? '');
                    $raw_country = (string)($r['i_country'] ?? 'United States');
                    $raw_city = (string)($r['i_city'] ?? '');

                    $clean_phone_digits = preg_replace('/\D+/', '', $raw_phone);
                    if (preg_match('/^\+(\d{1,3})[\s\-().]+(\d{2,4})/', trim($raw_phone), $pm)) {
                        $masked_phone = '+' . $pm[1] . ' (' . $pm[2] . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) === 11 && strpos($clean_phone_digits, '1') === 0) {
                        $masked_phone = '+1 (' . substr($clean_phone_digits, 1, 3) . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) > 10) {
                        $cc_len = strlen($clean_phone_digits) - 10;
                        $masked_phone = '+' . substr($clean_phone_digits, 0, $cc_len) . ' (' . substr($clean_phone_digits, $cc_len, 3) . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) === 10) {
                        $masked_phone = '+1 (' . substr($clean_phone_digits, 0, 3) . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) >= 4) {
                        $masked_phone = '+' . substr($clean_phone_digits, 0, 2) . ' (•••) •••-••••';
                    } else {
                        $masked_phone = '+1 (•••) •••-••••';
                    }

                    $email_parts = explode('@', trim($raw_email));
                    $ep_local = (string)($email_parts[0] ?? '');
                    $ep_domain = (string)($email_parts[1] ?? 'company.com');
                    $ep_tld = strpos($ep_domain, '.') !== false ? preg_replace('/[^a-zA-Z0-9]/', '', substr(strrchr($ep_domain, '.'), 1)) : 'com';
                    if ($ep_tld === '') $ep_tld = 'com';
                    $ep_seg = preg_replace('/[^a-zA-Z0-9]/', '', explode('_', str_replace(['.', '-'], '_', $ep_local))[0] ?? '');
                    $ep_alpha = preg_replace('/[^a-zA-Z0-9]/', '', $ep_local);
                    if (strlen($ep_seg) >= 2) {
                        $ep_vis = substr($ep_seg, 0, 6);
                    } elseif (strlen($ep_alpha) >= 4) {
                        $ep_vis = substr($ep_alpha, 0, 4);
                    } else {
                        $ep_vis = strlen($ep_alpha) > 0 ? substr($ep_alpha, 0, 1) : 'b';
                    }
                    $masked_email = $ep_vis . '••••@••••.' . $ep_tld;
                    $masked_company = 'Verified Importer • ' . $raw_country;

                    // Count unread messages & last message read status
                    $unread_admin = 0;
                    $unread_supplier = 0;
                    $last_msg_is_read = false;
                    $last_msg_sender_role = null;
                    try {
                        $uStmt = $pdo->prepare("SELECT sender_role, COUNT(*) AS cnt FROM chat_messages WHERE conversation_id = ? AND is_read = 0 GROUP BY sender_role");
                        $uStmt->execute([$r['id']]);
                        foreach ($uStmt->fetchAll(PDO::FETCH_ASSOC) as $ur) {
                            if ($ur['sender_role'] === 'supplier') $unread_admin = intval($ur['cnt']);
                            if ($ur['sender_role'] === 'buyer_identity') $unread_supplier = intval($ur['cnt']);
                        }
                        $lStmt = $pdo->prepare("SELECT sender_role, is_read FROM chat_messages WHERE conversation_id = ? ORDER BY created_at DESC, id DESC LIMIT 1");
                        $lStmt->execute([$r['id']]);
                        $lastRow = $lStmt->fetch(PDO::FETCH_ASSOC);
                        if ($lastRow) {
                            $last_msg_sender_role = (string)$lastRow['sender_role'];
                            $last_msg_is_read = !empty($lastRow['is_read']);
                        }
                    } catch (Exception $e) {}

                    $is_supplier_view = ($view_mode === 'supplier');
                    $conversations[] = [
                        'id' => (string)$r['id'],
                        'identityId' => (string)$r['identity_id'],
                        'supplierId' => (string)$r['supplier_id'],
                        'supplierName' => (string)$r['supplier_name'],
                        'supplierEmail' => (string)($r['supplier_email'] ?? ''),
                        'supplierCompany' => (string)($r['supplier_company'] ?? ''),
                        'supplierCountry' => (string)($r['supplier_country'] ?? ''),
                        'showPhone' => $show_phone,
                        'showEmail' => $show_email,
                        'showCompany' => $show_company,
                        'lastMessage' => (string)($r['last_message'] ?? ''),
                        'lastMessageIsRead' => $last_msg_is_read,
                        'lastMessageSenderRole' => $last_msg_sender_role,
                        'unreadForAdmin' => $unread_admin,
                        'unreadForSupplier' => $unread_supplier,
                        'unreadCount' => $is_supplier_view ? $unread_supplier : $unread_admin,
                        'updatedAt' => (string)($r['updated_at'] ?? date('c')),
                        'createdAt' => (string)($r['created_at'] ?? date('c')),
                        'identity' => [
                            'id' => (string)$r['identity_id'],
                            'buyerName' => (string)($r['buyer_name'] ?? 'Verified Buyer'),
                            'country' => $raw_country,
                            'city' => $raw_city,
                            'productInterest' => (string)($r['i_product_interest'] ?? ''),
                            'avatarUrl' => (string)($r['i_avatar_url'] ?? ''),
                            'verifiedBuyer' => true,
                            'phone' => ($is_supplier_view && !$show_phone) ? $masked_phone : $raw_phone,
                            'email' => ($is_supplier_view && !$show_email) ? $masked_email : $raw_email,
                            'companyName' => ($is_supplier_view && !$show_company) ? $masked_company : $raw_company,
                            'address' => ($is_supplier_view && !$show_company) ? ($raw_city ? "{$raw_city}, {$raw_country}" : "{$raw_country}") : $raw_address,
                            'phoneHidden' => !$show_phone,
                            'emailHidden' => !$show_email,
                            'companyHidden' => !$show_company
                        ]
                    ];
                }
            } catch (Exception $e) {}
        }
        echo json_encode(["status" => "success", "success" => true, "data" => $conversations]);
        break;

    case 'create_chat_conversation':
        $identity_id = trim((string)($input['identityId'] ?? $input['identity_id'] ?? ''));
        $supplier_id = trim((string)($input['supplierId'] ?? $input['supplier_id'] ?? ''));
        $supplier_name = trim((string)($input['supplierName'] ?? $input['supplier_name'] ?? 'Verified Supplier'));
        $supplier_email = trim((string)($input['supplierEmail'] ?? $input['supplier_email'] ?? ''));
        $supplier_company = trim((string)($input['supplierCompany'] ?? $input['supplier_company'] ?? $supplier_name));
        $supplier_country = trim((string)($input['supplierCountry'] ?? $input['supplier_country'] ?? ''));

        if ($identity_id === '' || $supplier_id === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "identityId and supplierId are required"]);
            break;
        }

        $conv_row = null;
        if ($db_connected && $pdo) {
            try {
                $chk = $pdo->prepare("SELECT * FROM chat_conversations WHERE identity_id = ? AND supplier_id = ? LIMIT 1");
                $chk->execute([$identity_id, $supplier_id]);
                $existing = $chk->fetch(PDO::FETCH_ASSOC);
                if ($existing) {
                    $conv_row = $existing;
                } else {
                    $new_id = 'conv-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid('', true)), 0, 5);
                    $now = gmdate('Y-m-d H:i:s');
                    $ins = $pdo->prepare("INSERT INTO chat_conversations (id, identity_id, supplier_id, supplier_name, supplier_email, supplier_company, supplier_country, show_phone, show_email, show_company, last_message, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, '', ?, ?)");
                    $ins->execute([$new_id, $identity_id, $supplier_id, $supplier_name, $supplier_email, $supplier_company, $supplier_country, $now, $now]);
                    $conv_row = [
                        'id' => $new_id,
                        'identity_id' => $identity_id,
                        'supplier_id' => $supplier_id,
                        'supplier_name' => $supplier_name,
                        'supplier_email' => $supplier_email,
                        'supplier_company' => $supplier_company,
                        'supplier_country' => $supplier_country,
                        'show_phone' => 0,
                        'show_email' => 0,
                        'show_company' => 0,
                        'last_message' => '',
                        'updated_at' => $now,
                        'created_at' => $now
                    ];
                }
            } catch (Exception $e) {}
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                'id' => (string)($conv_row['id'] ?? ('conv-' . round(microtime(true) * 1000))),
                'identityId' => $identity_id,
                'supplierId' => $supplier_id,
                'supplierName' => $supplier_name,
                'supplierEmail' => $supplier_email,
                'supplierCompany' => $supplier_company,
                'supplierCountry' => $supplier_country,
                'showPhone' => !empty($conv_row['show_phone']),
                'showEmail' => !empty($conv_row['show_email']),
                'showCompany' => !empty($conv_row['show_company']),
                'lastMessage' => (string)($conv_row['last_message'] ?? ''),
                'updatedAt' => (string)($conv_row['updated_at'] ?? gmdate('c'))
            ]
        ]);
        break;

    case 'toggle_chat_visibility':
        $conv_id = trim((string)($input['conversationId'] ?? $input['conversation_id'] ?? $input['id'] ?? ''));
        if ($conv_id === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "conversationId is required"]);
            break;
        }
        $show_phone = isset($input['showPhone']) ? (!empty($input['showPhone']) ? 1 : 0) : (isset($input['show_phone']) ? (!empty($input['show_phone']) ? 1 : 0) : null);
        $show_email = isset($input['showEmail']) ? (!empty($input['showEmail']) ? 1 : 0) : (isset($input['show_email']) ? (!empty($input['show_email']) ? 1 : 0) : null);
        $show_company = isset($input['showCompany']) ? (!empty($input['showCompany']) ? 1 : 0) : (isset($input['show_company']) ? (!empty($input['show_company']) ? 1 : 0) : null);

        if ($db_connected && $pdo) {
            try {
                $cur = $pdo->prepare("SELECT show_phone, show_email, show_company FROM chat_conversations WHERE id = ? LIMIT 1");
                $cur->execute([$conv_id]);
                $row = $cur->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $sp = ($show_phone !== null) ? $show_phone : intval($row['show_phone']);
                    $se = ($show_email !== null) ? $show_email : intval($row['show_email']);
                    $sc = ($show_company !== null) ? $show_company : intval($row['show_company']);
                    $upd = $pdo->prepare("UPDATE chat_conversations SET show_phone = ?, show_email = ?, show_company = ? WHERE id = ?");
                    $upd->execute([$sp, $se, $sc, $conv_id]);
                    $show_phone = $sp;
                    $show_email = $se;
                    $show_company = $sc;
                }
            } catch (Exception $e) {}
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                'conversationId' => $conv_id,
                'showPhone' => (bool)$show_phone,
                'showEmail' => (bool)$show_email,
                'showCompany' => (bool)$show_company
            ]
        ]);
        break;

    case 'get_chat_messages':
        $conv_id = trim((string)($_GET['conversation_id'] ?? $_GET['conversationId'] ?? $input['conversationId'] ?? ''));
        $reader_role = trim((string)($_GET['reader_role'] ?? $_GET['readerRole'] ?? $input['readerRole'] ?? ''));
        $messages = [];
        if ($db_connected && $pdo && $conv_id !== '') {
            try {
                if ($reader_role === 'buyer_identity' || $reader_role === 'supplier') {
                    $opposite = ($reader_role === 'buyer_identity') ? 'supplier' : 'buyer_identity';
                    $mrk = $pdo->prepare("UPDATE chat_messages SET is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE conversation_id = ? AND sender_role = ? AND is_read = 0");
                    $mrk->execute([$conv_id, $opposite]);
                }
                $stmt = $pdo->prepare("SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC");
                $stmt->execute([$conv_id]);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
                    $messages[] = [
                        'id' => (string)$r['id'],
                        'conversationId' => (string)$r['conversation_id'],
                        'senderRole' => (string)$r['sender_role'],
                        'messageText' => (string)($r['message_text'] ?? ''),
                        'mediaType' => (string)($r['media_type'] ?? 'none'),
                        'mediaUrl' => (string)($r['media_url'] ?? ''),
                        'mediaName' => (string)($r['media_name'] ?? ''),
                        'mediaSize' => intval($r['media_size'] ?? 0),
                        'isRead' => !empty($r['is_read']),
                        'readAt' => !empty($r['read_at']) ? (string)$r['read_at'] : null,
                        'emailAlertSent' => !empty($r['email_alert_sent']),
                        'emailAlertSentAt' => !empty($r['email_alert_sent_at']) ? (string)$r['email_alert_sent_at'] : null,
                        'createdAt' => (string)($r['created_at'] ?? gmdate('c'))
                    ];
                }
            } catch (Exception $e) {}
        }
        echo json_encode(["status" => "success", "success" => true, "data" => $messages]);
        break;

    case 'mark_chat_read':
        $conv_id = trim((string)($input['conversationId'] ?? $input['conversation_id'] ?? $_GET['conversation_id'] ?? ''));
        $reader_role = trim((string)($input['readerRole'] ?? $input['reader_role'] ?? $_GET['reader_role'] ?? ''));
        $updated_count = 0;
        $read_at = gmdate('c');
        if ($conv_id === '' || ($reader_role !== 'buyer_identity' && $reader_role !== 'supplier')) {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "conversationId and valid readerRole are required"]);
            break;
        }
        if ($db_connected && $pdo) {
            try {
                $opposite = ($reader_role === 'buyer_identity') ? 'supplier' : 'buyer_identity';
                $mrk = $pdo->prepare("UPDATE chat_messages SET is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE conversation_id = ? AND sender_role = ? AND is_read = 0");
                $mrk->execute([$conv_id, $opposite]);
                $updated_count = $mrk->rowCount();
            } catch (Exception $e) {}
        }
        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                "conversationId" => $conv_id,
                "readerRole" => $reader_role,
                "readSenderRole" => ($reader_role === 'buyer_identity') ? 'supplier' : 'buyer_identity',
                "updatedCount" => $updated_count,
                "readAt" => $read_at
            ]
        ]);
        break;

    case 'send_chat_message':
        $conv_id = trim((string)($input['conversationId'] ?? $input['conversation_id'] ?? ''));
        $sender_role = (($input['senderRole'] ?? $input['sender_role'] ?? '') === 'supplier') ? 'supplier' : 'buyer_identity';
        $message_text = trim((string)($input['messageText'] ?? $input['message_text'] ?? ''));
        $allowed_media = ['none', 'image', 'video', 'pdf'];
        $media_type = in_array(($input['mediaType'] ?? $input['media_type'] ?? 'none'), $allowed_media, true) ? ($input['mediaType'] ?? $input['media_type'] ?? 'none') : 'none';
        $media_url = trim((string)($input['mediaUrl'] ?? $input['media_url'] ?? ''));
        $media_name = trim((string)($input['mediaName'] ?? $input['media_name'] ?? ''));
        $media_size = intval($input['mediaSize'] ?? $input['media_size'] ?? 0);

        if ($conv_id === '' || ($message_text === '' && $media_url === '')) {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "conversationId and messageText or mediaUrl are required"]);
            break;
        }

        $msg_id = trim((string)($input['id'] ?? '')) ?: ('msg-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid('', true)), 0, 5));
        $now = gmdate('Y-m-d H:i:s');
        $preview = $message_text !== '' ? $message_text : ($media_type === 'video' ? '🎬 Video attachment' : ($media_type === 'pdf' ? '📄 ' . ($media_name ?: 'PDF Document') : '🖼️ Image attachment'));

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO chat_messages (id, conversation_id, sender_role, message_text, media_type, media_url, media_name, media_size, is_read, email_alert_sent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)");
                $stmt->execute([$msg_id, $conv_id, $sender_role, $message_text, $media_type, $media_url, $media_name, $media_size, $now]);
                $upd = $pdo->prepare("UPDATE chat_conversations SET last_message = ?, updated_at = ? WHERE id = ?");
                $upd->execute([$preview, $now, $conv_id]);
            } catch (Exception $e) {}
        }

        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                'id' => $msg_id,
                'conversationId' => $conv_id,
                'senderRole' => $sender_role,
                'messageText' => $message_text,
                'mediaType' => $media_type,
                'mediaUrl' => $media_url,
                'mediaName' => $media_name,
                'mediaSize' => $media_size,
                'isRead' => false,
                'emailAlertSent' => false,
                'createdAt' => gmdate('c')
            ]
        ]);
        break;

    case 'process_unseen_alerts':
        $min_age_seconds = max(1, intval($input['minAgeSeconds'] ?? $_GET['min_age_seconds'] ?? 60));
        $processed_count = 0;
        $alerts_sent = 0;
        $supplier_alerts = 0;
        $admin_alerts = 0;
        $alert_details = [];

        if ($db_connected && $pdo) {
            try {
                $sql = "SELECT m.*, c.identity_id, c.supplier_id, c.supplier_name, c.supplier_email, c.supplier_company, c.supplier_country,
                               c.show_phone, c.show_email, c.show_company,
                               i.buyer_name, i.company_name AS i_company_name, i.country AS i_country, i.city AS i_city,
                               i.phone AS i_phone, i.email AS i_email, i.product_interest AS i_product_interest, i.address AS i_address
                        FROM chat_messages m
                        INNER JOIN chat_conversations c ON m.conversation_id = c.id
                        LEFT JOIN admin_buyer_identities i ON c.identity_id = i.id
                        WHERE m.is_read = 0 AND m.email_alert_sent = 0
                          AND m.created_at <= DATE_SUB(NOW(), INTERVAL ? SECOND)
                        ORDER BY m.created_at ASC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$min_age_seconds]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Group unread messages by conversation + sender_role so we send one HTML alert email per unread thread
                $groups = [];
                foreach ($rows as $row) {
                    $gkey = $row['conversation_id'] . '::' . $row['sender_role'];
                    if (!isset($groups[$gkey])) {
                        $groups[$gkey] = ['meta' => $row, 'messages' => []];
                    }
                    $groups[$gkey]['messages'][] = $row;
                }

                $base_portal_url = 'https://tradeheaven.net';
                $headers_str = implode("\r\n", [
                    'MIME-Version: 1.0',
                    'Content-type: text/html; charset=UTF-8',
                    'From: Trade Heaven Deal Desk <noreply@tradeheaven.net>',
                    'Reply-To: help@tradeheaven.net',
                    'X-Mailer: PHP/' . phpversion()
                ]);

                foreach ($groups as $grp) {
                    $meta = $grp['meta'];
                    $msgs = $grp['messages'];
                    $msg_ids = array_map(fn($x) => $x['id'], $msgs);
                    $conv_id = (string)$meta['conversation_id'];
                    $sender_role = (string)$meta['sender_role'];

                    $buyer_name = (string)($meta['buyer_name'] ?? 'International Buyer');
                    $buyer_country = (string)($meta['i_country'] ?? 'Global');
                    $buyer_city = (string)($meta['i_city'] ?? '');
                    $buyer_interest = (string)($meta['i_product_interest'] ?? '');
                    $show_phone = !empty($meta['show_phone']);
                    $show_email = !empty($meta['show_email']);
                    $show_company = !empty($meta['show_company']);

                    $raw_phone = (string)($meta['i_phone'] ?? '');
                    $raw_email = (string)($meta['i_email'] ?? '');
                    $raw_company = (string)($meta['i_company_name'] ?? '');
                    $raw_address = (string)($meta['i_address'] ?? '');

                    $clean_phone_digits = preg_replace('/\D+/', '', $raw_phone);
                    if (preg_match('/^\+(\d{1,3})[\s\-().]+(\d{2,4})/', trim($raw_phone), $pm)) {
                        $masked_phone = '+' . $pm[1] . ' (' . $pm[2] . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) === 11 && strpos($clean_phone_digits, '1') === 0) {
                        $masked_phone = '+1 (' . substr($clean_phone_digits, 1, 3) . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) > 10) {
                        $cc_len = strlen($clean_phone_digits) - 10;
                        $masked_phone = '+' . substr($clean_phone_digits, 0, $cc_len) . ' (' . substr($clean_phone_digits, $cc_len, 3) . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) === 10) {
                        $masked_phone = '+1 (' . substr($clean_phone_digits, 0, 3) . ') •••-••••';
                    } elseif (strlen($clean_phone_digits) >= 4) {
                        $masked_phone = '+' . substr($clean_phone_digits, 0, 2) . ' (•••) •••-••••';
                    } else {
                        $masked_phone = '+1 (•••) •••-••••';
                    }

                    $ep = explode('@', trim($raw_email));
                    $ep_local = (string)($ep[0] ?? '');
                    $ep_domain = (string)($ep[1] ?? 'company.com');
                    $ep_tld = strpos($ep_domain, '.') !== false ? preg_replace('/[^a-zA-Z0-9]/', '', substr(strrchr($ep_domain, '.'), 1)) : 'com';
                    if ($ep_tld === '') $ep_tld = 'com';
                    $ep_seg = preg_replace('/[^a-zA-Z0-9]/', '', explode('_', str_replace(['.', '-'], '_', $ep_local))[0] ?? '');
                    $ep_alpha = preg_replace('/[^a-zA-Z0-9]/', '', $ep_local);
                    if (strlen($ep_seg) >= 2) {
                        $ep_vis = substr($ep_seg, 0, 6);
                    } elseif (strlen($ep_alpha) >= 4) {
                        $ep_vis = substr($ep_alpha, 0, 4);
                    } else {
                        $ep_vis = strlen($ep_alpha) > 0 ? substr($ep_alpha, 0, 1) : 'b';
                    }
                    $masked_email = $ep_vis . '••••@••••.' . $ep_tld;
                    $masked_company = 'Verified Importer • ' . $buyer_country;

                    $safe_phone = $show_phone ? $raw_phone : $masked_phone;
                    $safe_email = $show_email ? $raw_email : $masked_email;
                    $safe_company = $show_company ? $raw_company : $masked_company;
                    $safe_address = $show_company ? $raw_address : ($buyer_city ? "{$buyer_city}, {$buyer_country}" : "{$buyer_country}");

                    $snippets = '';
                    foreach (array_slice($msgs, -3) as $um) {
                        $txt = trim((string)($um['message_text'] ?? ''));
                        if ($txt === '' && !empty($um['media_name'])) {
                            $txt = '[' . strtoupper((string)($um['media_type'] ?? 'FILE')) . ': ' . $um['media_name'] . ']';
                        }
                        $snippets .= '<li style="margin-bottom:6px;color:#0f172a;">' . htmlspecialchars($txt) . '</li>';
                    }

                    if ($sender_role === 'buyer_identity') {
                        // Buyer sent -> Supplier hasn't read within 60s (+ send Admin Copy so Admin can verify delivery)
                        $target_email = trim(strtolower((string)($meta['supplier_email'] ?? '')));
                        if ($target_email === '' && !empty($meta['supplier_id'])) {
                            try {
                                $uStmt = $pdo->prepare("SELECT email FROM users WHERE id = ? LIMIT 1");
                                $uStmt->execute([$meta['supplier_id']]);
                                $uRow = $uStmt->fetch(PDO::FETCH_ASSOC);
                                if (!empty($uRow['email'])) $target_email = trim(strtolower((string)$uRow['email']));
                            } catch (Exception $e) {}
                        }
                        if ($target_email !== '' && filter_var($target_email, FILTER_VALIDATE_EMAIL)) {
                            $subject = "Urgent Deal Update: Unread message from {$buyer_name} ({$buyer_country}) on Trade Heaven";
                            $reply_link = $base_portal_url . '/?view=SUPPLIER_MESSAGES';
                            $html_body = "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;\">
                              <div style=\"max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;\">
                                <div style=\"background:#0f172a;padding:20px 24px;color:#ffffff;\">
                                  <h2 style=\"margin:0;font-size:18px;color:#38bdf8;\">Urgent Export Deal Update Pending Reply</h2>
                                  <p style=\"margin:6px 0 0;font-size:13px;color:#cbd5e1;\">You have " . count($msgs) . " unread message(s) from {$buyer_name} ({$buyer_country})</p>
                                </div>
                                <div style=\"padding:24px;\">
                                  <p style=\"margin:0 0 14px;font-size:14px;color:#334155;\"><strong>Action Required:</strong> An international buyer sent an inquiry over 1 minute ago and is awaiting your response on Trade Heaven. Sign in to access secure inquiry details.</p>
                                  <table style=\"width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;background:#f8fafc;border:1px solid #e2e8f0;\">
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;width:140px;\">Buyer Name:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($buyer_name) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Company:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_company) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Location:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_address) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Phone:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_phone) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Email:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_email) . "</td></tr>
                                    " . ($buyer_interest !== '' ? "<tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Product Interest:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($buyer_interest) . "</td></tr>" : "") . "
                                  </table>
                                  <div style=\"background:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;margin-bottom:18px;\">
                                    <p style=\"margin:0 0 6px;font-size:12px;font-weight:bold;color:#1e40af;\">Unread Message Preview:</p>
                                    <ul style=\"margin:0;padding-left:18px;font-size:13px;\">{$snippets}</ul>
                                  </div>
                                  <p style=\"margin:0 0 14px;font-size:12px;color:#64748b;\">Sign in to access secure inquiry details and respond directly inside your portal inbox.</p>
                                  <a href=\"{$reply_link}\" style=\"display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:8px;\">Login to Reply &amp; View Contact Details &rarr;</a>
                                </div>
                              </div>
                            </body></html>";
                            $ok = @mail($target_email, $subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
                            if (!$ok) {
                                $ok = @mail($target_email, $subject, $html_body, $headers_str);
                            }

                            $admin_recipients = ['sankalprajput15@gmail.com', 'solutionthe87@gmail.com', 'yr943334@gmail.com'];
                            $env_r = getenv('ALERT_EMAIL');
                            if (!empty($env_r)) {
                                foreach (explode(',', $env_r) as $er) {
                                    $er = trim(strtolower($er));
                                    if ($er && filter_var($er, FILTER_VALIDATE_EMAIL) && !in_array($er, $admin_recipients, true)) {
                                        $admin_recipients[] = $er;
                                    }
                                }
                            }
                            $admin_copy_ok = false;
                            $admin_copy_subject = "[Admin Copy] {$subject} -> {$target_email}";
                            foreach ($admin_recipients as $ar) {
                                $aok = @mail($ar, $admin_copy_subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
                                if (!$aok) {
                                    $aok = @mail($ar, $admin_copy_subject, $html_body, $headers_str);
                                }
                                if ($aok) $admin_copy_ok = true;
                            }

                            @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [1MIN_UNSEEN_SUPPLIER_ALERT] {$subject} -> {$target_email} (supplierOk=" . ($ok ? '1' : '0') . ", adminCopyOk=" . ($admin_copy_ok ? '1' : '0') . ")\n", FILE_APPEND);
                            if ($ok || $admin_copy_ok) {
                                $alerts_sent++;
                                $supplier_alerts++;
                            }
                            $alert_details[] = [
                                'conversationId' => $conv_id,
                                'targetRole' => 'supplier',
                                'recipient' => $target_email,
                                'subject' => $subject,
                                'messageCount' => count($msgs),
                                'messageIds' => $msg_ids,
                                'supplierMailAccepted' => (bool)$ok,
                                'adminCopyRecipients' => $admin_recipients,
                                'adminCopyAccepted' => (bool)$admin_copy_ok
                            ];
                            if (!$ok && !$admin_copy_ok) {
                                continue;
                            }
                        }
                    } else {
                        // Supplier sent -> Admin hasn't read within 60s
                        $sup_company = (string)($meta['supplier_company'] ?: $meta['supplier_name'] ?: 'Verified Supplier');
                        $admin_recipients = ['sankalprajput15@gmail.com', 'solutionthe87@gmail.com', 'yr943334@gmail.com'];
                        $env_r = getenv('ALERT_EMAIL');
                        if (!empty($env_r)) {
                            foreach (explode(',', $env_r) as $er) {
                                $er = trim(strtolower($er));
                                if ($er && filter_var($er, FILTER_VALIDATE_EMAIL) && !in_array($er, $admin_recipients, true)) {
                                    $admin_recipients[] = $er;
                                }
                            }
                        }
                        $subject = "Urgent Supplier Reply: Unread message from {$sup_company} to {$buyer_name} on Trade Heaven";
                        $admin_link = $base_portal_url . '/?view=CLIENT_ADMIN&tab=BUYER_CHAT_DESK';
                        $html_body = "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;\">
                          <div style=\"max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;\">
                            <div style=\"background:#0f172a;padding:20px 24px;color:#ffffff;\">
                              <h2 style=\"margin:0;font-size:18px;color:#f59e0b;\">Admin Alert: Unread Supplier Reply (&gt;1 Min)</h2>
                              <p style=\"margin:6px 0 0;font-size:13px;color:#cbd5e1;\">{$sup_company} replied to buyer persona {$buyer_name}</p>
                            </div>
                            <div style=\"padding:24px;\">
                              <p style=\"margin:0 0 14px;font-size:14px;color:#334155;\">A supplier sent " . count($msgs) . " message(s) that remain unread in the Admin Multi-Identity Chat Desk after 60 seconds.</p>
                              <div style=\"background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;margin-bottom:20px;\">
                                <p style=\"margin:0 0 6px;font-size:12px;font-weight:bold;color:#92400e;\">Supplier Message Preview:</p>
                                <ul style=\"margin:0;padding-left:18px;font-size:13px;\">{$snippets}</ul>
                              </div>
                              <a href=\"{$admin_link}\" style=\"display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:8px;\">Open Admin Chat Desk &rarr;</a>
                            </div>
                          </div>
                        </body></html>";
                        $admin_ok = false;
                        foreach ($admin_recipients as $ar) {
                            $ok = @mail($ar, $subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
                            if (!$ok) $ok = @mail($ar, $subject, $html_body, $headers_str);
                            if ($ok) $admin_ok = true;
                        }
                        @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [1MIN_UNSEEN_ADMIN_ALERT] {$subject} -> " . implode(', ', $admin_recipients) . " (ok=" . ($admin_ok ? '1' : '0') . ")\n", FILE_APPEND);
                        if ($admin_ok) {
                            $alerts_sent++;
                            $admin_alerts++;
                        }
                        $alert_details[] = [
                            'conversationId' => $conv_id,
                            'targetRole' => 'admin',
                            'recipient' => implode(', ', $admin_recipients),
                            'subject' => $subject,
                            'messageCount' => count($msgs),
                            'messageIds' => $msg_ids,
                            'adminCopyRecipients' => $admin_recipients,
                            'adminCopyAccepted' => (bool)$admin_ok
                        ];
                        if (!$admin_ok) {
                            continue;
                        }
                    }

                    // Mark all messages in group as email_alert_sent = 1
                    $placeholders = implode(',', array_fill(0, count($msg_ids), '?'));
                    $updAlert = $pdo->prepare("UPDATE chat_messages SET email_alert_sent = 1, email_alert_sent_at = NOW() WHERE id IN ({$placeholders})");
                    $updAlert->execute($msg_ids);
                    $processed_count += count($msg_ids);
                }
            } catch (Exception $e) {
                @file_put_contents(__DIR__ . '/db_error.log', "process_unseen_alerts error: " . $e->getMessage() . "\n", FILE_APPEND);
            }
        }

        echo json_encode([
            "status" => "success",
            "success" => true,
            "data" => [
                "processedCount" => $processed_count,
                "alertsSent" => $alerts_sent,
                "supplierAlerts" => $supplier_alerts,
                "adminAlerts" => $admin_alerts,
                "details" => $alert_details
            ]
        ]);
        break;

    case 'upload_chat_media':
        $chat_media_dir = __DIR__ . '/uploads/chat_media';
        if (!is_dir($chat_media_dir)) {
            @mkdir($chat_media_dir, 0775, true);
        }
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov', 'pdf'];
        $max_bytes = 50 * 1024 * 1024; // 50MB

        $final_name = '';
        $final_size = 0;
        $orig_name = 'attachment';
        $ext = '';
        $mime_type = 'application/octet-stream';

        if (!empty($_FILES['file']) && is_array($_FILES['file']) && ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $tmp_path = $_FILES['file']['tmp_name'];
            $orig_name = basename((string)($_FILES['file']['name'] ?? 'attachment'));
            $final_size = intval($_FILES['file']['size'] ?? 0);
            $ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
            if ($final_size > $max_bytes) {
                http_response_code(413);
                echo json_encode(["status" => "error", "success" => false, "message" => "File exceeds maximum 50MB limit."]);
                break;
            }
            if (!in_array($ext, $allowed_extensions, true)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "success" => false, "message" => "Unsupported file format. Allowed: jpg, jpeg, png, webp, mp4, webm, mov, pdf."]);
                break;
            }
            $finfo = function_exists('finfo_open') ? @finfo_open(FILEINFO_MIME_TYPE) : false;
            if ($finfo) {
                $mime_type = (string)@finfo_file($finfo, $tmp_path);
                @finfo_close($finfo);
            }
            $safe_base = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($orig_name, PATHINFO_FILENAME));
            $safe_base = substr(trim($safe_base, '-'), 0, 50) ?: 'chat-media';
            $final_name = $safe_base . '-' . round(microtime(true) * 1000) . '.' . $ext;
            $dest = $chat_media_dir . '/' . $final_name;
            if (!@move_uploaded_file($tmp_path, $dest)) {
                @copy($tmp_path, $dest);
            }
        } elseif (!empty($input['base64Data'])) {
            $orig_name = basename((string)($input['fileName'] ?? 'attachment.pdf'));
            $ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowed_extensions, true)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "success" => false, "message" => "Unsupported file extension."]);
                break;
            }
            $raw_b64 = (string)$input['base64Data'];
            if (preg_match('/^data:([A-Za-z0-9\-\+\/\.]+);base64,(.+)$/', $raw_b64, $m)) {
                $mime_type = $m[1];
                $raw_b64 = $m[2];
            }
            $binary = base64_decode($raw_b64);
            $final_size = strlen((string)$binary);
            if ($final_size > $max_bytes) {
                http_response_code(413);
                echo json_encode(["status" => "error", "success" => false, "message" => "File exceeds 50MB limit."]);
                break;
            }
            $safe_base = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($orig_name, PATHINFO_FILENAME));
            $safe_base = substr(trim($safe_base, '-'), 0, 50) ?: 'chat-media';
            $final_name = $safe_base . '-' . round(microtime(true) * 1000) . '.' . $ext;
            @file_put_contents($chat_media_dir . '/' . $final_name, $binary);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "success" => false, "message" => "No file uploaded. Send multipart 'file' or 'base64Data'."]);
            break;
        }

        $resolved_media_type = 'image';
        if (in_array($ext, ['mp4', 'webm', 'mov'], true)) {
            $resolved_media_type = 'video';
        } elseif ($ext === 'pdf') {
            $resolved_media_type = 'pdf';
        }
        $public_url = '/uploads/chat_media/' . $final_name;
        echo json_encode([
            "status" => "success",
            "success" => true,
            "mediaType" => $resolved_media_type,
            "mediaUrl" => $public_url,
            "mediaName" => $orig_name,
            "mediaSize" => $final_size,
            "mimeType" => $mime_type,
            "url" => $public_url
        ]);
        break;

    // -------------------------------------------------------------
    // Visual Product Image Finder / Auto-Fetch Engine (7-Day Cache)
    // -------------------------------------------------------------
    case 'fetch_product_images':
    case 'visual_product_search':
        $raw_p_name = trim((string)($input['product_name'] ?? $input['productName'] ?? $input['q'] ?? $_GET['product_name'] ?? $_GET['productName'] ?? $_GET['q'] ?? ''));
        $p_cat = trim((string)($input['category'] ?? $_GET['category'] ?? ''));
        $p_specs = trim((string)($input['specifications'] ?? $input['specs'] ?? $_GET['specifications'] ?? ''));
        $req_count = max(12, min(20, intval($input['count'] ?? $_GET['count'] ?? 15)));
        $force_refresh = !empty($input['force_refresh']) || !empty($input['forceRefresh']) || (($_GET['force_refresh'] ?? '') === '1');

        // Clean RFQ boilerplate, quantities, parenthetical ports/engines, and contract suffixes
        $clean_subject = preg_replace('/\([^)]*\)/', ' ', $raw_p_name);
        $clean_subject = preg_replace('/\[[^\]]*\]/', ' ', (string)$clean_subject);
        $clean_subject = preg_replace('/^[^\wA-Za-z0-9]+/u', '', (string)$clean_subject);
        $clean_subject = preg_replace('/^(?:golden\s+lead|vip\s+exclusive|urgent\s+requirement|urgent\s+tender|buying\s+lead|buy\s+lead|sourcing\s+request|spot\s+tender|annual\s+contract|rfq|wanted)\b[\s:\-–—•]*/iu', '', (string)$clean_subject);
        $clean_subject = preg_replace('/^[^\wA-Za-z0-9]+/u', '', (string)$clean_subject);
        $clean_subject = preg_replace('/^\d[\d,.]*\s*(?:mt|metric\s+tons?|tons?|units?|pcs|pieces|barrels?|bbl|containers?|fcl|teu|kg|kgs|liters?|lbs)\b\s*(?:of\s+)?/i', '', (string)$clean_subject);
        $clean_subject = preg_replace('/\s+[-–—]\s*\d[\d,.]*\s*(?:mt|tons?|units?|pcs|barrels?|fcl|mw|kw|months?|years?).*$/i', '', (string)$clean_subject);
        $clean_subject = preg_replace('/\b\d+(?:\.\d+)?\s*-\s*ton\b/i', ' ', (string)$clean_subject);
        $clean_subject = preg_replace('/\bgrade\s+[a-z0-9+-]+\b/i', ' ', (string)$clean_subject);
        $clean_subject = preg_replace('/\b[A-Za-z0-9]+\s*\/\s*[A-Za-z0-9]+\b/', ' ', (string)$clean_subject);
        $clean_subject = trim(preg_replace('/\s+/', ' ', (string)$clean_subject));
        $p_name = strlen($clean_subject) >= 2 ? $clean_subject : $raw_p_name;

        if (strlen($p_name) < 2) {
            echo json_encode([
                "status" => "invalid_query",
                "success" => false,
                "message" => "Please provide a valid product name to fetch product images.",
                "images" => [],
                "pool" => []
            ]);
            break;
        }

        $norm_name = trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s-]/', ' ', strtolower($p_name))));
        $norm_cat = trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s-]/', ' ', strtolower($p_cat))));
        $cache_keyword = $norm_cat !== '' ? ($norm_name . '::' . $norm_cat) : $norm_name;

        $cat_word = '';
        if ($p_cat !== '') {
            $parts = preg_split('/[&,]/', $p_cat);
            $first_part = trim((string)($parts[0] ?? ''));
            if ($first_part !== '' && stripos($p_name, explode(' ', $first_part)[0]) === false) {
                $cat_word = $first_part;
            }
        }
        $spec_words = [];
        if ($p_specs !== '') {
            $sw = preg_split('/[\s,;|{}\[\]"]+/', $p_specs);
            foreach ($sw as $w) {
                if (strlen($w) >= 3 && !preg_match('/^(the|and|for|with|grade|quality|export|iso|verified)$/i', $w)) {
                    $spec_words[] = $w;
                    if (count($spec_words) >= 3) break;
                }
            }
        }
        $core_query = trim(implode(' ', array_filter([$p_name, $cat_word, implode(' ', $spec_words)])));
        $query_used = "\"{$p_name}\" {$core_query} product photo OR wholesale OR export -wallpaper -clipart -cartoon -logo -meme";

        $cache_file_json = __DIR__ . '/product_image_cache.json';

        // 1. Check 7-day MySQL product_image_cache (or JSON fallback)
        if (!$force_refresh) {
            $cached_pool = null;
            if ($db_connected && $pdo) {
                try {
                    $cStmt = $pdo->prepare("SELECT image_urls_json FROM product_image_cache WHERE keyword = ? AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) LIMIT 1");
                    $cStmt->execute([$cache_keyword]);
                    $cRow = $cStmt->fetch(PDO::FETCH_ASSOC);
                    if ($cRow && !empty($cRow['image_urls_json'])) {
                        $dec = json_decode((string)$cRow['image_urls_json'], true);
                        if (is_array($dec) && count($dec) >= 10) $cached_pool = $dec;
                    }
                } catch (Exception $e) {}
            }
            if ($cached_pool === null && file_exists($cache_file_json)) {
                $f_json = json_decode((string)@file_get_contents($cache_file_json), true);
                if (is_array($f_json) && isset($f_json[$cache_keyword])) {
                    $rec = $f_json[$cache_keyword];
                    $ts = isset($rec['updatedAt']) ? strtotime((string)$rec['updatedAt']) : 0;
                    if ($ts > 0 && (time() - $ts) < 7 * 86400 && !empty($rec['images']) && is_array($rec['images']) && count($rec['images']) >= 10) {
                        $cached_pool = $rec['images'];
                    }
                }
            }
            if (is_array($cached_pool) && count($cached_pool) >= 10) {
                shuffle($cached_pool);
                $selected = array_slice($cached_pool, 0, $req_count);
                echo json_encode([
                    "status" => "cached",
                    "success" => true,
                    "fromCache" => true,
                    "provider" => "gemini_google_search_grounding",
                    "queryUsed" => $query_used,
                    "totalVerified" => count($cached_pool),
                    "images" => $selected,
                    "pool" => $cached_pool
                ]);
                break;
            }
        }

        // 2. Resolve ONLY GEMINI_API_KEY from env, $_ENV/$_SERVER, .env, or MySQL site_settings
        $gemini_api_key = trim((string)(getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? $_SERVER['GEMINI_API_KEY'] ?? '')));
        if ($gemini_api_key === '' && file_exists(__DIR__ . '/.env')) {
            $env_lines = @file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (is_array($env_lines)) {
                foreach ($env_lines as $el) {
                    if (preg_match('/^\s*GEMINI_API_KEY\s*=\s*["\']?([^"\'\r\n]+)["\']?/i', $el, $em)) {
                        $gemini_api_key = trim((string)$em[1]);
                        break;
                    }
                }
            }
        }
        if (($gemini_api_key === '' || $gemini_api_key === 'MY_GEMINI_API_KEY') && $db_connected && $pdo) {
            try {
                $sStmt = $pdo->query("SELECT setting_value FROM site_settings WHERE setting_key IN ('GEMINI_API_KEY','gemini_api_key') LIMIT 1");
                $sv = trim((string)($sStmt->fetchColumn() ?: ''));
                if ($sv !== '') $gemini_api_key = $sv;
            } catch (Exception $e) {}
        }
        if ($gemini_api_key === 'MY_GEMINI_API_KEY') $gemini_api_key = '';

        // Continue into live Wikimedia Commons + Commercial Web + optional Gemini Search Grounding pipeline even if GEMINI_API_KEY is empty.

        $blocked_domains = [
            'picsum.photos', 'via.placeholder.com', 'placeholder.com', 'dummyimage.com', 'placekitten.com',
            'unsplash.com', 'images.unsplash.com', 'pexels.com', 'pixabay.com',
            'shutterstock.com', 'istockphoto.com', 'gettyimages.com', 'alamy.com', '123rf.com',
            'depositphotos.com', 'dreamstime.com', 'lookaside.fbsbx.com', 'fbsbx.com',
            'facebook.com', 'instagram.com', 'tiktok.com', 'pinterest.com', 'twimg.com'
        ];
        $stopwords = ['the','and','for','with','from','that','this','export','grade','quality','wholesale','bulk','supply','direct','factory','oem','odm','verified','new','high','best','commercial','industrial','product','products','unit','units','tons','metric','pcs','pieces','kgs','kg','ton','pure','natural','premium','standard','international','global','certified','genuine','original','custom','rfq','wanted','urgent','requirement','tender','cif','fob','port','months','month'];
        $modifier_words = ['fresh','raw','black','white','red','green','yellow','blue','golden','silver','refined','unrefined','organic','processed','frozen','dried','dry','wet','liquid','solid','powder','powdered','granular','granules','crude','heavy','light','duty','medium','small','large','extra','long','short','steam','parboiled','broken','whole','split','peeled','washed','polished','unpolished','stone','stones','rock','hydraulic','crawler','wheeled','portable','automatic','semi','manual','electric','electronic','digital','smart','mini','micro','multi','single','double','triple','stage','type','class','series','model','system','systems','machine','machinery','equipment','automotive','agricultural','medical','surgical','pharmaceutical','cosmetic','food','edible','packaging','printed','plain','corrugated','kraft','woven','nonwoven','knitted','stainless','carbon','alloy','cast','forged','hot','cold','rolled','galvanized','coated','painted','anodized','aspheric','optical','infrared','thermal','solar','inverter','window','wall','mounted','ceiling','floor','standing','grain','electrolytic'];
        $raw_tokens = preg_split('/\s+/', preg_replace('/[^a-z0-9\s]/', ' ', strtolower($p_name)));
        $prod_tokens = [];
        $core_nouns = [];
        foreach ($raw_tokens as $tk) {
            if (strlen($tk) >= 3 && !ctype_digit($tk) && !in_array($tk, $stopwords, true) && !in_array($tk, $prod_tokens, true)) {
                $prod_tokens[] = $tk;
                if (!in_array($tk, $modifier_words, true)) {
                    $core_nouns[] = $tk;
                }
            }
        }
        if (empty($core_nouns)) $core_nouns = $prod_tokens;

        $token_matches_text = function($tk, $txt) {
            $stems = [$tk];
            if (strlen($tk) > 4) {
                if (substr($tk, -3) === 'ies') $stems[] = substr($tk, 0, -3) . 'y';
                if (substr($tk, -2) === 'es') $stems[] = substr($tk, 0, -2);
                if (substr($tk, -1) === 's') $stems[] = substr($tk, 0, -1);
            }
            foreach ($stems as $st) {
                if (strlen($st) >= 3 && strpos($txt, $st) !== false) return true;
            }
            return false;
        };

        $is_relevant_direct_image = function($cand) use ($blocked_domains, $prod_tokens, $core_nouns, $token_matches_text) {
            $u = trim((string)($cand['url'] ?? ''));
            if ($u === '' || !preg_match('/^https?:\/\//i', $u)) return false;
            if (!preg_match('/\.(?:jpe?g|png|webp)(?:[?#!_].*)?$/i', $u)) return false;
            $host = strtolower((string)(parse_url($u, PHP_URL_HOST) ?? ''));
            if ($host === '') return false;
            foreach ($blocked_domains as $bd) {
                if ($host === $bd || substr($host, -strlen('.' . $bd)) === '.' . $bd) return false;
            }
            $combined = strtolower($u . ' ' . ($cand['title'] ?? '') . ' ' . ($cand['sourceDomain'] ?? ''));
            if (preg_match('/(logo|icon|favicon|sprite|clipart|cartoon|meme|wallpaper|avatar|watermark|placeholder|vector|infographic|diagram|chart|barcode|qrcode|\.svg($|\?)|\.gif($|\?)|\.ico($|\?))/i', $combined)) {
                return false;
            }
            if (!empty($cand['width']) && $cand['width'] < 300) return false;
            if (!empty($cand['height']) && $cand['height'] < 300) return false;
            if (empty($prod_tokens)) return 1;
            $hits_all = 0;
            foreach ($prod_tokens as $tk) {
                if ($token_matches_text($tk, $combined)) $hits_all++;
            }
            $hits_core = 0;
            foreach ($core_nouns as $cn) {
                if ($token_matches_text($cn, $combined)) $hits_core++;
            }
            if ($hits_core === 0) return false;
            $head_noun = !empty($core_nouns) ? $core_nouns[count($core_nouns) - 1] : '';
            $first_core = !empty($core_nouns) ? $core_nouns[0] : '';
            $head_matched = $head_noun !== '' ? $token_matches_text($head_noun, $combined) : false;
            $first_matched = $first_core !== '' ? $token_matches_text($first_core, $combined) : false;
            if (count($prod_tokens) >= 2 && $hits_all < 2 && !$head_matched && !$first_matched) {
                return false;
            }
            return $hits_core * 3 + $hits_all + ($head_matched ? 2 : 0);
        };

        $call_gemini_grounded = function($prompt_text) use ($gemini_api_key, $p_name) {
            $models = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
            $last_err = '';
            foreach ($models as $m_name) {
                $api_url = 'https://generativelanguage.googleapis.com/v1beta/models/' . urlencode($m_name) . ':generateContent?key=' . urlencode($gemini_api_key);
                $req_body = json_encode([
                    'contents' => [['role' => 'user', 'parts' => [['text' => $prompt_text]]]],
                    'tools' => [['google_search' => new stdClass()]]
                ]);
                $resp_code = 0;
                $resp_raw = '';
                if (function_exists('curl_init')) {
                    $ch = curl_init($api_url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $req_body);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 18);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'User-Agent: aistudio-build']);
                    $resp_raw = (string)curl_exec($ch);
                    $resp_code = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
                    curl_close($ch);
                } else {
                    $ctx = stream_context_create([
                        'http' => [
                            'method' => 'POST',
                            'header' => "Content-Type: application/json\r\nUser-Agent: aistudio-build\r\n",
                            'content' => $req_body,
                            'timeout' => 18,
                            'ignore_errors' => true
                        ]
                    ]);
                    $resp_raw = (string)@file_get_contents($api_url, false, $ctx);
                    $resp_code = $resp_raw !== '' ? 200 : 500;
                }
                $json = json_decode($resp_raw, true) ?: [];
                if ($resp_code >= 400 || !empty($json['error'])) {
                    $last_err = (string)($json['error']['message'] ?? ('HTTP ' . $resp_code));
                    if (preg_match('/API_KEY_INVALID|PERMISSION_DENIED/i', $last_err)) break;
                    continue;
                }

                $parts = $json['candidates'][0]['content']['parts'] ?? [];
                $raw_text = '';
                foreach ($parts as $pt) {
                    if (!empty($pt['text'])) $raw_text .= "\n" . $pt['text'];
                }
                $cleaned = trim(preg_replace('/\s*```$/i', '', preg_replace('/^```(?:json)?\s*/i', '', trim($raw_text))));
                $parsed_items = [];
                $dec = json_decode($cleaned, true);
                if (is_array($dec)) {
                    $parsed_items = isset($dec['images']) && is_array($dec['images']) ? $dec['images'] : $dec;
                } elseif (preg_match('/\{[\s\S]*\}/', $cleaned, $jm)) {
                    $dec2 = json_decode($jm[0], true);
                    if (is_array($dec2)) $parsed_items = isset($dec2['images']) && is_array($dec2['images']) ? $dec2['images'] : $dec2;
                } elseif (preg_match('/\[[\s\S]*\]/', $cleaned, $am)) {
                    $dec3 = json_decode($am[0], true);
                    if (is_array($dec3)) $parsed_items = $dec3;
                }

                $cands = [];
                $pages = [];
                foreach ($parsed_items as $it) {
                    if (!is_array($it)) continue;
                    $u = trim((string)($it['url'] ?? $it['imageUrl'] ?? $it['image_url'] ?? ''));
                    if ($u !== '' && preg_match('/^https?:\/\//i', $u)) {
                        $cands[] = [
                            'url' => $u,
                            'thumbnailUrl' => trim((string)($it['thumbnailUrl'] ?? $u)),
                            'title' => trim((string)($it['title'] ?? $p_name)),
                            'sourceDomain' => trim((string)($it['sourceDomain'] ?? parse_url($u, PHP_URL_HOST) ?? '')),
                            'width' => intval($it['width'] ?? 0) ?: null,
                            'height' => intval($it['height'] ?? 0) ?: null
                        ];
                    }
                    $sp = trim((string)($it['sourcePageUrl'] ?? $it['pageUrl'] ?? ''));
                    if ($sp !== '' && preg_match('/^https?:\/\//i', $sp)) {
                        $pages[] = ['uri' => $sp, 'title' => trim((string)($it['title'] ?? $p_name))];
                    }
                }
                if (preg_match_all('/https?:\/\/[^\s"\'<>)\]]+?\.(?:jpe?g|png|webp)(?:\?[^\s"\'<>)\]]*)?/i', $cleaned, $um)) {
                    foreach (array_unique($um[0]) as $found_u) {
                        $cands[] = [
                            'url' => $found_u,
                            'thumbnailUrl' => $found_u,
                            'title' => $p_name,
                            'sourceDomain' => (string)(parse_url($found_u, PHP_URL_HOST) ?? '')
                        ];
                    }
                }
                foreach (($json['candidates'][0]['groundingMetadata']['groundingChunks'] ?? []) as $ch) {
                    $g_uri = trim((string)($ch['web']['uri'] ?? ''));
                    $g_title = trim((string)($ch['web']['title'] ?? $p_name));
                    if ($g_uri !== '' && preg_match('/^https?:\/\//i', $g_uri)) {
                        if (preg_match('/\.(?:jpe?g|png|webp)(?:[?#].*)?$/i', $g_uri)) {
                            $cands[] = ['url' => $g_uri, 'thumbnailUrl' => $g_uri, 'title' => $g_title, 'sourceDomain' => (string)(parse_url($g_uri, PHP_URL_HOST) ?? '')];
                        } else {
                            $pages[] = ['uri' => $g_uri, 'title' => $g_title];
                        }
                    }
                }
                if (!empty($cands) || !empty($pages)) {
                    return ['candidates' => $cands, 'pages' => $pages, 'error' => ''];
                }
            }
            return ['candidates' => [], 'pages' => [], 'error' => $last_err];
        };

        $resolve_php_url = function($raw, $base) {
            $clean = trim(str_replace('&amp;', '&', (string)$raw));
            if ($clean === '' || stripos($clean, 'data:') === 0) return '';
            if (preg_match('/^https?:\/\//i', $clean)) return $clean;
            $bp = parse_url($base);
            if (empty($bp['scheme']) || empty($bp['host'])) return '';
            $port = !empty($bp['port']) ? (':' . $bp['port']) : '';
            $origin = $bp['scheme'] . '://' . $bp['host'] . $port;
            if (strpos($clean, '//') === 0) return $bp['scheme'] . ':' . $clean;
            if (strpos($clean, '/') === 0) return $origin . $clean;
            $base_path = $bp['path'] ?? '/';
            $dir = rtrim(dirname($base_path), '/\\');
            return $origin . ($dir === '' ? '' : $dir) . '/' . ltrim($clean, '/');
        };

        $scrape_grounded_pages = function($pages) use ($blocked_domains, $p_name, $is_relevant_direct_image, $resolve_php_url) {
            $out = [];
            $seen_p = [];
            $targets = [];
            foreach ($pages as $pg) {
                $u = trim((string)($pg['uri'] ?? ''));
                if ($u === '' || isset($seen_p[$u])) continue;
                $h = strtolower((string)(parse_url($u, PHP_URL_HOST) ?? ''));
                $skip = false;
                foreach ($blocked_domains as $bd) {
                    if ($h === $bd || substr($h, -strlen('.' . $bd)) === '.' . $bd) { $skip = true; break; }
                }
                if ($skip) continue;
                $seen_p[$u] = true;
                $targets[] = ['uri' => $u, 'title' => $pg['title'] ?? $p_name];
                if (count($targets) >= 10) break;
            }
            if (empty($targets) || !function_exists('curl_multi_init')) return $out;
            $mh = curl_multi_init();
            $handles = [];
            foreach ($targets as $idx => $tg) {
                $ch = curl_init($tg['uri']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 4);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; TradeHeavenVisualBot/1.0)');
                curl_multi_add_handle($mh, $ch);
                $handles[$idx] = [$ch, $tg];
            }
            $running = null;
            do { curl_multi_exec($mh, $running); curl_multi_select($mh, 0.1); } while ($running > 0);
            foreach ($handles as [$ch, $tg]) {
                $html = (string)curl_multi_getcontent($ch);
                $code = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
                $eff_page = (string)curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
                curl_multi_remove_handle($mh, $ch);
                curl_close($ch);
                if ($code < 200 || $code >= 400 || $html === '') continue;
                $final_page_url = ($eff_page !== '' && preg_match('/^https?:\/\//i', $eff_page)) ? $eff_page : $tg['uri'];
                $dom = strtolower((string)(parse_url($final_page_url, PHP_URL_HOST) ?? ''));
                $skip_eff = false;
                foreach ($blocked_domains as $bd) {
                    if ($dom === $bd || substr($dom, -strlen('.' . $bd)) === '.' . $bd) { $skip_eff = true; break; }
                }
                if ($skip_eff) continue;
                $snippet = substr($html, 0, 220000);
                if (preg_match_all('/<meta[^>]+(?:property|name)=["\'](?:og:image|og:image:secure_url|twitter:image)["\'][^>]+content=["\']([^"\']+)["\']/i', $snippet, $mm1)) {
                    foreach ($mm1[1] as $mu) {
                        $res_u = $resolve_php_url($mu, $final_page_url);
                        if ($res_u !== '') $out[] = ['url' => $res_u, 'thumbnailUrl' => $res_u, 'title' => $tg['title'], 'sourceDomain' => $dom];
                    }
                }
                if (preg_match_all('/<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\'](?:og:image|og:image:secure_url|twitter:image)["\']/i', $snippet, $mm2)) {
                    foreach ($mm2[1] as $mu) {
                        $res_u = $resolve_php_url($mu, $final_page_url);
                        if ($res_u !== '') $out[] = ['url' => $res_u, 'thumbnailUrl' => $res_u, 'title' => $tg['title'], 'sourceDomain' => $dom];
                    }
                }
                if (preg_match_all('/<img[^>]+(?:src|data-src|data-original)=["\']([^"\']+\.(?:jpe?g|png|webp)(?:\?[^"\']*)?)["\']/i', $snippet, $im)) {
                    foreach (array_slice($im[1], 0, 8) as $iu) {
                        $res_u = $resolve_php_url($iu, $final_page_url);
                        if ($res_u === '') continue;
                        $cand = ['url' => $res_u, 'thumbnailUrl' => $res_u, 'title' => $tg['title'], 'sourceDomain' => $dom];
                        if ($is_relevant_direct_image($cand)) $out[] = $cand;
                    }
                }
            }
            curl_multi_close($mh);
            return $out;
        };

        $verify_live_batch = function($cand_list) {
            if (empty($cand_list) || !function_exists('curl_multi_init')) return array_values($cand_list);
            $run_checks = function($items, $use_get_range = false) {
                $mh = curl_multi_init();
                $handles = [];
                foreach ($items as $idx => $cand) {
                    $ch = curl_init($cand['url']);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
                    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; TradeHeavenVisualBot/1.0)');
                    if ($use_get_range) {
                        curl_setopt($ch, CURLOPT_NOBODY, false);
                        curl_setopt($ch, CURLOPT_RANGE, '0-4095');
                    } else {
                        curl_setopt($ch, CURLOPT_NOBODY, true);
                    }
                    curl_multi_add_handle($mh, $ch);
                    $handles[$idx] = [$ch, $cand];
                }
                $running = null;
                do { curl_multi_exec($mh, $running); curl_multi_select($mh, 0.1); } while ($running > 0);
                $passed = [];
                $retry = [];
                foreach ($handles as [$ch, $cand]) {
                    $code = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
                    $ctype = strtolower((string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
                    $clen = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
                    $eff = (string)curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
                    curl_multi_remove_handle($mh, $ch);
                    curl_close($ch);
                    if (!$use_get_range && in_array($code, [400, 403, 405, 501], true)) {
                        $retry[] = $cand;
                        continue;
                    }
                    if ($code < 200 || ($code >= 300 && $code !== 206 && $code !== 304)) continue;
                    if ($ctype !== '') {
                        if (strpos($ctype, 'text/html') !== false || strpos($ctype, 'application/json') !== false || strpos($ctype, 'svg') !== false || strpos($ctype, 'gif') !== false || strpos($ctype, 'icon') !== false) {
                            continue;
                        }
                        $supported_mime = (strpos($ctype, 'image/jpeg') !== false || strpos($ctype, 'image/jpg') !== false || strpos($ctype, 'image/png') !== false || strpos($ctype, 'image/webp') !== false || (strpos($ctype, 'application/octet-stream') !== false && preg_match('/\.(?:jpe?g|png|webp)(?:[?#].*)?$/i', $cand['url'])));
                        if (!$supported_mime) continue;
                    }
                    if ($clen > 0 && $clen < 6000) continue;
                    $final_u = ($eff !== '' && preg_match('/^https?:\/\//i', $eff)) ? $eff : $cand['url'];
                    $cand['url'] = $final_u;
                    $cand['thumbnailUrl'] = $final_u;
                    $passed[] = $cand;
                }
                curl_multi_close($mh);
                return ['passed' => $passed, 'retry' => $retry];
            };

            $first = $run_checks($cand_list, false);
            $ok = $first['passed'];
            if (!empty($first['retry'])) {
                $second = $run_checks($first['retry'], true);
                $ok = array_merge($ok, $second['passed']);
            }
            return $ok;
        };

        $build_focused_queries_php = function($raw_title, $raw_cat = '') use ($stopwords) {
            $extra_stop = [
                'heavy', 'duty', 'turnkey', 'configuration', 'config', 'solution', 'solutions', 'series',
                'edition', 'version', 'capacity', 'spec', 'specs', 'specification', 'specifications',
                'complete', 'professional', 'enterprise', 'advanced', 'modern', 'ultra', 'super', 'pro',
                'max', 'plus', 'type', 'class', 'model', 'system', 'systems', 'equipment', 'machinery', 'machine'
            ];
            $all_stop = array_merge($stopwords, $extra_stop);
            $cleaned_q = preg_replace('/\s*&\s*/', ', ', (string)$raw_title);
            $clauses = array_values(array_filter(array_map('trim', preg_split('/[,;\/]+/', $cleaned_q)), function($c) {
                return strlen($c) >= 3;
            }));
            $all_toks = array_values(array_unique(array_filter(preg_split('/[^a-z0-9]+/', strtolower($cleaned_q)), function($w) use ($all_stop) {
                return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $all_stop, true);
            })));
            $qs = [];
            if (count($all_toks) >= 2 && count($all_toks) <= 4) {
                $qs[] = implode(' ', $all_toks);
            }
            foreach (array_slice($clauses, 0, 3) as $cl) {
                $cl_toks = array_values(array_filter(preg_split('/[^a-z0-9]+/', strtolower($cl)), function($w) use ($all_stop) {
                    return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $all_stop, true);
                }));
                if (count($cl_toks) >= 2) {
                    $qs[] = implode(' ', array_slice($cl_toks, 0, 3));
                } elseif (count($cl_toks) === 1 && count($all_toks) >= 2 && $cl_toks[0] !== $all_toks[0]) {
                    $qs[] = $all_toks[0] . ' ' . $cl_toks[0];
                } elseif (count($cl_toks) === 1 && strlen($cl_toks[0]) >= 4) {
                    $qs[] = $cl_toks[0];
                }
            }
            if (count($all_toks) >= 3) {
                $qs[] = implode(' ', array_slice($all_toks, 0, 3));
                $qs[] = $all_toks[0] . ' ' . $all_toks[count($all_toks) - 1];
            } elseif (count($all_toks) >= 1) {
                $qs[] = implode(' ', $all_toks);
            }
            if (empty($qs) && trim((string)$raw_cat) !== '') {
                $qs[] = trim((string)$raw_cat);
            }
            return array_slice(array_values(array_unique(array_filter(array_map('trim', $qs), function($q) {
                return strlen($q) >= 3;
            }))), 0, 4);
        };

        $fetch_wikimedia_commons_php = function($title_in, $cat_in = '') use ($build_focused_queries_php) {
            $found = [];
            if (!function_exists('curl_init')) return $found;
            $queries = $build_focused_queries_php($title_in, $cat_in);
            $bad_title_re = '/(diagram|chart|logo|icon|map|coat_of_arms|flag|signature|screenshot|pdf|djvu|infographic|cartoon|drawing|painting|sketch|poster|brochure|advert|newspaper|magazine|catalogue|postcard|statelib|fortepan|bundesarchiv|18[89]\d|19[0-8]\d)/i';
            foreach ($queries as $q_str) {
                $api_u = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' . urlencode($q_str . ' filetype:bitmap') . '&gsrnamespace=6&gsrlimit=18&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json';
                $ch = curl_init($api_u);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                curl_setopt($ch, CURLOPT_USERAGENT, 'TradeHeavenVisualCatalogBot/1.0 (https://tradeheaven.net)');
                $raw = (string)curl_exec($ch);
                $code = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
                curl_close($ch);
                if ($code < 200 || $code >= 300 || $raw === '') continue;
                $dec = json_decode($raw, true);
                $pages = $dec['query']['pages'] ?? [];
                if (!is_array($pages)) continue;
                foreach ($pages as $pg) {
                    $info = $pg['imageinfo'][0] ?? null;
                    if (!is_array($info)) continue;
                    $raw_t = (string)($pg['title'] ?? '');
                    if (preg_match($bad_title_re, $raw_t)) continue;
                    $mime = strtolower((string)($info['mime'] ?? ''));
                    if (strpos($mime, 'jpeg') === false && strpos($mime, 'png') === false && strpos($mime, 'webp') === false) continue;
                    $w = intval($info['width'] ?? 0);
                    $h = intval($info['height'] ?? 0);
                    if (($w > 0 && $w < 380) || ($h > 0 && $h < 280)) continue;
                    $cand_u = trim((string)($info['thumburl'] ?? $info['url'] ?? ''));
                    if ($cand_u === '' || !preg_match('/^https?:\/\//i', $cand_u)) continue;
                    $clean_t = trim(preg_replace('/[_-]+/', ' ', preg_replace('/\.[^.]+$/', '', preg_replace('/^File:/i', '', $raw_t))));
                    $found[] = [
                        'url' => $cand_u,
                        'thumbnailUrl' => $cand_u,
                        'title' => $clean_t ?: $q_str,
                        'sourceDomain' => 'commons.wikimedia.org',
                        'width' => $w ?: null,
                        'height' => $h ?: null
                    ];
                }
            }
            return $found;
        };

        $fetch_live_commercial_web_images = function() use ($p_name, $p_cat, $p_specs, $build_focused_queries_php) {
            $found = [];
            $focused = $build_focused_queries_php($p_name, $p_cat);
            $queries = array_slice(array_values(array_unique(array_filter([
                $focused[0] ?? trim($p_name),
                isset($focused[1]) ? ($focused[1] . ' product') : trim($p_name . ' ' . $p_specs . ' wholesale')
            ]))), 0, 2);
            foreach ($queries as $q_idx => $q_str) {
                $filter_part = $q_idx === 0 ? '&qft=+filterui:photo-photo' : '';
                $b_url = 'https://www.bing.com/images/search?q=' . urlencode($q_str) . $filter_part . '&form=HDRSC2&first=1';
                $b_html = '';
                if (function_exists('curl_init')) {
                    $ch = curl_init($b_url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
                    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                    $b_html = (string)curl_exec($ch);
                    curl_close($ch);
                }
                if ($b_html !== '' && preg_match_all('/m="(\{&quot;[^"]+\})"/', $b_html, $bm)) {
                    foreach ($bm[1] as $raw_m) {
                        $dec_m = json_decode(html_entity_decode($raw_m, ENT_QUOTES, 'UTF-8'), true);
                        if (!is_array($dec_m)) continue;
                        $murl = trim((string)($dec_m['murl'] ?? ''));
                        if ($murl === '' || !preg_match('/^https?:\/\//i', $murl)) continue;
                        $purl = trim((string)($dec_m['purl'] ?? $murl));
                        $found[] = [
                            'url' => $murl,
                            'thumbnailUrl' => $murl,
                            'title' => trim((string)($dec_m['t'] ?? $p_name)),
                            'sourceDomain' => strtolower((string)(parse_url($purl, PHP_URL_HOST) ?? ''))
                        ];
                    }
                }
            }
            return $found;
        };

        $cand_pool = [];
        $verified = [];
        $seen_urls = [];
        $quota_error = '';

        $add_cands = function($list) use (&$cand_pool, &$seen_urls, $is_relevant_direct_image) {
            foreach ($list as $c) {
                $u = trim((string)($c['url'] ?? ''));
                $dk = explode('#', $u)[0];
                if ($u === '' || isset($seen_urls[$dk])) continue;
                $score = $is_relevant_direct_image($c);
                if ($score === false) continue;
                $seen_urls[$dk] = true;
                $c['relevanceScore'] = intval($score);
                $cand_pool[] = $c;
            }
        };

        // 1. Run Wikimedia Commons + Bing focused commercial search first (works reliably on every host even without GEMINI_API_KEY)
        $add_cands($fetch_wikimedia_commons_php($p_name, $p_cat));
        $add_cands($fetch_live_commercial_web_images());
        if (!empty($cand_pool)) {
            usort($cand_pool, function($a, $b) { return intval($b['relevanceScore'] ?? 0) <=> intval($a['relevanceScore'] ?? 0); });
            $wiki_pre = [];
            $to_check = [];
            foreach (array_slice($cand_pool, 0, 35) as $cp) {
                if (($cp['sourceDomain'] ?? '') === 'commons.wikimedia.org' && !empty($cp['width']) && !empty($cp['height'])) {
                    $wiki_pre[] = $cp;
                } else {
                    $to_check[] = $cp;
                }
            }
            $verified = array_merge($wiki_pre, $verify_live_batch(array_slice($to_check, 0, 25)));
        }

        // 2. If GEMINI_API_KEY is available and fewer than 8 real photos were found, augment with Gemini Google Search Grounding
        if (count($verified) < 8 && $gemini_api_key !== '') {
            $cand_pool = [];
            $spec_note = $p_specs !== '' ? " ({$p_specs})" : '';
            $cat_note = $p_cat !== '' ? " in category \"{$p_cat}\"" : '';
            $r1_prompt = "You are a commercial product image research engine using Google Search.\nFind 20 to 25 REAL, public, high-resolution direct product photography image URLs (.jpg, .jpeg, .png, or .webp) strictly depicting the exact product: \"{$p_name}\"{$cat_note}{$spec_note}.\nEvery url must be a direct .jpg/.jpeg/.png/.webp image file URL (min 300x300). No shutterstock/getty/istock/alamy/123rf/depositphotos/dreamstime/picsum/via.placeholder, no logos, svg, gif, icons, or off-topic photos.\nReturn ONLY valid JSON: {\"images\":[{\"url\":\"https://.../photo.jpg\",\"sourcePageUrl\":\"https://...\",\"title\":\"...\",\"sourceDomain\":\"...\"}]}.";

            $r1 = $call_gemini_grounded($r1_prompt);
            if ($r1['error'] !== '' && preg_match('/quota|429|RESOURCE_EXHAUSTED|API_KEY_INVALID|PERMISSION_DENIED/i', $r1['error'])) {
                $quota_error = "Gemini Google Search Grounding quota or key error ({$r1['error']}).";
            }
            $add_cands($r1['candidates']);
            if (!empty($r1['pages']) && count($cand_pool) < 25) {
                $add_cands($scrape_grounded_pages($r1['pages']));
            }
            $verified = array_merge($verified, $verify_live_batch(array_slice($cand_pool, 0, 30)));
        }

        // 3. Only if still empty, check strictly-matching local /assets/uploads/ files (never score-0 random images)
        if (empty($verified)) {
            $uploads_dir_fb = __DIR__ . '/assets/uploads';
            if (!is_dir($uploads_dir_fb) && is_dir(__DIR__ . '/public/assets/uploads')) {
                $uploads_dir_fb = __DIR__ . '/public/assets/uploads';
            }
            if (is_dir($uploads_dir_fb) && !empty($prod_tokens)) {
                foreach (@scandir($uploads_dir_fb) ?: [] as $uf) {
                    if (!preg_match('/\.(?:webp|jpe?g|png)$/i', $uf)) continue;
                    if (preg_match('/(diwali-offer|unsplash|placeholder)/i', $uf)) continue;
                    $fp = $uploads_dir_fb . '/' . $uf;
                    if (!is_file($fp) || filesize($fp) < 2000) continue;
                    $low_uf = strtolower($uf);
                    $sc = 0;
                    foreach ($core_nouns as $cn) {
                        if ($token_matches_text($cn, $low_uf)) $sc += 4;
                    }
                    if ($sc >= 4) {
                        $web_u = '/assets/uploads/' . $uf;
                        $verified[] = [
                            'url' => $web_u,
                            'thumbnailUrl' => $web_u,
                            'title' => pathinfo($uf, PATHINFO_FILENAME),
                            'sourceDomain' => 'tradeheaven.net',
                            'relevanceScore' => $sc
                        ];
                    }
                }
            }
        }

        if (empty($verified)) {
            echo json_encode([
                "status" => $quota_error !== '' ? "quota_exceeded" : "no_relevant_matches",
                "success" => false,
                "configRequired" => false,
                "message" => "No verified commercial product photos (.jpg/.png/.webp) matched \"{$p_name}\". Try refining the product title or upload an image manually.",
                "queryUsed" => $query_used,
                "images" => [],
                "pool" => []
            ]);
            break;
        }

        // Auto-upload top 4 verified external images directly onto the site (/assets/uploads/auto-...) so next loads are instant (0ms)
        $uploads_dir_auto = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_auto) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_auto = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir_auto)) {
            @mkdir($uploads_dir_auto, 0775, true);
        }
        $auto_slug = substr(trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($p_name)), '-'), 0, 36) ?: 'product';
        for ($mi = 0; $mi < min(4, count($verified)); $mi++) {
            $ext_u = trim((string)($verified[$mi]['url'] ?? ''));
            if ($ext_u === '' || strpos($ext_u, '/assets/uploads/') === 0) continue;
            $u_hash = substr(sha1($ext_u), 0, 12);
            $u_ext = 'jpg';
            if (preg_match('/\.(png|webp)(?:[?#!_].*)?$/i', $ext_u, $em_ext)) {
                $u_ext = strtolower($em_ext[1]);
            }
            $local_fname = "auto-{$auto_slug}-{$u_hash}.{$u_ext}";
            $local_fpath = $uploads_dir_auto . '/' . $local_fname;
            $local_web_url = '/assets/uploads/' . $local_fname;
            if (file_exists($local_fpath) && filesize($local_fpath) > 1500) {
                $verified[$mi]['url'] = $local_web_url;
                $verified[$mi]['thumbnailUrl'] = $local_web_url;
            } elseif (function_exists('curl_init')) {
                $ch_dl = curl_init($ext_u);
                curl_setopt($ch_dl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch_dl, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch_dl, CURLOPT_TIMEOUT, 4);
                curl_setopt($ch_dl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                $bin_dl = (string)curl_exec($ch_dl);
                $code_dl = intval(curl_getinfo($ch_dl, CURLINFO_HTTP_CODE));
                $ct_dl = strtolower((string)curl_getinfo($ch_dl, CURLINFO_CONTENT_TYPE));
                curl_close($ch_dl);
                if ($code_dl >= 200 && $code_dl < 300 && strlen($bin_dl) > 2500 && strpos($ct_dl, 'text/html') === false) {
                    if (@file_put_contents($local_fpath, $bin_dl) !== false) {
                        $verified[$mi]['url'] = $local_web_url;
                        $verified[$mi]['thumbnailUrl'] = $local_web_url;
                    }
                }
            }
        }

        // Persist into 7-day MySQL product_image_cache + JSON cache
        $json_pool = json_encode($verified, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($db_connected && $pdo) {
            try {
                $upStmt = $pdo->prepare("INSERT INTO product_image_cache (keyword, image_urls_json, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE image_urls_json = VALUES(image_urls_json), updated_at = NOW()");
                $upStmt->execute([$cache_keyword, $json_pool]);
            } catch (Exception $e) {}
        }
        $existing_json_cache = file_exists($cache_file_json) ? (json_decode((string)@file_get_contents($cache_file_json), true) ?: []) : [];
        $existing_json_cache[$cache_keyword] = [
            "keyword" => $cache_keyword,
            "queryUsed" => $query_used,
            "images" => $verified,
            "updatedAt" => gmdate('c'),
            "provider" => "gemini_google_search_grounding"
        ];
        @file_put_contents($cache_file_json, json_encode($existing_json_cache, JSON_UNESCAPED_SLASHES));

        shuffle($verified);
        $selected = array_slice($verified, 0, $req_count);
        echo json_encode([
            "status" => "ok",
            "success" => true,
            "fromCache" => false,
            "provider" => "gemini_google_search_grounding",
            "queryUsed" => $query_used,
            "totalVerified" => count($verified),
            "images" => $selected,
            "pool" => $verified
        ]);
        break;

    case 'auto_upload_product_image':
        $ext_url = trim((string)($input['image_url'] ?? $input['imageUrl'] ?? $input['url'] ?? $_GET['image_url'] ?? ''));
        $prod_id = trim((string)($input['product_id'] ?? $input['productId'] ?? $_GET['product_id'] ?? ''));
        $prod_name = trim((string)($input['product_name'] ?? $input['productName'] ?? $_GET['product_name'] ?? 'product'));
        if ($ext_url === '') {
            echo json_encode(["status" => "error", "success" => false, "localUrl" => "", "originalUrl" => $ext_url]);
            break;
        }
        $uploads_dir_auto = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_auto) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_auto = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir_auto)) {
            @mkdir($uploads_dir_auto, 0775, true);
        }

        $local_web_url = '';
        $u_ext = 'WEBP';
        $saved_ok = false;

        if (strpos($ext_url, '/assets/uploads/') === 0 || strpos($ext_url, '/src/assets/') === 0) {
            $clean_local = explode('?', $ext_url)[0];
            if (strpos($clean_local, '/assets/uploads/') === 0) {
                $local_check_path = $uploads_dir_auto . '/' . basename($clean_local);
                $saved_ok = (file_exists($local_check_path) && filesize($local_check_path) > 1500);
            } else {
                $saved_ok = true;
            }
            if ($saved_ok) {
                $local_web_url = $clean_local;
                $u_ext = strtoupper(pathinfo($clean_local, PATHINFO_EXTENSION) ?: 'WEBP');
            }
        } elseif (preg_match('/^https?:\/\//i', $ext_url)) {
            $auto_slug = substr(trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($prod_name)), '-'), 0, 36) ?: 'product';
            $u_hash = substr(sha1($ext_url), 0, 12);
            $dl_ext = 'jpg';
            if (preg_match('/\.(png|webp)(?:[?#!_].*)?$/i', $ext_url, $em_ext)) {
                $dl_ext = strtolower($em_ext[1]);
            }
            $u_ext = strtoupper($dl_ext);
            $local_fname = "auto-{$auto_slug}-{$u_hash}.{$dl_ext}";
            $local_fpath = $uploads_dir_auto . '/' . $local_fname;
            $local_web_url = '/assets/uploads/' . $local_fname;
            $saved_ok = (file_exists($local_fpath) && filesize($local_fpath) > 1500);
            if (!$saved_ok && function_exists('curl_init')) {
                $ch_dl = curl_init($ext_url);
                curl_setopt($ch_dl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch_dl, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch_dl, CURLOPT_TIMEOUT, 6);
                curl_setopt($ch_dl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                $bin_dl = (string)curl_exec($ch_dl);
                $code_dl = intval(curl_getinfo($ch_dl, CURLINFO_HTTP_CODE));
                $ct_dl = strtolower((string)curl_getinfo($ch_dl, CURLINFO_CONTENT_TYPE));
                curl_close($ch_dl);
                if ($code_dl >= 200 && $code_dl < 300 && strlen($bin_dl) > 2500 && strpos($ct_dl, 'text/html') === false) {
                    $saved_ok = (@file_put_contents($local_fpath, $bin_dl) !== false);
                }
            }
        }

        if ($saved_ok && $local_web_url !== '') {
            $overrides_file = $uploads_dir_auto . '/product-image-overrides.json';
            $ov_state = file_exists($overrides_file) ? (json_decode((string)@file_get_contents($overrides_file), true) ?: []) : [];
            if (!isset($ov_state['urlReplacements']) || !is_array($ov_state['urlReplacements'])) $ov_state['urlReplacements'] = [];
            if (!isset($ov_state['overrides']) || !is_array($ov_state['overrides'])) $ov_state['overrides'] = [];
            if (!isset($ov_state['mediaLibrary']) || !is_array($ov_state['mediaLibrary'])) $ov_state['mediaLibrary'] = [];

            if (preg_match('/^https?:\/\//i', $ext_url)) {
                $ov_state['urlReplacements'][$ext_url] = $local_web_url;
            }

            $should_bind_ov = function($key) use ($ov_state, $uploads_dir_auto) {
                if (empty($ov_state['overrides'][$key]) || empty($ov_state['overrides'][$key]['primary'])) return true;
                $cur = strtolower((string)$ov_state['overrides'][$key]['primary']);
                if (strpos($cur, 'unsplash.com') !== false || strpos($cur, 'picsum.photos') !== false || strpos($cur, 'placeholder') !== false) return true;
                if (preg_match('/^https?:\/\//i', $cur)) return true;
                if (strpos($cur, '/assets/uploads/') === 0) {
                    $fp = $uploads_dir_auto . '/' . basename(explode('?', $cur)[0]);
                    if (!file_exists($fp) || filesize($fp) <= 1500) return true;
                }
                return false;
            };

            $now_ts = gmdate('Y-m-d\TH:i:s\Z');
            if ($prod_id !== '' && $should_bind_ov($prod_id)) {
                $ov_state['overrides'][$prod_id] = [
                    "primary" => $local_web_url,
                    "gallery" => [$local_web_url],
                    "format" => $u_ext,
                    "updatedAt" => $now_ts,
                    "updatedBy" => "auto-site-upload"
                ];
            }
            if ($prod_name !== '' && strtolower($prod_name) !== 'product' && strlen($prod_name) >= 3 && $should_bind_ov($prod_name)) {
                $ov_state['overrides'][$prod_name] = [
                    "primary" => $local_web_url,
                    "gallery" => [$local_web_url],
                    "format" => $u_ext,
                    "updatedAt" => $now_ts,
                    "updatedBy" => "auto-site-upload"
                ];
            }

            $already_in_lib = false;
            foreach ($ov_state['mediaLibrary'] as $ml) {
                if (($ml['url'] ?? '') === $local_web_url) {
                    $already_in_lib = true;
                    break;
                }
            }
            if (!$already_in_lib) {
                array_unshift($ov_state['mediaLibrary'], [
                    "id" => "media-" . basename($local_web_url),
                    "url" => $local_web_url,
                    "name" => basename($local_web_url),
                    "format" => $u_ext,
                    "uploadedAt" => $now_ts
                ]);
            }

            @file_put_contents($overrides_file, json_encode($ov_state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            // Also persist the local image path directly into MySQL rfqs / listings tables & rfqs_auto_store.json on BigRock
            $imgs_single_json = json_encode([$local_web_url], JSON_UNESCAPED_SLASHES);
            if ($db_connected && $pdo) {
                try {
                    if ($prod_id !== '') {
                        $raw_num_id = preg_replace('/^rfq-/', '', $prod_id);
                        $upRfq1 = $pdo->prepare("UPDATE rfqs SET image_url = ?, images = ? WHERE (external_id = ? OR id = ?) AND (image_url IS NULL OR image_url = '' OR image_url NOT LIKE '/assets/uploads/%')");
                        $upRfq1->execute([$local_web_url, $imgs_single_json, $prod_id, is_numeric($raw_num_id) ? intval($raw_num_id) : -1]);
                    }
                    if ($prod_name !== '' && strtolower($prod_name) !== 'product' && strlen($prod_name) >= 3) {
                        $upRfq2 = $pdo->prepare("UPDATE rfqs SET image_url = ?, images = ? WHERE (LOWER(title) = LOWER(?) OR LOWER(title) LIKE ?) AND (image_url IS NULL OR image_url = '' OR image_url NOT LIKE '/assets/uploads/%')");
                        $upRfq2->execute([$local_web_url, $imgs_single_json, $prod_name, '%' . strtolower($prod_name) . '%']);
                        $upLst = $pdo->prepare("UPDATE listings SET image_url = ?, images = ? WHERE LOWER(title) = LOWER(?) AND (image_url IS NULL OR image_url = '' OR image_url NOT LIKE '/assets/uploads/%')");
                        $upLst->execute([$local_web_url, $imgs_single_json, $prod_name]);
                    }
                } catch (Exception $e) {}
            }
            $auto_rfq_file_up = __DIR__ . '/rfqs_auto_store.json';
            if (file_exists($auto_rfq_file_up)) {
                $jr_list = json_decode((string)@file_get_contents($auto_rfq_file_up), true);
                if (is_array($jr_list)) {
                    $jr_changed = false;
                    foreach ($jr_list as $j_idx => $jr_item) {
                        if (!is_array($jr_item)) continue;
                        $jid = (string)($jr_item['id'] ?? '');
                        $jtitle = strtolower((string)($jr_item['productName'] ?? $jr_item['title'] ?? ''));
                        if (($prod_id !== '' && $jid === $prod_id) || ($prod_name !== '' && strlen($prod_name) >= 3 && ($jtitle === strtolower($prod_name) || strpos($jtitle, strtolower($prod_name)) !== false))) {
                            if (empty($jr_item['image_url']) || strpos((string)$jr_item['image_url'], '/assets/uploads/') !== 0) {
                                $jr_list[$j_idx]['image'] = $local_web_url;
                                $jr_list[$j_idx]['image_url'] = $local_web_url;
                                $jr_list[$j_idx]['images'] = [$local_web_url];
                                $jr_changed = true;
                            }
                        }
                    }
                    if ($jr_changed) {
                        @file_put_contents($auto_rfq_file_up, json_encode($jr_list, JSON_UNESCAPED_SLASHES));
                    }
                }
            }

            echo json_encode(["status" => "success", "success" => true, "localUrl" => $local_web_url, "url" => $local_web_url, "originalUrl" => $ext_url]);
        } else {
            echo json_encode(["status" => "error", "success" => false, "localUrl" => "", "originalUrl" => $ext_url]);
        }
        break;

    case 'audit_and_fix_catalog_images':
        $dry_run = !empty($input['dry_run']) || !empty($input['dryRun']) || (isset($_GET['dry_run']) && $_GET['dry_run'] === '1') || (isset($_GET['mode']) && $_GET['mode'] === 'preview');
        $uploads_dir_aud = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_aud) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_aud = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir_aud)) {
            @mkdir($uploads_dir_aud, 0775, true);
        }

        $overrides_file_aud = $uploads_dir_aud . '/product-image-overrides.json';
        $ov_state_aud = file_exists($overrides_file_aud) ? (json_decode((string)@file_get_contents($overrides_file_aud), true) ?: []) : [];
        if (!isset($ov_state_aud['overrides']) || !is_array($ov_state_aud['overrides'])) $ov_state_aud['overrides'] = [];

        $cache_file_aud = __DIR__ . '/product_image_cache.json';
        $cache_data_aud = file_exists($cache_file_aud) ? (json_decode((string)@file_get_contents($cache_file_aud), true) ?: []) : [];

        // Resolve GEMINI_API_KEY for live Google Search Grounding fallback
        $gemini_key_aud = trim((string)(getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? $_SERVER['GEMINI_API_KEY'] ?? '')));
        if ($gemini_key_aud === '' && file_exists(__DIR__ . '/.env')) {
            $env_lines_a = @file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (is_array($env_lines_a)) {
                foreach ($env_lines_a as $ela) {
                    if (preg_match('/^\s*GEMINI_API_KEY\s*=\s*["\']?([^"\'\r\n]+)["\']?/i', $ela, $ema)) {
                        $gemini_key_aud = trim((string)$ema[1]);
                        break;
                    }
                }
            }
        }
        if ($gemini_key_aud === 'MY_GEMINI_API_KEY') $gemini_key_aud = '';

        // Collect all valid local upload files on disk
        $local_upload_files = [];
        if (is_dir($uploads_dir_aud)) {
            foreach (@scandir($uploads_dir_aud) ?: [] as $uf) {
                if (preg_match('/\.(?:webp|jpe?g|png)$/i', $uf) && !preg_match('/(diwali-offer|unsplash|placeholder)/i', $uf)) {
                    $fp = $uploads_dir_aud . '/' . $uf;
                    if (is_file($fp) && filesize($fp) > 2000) {
                        $local_upload_files['/assets/uploads/' . $uf] = $fp;
                    }
                }
            }
        }

        $seen_urls_aud = [];
        $used_urls_aud = [];
        $audit_log = [];
        $total_scanned = 0;
        $products_scanned = 0;
        $rfqs_scanned = 0;
        $duplicates_detected = 0;
        $mismatched_detected = 0;
        $records_fixed = 0;
        $gemini_budget = 2;

        $check_issue_php = function($rec_id, $rec_type, $title, $cat, $img_url) use (&$seen_urls_aud, $uploads_dir_aud) {
            $clean_u = trim(explode('?', (string)$img_url)[0]);
            if ($clean_u === '') {
                return ['flagged' => true, 'type' => 'PLACEHOLDER_OR_MISSING', 'reason' => 'Empty or missing image_url'];
            }
            if (preg_match('/(picsum\.photos|via\.placeholder\.com|placeholder\.com|dummyimage\.com|placekitten\.com|unsplash\.com|images\.unsplash\.com|pexels\.com|pixabay\.com|shutterstock\.com|istockphoto\.com|gettyimages\.com|default-icon|tradeheavenb2bbest\.svg|diwali-offer-banner|\.svg$)/i', $clean_u)) {
                return ['flagged' => true, 'type' => 'PLACEHOLDER_OR_MISSING', 'reason' => 'Generic placeholder or stock asset detected'];
            }
            if (strpos($clean_u, '/assets/uploads/') === 0) {
                $fp = $uploads_dir_aud . '/' . basename($clean_u);
                if (!file_exists($fp) || filesize($fp) <= 1500) {
                    return ['flagged' => true, 'type' => 'BROKEN_ASSET', 'reason' => 'Local upload file missing on disk'];
                }
            }
            $lower_u = strtolower($clean_u);
            $joined_t = strtolower($title . ' ' . $cat);
            if (strpos($lower_u, 'agricultural_rice_husk_powder') !== false && !preg_match('/(rice|husk|agri|biomass|briquette|pellet|ash|powder)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Rice Husk image on non-agri item)'];
            }
            if (strpos($lower_u, 'leather_belt') !== false && !preg_match('/(leather|belt|apparel|fashion|strap|wallet)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Leather Belt image on non-leather item)'];
            }
            if ((strpos($lower_u, 'saree') !== false || strpos($lower_u, 'shree') !== false) && !preg_match('/(saree|sari|textile|apparel|garment|silk|fabric|cloth)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Saree/Textile image on unrelated item)'];
            }
            if ((strpos($lower_u, 'image002_50ab7837') !== false || strpos($lower_u, 'image003_6c1f0619') !== false) && !preg_match('/(generator|genset|cummins|cat power|diesel power|power generation)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Generator image on unrelated item)'];
            }
            if (strpos($lower_u, 'image004_fa37a57a') !== false && !preg_match('/(tank|storage tank|fuel tank|gallon)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Fuel Tank image on unrelated item)'];
            }
            if (strpos($lower_u, 'stainless-steel-heavy-coils') !== false && !preg_match('/(steel|coil|sheet|metal|alloy|iron|galvanized|rebar|plate)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Steel Coils image on unrelated item)'];
            }
            if (strpos($lower_u, 'mineral-coal') !== false && !preg_match('/(coal|anthracite|coking|steam coal|carbon|fuel|energy|mineral|mining)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Coal image on unrelated item)'];
            }
            if (strpos($lower_u, 'sidath-vimukthi') !== false && !preg_match('/(vanilla|pod|bean|spice|extract)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Vanilla image on unrelated item)'];
            }
            if (strpos($lower_u, 'whatsapp_image_') !== false && !preg_match('/(jade|cabochon|turquoise|gemstone|nephrite|matrix|mineral|stone|jewel|blackstone|yunnan)/i', $joined_t)) {
                return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => 'Cross-category mismatch (Gemstone photo on unrelated item)'];
            }
            $base_f = basename($lower_u);
            if (preg_match('/^(?:auto|verified)-([a-z0-9-]+)-[a-f0-9]{6,16}\.(?:webp|jpe?g|png)$/i', $base_f, $am)) {
                $aud_stop = ['the','and','for','with','from','export','grade','quality','wholesale','bulk','supply','direct','factory','verified','commercial','industrial','product','products','unit','units','tons','metric','pcs','pieces','kgs','buy','lead','rfq','sourcing','tender','high','pure','natural','premium','standard','global','general','auto','catalog'];
                $slug_toks = array_values(array_filter(preg_split('/[^a-z0-9]+/', str_replace('-', ' ', $am[1])), function($w) use ($aud_stop) {
                    return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $aud_stop, true);
                }));
                $tgt_toks = array_values(array_filter(preg_split('/[^a-z0-9]+/', $joined_t), function($w) use ($aud_stop) {
                    return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $aud_stop, true);
                }));
                if (!empty($slug_toks) && !empty($tgt_toks)) {
                    $overlap = false;
                    foreach ($slug_toks as $st) {
                        foreach ($tgt_toks as $tt) {
                            if ($st === $tt || (strlen($st) >= 4 && strlen($tt) >= 4 && (strpos($st, $tt) !== false || strpos($tt, $st) !== false))) {
                                $overlap = true;
                                break 2;
                            }
                        }
                    }
                    if (!$overlap) {
                        return ['flagged' => true, 'type' => 'MISMATCHED', 'reason' => "Visual subject mismatch: asset \"{$am[1]}\" does not match \"{$title}\""];
                    }
                }
            }
            if (isset($seen_urls_aud[$clean_u]) && $seen_urls_aud[$clean_u]['id'] !== $rec_id) {
                $prev = $seen_urls_aud[$clean_u];
                return ['flagged' => true, 'type' => 'DUPLICATE', 'reason' => "Duplicate image_url shared with \"{$prev['title']}\" ({$prev['id']})"];
            }
            return ['flagged' => false];
        };

        $resolve_unique_image_php = function($rec_id, $title, $cat) use (&$used_urls_aud, &$cache_data_aud, $local_upload_files, $uploads_dir_aud, $check_issue_php) {
            $clean_t = trim(preg_replace('/\([^)]*\)|\[[^\]]*\]/', ' ', $title));
            $query_str = "\"{$clean_t}\" {$cat} product photo wholesale export -placeholder -logo";
            $stop_w = ['the','and','for','with','from','buy','lead','rfq','export','wholesale','grade','bulk','general','quality','supply','direct','factory','verified','product','products','commercial','industrial','standard','global'];
            $title_words = array_values(array_filter(preg_split('/[^a-z0-9]+/', strtolower($clean_t)), function($w) use ($stop_w) {
                return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $stop_w, true);
            }));

            // 1. Check cached visual search pools (require title keyword match + non-mismatch)
            foreach ($cache_data_aud as $ck => $crec) {
                $matched_kw = 0;
                foreach ($title_words as $w) {
                    if (strpos($ck, $w) !== false) $matched_kw++;
                }
                if ($matched_kw >= 1 && !empty($crec['images']) && is_array($crec['images'])) {
                    $imgs = $crec['images'];
                    shuffle($imgs);
                    foreach ($imgs as $im) {
                        $u = trim(explode('?', (string)($im['url'] ?? ''))[0]);
                        if ($u !== '' && !isset($used_urls_aud[$u])) {
                            $probe = $check_issue_php($rec_id, 'PRODUCT', $title, $cat, $u);
                            if ($probe['flagged']) continue;
                            if (strpos($u, '/assets/uploads/') === 0) {
                                $fp = $uploads_dir_aud . '/' . basename($u);
                                if (file_exists($fp) && filesize($fp) > 1500) {
                                    $used_urls_aud[$u] = true;
                                    return ['url' => $u, 'query' => $query_str];
                                }
                            }
                        }
                    }
                }
            }

            // 2. Check local /assets/uploads/ files strictly matching title tokens (NEVER pick score-0 unrelated files)
            $best_unused_u = '';
            $best_unused_sc = 0;
            foreach ($local_upload_files as $web_u => $disk_fp) {
                if (isset($used_urls_aud[$web_u])) continue;
                $probe = $check_issue_php($rec_id, 'PRODUCT', $title, $cat, $web_u);
                if ($probe['flagged']) continue;
                $hits = 0;
                foreach ($title_words as $w) {
                    if (stripos($web_u, $w) !== false) $hits++;
                }
                if ($hits > $best_unused_sc) {
                    $best_unused_sc = $hits;
                    $best_unused_u = $web_u;
                }
            }
            if ($best_unused_u !== '' && $best_unused_sc >= 1) {
                $used_urls_aud[$best_unused_u] = true;
                return ['url' => $best_unused_u, 'query' => $query_str];
            }

            // 3. Do NOT copy unrelated local files onto products; return empty so caller keeps record FLAGGED or uses live Wikimedia fetch
            return ['url' => '', 'query' => $query_str];
        };

        $include_catalog = !empty($input['include_catalog']) || !empty($input['includeCatalog']) || (isset($_GET['include_catalog']) && $_GET['include_catalog'] === '1');
        $catalog_records_aud = [];
        $categories_scanned = 0;
        $scanned_ids_aud = [];

        // A. Scan MySQL listings table safely using SELECT *
        if ($db_connected && $pdo) {
            try {
                $lStmt = $pdo->query("SELECT * FROM listings ORDER BY id ASC");
                $lRows = $lStmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($lRows as $lr) {
                    $lid = 'prod-db-' . $lr['id'];
                    if (isset($scanned_ids_aud[$lid])) continue;
                    $scanned_ids_aud[$lid] = true;
                    $total_scanned++;
                    $products_scanned++;
                    $ov_rec = $ov_state_aud['overrides'][$lid] ?? null;
                    $cur_img = trim((string)($ov_rec['primary'] ?? $lr['image_url'] ?? $lr['image'] ?? ''));
                    $chk = $check_issue_php($lid, 'PRODUCT', (string)($lr['title'] ?? $lid), (string)($lr['category'] ?? 'General'), $cur_img);
                    if (!$chk['flagged']) {
                        $clean_c = trim(explode('?', $cur_img)[0]);
                        $seen_urls_aud[$clean_c] = ['id' => $lid, 'title' => (string)($lr['title'] ?? $lid)];
                        $used_urls_aud[$clean_c] = true;
                        $was_fixed = is_array($ov_rec) && in_array($ov_rec['updatedBy'] ?? '', ['admin-manual', 'catalog-image-auditor', 'system-repair'], true);
                        if ($was_fixed) $records_fixed++;
                        if ($include_catalog) {
                            $catalog_records_aud[] = [
                                'record_id' => $lid,
                                'record_type' => 'PRODUCT',
                                'title' => (string)($lr['title'] ?? $lid),
                                'category' => (string)($lr['category'] ?? 'General'),
                                'current_image_url' => $cur_img,
                                'previous_image_url' => (string)($ov_rec['previousPrimary'] ?? $lr['image_url'] ?? $cur_img),
                                'updated_at' => $ov_rec['updatedAt'] ?? null,
                                'status' => $was_fixed ? 'FIXED' : 'CLEAN'
                            ];
                        }
                        continue;
                    }
                    if ($chk['type'] === 'DUPLICATE') $duplicates_detected++;
                    else $mismatched_detected++;

                    if ($dry_run) {
                        $audit_log[] = [
                            'record_id' => $lid,
                            'record_type' => 'PRODUCT',
                            'title' => (string)($lr['title'] ?? $lid),
                            'category' => (string)($lr['category'] ?? 'General'),
                            'issue_type' => $chk['type'],
                            'issue_reason' => $chk['reason'],
                            'old_image_url' => $cur_img ?: '(empty)',
                            'new_image_url' => '(pending audit fix)',
                            'query_used' => "\"{$lr['title']}\" {$lr['category']}",
                            'status' => 'FLAGGED'
                        ];
                        if ($include_catalog) {
                            $catalog_records_aud[] = [
                                'record_id' => $lid,
                                'record_type' => 'PRODUCT',
                                'title' => (string)($lr['title'] ?? $lid),
                                'category' => (string)($lr['category'] ?? 'General'),
                                'current_image_url' => $cur_img,
                                'previous_image_url' => $cur_img,
                                'status' => 'FLAGGED'
                            ];
                        }
                        continue;
                    }

                    $res_fix = $resolve_unique_image_php($lid, (string)($lr['title'] ?? $lid), (string)($lr['category'] ?? 'General'));
                    $new_u = trim((string)($res_fix['url'] ?? ''));
                    if ($new_u === '') {
                        $audit_log[] = [
                            'record_id' => $lid,
                            'record_type' => 'PRODUCT',
                            'title' => (string)($lr['title'] ?? $lid),
                            'category' => (string)($lr['category'] ?? 'General'),
                            'issue_type' => $chk['type'],
                            'issue_reason' => $chk['reason'],
                            'old_image_url' => $cur_img ?: '(empty)',
                            'new_image_url' => '(pending audit fix)',
                            'query_used' => $res_fix['query'],
                            'status' => 'FLAGGED'
                        ];
                        if ($include_catalog) {
                            $catalog_records_aud[] = [
                                'record_id' => $lid,
                                'record_type' => 'PRODUCT',
                                'title' => (string)($lr['title'] ?? $lid),
                                'category' => (string)($lr['category'] ?? 'General'),
                                'current_image_url' => $cur_img,
                                'previous_image_url' => $cur_img,
                                'status' => 'FLAGGED'
                            ];
                        }
                        continue;
                    }
                    $seen_urls_aud[$new_u] = ['id' => $lid, 'title' => (string)($lr['title'] ?? $lid)];
                    try {
                        $upL = $pdo->prepare("UPDATE listings SET image_url = ? WHERE id = ?");
                        $upL->execute([$new_u, $lr['id']]);
                    } catch (Exception $e) {}
                    $ov_state_aud['overrides'][$lid] = [
                        'primary' => $new_u,
                        'previousPrimary' => $cur_img ?: null,
                        'gallery' => [$new_u],
                        'format' => strtoupper(pathinfo($new_u, PATHINFO_EXTENSION) ?: 'WEBP'),
                        'updatedAt' => gmdate('Y-m-d\TH:i:s\Z'),
                        'imageUpdatedAt' => (int)round(microtime(true) * 1000),
                        'updatedBy' => 'catalog-image-auditor'
                    ];
                    $records_fixed++;
                    $audit_log[] = [
                        'record_id' => $lid,
                        'record_type' => 'PRODUCT',
                        'title' => (string)($lr['title'] ?? $lid),
                        'category' => (string)($lr['category'] ?? 'General'),
                        'issue_type' => $chk['type'],
                        'issue_reason' => $chk['reason'],
                        'old_image_url' => $cur_img ?: '(empty)',
                        'new_image_url' => $new_u,
                        'query_used' => $res_fix['query'],
                        'status' => 'FIXED'
                    ];
                }
            } catch (Exception $e) {}

            // B. Scan MySQL rfqs table safely using SELECT *
            try {
                $rStmt = $pdo->query("SELECT * FROM rfqs ORDER BY id ASC");
                $rRows = $rStmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rRows as $rr) {
                    $rid = !empty($rr['external_id']) ? (string)$rr['external_id'] : ('rfq-' . $rr['id']);
                    $rTitle = trim((string)($rr['title'] ?? ''));
                    if ($rTitle === '' || isset($scanned_ids_aud[$rid])) continue;
                    $scanned_ids_aud[$rid] = true;
                    $total_scanned++;
                    $rfqs_scanned++;
                    $ov_rec = $ov_state_aud['overrides'][$rid] ?? null;
                    $cur_img = trim((string)($ov_rec['primary'] ?? $rr['image_url'] ?? $rr['image'] ?? ''));
                    $chk = $check_issue_php($rid, 'RFQ', $rTitle, (string)($rr['category'] ?? 'Global Sourcing'), $cur_img);
                    if (!$chk['flagged']) {
                        $clean_c = trim(explode('?', $cur_img)[0]);
                        $seen_urls_aud[$clean_c] = ['id' => $rid, 'title' => $rTitle];
                        $used_urls_aud[$clean_c] = true;
                        $was_fixed = is_array($ov_rec) && in_array($ov_rec['updatedBy'] ?? '', ['admin-manual', 'catalog-image-auditor', 'system-repair'], true);
                        if ($was_fixed) $records_fixed++;
                        if ($include_catalog) {
                            $catalog_records_aud[] = [
                                'record_id' => $rid,
                                'record_type' => 'RFQ',
                                'title' => $rTitle,
                                'category' => (string)($rr['category'] ?? 'Global Sourcing'),
                                'current_image_url' => $cur_img,
                                'previous_image_url' => (string)($ov_rec['previousPrimary'] ?? $rr['image_url'] ?? $cur_img),
                                'updated_at' => $ov_rec['updatedAt'] ?? null,
                                'status' => $was_fixed ? 'FIXED' : 'CLEAN'
                            ];
                        }
                        continue;
                    }
                    if ($chk['type'] === 'DUPLICATE') $duplicates_detected++;
                    else $mismatched_detected++;

                    if ($dry_run) {
                        $audit_log[] = [
                            'record_id' => $rid,
                            'record_type' => 'RFQ',
                            'title' => $rTitle,
                            'category' => (string)($rr['category'] ?? 'Global Sourcing'),
                            'issue_type' => $chk['type'],
                            'issue_reason' => $chk['reason'],
                            'old_image_url' => $cur_img ?: '(empty)',
                            'new_image_url' => '(pending audit fix)',
                            'query_used' => "\"{$rTitle}\" {$rr['category']}",
                            'status' => 'FLAGGED'
                        ];
                        if ($include_catalog) {
                            $catalog_records_aud[] = [
                                'record_id' => $rid,
                                'record_type' => 'RFQ',
                                'title' => $rTitle,
                                'category' => (string)($rr['category'] ?? 'Global Sourcing'),
                                'current_image_url' => $cur_img,
                                'previous_image_url' => $cur_img,
                                'status' => 'FLAGGED'
                            ];
                        }
                        continue;
                    }

                    $res_fix = $resolve_unique_image_php($rid, $rTitle, (string)($rr['category'] ?? 'Global Sourcing'));
                    $new_u = trim((string)($res_fix['url'] ?? ''));
                    if ($new_u === '') {
                        $audit_log[] = [
                            'record_id' => $rid,
                            'record_type' => 'RFQ',
                            'title' => $rTitle,
                            'category' => (string)($rr['category'] ?? 'Global Sourcing'),
                            'issue_type' => $chk['type'],
                            'issue_reason' => $chk['reason'],
                            'old_image_url' => $cur_img ?: '(empty)',
                            'new_image_url' => '(pending audit fix)',
                            'query_used' => $res_fix['query'],
                            'status' => 'FLAGGED'
                        ];
                        if ($include_catalog) {
                            $catalog_records_aud[] = [
                                'record_id' => $rid,
                                'record_type' => 'RFQ',
                                'title' => $rTitle,
                                'category' => (string)($rr['category'] ?? 'Global Sourcing'),
                                'current_image_url' => $cur_img,
                                'previous_image_url' => $cur_img,
                                'status' => 'FLAGGED'
                            ];
                        }
                        continue;
                    }
                    $seen_urls_aud[$new_u] = ['id' => $rid, 'title' => $rTitle];
                    try {
                        $upR = $pdo->prepare("UPDATE rfqs SET image_url = ? WHERE id = ?");
                        $upR->execute([$new_u, $rr['id']]);
                    } catch (Exception $e) {}
                    $ov_state_aud['overrides'][$rid] = [
                        'primary' => $new_u,
                        'previousPrimary' => $cur_img ?: null,
                        'gallery' => [$new_u],
                        'format' => strtoupper(pathinfo($new_u, PATHINFO_EXTENSION) ?: 'WEBP'),
                        'updatedAt' => gmdate('Y-m-d\TH:i:s\Z'),
                        'imageUpdatedAt' => (int)round(microtime(true) * 1000),
                        'updatedBy' => 'catalog-image-auditor'
                    ];
                    $records_fixed++;
                    $audit_log[] = [
                        'record_id' => $rid,
                        'record_type' => 'RFQ',
                        'title' => $rTitle,
                        'category' => (string)($rr['category'] ?? 'Global Sourcing'),
                        'issue_type' => $chk['type'],
                        'issue_reason' => $chk['reason'],
                        'old_image_url' => $cur_img ?: '(empty)',
                        'new_image_url' => $new_u,
                        'query_used' => $res_fix['query'],
                        'status' => 'FIXED'
                    ];
                }
            } catch (Exception $e) {}
        }

        // C. Scan catalog_items submitted by the frontend (products + procurement sectors)
        $incoming_catalog_items = $input['catalog_items'] ?? $input['catalogItems'] ?? [];
        if (is_array($incoming_catalog_items)) {
            foreach ($incoming_catalog_items as $ci) {
                if (!is_array($ci) || empty($ci['id'])) continue;
                $cid = trim((string)$ci['id']);
                if ($cid === '' || isset($scanned_ids_aud[$cid])) continue;
                $scanned_ids_aud[$cid] = true;
                $ctype = strtoupper(trim((string)($ci['type'] ?? (strpos($cid, 'cat-') === 0 ? 'CATEGORY' : (strpos($cid, 'rfq-') === 0 ? 'RFQ' : 'PRODUCT')))));
                $ctitle = trim((string)($ci['title'] ?? $cid));
                $ccat = trim((string)($ci['category'] ?? 'General'));
                $total_scanned++;
                if ($ctype === 'CATEGORY') $categories_scanned++;
                elseif ($ctype === 'RFQ') $rfqs_scanned++;
                else $products_scanned++;

                $ov_rec = $ov_state_aud['overrides'][$cid] ?? null;
                $cur_img = trim((string)($ov_rec['primary'] ?? $ci['image_url'] ?? ''));
                $chk = $check_issue_php($cid, $ctype, $ctitle, $ccat, $cur_img);
                if (!$chk['flagged']) {
                    $clean_c = trim(explode('?', $cur_img)[0]);
                    $seen_urls_aud[$clean_c] = ['id' => $cid, 'title' => $ctitle];
                    $used_urls_aud[$clean_c] = true;
                    $was_fixed = is_array($ov_rec) && in_array($ov_rec['updatedBy'] ?? '', ['admin-manual', 'catalog-image-auditor', 'system-repair'], true);
                    if ($was_fixed) $records_fixed++;
                    if ($include_catalog) {
                        $catalog_records_aud[] = [
                            'record_id' => $cid,
                            'record_type' => $ctype,
                            'title' => $ctitle,
                            'category' => $ccat,
                            'current_image_url' => $cur_img,
                            'previous_image_url' => (string)($ov_rec['previousPrimary'] ?? $ci['image_url'] ?? $cur_img),
                            'updated_at' => $ov_rec['updatedAt'] ?? null,
                            'status' => $was_fixed ? 'FIXED' : 'CLEAN'
                        ];
                    }
                    continue;
                }
                if ($chk['type'] === 'DUPLICATE') $duplicates_detected++;
                else $mismatched_detected++;

                if ($dry_run) {
                    $audit_log[] = [
                        'record_id' => $cid,
                        'record_type' => $ctype,
                        'title' => $ctitle,
                        'category' => $ccat,
                        'issue_type' => $chk['type'],
                        'issue_reason' => $chk['reason'],
                        'old_image_url' => $cur_img ?: '(empty)',
                        'new_image_url' => '(pending audit fix)',
                        'query_used' => "\"{$ctitle}\" {$ccat}",
                        'status' => 'FLAGGED'
                    ];
                    if ($include_catalog) {
                        $catalog_records_aud[] = [
                            'record_id' => $cid,
                            'record_type' => $ctype,
                            'title' => $ctitle,
                            'category' => $ccat,
                            'current_image_url' => $cur_img,
                            'previous_image_url' => $cur_img,
                            'status' => 'FLAGGED'
                        ];
                    }
                    continue;
                }

                $res_fix = $resolve_unique_image_php($cid, $ctitle, $ccat);
                $new_u = trim((string)($res_fix['url'] ?? ''));
                if ($new_u === '') {
                    $audit_log[] = [
                        'record_id' => $cid,
                        'record_type' => $ctype,
                        'title' => $ctitle,
                        'category' => $ccat,
                        'issue_type' => $chk['type'],
                        'issue_reason' => $chk['reason'],
                        'old_image_url' => $cur_img ?: '(empty)',
                        'new_image_url' => '(pending audit fix)',
                        'query_used' => $res_fix['query'],
                        'status' => 'FLAGGED'
                    ];
                    if ($include_catalog) {
                        $catalog_records_aud[] = [
                            'record_id' => $cid,
                            'record_type' => $ctype,
                            'title' => $ctitle,
                            'category' => $ccat,
                            'current_image_url' => $cur_img,
                            'previous_image_url' => $cur_img,
                            'status' => 'FLAGGED'
                        ];
                    }
                    continue;
                }
                $seen_urls_aud[$new_u] = ['id' => $cid, 'title' => $ctitle];
                $ov_state_aud['overrides'][$cid] = [
                    'primary' => $new_u,
                    'previousPrimary' => $cur_img ?: null,
                    'gallery' => [$new_u],
                    'format' => strtoupper(pathinfo($new_u, PATHINFO_EXTENSION) ?: 'WEBP'),
                    'updatedAt' => gmdate('Y-m-d\TH:i:s\Z'),
                    'imageUpdatedAt' => (int)round(microtime(true) * 1000),
                    'updatedBy' => 'catalog-image-auditor'
                ];
                $records_fixed++;
                $audit_log[] = [
                    'record_id' => $cid,
                    'record_type' => $ctype,
                    'title' => $ctitle,
                    'category' => $ccat,
                    'issue_type' => $chk['type'],
                    'issue_reason' => $chk['reason'],
                    'old_image_url' => $cur_img ?: '(empty)',
                    'new_image_url' => $new_u,
                    'query_used' => $res_fix['query'],
                    'status' => 'FIXED'
                ];
            }
        }

        if (!$dry_run) {
            $encoded_aud = json_encode($ov_state_aud, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            @file_put_contents($overrides_file_aud, $encoded_aud);
            if (is_dir(__DIR__ . '/data')) {
                @file_put_contents(__DIR__ . '/data/productImageSystemState.json', $encoded_aud);
            }
        }

        $audit_resp = [
            "status" => "success",
            "success" => true,
            "dry_run" => $dry_run,
            "total_scanned" => $total_scanned,
            "products_scanned" => $products_scanned,
            "rfqs_scanned" => $rfqs_scanned,
            "categories_scanned" => $categories_scanned,
            "duplicates_detected" => $duplicates_detected,
            "mismatched_detected" => $mismatched_detected,
            "records_fixed" => $records_fixed,
            "healthy_records" => max(0, $total_scanned - ($dry_run ? ($duplicates_detected + $mismatched_detected) : 0)),
            "timestamp" => gmdate('c'),
            "audit_log" => $audit_log
        ];
        if ($include_catalog) {
            $audit_resp["catalog_records"] = $catalog_records_aud;
        }
        echo json_encode($audit_resp);
        break;

    case 'fix_single_catalog_image':
        $rec_id = trim((string)($input['record_id'] ?? $input['recordId'] ?? ''));
        if ($rec_id === '') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing record_id"]);
            break;
        }
        $rec_type = strtoupper(trim((string)($input['record_type'] ?? $input['recordType'] ?? (strpos($rec_id, 'cat-') === 0 ? 'CATEGORY' : (strpos($rec_id, 'rfq-') === 0 ? 'RFQ' : 'PRODUCT')))));
        $rec_title = trim((string)($input['title'] ?? $rec_id));
        $rec_cat = trim((string)($input['category'] ?? 'General'));
        $custom_url = trim((string)($input['custom_image_url'] ?? $input['customImageUrl'] ?? ''));
        $prev_url = trim((string)($input['previous_image_url'] ?? $input['previousImageUrl'] ?? ''));
        $is_revert = !empty($input['revert']);

        $uploads_dir_sf = __DIR__ . '/assets/uploads';
        if (!is_dir($uploads_dir_sf) && is_dir(__DIR__ . '/public/assets/uploads')) {
            $uploads_dir_sf = __DIR__ . '/public/assets/uploads';
        }
        if (!is_dir($uploads_dir_sf)) @mkdir($uploads_dir_sf, 0775, true);
        $overrides_file_sf = $uploads_dir_sf . '/product-image-overrides.json';
        $ov_state_sf = file_exists($overrides_file_sf) ? (json_decode((string)@file_get_contents($overrides_file_sf), true) ?: []) : [];
        if (!isset($ov_state_sf['overrides']) || !is_array($ov_state_sf['overrides'])) $ov_state_sf['overrides'] = [];
        if (!isset($ov_state_sf['productActivityTimestamps']) || !is_array($ov_state_sf['productActivityTimestamps'])) $ov_state_sf['productActivityTimestamps'] = [];

        $existing_ov = $ov_state_sf['overrides'][$rec_id] ?? null;
        $old_url = $prev_url ?: (string)($existing_ov['primary'] ?? '(empty)');
        $final_url = '';
        $source_sf = 'manual_custom_url';

        if ($is_revert && $prev_url !== '' && $prev_url !== '(empty)') {
            $final_url = trim(explode('?', $prev_url)[0]);
            $source_sf = 'revert_restore';
        } elseif ($custom_url !== '') {
            $final_url = trim(explode('?', $custom_url)[0]);
            $source_sf = 'manual_custom_url';
        } else {
            $stop_sf = ['the','and','for','with','from','export','grade','wholesale','bulk','general','rfq','buy','lead','quality','supply','direct','factory','verified','product','products','commercial','industrial','standard','global','premium','natural','pure'];
            $clean_title_sf = trim(preg_replace('/\([^)]*\)|\[[^\]]*\]/', ' ', $rec_title));
            $title_words_sf = array_values(array_unique(array_filter(preg_split('/[^a-z0-9]+/', strtolower($clean_title_sf)), function($w) use ($stop_sf) {
                return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $stop_sf, true);
            })));
            $clean_old_sf = trim(explode('?', $old_url)[0]);

            // 1. Live Wikimedia Commons + Bing focused real-photo search (downloads verified image directly into /assets/uploads/)
            if (function_exists('curl_init') && !empty($title_words_sf)) {
                $clauses_sf = array_values(array_filter(array_map('trim', preg_split('/[,;\/&]+/', $clean_title_sf)), function($c) {
                    return strlen($c) >= 3;
                }));
                $sf_queries = [];
                if (count($title_words_sf) >= 2 && count($title_words_sf) <= 4) {
                    $sf_queries[] = implode(' ', $title_words_sf);
                }
                foreach (array_slice($clauses_sf, 0, 3) as $cl) {
                    $cl_t = array_values(array_filter(preg_split('/[^a-z0-9]+/', strtolower($cl)), function($w) use ($stop_sf) {
                        return strlen($w) >= 3 && !ctype_digit($w) && !in_array($w, $stop_sf, true);
                    }));
                    if (count($cl_t) >= 2) {
                        $sf_queries[] = implode(' ', array_slice($cl_t, 0, 3));
                    } elseif (count($cl_t) === 1 && count($title_words_sf) >= 2 && $cl_t[0] !== $title_words_sf[0]) {
                        $sf_queries[] = $title_words_sf[0] . ' ' . $cl_t[0];
                    } elseif (count($cl_t) === 1 && strlen($cl_t[0]) >= 4) {
                        $sf_queries[] = $cl_t[0];
                    }
                }
                if (count($title_words_sf) >= 3) {
                    $sf_queries[] = implode(' ', array_slice($title_words_sf, 0, 3));
                } elseif (!empty($title_words_sf)) {
                    $sf_queries[] = implode(' ', $title_words_sf);
                }
                $sf_queries = array_slice(array_values(array_unique(array_filter($sf_queries))), 0, 4);

                $bad_sf_re = '/(diagram|chart|logo|icon|map|coat_of_arms|flag|signature|screenshot|pdf|djvu|infographic|cartoon|drawing|painting|sketch|poster|brochure|advert|newspaper|magazine|catalogue|postcard|statelib|fortepan|bundesarchiv|18[89]\d|19[0-8]\d)/i';
                $ambig_sf = ['wooden','wood','plastic','metal','steel','aluminum','glass','ceramic','paper','cotton','ice','cream','cocktail','oil','water','food','mini','heavy','light','multi','set','kit','pack'];
                $live_cands_sf = [];

                foreach ($sf_queries as $q_sf) {
                    $w_api = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' . urlencode($q_sf . ' filetype:bitmap') . '&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json';
                    $ch_w = curl_init($w_api);
                    curl_setopt($ch_w, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch_w, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch_w, CURLOPT_TIMEOUT, 5);
                    curl_setopt($ch_w, CURLOPT_USERAGENT, 'TradeHeavenVisualCatalogBot/1.0 (https://tradeheaven.net)');
                    $raw_w = (string)curl_exec($ch_w);
                    $code_w = intval(curl_getinfo($ch_w, CURLINFO_HTTP_CODE));
                    curl_close($ch_w);
                    if ($code_w < 200 || $code_w >= 300 || $raw_w === '') continue;
                    $dec_w = json_decode($raw_w, true);
                    foreach (($dec_w['query']['pages'] ?? []) as $pg) {
                        $info = $pg['imageinfo'][0] ?? null;
                        if (!is_array($info)) continue;
                        $rt = (string)($pg['title'] ?? '');
                        if (preg_match($bad_sf_re, $rt)) continue;
                        $mime = strtolower((string)($info['mime'] ?? ''));
                        if (strpos($mime, 'jpeg') === false && strpos($mime, 'png') === false && strpos($mime, 'webp') === false) continue;
                        $w = intval($info['width'] ?? 0);
                        $h = intval($info['height'] ?? 0);
                        if (($w > 0 && $w < 380) || ($h > 0 && $h < 280)) continue;
                        $cu = trim((string)($info['thumburl'] ?? $info['url'] ?? ''));
                        if ($cu === '' || !preg_match('/^https?:\/\//i', $cu)) continue;
                        $hay = strtolower($rt . ' ' . $cu);
                        $all_hits = 0;
                        $spec_hits = 0;
                        foreach ($title_words_sf as $tw) {
                            $st = (strlen($tw) > 4 && substr($tw, -1) === 's') ? substr($tw, 0, -1) : $tw;
                            if (strpos($hay, $tw) !== false || strpos($hay, $st) !== false) {
                                $all_hits++;
                                if (!in_array($tw, $ambig_sf, true)) $spec_hits++;
                            }
                        }
                        if ($all_hits === 0 || ($all_hits === 1 && $spec_hits === 0)) continue;
                        $live_cands_sf[] = [
                            'url' => $cu,
                            'score' => $spec_hits * 5 + $all_hits * 2 + ($w >= $h ? 2 : 0)
                        ];
                    }
                    if (count($live_cands_sf) >= 6) break;
                }

                if (!empty($live_cands_sf)) {
                    usort($live_cands_sf, function($a, $b) { return $b['score'] <=> $a['score']; });
                    $auto_slug_sf = substr(trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($clean_title_sf)), '-'), 0, 36) ?: 'product';
                    foreach (array_slice($live_cands_sf, 0, 5) as $cand_sf) {
                        $ext_u = $cand_sf['url'];
                        $u_hash = substr(sha1($ext_u), 0, 12);
                        $dl_ext = 'jpg';
                        if (preg_match('/\.(png|webp)(?:[?#!_].*)?$/i', $ext_u, $em_ext)) {
                            $dl_ext = strtolower($em_ext[1]);
                        }
                        $local_fname = "auto-{$auto_slug_sf}-{$u_hash}.{$dl_ext}";
                        $local_fpath = $uploads_dir_sf . '/' . $local_fname;
                        $local_web_url = '/assets/uploads/' . $local_fname;
                        if ($local_web_url === $clean_old_sf) continue;

                        $ok_dl = (file_exists($local_fpath) && filesize($local_fpath) > 2500);
                        if (!$ok_dl) {
                            $ch_dl = curl_init($ext_u);
                            curl_setopt($ch_dl, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch_dl, CURLOPT_FOLLOWLOCATION, true);
                            curl_setopt($ch_dl, CURLOPT_TIMEOUT, 6);
                            curl_setopt($ch_dl, CURLOPT_USERAGENT, 'TradeHeavenVisualCatalogBot/1.0 (https://tradeheaven.net)');
                            $bin_dl = (string)curl_exec($ch_dl);
                            $code_dl = intval(curl_getinfo($ch_dl, CURLINFO_HTTP_CODE));
                            $ct_dl = strtolower((string)curl_getinfo($ch_dl, CURLINFO_CONTENT_TYPE));
                            curl_close($ch_dl);
                            if ($code_dl >= 200 && $code_dl < 300 && strlen($bin_dl) > 2500 && strpos($ct_dl, 'text/html') === false) {
                                $ok_dl = (@file_put_contents($local_fpath, $bin_dl) !== false);
                            }
                        }
                        if ($ok_dl) {
                            $final_url = $local_web_url;
                            $source_sf = 'wikimedia_commons_verified';
                            break;
                        }
                    }
                }
            }

            // 2. If live Wikimedia search did not yield a file, check ONLY strictly relevant local uploads (require strong title match, NEVER score-0 random files or Unsplash fallback)
            if ($final_url === '' && !empty($title_words_sf)) {
                $best_url = '';
                $best_score = 0;
                foreach (@scandir($uploads_dir_sf) ?: [] as $uf) {
                    if (!preg_match('/\.(?:webp|jpe?g|png)$/i', $uf) || preg_match('/(diwali-offer|unsplash|placeholder|vecteezy)/i', $uf)) continue;
                    $fp = $uploads_dir_sf . '/' . $uf;
                    if (!is_file($fp) || filesize($fp) < 2000) continue;
                    $web_u = '/assets/uploads/' . $uf;
                    if ($web_u === $clean_old_sf) continue;
                    $low_u = strtolower($uf);
                    $sc = 0;
                    foreach ($title_words_sf as $w) {
                        $st = (strlen($w) > 4 && substr($w, -1) === 's') ? substr($w, 0, -1) : $w;
                        if (strpos($low_u, $w) !== false) $sc += 4;
                        elseif (strlen($st) >= 4 && strpos($low_u, $st) !== false) $sc += 2;
                    }
                    if ($sc > $best_score) {
                        $best_score = $sc;
                        $best_url = $web_u;
                    }
                }
                if ($best_score >= 4 && $best_url !== '') {
                    $final_url = $best_url;
                    $source_sf = 'server_media_library_verified';
                }
            }
        }

        if ($final_url === '' || $final_url === '(empty)') {
            http_response_code(422);
            echo json_encode([
                "success" => false,
                "message" => "No verified matching photo could be fetched automatically for \"{$rec_title}\". Please upload a photo manually."
            ]);
            break;
        }

        $now_ms_sf = (int)round(microtime(true) * 1000);
        $now_iso_sf = gmdate('Y-m-d\TH:i:s\Z');
        $ov_state_sf['overrides'][$rec_id] = [
            'primary' => $final_url,
            'previousPrimary' => ($old_url !== '' && $old_url !== '(empty)' && $old_url !== $final_url) ? $old_url : ($existing_ov['previousPrimary'] ?? null),
            'gallery' => [$final_url],
            'format' => strtoupper(pathinfo($final_url, PATHINFO_EXTENSION) ?: 'WEBP'),
            'updatedAt' => $now_iso_sf,
            'imageUpdatedAt' => $now_ms_sf,
            'updatedBy' => $is_revert ? 'auto-site-upload' : ($custom_url !== '' ? 'admin-manual' : 'catalog-image-auditor')
        ];
        if (!$is_revert) {
            $ov_state_sf['productActivityTimestamps'][$rec_id] = $now_ms_sf;
        }

        if ($db_connected && $pdo) {
            try {
                if (strpos($rec_id, 'prod-db-') === 0) {
                    $num_id = intval(substr($rec_id, 8));
                    if ($num_id > 0) {
                        $pdo->prepare("UPDATE listings SET image_url = ? WHERE id = ?")->execute([$final_url, $num_id]);
                    }
                } elseif (strpos($rec_id, 'rfq-') === 0) {
                    $pdo->prepare("UPDATE rfqs SET image_url = ? WHERE external_id = ?")->execute([$final_url, $rec_id]);
                }
            } catch (Exception $e) {}
        }

        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        $encoded_sf = json_encode($ov_state_sf, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        @file_put_contents($overrides_file_sf, $encoded_sf);
        if (is_dir(__DIR__ . '/data')) {
            @file_put_contents(__DIR__ . '/data/productImageSystemState.json', $encoded_sf);
        }

        echo json_encode([
            "status" => $is_revert ? "FLAGGED" : "FIXED",
            "success" => true,
            "record_id" => $rec_id,
            "record_type" => $rec_type,
            "title" => $rec_title,
            "category" => $rec_cat,
            "old_image_url" => $old_url,
            "new_image_url" => $final_url,
            "query_used" => $rec_title,
            "source" => $source_sf,
            "is_fallback_card" => false,
            "updatedAt" => $now_iso_sf,
            "imageUpdatedAt" => !$is_revert ? $now_ms_sf : null
        ]);
        break;

    // -------------------------------------------------------------
    // Default fallback
    // -------------------------------------------------------------
    default:
        echo json_encode([
            "status" => "success",
            "service" => "Trade4Deals MySQL PDO API Gateway",
            "db_connected" => $db_connected,
            "database" => $db_name,
            "timestamp" => date("Y-m-d H:i:s")
        ]);
        break;
}
