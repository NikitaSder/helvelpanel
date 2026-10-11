<?php
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}

$user = $_SESSION['user'];
$role = $_SESSION['role'] ?? '';
$access = $_SESSION['access'] ?? [];

require_once __DIR__ . '/../../db.php';
