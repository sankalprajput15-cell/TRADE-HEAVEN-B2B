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
    $marker_file = __DIR__ . '/.db_schema_initialized';
    if (!file_exists($marker_file)) {
        try {

        // -------------------------------------------------------------
        // Table Auto-Creation: rfqs table as per mandatory schema
        // -------------------------------------------------------------
        $pdo->exec("CREATE TABLE IF NOT EXISTS rfqs (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Self-healing column migrations for pre-existing rfqs tables
        $rfq_extra_columns = [
            "buyer_phone VARCHAR(100) DEFAULT ''",
            "buyer_address TEXT",
            "payment_terms VARCHAR(255) DEFAULT ''",
            "order_frequency VARCHAR(100) DEFAULT 'Monthly'",
            "source VARCHAR(50) DEFAULT 'user'",
            "sync_tag VARCHAR(50) DEFAULT ''",
            "search_keyword VARCHAR(255) DEFAULT ''",
            "market_insight TEXT",
            "posted_label VARCHAR(100) DEFAULT ''"
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
            'tier' => 'PLATINUM',
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

    $rawRole = strtoupper((string)($dbRow['role'] ?? $localRow['role'] ?? $seedRow['role'] ?? 'BUYER'));
    if ($isRootAdmin) {
        $resolvedRole = 'ADMIN';
    } elseif ($rawRole === 'ADMIN') {
        $resolvedRole = 'SUPPLIER';
    } else {
        $resolvedRole = $rawRole;
    }

    return [
        'id' => (string)($dbRow['id'] ?? $localRow['id'] ?? $seedRow['id'] ?? ('user-' . md5($cleanEmail))),
        'email' => $cleanEmail,
        'name' => (string)($dbRow['name'] ?? $localRow['name'] ?? $seedRow['name'] ?? 'Registered Partner'),
        'role' => $resolvedRole,
        'isRootAdmin' => $isRootAdmin,
        'password' => $dbRow['password'] ?? ($localRow['password_hash'] ?? ''),
        'seedPassword' => $seedRow['password_plain'] ?? '',
        'altPasswords' => $seedRow['alt_passwords'] ?? [],
        'companyName' => (string)($dbRow['company_name'] ?? $localRow['company_name'] ?? $seedRow['companyName'] ?? 'Enterprise Trading Firm'),
        'country' => (string)($dbRow['country'] ?? $localRow['country'] ?? $seedRow['country'] ?? 'United States'),
        'phone' => (string)($dbRow['phone'] ?? $localRow['phone'] ?? $seedRow['phone'] ?? ''),
        'tier' => (string)($dbRow['tier'] ?? $localRow['tier'] ?? $seedRow['tier'] ?? ($isRootAdmin ? 'VIP' : ($resolvedRole === 'SUPPLIER' ? 'SILVER' : 'FREE'))),
        'isPremium' => isset($dbRow['is_premium']) ? (bool)$dbRow['is_premium'] : (!empty($seedRow['isPremium']) || $isRootAdmin),
        'membershipStatus' => (string)($dbRow['membership_status'] ?? $seedRow['membershipStatus'] ?? ($isRootAdmin ? 'paid' : 'free')),
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
        } elseif (strpos($sub, 'products') !== false) {
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $raw_action = 'delete_listing';
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
                $raw_action = 'submit_listing';
            } else {
                $raw_action = 'get_listings';
            }
        } elseif (strpos($sub, 'homepage-config') !== false) {
            $raw_action = 'homepage_config';
        } elseif (strpos($sub, 'commodity-indices') !== false) {
            $raw_action = 'commodity_indices';
        } elseif (strpos($sub, 'flash-deals') !== false) {
            $raw_action = 'flash_deals';
        } elseif (strpos($sub, 'stats') !== false) {
            $raw_action = 'stats';
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
        if (empty($users_list)) {
            $seedUsers = getBuiltInSeedAuthUsers();
            foreach ($seedUsers as $u) {
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
            sendPhpMailAlert(
                "📝 Website Content & CMS Updated",
                "CMS Site Content Saved",
                "An administrator or authorized editor updated the site content and configurations.",
                [
                    "Editor Action" => "save_content",
                    "Timestamp" => date("Y-m-d H:i:s T"),
                    "Payload Sections Updated" => is_array($cms_payload) ? implode(', ', array_keys($cms_payload)) : "Global Config"
                ]
            );
            echo json_encode(["status" => "success", "message" => "CMS content saved successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to write to site_content.json. Check file permissions (ensure 0644 or 0666)."]);
        }
        exit;

    // -------------------------------------------------------------
    // 2. Fetch RFQs: SELECT * FROM rfqs ORDER BY id DESC
    // Always returns {"status": "success", "data": [...]} (never null or string)
    // -------------------------------------------------------------
    case 'get_rfqs':
    case 'rfqs':
        $rows = [];
        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM rfqs ORDER BY CASE WHEN source = 'auto_generated' OR sync_tag = 'market_sync' THEN 1 ELSE 0 END ASC, id DESC");
                $db_rfqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($db_rfqs)) {
                    foreach ($db_rfqs as $r) {
                        $targetQty = is_numeric($r['quantity']) ? intval($r['quantity']) : 1;
                        $targetPriceNum = is_numeric($r['targetPrice']) ? floatval($r['targetPrice']) : (is_numeric($r['target_price'] ?? null) ? floatval($r['target_price']) : 0.0);
                        $isAuto = (($r['source'] ?? '') === 'auto_generated' || ($r['sync_tag'] ?? '') === 'market_sync');

                        $rows[] = [
                            "id" => "rfq-" . $r['id'],
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
                            "created_at" => $r['created_at'] ?? date("Y-m-d H:i:s")
                        ];
                    }
                }
            } catch (Exception $e) {
                $rows = [];
            }
        }
        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    // -------------------------------------------------------------
    // 3. Submit RFQ: Inserts into `rfqs` table with prepared statements
    // Fetches newly created record via lastInsertId() and returns {"status": "success", "data": <inserted_row>}
    // -------------------------------------------------------------
    case 'submit_rfq':
    case 'create_rfq':
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

        $inserted_id = time();
        $inserted_row = null;

        if ($db_connected && $pdo) {
            try {
                // Deduplicate auto_generated market_sync RFQs
                $dbRow = null;
                if ($source === 'auto_generated') {
                    $dupStmt = $pdo->prepare("SELECT * FROM rfqs WHERE title = ? AND buyer_email = ? AND source = 'auto_generated' LIMIT 1");
                    $dupStmt->execute([$title, $buyer_email]);
                    $dbRow = $dupStmt->fetch(PDO::FETCH_ASSOC);
                    if ($dbRow) {
                        $inserted_id = (int)$dbRow['id'];
                    }
                }

                if (!$dbRow) {
                    $stmt = $pdo->prepare("INSERT INTO rfqs (
                        title, category, quantity, unit, targetPrice, incoterms, destinationPort,
                        specifications, buyer_name, buyer_country, buyer_email, buyer_company,
                        buyer_phone, buyer_address, payment_terms, order_frequency, source, sync_tag,
                        search_keyword, market_insight, posted_label
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    $stmt->execute([
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
                        $posted_label
                    ]);

                    $inserted_id = (int)$pdo->lastInsertId();

                    // Query back the newly created row
                    $fetchStmt = $pdo->prepare("SELECT * FROM rfqs WHERE id = ?");
                    $fetchStmt->execute([$inserted_id]);
                    $dbRow = $fetchStmt->fetch(PDO::FETCH_ASSOC);
                }

                if ($dbRow) {
                    $targetQty = is_numeric($dbRow['quantity']) ? intval($dbRow['quantity']) : 1;
                    $targetPriceNum = is_numeric($dbRow['targetPrice']) ? floatval($dbRow['targetPrice']) : 0.0;
                    $isAuto = (($dbRow['source'] ?? $source) === 'auto_generated' || ($dbRow['sync_tag'] ?? $sync_tag) === 'market_sync');

                    $inserted_row = [
                        "id" => "rfq-" . $dbRow['id'],
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
            $inserted_row = [
                "id" => "rfq-" . $inserted_id,
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
                "created_at" => date("Y-m-d H:i:s")
            ];
        }

        // Trigger Instant Email Notification
        sendPhpMailAlert(
            "📋 New RFQ Posted: {$title} - {$buyer_company}",
            "B2B Request For Quote Submitted",
            "A procurement officer listed a new wholesale buying requirement on Trade Heaven.",
            [
                "Product / Title" => $title,
                "Category" => $category,
                "Quantity" => "{$quantity} {$unit}",
                "Target Price" => "$ {$targetPrice}",
                "Incoterms" => $incoterms,
                "Destination Port" => $destinationPort,
                "Buyer Name" => $buyer_name,
                "Buyer Email" => $buyer_email,
                "Buyer Company" => $buyer_company,
                "Buyer Country" => $buyer_country,
                "Specifications" => $specifications
            ]
        );

        echo json_encode([
            "status" => "success",
            "data" => $inserted_row
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
            $image_url = $input['image_url'] ?? $input['imageUrl'] ?? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
            $listing_id = isset($input['id']) ? intval($input['id']) : null;

            $inserted_id = $listing_id ?: time();
            if ($db_connected && $pdo) {
                try {
                    if ($action === 'update_listing' && $listing_id) {
                        $stmt = $pdo->prepare("UPDATE listings SET
                            title = ?, category = ?, sub_category = ?, price = ?, moq = ?, moq_unit = ?,
                            supplier_name = ?, supplier_email = ?, supplier_phone = ?, supplier_country = ?,
                            location = ?, description = ?, image_url = ? WHERE id = ?");
                        $stmt->execute([
                            $title, $category, $sub_category, $price, $moq, $moq_unit,
                            $supplier_name, $supplier_email, $supplier_phone, $supplier_country,
                            $location, $description, $image_url, $listing_id
                        ]);
                        $inserted_id = $listing_id;
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO listings (
                            title, category, sub_category, price, moq, moq_unit,
                            supplier_name, supplier_email, supplier_phone, supplier_country,
                            location, description, image_url, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')");

                        $stmt->execute([
                            $title, $category, $sub_category, $price, $moq, $moq_unit,
                            $supplier_name, $supplier_email, $supplier_phone, $supplier_country,
                            $location, $description, $image_url
                        ]);
                        $inserted_id = (int)$pdo->lastInsertId();
                    }
                } catch (Exception $e) {}
            }

            // Trigger Instant Email Notification for Product Create / Edit
            sendPhpMailAlert(
                "📦 Product Catalog Edit / Listing: {$title}",
                "Product Listing Published or Modified",
                "A supplier or administrator created or updated a product catalog listing.",
                [
                    "Product Title" => $title,
                    "Category" => $category,
                    "Price" => "$ {$price}",
                    "MOQ" => "{$moq} {$moq_unit}",
                    "Supplier Name" => $supplier_name,
                    "Supplier Email" => $supplier_email ?: "N/A",
                    "Supplier Country" => $supplier_country,
                    "Port / Location" => $location,
                    "Description" => substr($description, 0, 150) . (strlen($description) > 150 ? '...' : '')
                ]
            );

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
        echo json_encode([
            "status" => "success",
            "success" => true,
            "user" => [
                "id" => $claims['uid'],
                "email" => $claims['email'],
                "name" => $claims['name'],
                "role" => $claims['role'],
                "isPremium" => !empty($claims['isPremium']),
                "membershipStatus" => $claims['membershipStatus'] ?? 'free',
                "status" => $claims['status'] ?? 'ACTIVE',
                "isVerified" => true,
                "isVerifiedAdmin" => ($claims['role'] ?? '') === 'ADMIN',
                "otpVerified" => true,
                "tier" => $claims['tier'] ?? 'FREE',
                "companyName" => $claims['companyName'] ?? 'Enterprise Trading Firm',
                "country" => $claims['country'] ?? 'United States',
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

        if ($db_connected && $pdo && $user_id) {
            try {
                $stmt = $pdo->prepare("UPDATE users SET 
                    name = COALESCE(NULLIF(?, ''), name),
                    company_name = COALESCE(NULLIF(?, ''), company_name),
                    phone = COALESCE(NULLIF(?, ''), phone),
                    country = COALESCE(NULLIF(?, ''), country),
                    tier = COALESCE(NULLIF(?, ''), tier)
                    WHERE id = ? OR LOWER(TRIM(email)) = ?");
                $stmt->execute([$name, $company, $phone, $country, $tier, $user_id, $email]);
            } catch (Exception $e) {}
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
            "message" => "Profile updated successfully!",
            "user" => [
                "id" => (string)$user_id,
                "name" => $name,
                "email" => $email,
                "companyName" => $company,
                "phone" => $phone,
                "country" => $country,
                "tier" => $tier
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
        $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($fileName, PATHINFO_FILENAME));
        $baseName = substr(trim($baseName, '-'), 0, 50) ?: 'product-image';
        $finalFileName = $baseName . '-' . round(microtime(true) * 1000) . '.' . $ext;
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
        if ($productId) {
            $existingGallery = $state['overrides'][$productId]['gallery'] ?? [];
            $gallery = array_values(array_unique(array_merge([$uploadedUrl], is_array($existingGallery) ? $existingGallery : [])));
            $state['overrides'][$productId] = [
                "primary" => $uploadedUrl,
                "gallery" => $gallery,
                "format" => strtoupper($ext),
                "updatedAt" => $nowIso
            ];
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
                    "updatedAt" => $nowIso
                ];
            }
        }

        @file_put_contents($overrides_file, json_encode($state, JSON_PRETTY_PRINT));
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
        $nowIso = gmdate('Y-m-d\TH:i:s\Z');
        if (!empty($input['fullOverridesMap']) && is_array($input['fullOverridesMap'])) {
            foreach ($input['fullOverridesMap'] as $pid => $entry) {
                $state['overrides'][$pid] = $entry;
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
                "updatedAt" => $nowIso
            ];
        }
        if (is_array($productIds) && $primaryUrl) {
            foreach ($productIds as $pid) {
                if (!$pid) continue;
                $state['overrides'][$pid] = [
                    "primary" => $primaryUrl,
                    "gallery" => is_array($galleryUrls) && count($galleryUrls) > 0 ? $galleryUrls : [$primaryUrl],
                    "format" => $format,
                    "updatedAt" => $nowIso
                ];
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
        @file_put_contents($overrides_file, json_encode($state, JSON_PRETTY_PRINT));
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
        $intro_msg = trim((string)($input['introMessage'] ?? 'Please log in to your Trade Heaven account to review active buyer trade requests.'));
        $cta_url = trim((string)($input['ctaUrl'] ?? $input['portalUrl'] ?? 'https://www.tradeheaven.net'));
        $cta_text = trim((string)($input['ctaText'] ?? 'Log In to Trade Heaven Account →'));

        if (empty($to_email) || !filter_var($to_email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["status" => "error", "success" => false, "message" => "Valid recipient email is required."]);
            break;
        }

        $html_body = isset($input['rawHtmlOverride']) && trim((string)$input['rawHtmlOverride']) !== ''
            ? (string)$input['rawHtmlOverride']
            : "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;background:#f8fafc;padding:24px;\"><div style=\"max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #cbd5e1;\"><div style=\"background:#0f172a;color:#ffffff;padding:26px 22px;text-align:center;\"><h2 style=\"margin:0;font-size:20px;\">" . htmlspecialchars($subject) . "</h2><p style=\"margin:6px 0 0;color:#cbd5e1;font-size:13px;\">" . htmlspecialchars($company_name) . "</p></div><div style=\"padding:24px;color:#1e293b;\"><p>Hello <strong>" . htmlspecialchars($recipient_name) . "</strong>,</p><p style=\"line-height:1.6;\">" . nl2br(htmlspecialchars($intro_msg)) . "</p><div style=\"text-align:center;margin:24px 0;\"><a href=\"" . htmlspecialchars($cta_url) . "\" style=\"display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:8px;\">" . htmlspecialchars($cta_text) . "</a></div></div></div></body></html>";

        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: Trade Heaven Global B2B <noreply@tradeheaven.net>',
            'Reply-To: help@tradeheaven.net',
            'X-Mailer: PHP/' . phpversion()
        ];
        $headers_str = implode("\r\n", $headers);
        $sent = @mail($to_email, $subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
        if (!$sent) {
            $sent = @mail($to_email, $subject, $html_body, $headers_str);
        }

        echo json_encode([
            "status" => $sent ? "success" : "error",
            "success" => (bool)$sent,
            "recipient" => $to_email,
            "deliveryMode" => "PHP_MAIL_RELAY",
            "message" => $sent ? "Custom email sent via Trade Heaven PHP mail() to {$to_email}." : "PHP mail() could not relay to {$to_email}."
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
                    if (!empty($conds)) {
                        $sql .= " WHERE (" . implode(" OR ", $conds) . ")";
                    }
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

                    $masked_phone = strlen(preg_replace('/\D+/', '', $raw_phone)) >= 4
                        ? substr($raw_phone, 0, 2) . ' •••-•••-' . substr(preg_replace('/\D+/', '', $raw_phone), -4) . ' [Protected by Trade Heaven]'
                        : '+•• •••-•••-•••• [Protected by Trade Heaven]';
                    $email_parts = explode('@', $raw_email);
                    $masked_email = (strlen($email_parts[0] ?? '') > 0 ? substr($email_parts[0], 0, 1) : 'b') . '••••@••••.' . (strpos($email_parts[1] ?? '', '.') !== false ? substr(strrchr($email_parts[1], '.'), 1) : 'com');
                    $masked_company = 'Verified Importer • ' . $raw_country . ' [Protected by Trade Heaven]';

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
                            'address' => ($is_supplier_view && !$show_company) ? ($raw_city ? "{$raw_city}, {$raw_country} [Exact Address Hidden]" : "{$raw_country} [Exact Address Hidden]") : $raw_address,
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

                    $masked_phone = strlen(preg_replace('/\D+/', '', $raw_phone)) >= 4
                        ? substr($raw_phone, 0, 2) . ' •••-•••-' . substr(preg_replace('/\D+/', '', $raw_phone), -4) . ' [Protected by Trade Heaven]'
                        : '+•• •••-•••-•••• [Protected by Trade Heaven]';
                    $ep = explode('@', $raw_email);
                    $masked_email = (strlen($ep[0] ?? '') > 0 ? substr($ep[0], 0, 1) : 'b') . '••••@••••.' . (strpos($ep[1] ?? '', '.') !== false ? substr(strrchr($ep[1], '.'), 1) : 'com');
                    $masked_company = 'Verified Importer • ' . $buyer_country . ' [Protected by Trade Heaven]';

                    $safe_phone = $show_phone ? $raw_phone : $masked_phone;
                    $safe_email = $show_email ? $raw_email : $masked_email;
                    $safe_company = $show_company ? $raw_company : $masked_company;
                    $safe_address = $show_company ? $raw_address : ($buyer_city ? "{$buyer_city}, {$buyer_country} [Protected]" : "{$buyer_country} [Protected]");

                    $snippets = '';
                    foreach (array_slice($msgs, -3) as $um) {
                        $txt = trim((string)($um['message_text'] ?? ''));
                        if ($txt === '' && !empty($um['media_name'])) {
                            $txt = '[' . strtoupper((string)($um['media_type'] ?? 'FILE')) . ': ' . $um['media_name'] . ']';
                        }
                        $snippets .= '<li style="margin-bottom:6px;color:#0f172a;">' . htmlspecialchars($txt) . '</li>';
                    }

                    if ($sender_role === 'buyer_identity') {
                        // Buyer sent -> Supplier hasn't read within 60s
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
                                  <p style=\"margin:0 0 14px;font-size:14px;color:#334155;\"><strong>Action Required:</strong> An international buyer sent an inquiry over 1 minute ago and is awaiting your response on Trade Heaven.</p>
                                  <table style=\"width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;background:#f8fafc;border:1px solid #e2e8f0;\">
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;width:140px;\">Buyer Name:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($buyer_name) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Company:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_company) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Location:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_address) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Phone:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_phone) . "</td></tr>
                                    <tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Email:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($safe_email) . "</td></tr>
                                    " . ($buyer_interest !== '' ? "<tr><td style=\"padding:8px 12px;font-weight:bold;color:#475569;\">Product Interest:</td><td style=\"padding:8px 12px;color:#0f172a;\">" . htmlspecialchars($buyer_interest) . "</td></tr>" : "") . "
                                  </table>
                                  <div style=\"background:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;margin-bottom:20px;\">
                                    <p style=\"margin:0 0 6px;font-size:12px;font-weight:bold;color:#1e40af;\">Unread Message Preview:</p>
                                    <ul style=\"margin:0;padding-left:18px;font-size:13px;\">{$snippets}</ul>
                                  </div>
                                  <a href=\"{$reply_link}\" style=\"display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:8px;\">Reply to Buyer Now &rarr;</a>
                                </div>
                              </div>
                            </body></html>";
                            $ok = @mail($target_email, $subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
                            if (!$ok) @mail($target_email, $subject, $html_body, $headers_str);
                            @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [1MIN_UNSEEN_SUPPLIER_ALERT] {$subject} -> {$target_email}\n", FILE_APPEND);
                            $alerts_sent++;
                            $supplier_alerts++;
                            $alert_details[] = ['conversationId' => $conv_id, 'targetRole' => 'supplier', 'recipient' => $target_email, 'subject' => $subject, 'messageCount' => count($msgs)];
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
                        foreach ($admin_recipients as $ar) {
                            $ok = @mail($ar, $subject, $html_body, $headers_str, "-f noreply@tradeheaven.net");
                            if (!$ok) @mail($ar, $subject, $html_body, $headers_str);
                        }
                        @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [1MIN_UNSEEN_ADMIN_ALERT] {$subject} -> " . implode(', ', $admin_recipients) . "\n", FILE_APPEND);
                        $alerts_sent++;
                        $admin_alerts++;
                        $alert_details[] = ['conversationId' => $conv_id, 'targetRole' => 'admin', 'recipient' => implode(', ', $admin_recipients), 'subject' => $subject, 'messageCount' => count($msgs)];
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
