<?php
require_once __DIR__ . '/db.php';

session_start();

if (!isset($_SESSION['user']) || empty($_SESSION['user'])) {
    http_response_code(403);
    exit('Access denied');
}

$user = $_GET['user'] ?? $_SESSION['user'];
$user = preg_replace('/[^A-Za-z0-9_.@-]/', '', $user);

if ($user === '') {
    http_response_code(400);
    exit('Invalid user');
}

try {
    $stmt = $pdo->prepare('SELECT avatar FROM Users WHERE login = ? LIMIT 1');
    $stmt->execute([$user]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || empty($row['avatar'])) {
        http_response_code(404);
        exit('No avatar');
    }

    $avatarPath = __DIR__ . '/' . ltrim($row['avatar'], '/');
    if (!is_file($avatarPath)) {
        http_response_code(404);
        exit('Avatar file not found');
    }

    $ext = strtolower(pathinfo($avatarPath, PATHINFO_EXTENSION));
    $mime = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp', 'svg' => 'image/svg+xml'];
    header('Content-Type: ' . ($mime[$ext] ?? 'image/png'));
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    readfile($avatarPath);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    exit('Avatar server error');
}
