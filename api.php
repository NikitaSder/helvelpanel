<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false, 'message'=>'Метод не разрешён']);
    exit;
}

require_once 'db.php';

function ensureAvatarColumn($pdo) {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM Users LIKE 'avatar'");
        if ($stmt->rowCount() === 0) {
            $pdo->exec("ALTER TABLE Users ADD COLUMN avatar VARCHAR(255) NULL DEFAULT NULL AFTER password");
        }
    } catch (PDOException $e) {
        // ignore, if table is missing or column already exists
    }
}

function ensureLogsTable($pdo) {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'logs'");
        if ($stmt->rowCount() === 0) {
            $pdo->exec("CREATE TABLE logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(32) NULL,
                message TEXT NOT NULL,
                target VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hide TINYINT(1) NOT NULL DEFAULT 1
            )");
        }
    } catch (PDOException $e) {
        // ignore if table creation fails
    }
}

function ensureLogsHideColumn($pdo) {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM logs LIKE 'hide'");
        if ($stmt->rowCount() === 0) {
            $pdo->exec("ALTER TABLE logs ADD COLUMN hide TINYINT(1) NOT NULL DEFAULT 1 AFTER created_at");
        }
    } catch (PDOException $e) {
        // ignore if table missing or column already exists
    }
}

ensureAvatarColumn($pdo);
ensureLogsTable($pdo);
ensureLogsHideColumn($pdo);

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success'=>false, 'message'=>'Не авторизован']);
    exit;
}

$login = $_SESSION['user'];
$action = $_POST['action'] ?? '';

$stmt = $pdo->prepare("SELECT access FROM Users WHERE login = ?");
$stmt->execute([$login]);
$user = $stmt->fetch();
if ($user) {
    $access = json_decode($user['access'], true);
} else {
    $access = [];
}

function checkAccess($key) {
    global $access;
    return isset($access[$key]) && $access[$key] === true;
}

