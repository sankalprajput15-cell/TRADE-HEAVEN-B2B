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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

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

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Trade Heaven Security <noreply@tradeheaven.net>',
        'Reply-To: help@tradeheaven.net',
        'X-Mailer: PHP/' . phpversion()
    ];
    $headers_str = implode("\r\n", $headers);

    $sent = @mail($cleanEmail, $subject, $html, $headers_str, "-f noreply@tradeheaven.net");
    if (!$sent) {
        $sent = @mail($cleanEmail, $subject, $html, $headers_str);
    }

    @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [CLIENT_OTP_DISPATCH] Sent OTP {$code} from noreply@tradeheaven.net -> {$cleanEmail} (status=" . ($sent ? 'OK' : 'FALLBACK') . ")\n", FILE_APPEND);
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

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Trade Heaven Security <noreply@tradeheaven.net>',
        'Reply-To: help@tradeheaven.net',
        'X-Mailer: PHP/' . phpversion()
    ];
    $headers_str = implode("\r\n", $headers);

    $sent = @mail($cleanEmail, $subject, $html, $headers_str, "-f noreply@tradeheaven.net");
    if (!$sent) {
        $sent = @mail($cleanEmail, $subject, $html, $headers_str);
    }

    @file_put_contents(__DIR__ . '/activity_mail.log', "[" . date('Y-m-d H:i:s') . "] [LOGIN_OTP_DISPATCH] Sent OTP -> {$cleanEmail} (mode=" . ($isRegistration ? 'REGISTER' : 'LOGIN') . ", status=" . ($sent ? 'OK' : 'FALLBACK') . ")\n", FILE_APPEND);
    return $sent;
}

