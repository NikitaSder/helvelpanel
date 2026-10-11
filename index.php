<?php
session_start();

if (isset($_SESSION['user'])) {
    header('Location: panel.php');
    exit;
}

require_once 'db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = trim($_POST['login'] ?? '');
    $pass = trim($_POST['password'] ?? '');
    if ($login && $pass) {
        $stmt = $pdo->prepare("SELECT * FROM Users WHERE login = ?");
        $stmt->execute([$login]);
        $user = $stmt->fetch();
        if ($user && $user['password'] === $pass) {
            session_regenerate_id(true);
            $_SESSION['user'] = $login;
            $_SESSION['role'] = $user['role'] ?? '';
            $_SESSION['access'] = json_decode($user['access'] ?? '{}', true);
            header('Location: panel.php');
            exit;
        }
        $error = 'Неверный логин или пароль';
    } else {
        $error = 'Заполните все поля';
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Вход в панель HELVEL</title>
    <link rel="icon" type="image/png" href="assets/icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body {
            font-family: 'Inter', sans-serif;
            background: #050508;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }
        body::before {
            content: '';
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%);
            top: -200px;
            left: -200px;
            filter: blur(100px);
        }
        body::after {
            content: '';
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
            bottom: -200px;
            right: -200px;
            filter: blur(100px);
        }
        .bg-wrap {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
        }
        .bg-glow {
            position: absolute;
            width: 100%; height: 100%;
            background:
                radial-gradient(ellipse at 20% 80%, rgba(10, 132, 255, 0.10) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 40%);
            filter: blur(120px);
        }
        .bg-grid {
            position: absolute;
            width: 100%; height: 100%;
            background-image:
                linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
            background-size: 70px 70px;
            animation: gridMove 50s linear infinite;
        }
        @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(70px, 70px); }
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.12;
            animation: orbFloat 20s ease-in-out infinite alternate;
        }
        .orb-1 { width: 400px; height: 400px; background: #0A84FF; top: -10%; left: -5%; animation-delay: 0s; }
        .orb-2 { width: 500px; height: 500px; background: #8b5cf6; bottom: -10%; right: -5%; animation-delay: 7s; }
        .orb-3 { width: 300px; height: 300px; background: #ec4899; top: 40%; left: 50%; animation-delay: 14s; }
        @keyframes orbFloat {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(40px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 40px) scale(0.9); }
            100% { transform: translate(30px, -20px) scale(1.05); }
        }
        .particle {
            position: absolute;
            border-radius: 50%;
            background: #0A84FF;
            box-shadow: 0 0 30px #0A84FF;
            opacity: 0;
            animation: floatParticle linear infinite;
        }
        @keyframes floatParticle {
            0% { transform: translateY(100vh) scale(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% { transform: translateY(-10vh) scale(1) rotate(720deg); opacity: 0; }
        }
        .p1 { left: 5%; width: 4px; height: 4px; animation-duration: 18s; animation-delay: 0s; }
        .p2 { left: 12%; width: 3px; height: 3px; animation-duration: 15s; animation-delay: 2s; }
        .p3 { left: 22%; width: 5px; height: 5px; animation-duration: 20s; animation-delay: 5s; }
        .p4 { left: 32%; width: 3px; height: 3px; animation-duration: 16s; animation-delay: 8s; }
        .p5 { left: 42%; width: 4px; height: 4px; animation-duration: 19s; animation-delay: 11s; }
        .p6 { left: 52%; width: 6px; height: 6px; animation-duration: 21s; animation-delay: 3s; }
        .p7 { left: 62%; width: 3px; height: 3px; animation-duration: 17s; animation-delay: 6s; }
        .p8 { left: 72%; width: 5px; height: 5px; animation-duration: 18s; animation-delay: 9s; }
        .p9 { left: 82%; width: 3px; height: 3px; animation-duration: 16s; animation-delay: 12s; }
        .p10 { left: 92%; width: 4px; height: 4px; animation-duration: 20s; animation-delay: 15s; }
        .p11 { left: 10%; width: 8px; height: 8px; box-shadow: 0 0 40px #0A84FF; animation-duration: 24s; animation-delay: 1s; }
        .p12 { left: 38%; width: 7px; height: 7px; box-shadow: 0 0 35px #8b5cf6; background: #8b5cf6; animation-duration: 26s; animation-delay: 6s; }
        .p13 { left: 68%; width: 9px; height: 9px; box-shadow: 0 0 45px #0A84FF; animation-duration: 23s; animation-delay: 4s; }
        .p14 { left: 85%; width: 6px; height: 6px; box-shadow: 0 0 30px #8b5cf6; background: #8b5cf6; animation-duration: 25s; animation-delay: 10s; }
        .p15 { left: 48%; width: 5px; height: 5px; box-shadow: 0 0 30px #0A84FF; animation-duration: 21s; animation-delay: 13s; }

        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .login-box {
            background: rgba(17, 17, 24, 0.92);
            backdrop-filter: blur(20px);
            padding: 48px 44px;
            border-radius: 28px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6), 0 0 80px rgba(10, 132, 255, 0.04);
            width: 100%;
            max-width: 440px;
            animation: fadeInUp 0.6s ease;
            position: relative;
            z-index: 1;
            overflow: hidden;
        }
        .login-box::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #0A84FF, #8b5cf6, #ec4899);
            background-size: 300% 100%;
            animation: shimmer 4s infinite;
        }
        .login-box .logo {
            font-size: 38px;
            font-weight: 900;
            text-align: center;
            letter-spacing: -1px;
        }
        .login-box .logo span {
            background: linear-gradient(135deg, #0A84FF, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .login-box .logo .badge {
            display: inline-block;
            font-size: 10px;
            background: linear-gradient(135deg, #0A84FF, #8b5cf6);
            -webkit-text-fill-color: #fff;
            padding: 2px 14px;
            border-radius: 30px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-left: 6px;
            vertical-align: super;
        }
        .login-box .sub {
            text-align: center;
            color: #8a8a8a;
            font-size: 14px;
            margin-top: 4px;
            margin-bottom: 32px;
        }
        .login-box .form-group { margin-bottom: 18px; }
        .login-box .form-group label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #8a8a8a;
            margin-bottom: 6px;
        }
        .login-box .form-group input {
            width: 100%;
            padding: 14px 18px;
            background: rgba(26, 26, 34, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.06);
            border-radius: 14px;
            color: #fff;
            font-size: 15px;
            font-family: inherit;
            outline: none;
            transition: 0.3s;
        }
        .login-box .form-group input:focus {
            border-color: #0A84FF;
            box-shadow: 0 0 0 5px rgba(10, 132, 255, 0.1);
            background: rgba(30, 30, 40, 0.9);
        }
        .login-box .form-group input::placeholder { color: #444; }
        .login-box .btn {
            width: 100%;
            padding: 17px;
            border: none;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 700;
            font-family: inherit;
            background: linear-gradient(135deg, #0A84FF, #6b4fff);
            color: #fff;
            cursor: pointer;
            transition: 0.3s;
        }
        .login-box .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(10, 132, 255, 0.35); }
        .login-box .btn:active { transform: scale(0.97); }
        .login-box .btn:disabled { opacity: 0.5; transform: none; }
        .error {
            color: #ff3b30;
            font-size: 14px;
            text-align: center;
            margin-top: 14px;
            margin-bottom: 14px;
            padding: 12px;
            background: rgba(255, 59, 48, 0.08);
            border-radius: 10px;
            border: 1px solid rgba(255, 59, 48, 0.1);
        }
        .security-note {
            text-align: center;
            color: #444;
            font-size: 12px;
            margin-top: 20px;
        }
        @media (max-width: 480px) {
            .login-box { padding: 32px 24px; }
            .login-box .logo { font-size: 30px; }
        }
    </style>
</head>
<body>
    <div class="bg-wrap">
        <div class="bg-glow"></div>
        <div class="bg-grid"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="particle p1"></div>
        <div class="particle p2"></div>
        <div class="particle p3"></div>
        <div class="particle p4"></div>
        <div class="particle p5"></div>
        <div class="particle p6"></div>
        <div class="particle p7"></div>
        <div class="particle p8"></div>
        <div class="particle p9"></div>
        <div class="particle p10"></div>
        <div class="particle p11"></div>
        <div class="particle p12"></div>
        <div class="particle p13"></div>
        <div class="particle p14"></div>
        <div class="particle p15"></div>
    </div>

    <div class="login-box">
        <div class="logo">HEL<span>VEL</span> <span class="badge">ADMIN</span></div>
        <div class="sub">Вход в панель управления</div>
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <form method="post" autocomplete="off">
            <div class="form-group">
                <label>ЛОГИН</label>
                <input type="text" name="login" placeholder="Введите логин" required autofocus>
            </div>
            <div class="form-group">
                <label>ПАРОЛЬ</label>
                <input type="password" name="password" placeholder="Введите пароль" required>
            </div>
            <button type="submit" class="btn">Войти</button>
        </form>
        <div class="security-note">🔒 Защищённое соединение</div>
    </div>
</body>
</html>