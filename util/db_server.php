<?php

$DB_HOST = "80.242.59.112";
$DB_NAME = "gs346413";
$DB_USER = "gs346413";
$DB_PASS = "H0hG20VYWKKp";

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (Exception $e) {
    die("DB ERROR");
}