function addLog($pdo, $type, $message, $target = null, $hide = 1) {
    try {
        $stmt = $pdo->prepare("INSERT INTO logs (type, message, target, hide) VALUES (?, ?, ?, ?)");
        $stmt->execute([$type, $message, $target, $hide]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function getLogs($pdo, $limit = 50) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM logs WHERE hide = 1 ORDER BY id DESC LIMIT ?");
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        return [];
    }
}

function hideAllLogs($pdo) {
    try {
        $stmt = $pdo->prepare("UPDATE logs SET hide = 0 WHERE hide = 1");
        $stmt->execute();
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

function cleanOldLogs($pdo) {
    try {
        $stmt = $pdo->prepare("DELETE FROM logs WHERE created_at < NOW() - INTERVAL 14 DAY");
        $stmt->execute();
    } catch (PDOException $e) {}
}

cleanOldLogs($pdo);

if ($action == 'getStats') {
    $stmt = $pdo->query("SELECT COUNT(*) as accounts FROM Users");
    $accounts = $stmt->fetch()['accounts'];
    echo json_encode([
        'success'=>true,
        'online'=>0,
        'accounts'=>$accounts,
        'totalDonate'=>0,
        'totalMoney'=>0
    ]);
    exit;
}

if ($action == 'getLogs') {
    $logs = getLogs($pdo, 50);
    echo json_encode(['success'=>true, 'logs'=>$logs]);
    exit;
}

if ($action == 'hideAllLogs') {
    $result = hideAllLogs($pdo);
    echo json_encode(['success' => $result, 'message' => $result ? 'Логи скрыты' : 'Ошибка скрытия логов']);
    exit;
}

if ($action == 'uploadAvatar') {
    if (!isset($_FILES['avatar']) || !is_uploaded_file($_FILES['avatar']['tmp_name'])) {
        echo json_encode(['success'=>false, 'message'=>'Файл не загружен']);
        exit;
    }

    $file = $_FILES['avatar'];
    $allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes, true)) {
        echo json_encode(['success'=>false, 'message'=>'Поддерживаются только PNG, JPG, WEBP и GIF']);
        exit;
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success'=>false, 'message'=>'Файл слишком большой, максимум 5 МБ']);
        exit;
    }

    $targetName = preg_replace('/[^a-zA-Z0-9_.-]+/', '_', $login);
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($ext === '') {
        $ext = 'png';
    }

    $uploadDir = __DIR__ . '/uploads/avatars';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $finalName = $targetName . '.' . $ext;
    $finalPath = $uploadDir . '/' . $finalName;
    $oldAvatarFile = null;

    $stmt = $pdo->prepare('SELECT avatar FROM Users WHERE login = ? LIMIT 1');
    $stmt->execute([$login]);
    $row = $stmt->fetch();
    if ($row && !empty($row['avatar'])) {
        $oldAvatarFile = __DIR__ . '/' . ltrim($row['avatar'], '/');
        if (is_file($oldAvatarFile) && $oldAvatarFile !== $finalPath) {
            @unlink($oldAvatarFile);
        }
    }

    if (!move_uploaded_file($file['tmp_name'], $finalPath)) {
        echo json_encode(['success'=>false, 'message'=>'Не удалось сохранить файл на сервере']);
        exit;
    }

    $avatarUrl = 'uploads/avatars/' . $finalName;
    $stmt = $pdo->prepare('UPDATE Users SET avatar = ? WHERE login = ?');
    $stmt->execute([$avatarUrl, $login]);

    echo json_encode(['success'=>true, 'avatar'=>'avatar.php?user=' . rawurlencode($login)]);
    exit;
}

if ($action == 'removeAvatar') {
    $stmt = $pdo->prepare('SELECT avatar FROM Users WHERE login = ? LIMIT 1');
    $stmt->execute([$login]);
    $row = $stmt->fetch();
    if ($row && !empty($row['avatar'])) {
        $file = __DIR__ . '/' . ltrim($row['avatar'], '/');
        if (is_file($file)) {
            @unlink($file);
        }
    }
    $stmt = $pdo->prepare('UPDATE Users SET avatar = NULL WHERE login = ?');
    $stmt->execute([$login]);
    echo json_encode(['success'=>true]);
    exit;
}

if ($action == 'addLog') {
    $type = $_POST['type'] ?? 'info';
    $message = $_POST['message'] ?? '';
    $target = $_POST['target'] ?? null;
    addLog($pdo, $type, $message, $target);
    echo json_encode(['success'=>true]);
    exit;
}

if ($action == 'getUsers') {
    if (!checkAccess('accounts')) {
        http_response_code(403);
        echo json_encode(['success'=>false, 'message'=>'Доступ запрещён']);
        exit;
    }
    $stmt = $pdo->query("SELECT login, role, access, avatar FROM Users ORDER BY login");
    $users = $stmt->fetchAll();
    $result = [];
    foreach ($users as $u) {
        $access = json_decode($u['access'] ?? '{}', true);
        unset($access['accounts']); // убираем accounts

        $result[$u['login']] = [
            'role' => $u['role'],
            'access' => $access,
            'avatar' => !empty($u['avatar']) ? 'avatar.php?user=' . rawurlencode($u['login']) : ''
        ];
    }
    echo json_encode(['success'=>true, 'users'=>$result]);
    exit;
}


if ($action == 'createUser') {
    if (!checkAccess('accounts')) {
        http_response_code(403);
        echo json_encode(['success'=>false, 'message'=>'Доступ запрещён']);
        exit;
    }
    $newLogin = trim($_POST['login'] ?? '');
    $newPass = trim($_POST['password'] ?? '');
    if (strlen($newLogin) < 3 || strlen($newLogin) > 50) {
        echo json_encode(['success'=>false, 'message'=>'Логин 3-50 символов']);
        exit;
    }
    if (strlen($newPass) < 8) {
        echo json_encode(['success'=>false, 'message'=>'Пароль минимум 8 символов']);
        exit;
    }
    if (!preg_match('/^[a-zA-Z0-9_.-]+$/', $newLogin)) {
        echo json_encode(['success'=>false, 'message'=>'Недопустимые символы']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE login = ?");
    $stmt->execute([$newLogin]);
    if ($stmt->fetch()) {
        echo json_encode(['success'=>false, 'message'=>'Пользователь уже существует']);
        exit;
    }
    $accessDefault = json_encode([
        'dashboard'=>true,'players'=>false,'bans'=>false,'economy'=>false,
        'server'=>false,'notify'=>false,'logs'=>false,'settings'=>false,'accounts'=>false
    ]);
    $stmt = $pdo->prepare("INSERT INTO Users (login, password, role, access) VALUES (?, ?, '', ?)");
    $stmt->execute([$newLogin, $newPass, $accessDefault]);
    addLog($pdo, 'admin', 'Создан аккаунт ' . $newLogin);
    echo json_encode(['success'=>true]);
    exit;
}

if ($action == 'deleteUser') {
    if (!checkAccess('accounts')) {
        http_response_code(403);
        echo json_encode(['success'=>false, 'message'=>'Доступ запрещён']);
        exit;
    }
    $target = $_POST['login'] ?? '';
    if ($target === $login) {
        echo json_encode(['success'=>false, 'message'=>'Нельзя удалить себя']);
        exit;
    }
    if ($target === 'Sobolev') {
        echo json_encode(['success'=>false, 'message'=>'Нельзя удалить этого пользователя']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM Users WHERE login = ?");
    $stmt->execute([$target]);
    if ($stmt->rowCount() > 0) {
        addLog($pdo, 'admin', 'Удалён аккаунт ' . $target);
        echo json_encode(['success'=>true]);
    } else {
        echo json_encode(['success'=>false, 'message'=>'Пользователь не найден']);
    }
    exit;
}

if ($action == 'updateUserAccess') {
    if (!checkAccess('accounts')) {
        http_response_code(403);
        echo json_encode(['success'=>false, 'message'=>'Доступ запрещён']);
        exit;
    }
    $target = $_POST['login'] ?? '';
    $key = $_POST['key'] ?? '';
    $value = $_POST['value'] === 'true';
    if ($target === $login) {
        echo json_encode(['success'=>false, 'message'=>'Нельзя менять права себе']);
        exit;
    }
    $allowedKeys = ['dashboard','players','bans','economy','server','notify','logs','settings','accounts'];
    if (!in_array($key, $allowedKeys)) {
        echo json_encode(['success'=>false, 'message'=>'Недопустимый ключ']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT access FROM Users WHERE login = ?");
    $stmt->execute([$target]);
    $user = $stmt->fetch();
    if (!$user) {
        echo json_encode(['success'=>false, 'message'=>'Пользователь не найден']);
        exit;
    }
    $accessData = json_decode($user['access'] ?? '{}', true);
    $accessData[$key] = $value;
    $stmt = $pdo->prepare("UPDATE Users SET access = ? WHERE login = ?");
    $stmt->execute([json_encode($accessData), $target]);
    addLog($pdo, 'admin', 'Изменён доступ "' . $key . '" для ' . $target);
    echo json_encode(['success'=>true]);
    exit;
}

if ($action == 'changePassword') {
    $target = $_POST['login'] ?? '';
    $newPass = $_POST['password'] ?? '';
    if (!checkAccess('accounts') && $target !== $login) {
        http_response_code(403);
        echo json_encode(['success'=>false, 'message'=>'Доступ запрещён']);
        exit;
    }
    if (strlen($newPass) < 8) {
        echo json_encode(['success'=>false, 'message'=>'Пароль минимум 8 символов']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE login = ?");
    $stmt->execute([$target]);
    if (!$stmt->fetch()) {
        echo json_encode(['success'=>false, 'message'=>'Пользователь не найден']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE Users SET password = ? WHERE login = ?");
    $stmt->execute([$newPass, $target]);
    addLog($pdo, 'admin', 'Сменён пароль для ' . $target);
    echo json_encode(['success'=>true]);
    exit;
}

if ($action == 'changeRole') {
    $target = $_POST['login'] ?? '';
    $newRole = $_POST['newRole'] ?? '';
    if (!checkAccess('accounts') && $target !== $login) {
        http_response_code(403);
        echo json_encode(['success'=>false, 'message'=>'Доступ запрещён']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE login = ?");
    $stmt->execute([$target]);
    if (!$stmt->fetch()) {
        echo json_encode(['success'=>false, 'message'=>'Пользователь не найден']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE Users SET role = ? WHERE login = ?");
    $stmt->execute([$newRole, $target]);
    addLog($pdo, 'admin', 'Сменёна роль для ' . $target);
    echo json_encode(['success'=>true]);
    exit;
}

if ($action == 'searchPlayer') {
    $nick = $_POST['nick'] ?? '';
    echo json_encode([
        'success'=>true,
        'player'=>[
            'nick'=>$nick,
            'donate'=>0,
            'money'=>0,
            'warns'=>0,
            'banned'=>false,
            'uuid'=>'UUid-' . strtoupper(substr(md5($nick), 0, 8))
        ]
    ]);
    exit;
}

if ($action == 'toggleLauncher') {
    $status = $_POST['status'] ?? 'off';
    addLog($pdo, 'info', $login . ' ' . ($status === 'on' ? 'включил' : 'выключил') . ' лаунчер');
    echo json_encode(['success'=>true, 'status'=>$status]);
    exit;
}

if ($action == 'getLauncherStatus') {
    echo json_encode(['success'=>true, 'status'=>'off']);
    exit;
}

echo json_encode(['success'=>false, 'message'=>'Неизвестное действие']);
?>