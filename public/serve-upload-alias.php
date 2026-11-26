<?php
/**
 * Ultra-lightweight static virtual-image-alias resolver for Apache / BigRock cPanel.
 * Resolves /assets/uploads/<virtual-alias> via virtual-image-aliases.json and streams
 * the underlying physical image with 1-year immutable browser caching.
 */
declare(strict_types=1);

$rawFile = isset($_GET['f']) ? (string)$_GET['f'] : '';
$fileName = basename(trim(strtok($rawFile, '?') ?: ''));

if ($fileName === '' || !preg_match('/^[a-zA-Z0-9._-]+\.(webp|jpe?g|png|gif|avif|svg)$/i', $fileName)) {
    http_response_code(404);
    exit;
}

$uploadsDir = __DIR__ . '/assets/uploads';
if (!is_dir($uploadsDir) && is_dir(__DIR__ . '/public/assets/uploads')) {
    $uploadsDir = __DIR__ . '/public/assets/uploads';
}
$realUploadsDir = realpath($uploadsDir);
if ($realUploadsDir === false) {
    http_response_code(404);
    exit;
}

$resolvedFile = null;

// 1. Direct physical hit (just in case)
$directPath = $realUploadsDir . DIRECTORY_SEPARATOR . $fileName;
if (is_file($directPath)) {
    $resolvedFile = $directPath;
}

// 2. Virtual image alias map lookup (supports chained aliases up to 8 hops)
if ($resolvedFile === null) {
    $aliasCandidates = [
        $realUploadsDir . DIRECTORY_SEPARATOR . 'virtual-image-aliases.json',
        __DIR__ . '/data/virtual-image-aliases.json',
        __DIR__ . '/public/data/virtual-image-aliases.json',
    ];
    foreach ($aliasCandidates as $aliasFile) {
        if (!is_file($aliasFile)) continue;
        $rawJson = @file_get_contents($aliasFile);
        if (!$rawJson) continue;
        $map = @json_decode($rawJson, true);
        if (!is_array($map)) continue;

        $cur = $fileName;
        $hops = 0;
        while (isset($map[$cur]) && is_string($map[$cur]) && $hops < 8) {
            $next = basename(trim($map[$cur]));
            if ($next === '' || $next === $cur) break;
            $cur = $next;
            $hops++;
        }
        if ($cur !== $fileName) {
            $targetPath = $realUploadsDir . DIRECTORY_SEPARATOR . $cur;
            if (is_file($targetPath)) {
                $resolvedFile = $targetPath;
                break;
            }
        }
    }
}

// 3. Fallback: strip trailing millisecond timestamp (e.g. foo-1795634123889.webp -> foo.webp)
if ($resolvedFile === null) {
    $stripped = preg_replace('/-\d{10,14}(\.(?:webp|jpe?g|png|gif|avif|svg))$/i', '$1', $fileName);
    if ($stripped && $stripped !== $fileName) {
        $strippedPath = $realUploadsDir . DIRECTORY_SEPARATOR . basename($stripped);
        if (is_file($strippedPath)) {
            $resolvedFile = $strippedPath;
        }
    }
}

if ($resolvedFile === null) {
    http_response_code(404);
    exit;
}

// Strict path confinement check
$realTarget = realpath($resolvedFile);
if ($realTarget === false || strpos($realTarget, $realUploadsDir . DIRECTORY_SEPARATOR) !== 0 || !is_file($realTarget)) {
    http_response_code(404);
    exit;
}

$ext = strtolower(pathinfo($realTarget, PATHINFO_EXTENSION));
$mimeMap = [
    'webp' => 'image/webp',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'avif' => 'image/avif',
    'svg'  => 'image/svg+xml',
];
$mime = $mimeMap[$ext] ?? 'application/octet-stream';
$size = @filesize($realTarget);
$mtime = @filemtime($realTarget) ?: time();
$etag = '"' . md5($realTarget . ':' . $size . ':' . $mtime) . '"';

header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=31536000, immutable');
header('ETag: ' . $etag);
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
header('X-Content-Type-Options: nosniff');

if (
    (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim((string)$_SERVER['HTTP_IF_NONE_MATCH']) === $etag)
) {
    http_response_code(304);
    exit;
}

if ($size !== false) {
    header('Content-Length: ' . $size);
}
readfile($realTarget);
exit;
