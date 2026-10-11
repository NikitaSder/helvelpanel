<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/db_server.php';

$cacheDir = __DIR__ . '/../cache';
$cacheFile = $cacheDir . '/samp_servers.json';
$cacheTtl = 600;

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    readfile($cacheFile);
    exit;
}

function sampIsOnline($ip, $port = 7777) {
    $errno = 0;
    $errstr = '';

    $socket = @fsockopen("udp://$ip", $port, $errno, $errstr, 1);
    if (!$socket) {
        return false;
    }
    fclose($socket);
    return true;
}

function sampQueryPlayers($ip, $port = 7777) {
    $socket = @fsockopen("udp://$ip", $port, $errno, $errstr, 1);
    if (!$socket) return 0;

    $parts = explode('.', $ip);
    if (count($parts) !== 4) {
        fclose($socket);
        return 0;
    }

    $packet = "SAMP" .
        chr((int)$parts[0]) .
        chr((int)$parts[1]) .
        chr((int)$parts[2]) .
        chr((int)$parts[3]) .
        chr($port & 0xFF) .
        chr($port >> 8) .
        "c";

    fwrite($socket, $packet);
    $response = fread($socket, 4096);
    fclose($socket);

    if (!$response || strlen($response) < 11) return 0;

    $offset = 11;
    return ord($response[$offset]) | (ord($response[$offset + 1]) << 8);
}

function collectServerList($pdo) {
    $rows = $pdo->query("SELECT * FROM server_info ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($rows)) {
        $servers = [];
        foreach ($rows as $index => $row) {
            $ip = $row['ip'] ?? $row['host'] ?? $row['address'] ?? null;
            $port = $row['port'] ?? $row['query_port'] ?? $row['game_port'] ?? 7777;

            if (!$ip) {
                continue;
            }

            $servers[] = [
                'id' => (int)($row['id'] ?? ($index + 1)),
                'name' => $row['name'] ?? $row['server_name'] ?? $row['title'] ?? 'Server ' . ($index + 1),
                'ip' => $ip,
                'port' => (int)$port,
                'gamemode' => $row['server_version'] ?? $row['gamemode'] ?? $row['version'] ?? '',
            ];
        }

        if (!empty($servers)) {
            return $servers;
        }
    }

    return [
        ['id' => 1, 'name' => 'HELVEL MOBILE', 'ip' => '80.242.59.112', 'port' => 3421, 'gamemode' => 'HELVEL'],
        ['id' => 2, 'name' => 'MAGNUM MOBILE', 'ip' => '80.242.59.112', 'port' => 3422, 'gamemode' => 'MAGNUM'],
        ['id' => 3, 'name' => 'NULL', 'ip' => '80.242.59.112', 'port' => 3423, 'gamemode' => 'NULL'],
    ];
}

$stmt = $pdo->query("SELECT COUNT(*) AS total FROM accounts");
$accountsRow = $stmt->fetch();
$accounts = (int)$accountsRow['total'];

$stmt = $pdo->query("SELECT COUNT(*) AS total FROM ban_list");
$banRow = $stmt->fetch();
$ban_count = (int)$banRow['total'];

$servers = collectServerList($pdo);
$serverStatus = [];

foreach ($servers as $server) {
    $ip = $server['ip'];
    $port = (int)$server['port'];
    $players = sampQueryPlayers($ip, $port);
    $status = sampIsOnline($ip, $port);

    $serverStatus[] = [
        'id' => (int)$server['id'],
        'name' => $server['name'],
        'ip' => $ip,
        'port' => $port,
        'gamemode' => $server['gamemode'],
        'online' => $players,
        'peak' => 0,
        'accounts' => $accounts,
        'ban' => $ban_count,
        'cpu' => 0,
        'ram' => 0,
        'status' => $status ? 'online' : 'offline',
        'updated' => date('H:i:s'),
    ];
}

$result = [
    'servers' => $serverStatus,
    'updated' => date('H:i:s'),
    'cache_ttl' => $cacheTtl,
];

$json = json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
if ($json !== false) {
    file_put_contents($cacheFile, $json, LOCK_EX);
}

echo $json;