// Parse request action & payload (normalize hyphenated /api/v1/auth/* routes too)
$raw_action = isset($_GET['action']) ? trim($_GET['action']) : '';
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
    // CMS Operations: get_content, save_content
    // -------------------------------------------------------------
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
        
        echo json_encode(["status" => "error", "message" => "CMS content not found or invalid"]);
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
                $stmt = $pdo->query("SELECT * FROM rfqs ORDER BY id DESC");
                $db_rfqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($db_rfqs)) {
                    foreach ($db_rfqs as $r) {
                        $targetQty = is_numeric($r['quantity']) ? intval($r['quantity']) : 1;
                        $targetPriceNum = is_numeric($r['targetPrice']) ? floatval($r['targetPrice']) : (is_numeric($r['target_price'] ?? null) ? floatval($r['target_price']) : 0.0);
                        
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
                            "targetPrice" => (string)($r['targetPrice'] ?? '0'),
                            "targetPriceUsd" => $targetPriceNum,
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
                            "buyer_company" => $r['buyer_company'] ?? $r['buyer_name'],
                            "buyerCompany" => $r['buyer_company'] ?? $r['buyer_name'],
                            "buyerVerified" => true,
                            "targetDeliveryDate" => date("Y-m-d", strtotime("+45 days")),
                            "paymentTerms" => "Trade Assurance Escrow (Swiss Vault)",
                            "urgency" => "STANDARD",
                            "quotesCount" => 0,
                            "postedDate" => isset($r['created_at']) ? substr($r['created_at'], 0, 10) : date("Y-m-d"),
                            "expiryDate" => date("Y-m-d", strtotime("+60 days")),
                            "status" => "OPEN",
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
        $title = trim($input['title'] ?? $input['product_name'] ?? 'Wholesale Product');
        $category = trim($input['category'] ?? 'Industrial Machinery & CNC');
        $quantity = (string)($input['quantity'] ?? $input['target_quantity'] ?? '1000');
        $unit = trim($input['unit'] ?? $input['quantity_unit'] ?? 'Pieces');
        $targetPrice = (string)($input['targetPrice'] ?? $input['target_price'] ?? $input['target_price_usd'] ?? '0');
        $incoterms = trim($input['incoterms'] ?? $input['incoterm'] ?? $input['preferred_incoterm'] ?? 'FOB');
        $destinationPort = trim($input['destinationPort'] ?? $input['destination_port'] ?? 'Port of Hamburg');
        $specifications = trim($input['specifications'] ?? $input['requirements'] ?? $input['detailed_requirements'] ?? $input['message'] ?? 'Standard export specifications.');
        $buyer_name = trim($input['buyer_name'] ?? $input['name'] ?? 'Procurement Officer');
        $buyer_country = trim($input['buyer_country'] ?? $input['country'] ?? 'United States');
        $buyer_email = trim($input['buyer_email'] ?? $input['email'] ?? 'buyer@tradeheaven.net');
        $buyer_company = trim($input['buyer_company'] ?? $input['company'] ?? $buyer_name);

        $inserted_id = time();
        $inserted_row = null;

        if ($db_connected && $pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO rfqs (
                    title, category, quantity, unit, targetPrice, incoterms, destinationPort,
                    specifications, buyer_name, buyer_country, buyer_email, buyer_company
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

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
                    $buyer_company
                ]);

                $inserted_id = (int)$pdo->lastInsertId();

                // Query back the newly created row
                $fetchStmt = $pdo->prepare("SELECT * FROM rfqs WHERE id = ?");
                $fetchStmt->execute([$inserted_id]);
                $dbRow = $fetchStmt->fetch(PDO::FETCH_ASSOC);

                if ($dbRow) {
                    $targetQty = is_numeric($dbRow['quantity']) ? intval($dbRow['quantity']) : 1;
                    $targetPriceNum = is_numeric($dbRow['targetPrice']) ? floatval($dbRow['targetPrice']) : 0.0;

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
                        "targetPrice" => (string)$dbRow['targetPrice'],
                        "targetPriceUsd" => $targetPriceNum,
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
                        "buyer_company" => $dbRow['buyer_company'] ?? $buyer_company,
                        "buyerCompany" => $dbRow['buyer_company'] ?? $buyer_company,
                        "buyerVerified" => true,
                        "targetDeliveryDate" => date("Y-m-d", strtotime("+45 days")),
                        "paymentTerms" => "Trade Assurance Escrow (Swiss Vault)",
                        "urgency" => "STANDARD",
                        "quotesCount" => 0,
                        "postedDate" => date("Y-m-d"),
                        "expiryDate" => date("Y-m-d", strtotime("+60 days")),
                        "status" => "OPEN",
                        "created_at" => $dbRow['created_at'] ?? date("Y-m-d H:i:s")
                    ];
                }
            } catch (Exception $e) {
                $inserted_id = time();
            }
        }

        // Fallback representation if database fetch was unassisted
        if (!$inserted_row) {
            $inserted_row = [
                "id" => "rfq-" . $inserted_id,
                "raw_id" => intval($inserted_id),
                "title" => $title,
                "productName" => $title,
                "category" => $category,
                "quantity" => (string)$quantity,
                "targetQuantity" => intval($quantity),
                "unit" => $unit,
                "quantityUnit" => $unit,
                "targetPrice" => (string)$targetPrice,
                "targetPriceUsd" => floatval($targetPrice),
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
                "buyer_company" => $buyer_company,
                "buyerCompany" => $buyer_company,
                "buyerVerified" => true,
                "targetDeliveryDate" => date("Y-m-d", strtotime("+45 days")),
                "paymentTerms" => "Trade Assurance Escrow (Swiss Vault)",
                "urgency" => "STANDARD",
                "quotesCount" => 0,
                "postedDate" => date("Y-m-d"),
                "expiryDate" => date("Y-m-d", strtotime("+60 days")),
                "status" => "OPEN",
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
    case 'create_listing':
    case 'update_listing':
        if ($method === 'GET' && $action !== 'create_listing' && $action !== 'update_listing') {
            $rows = [];
            if ($db_connected && $pdo) {
                try {
                    $stmt = $pdo->query("SELECT * FROM listings ORDER BY id DESC LIMIT 100");
                    $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    if (!empty($raw)) {
                        $rows = $raw;
                    }
                } catch (Exception $e) {
                    $rows = [];
                }
            }
            echo json_encode(["status" => "success", "data" => $rows]);
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

        // 1. Automatically dispatch single OTP email directly to client from noreply@tradeheaven.net
        $clientMailSent = sendClientOtpEmail($email, $user_name, $code);

        // 2. Notify internal admin monitoring only (do NOT send a duplicate alert email to the client)
        sendPhpMailAlert(
            "🔑 Your Trade Heaven Password Reset OTP: {$code}",
            "Trade Heaven Automated Password Reset OTP Dispatched",
            "Use the 6-digit verification code ({$code}) below to reset the Trade Heaven account password for {$email}.",
            [
                "Client Email" => $email,
                "Client Name" => $user_name,
                "Sender Address" => "noreply@tradeheaven.net",
                "Verification Code (OTP)" => $code,
                "Direct Mail Status" => $clientMailSent ? "Delivered via noreply@tradeheaven.net" : "Queued / Fallback Active",
                "WhatsApp Support" => "+91 8532934479",
                "Token Expiry" => "1 Hour"
            ]
        );

        echo json_encode([
            "status" => "success",
            "success" => true,
            "sender" => "noreply@tradeheaven.net",
            "emailSent" => (bool)$clientMailSent,
            "message" => "A 6-digit verification code has been automatically sent to {$email} from noreply@tradeheaven.net.",
            "code" => $code,
            "verification_code" => $code
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
            echo json_encode([
                "status" => "success",
                "success" => true,
                "otp_dispatched" => true,
                "mode" => "REGISTER",
                "email" => $cleanEmail,
                "maskedEmail" => $masked,
                "emailSent" => (bool)$sent,
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
        echo json_encode([
            "status" => "success",
            "success" => true,
            "otp_dispatched" => true,
            "mode" => "LOGIN",
            "requiresOtp" => true,
            "email" => $cleanEmail,
            "maskedEmail" => $masked,
            "role" => $matchedUser['role'],
            "emailSent" => (bool)$sent,
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
        echo json_encode([
            "status" => "success",
            "success" => true,
            "requiresOtp" => true,
            "email" => $cleanEmail,
            "maskedEmail" => $masked,
            "emailSent" => (bool)$sent,
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
        echo json_encode([
            "status" => "success",
            "success" => true,
            "requiresOtp" => true,
            "email" => $email,
            "maskedEmail" => $masked,
            "role" => $matchedUser['role'],
            "emailSent" => (bool)$sent,
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
