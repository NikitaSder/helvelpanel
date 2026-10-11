<?php
function render_panel_layout(string $user, string $role, array $access): void
{
    $avatarPath = '';
    try {
        $stmt = $GLOBALS['pdo']->prepare('SELECT avatar FROM Users WHERE login = ? LIMIT 1');
        $stmt->execute([$user]);
        $row = $stmt->fetch();
        if ($row && !empty($row['avatar'])) {
            $avatarPath = 'avatar.php?user=' . rawurlencode($user);
        }
    } catch (Throwable $e) {
        $avatarPath = '';
    }
    ?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>HELVEL Admin - Панель управления</title>
        <link rel="icon" type="image/png" href="assets/icon.png">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="styles.css?v=<?= time() ?>">
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

        <div class="app" id="app">
            <div class="header">
                <div class="left">
                    <button class="hamburger" id="hamburgerBtn">☰</button>
                    <h1>HEL<span>VEL</span> <small>Панель управления</small></h1>
                </div>
                <div class="user-badge">
                    <div class="avatar-wrap">
                        <img id="headerAvatarImg" src="" alt="avatar" style="display:none;">
                        <div class="avatar-placeholder" id="headerAvatarPlaceholder"><?= strtoupper(substr($user,0,1)) ?></div>
                    </div>
                    <div class="name" id="headerName"><?= htmlspecialchars($user) ?></div>
                    <a href="logout.php" style="color:#ff3b30;text-decoration:none;font-size:13px;font-weight:600;padding:4px 12px;border-radius:6px;background:rgba(255,59,48,0.08);transition:0.3s;">🚪</a>
                </div>
            </div>

            <div class="sidebar-overlay" id="sidebarOverlay"></div>
            <div class="sidebar" id="sidebar">
                <div class="sidebar-brand">HEL<span>VEL</span><small>Панель управления</small></div>
                <div class="nav-group">
                    <div class="group-label">Основное</div>
                    <button class="nav-item active" data-tab="dashboard"><span class="icon">📊</span> Дашборд</button>
                    <button class="nav-item" data-tab="players"><span class="icon">👥</span> Игроки</button>
                    <button class="nav-item" data-tab="notify"><span class="icon">🔔</span> Уведомления</button>
                </div>
                <div class="nav-group">
                    <div class="group-label">Модерация</div>
                    <button class="nav-item" data-tab="bans"><span class="icon">⛔</span> Баны и варны</button>
                </div>
                <div class="nav-group">
                    <div class="group-label">Экономика</div>
                    <button class="nav-item" data-tab="economy"><span class="icon">💰</span> Экономика</button>
                </div>
                <div class="nav-group">
                    <div class="group-label">Управление</div>
                    <!-- <button class="nav-item" data-tab="server"><span class="icon">🖥️</span> Сервера</button> -->
                    <a class="nav-item" href="https://logs.helvel-mobile.ru" target="_blank" style="text-decoration: none;">
                        <span class="icon">📜</span> Логи
                    </a>
                </div>
                <div class="nav-group">
                    <div class="group-label">Система</div>
                    <button class="nav-item" data-tab="logs"><span class="icon">📜</span> Логи системы</button>
                    <button class="nav-item" data-tab="settings"><span class="icon">⚙️</span> Настройки</button>
                    <?php if ($user === 'Sobolev' || ($access['accounts'] ?? false)): ?>
                    <button class="nav-item" data-tab="accounts"><span class="icon">👥</span> Аккаунты</button>
                    <?php endif; ?>
                </div>
                <div class="user-section">
                    <div class="user">
                        <div class="avatar-wrap" id="sidebarAvatarWrap">
                            <img id="sidebarAvatarImg" src="" alt="avatar" style="display:none;">
                            <div class="avatar-placeholder" id="sidebarAvatarPlaceholder"><?= strtoupper(substr($user,0,1)) ?></div>
                            <div class="online-dot"></div>
                        </div>
                        <div class="info">
                            <div class="name" id="sidebarName"><?= htmlspecialchars($user) ?></div>
                            <div class="role" id="sidebarRole"><?= htmlspecialchars($role) ?></div>
                        </div>
                    </div>
                    <a href="logout.php" style="display:block;width:100%;padding:10px;border:none;border-radius:8px;background:rgba(255,59,48,0.08);color:#ff3b30;font-weight:600;font-size:13px;font-family:inherit;cursor:pointer;transition:0.3s;margin-top:6px;text-align:center;text-decoration:none;">🚪 Выйти</a>
                </div>
            </div>

            <?php
            $pageFiles = [
                'dashboard' => __DIR__ . '/../../pages/dashboard.php',
                'players' => __DIR__ . '/../../pages/players.php',
                'bans' => __DIR__ . '/../../pages/bans.php',
                'economy' => __DIR__ . '/../../pages/economy.php',
                'server' => __DIR__ . '/../../pages/server.php',
                'notify' => __DIR__ . '/../../pages/notify.php',
                'logs' => __DIR__ . '/../../pages/logs.php',
                'settings' => __DIR__ . '/../../pages/settings.php',
            ];
            foreach ($pageFiles as $file) {
                require $file;
            }
            ?>

            <div class="ban-modal-overlay" id="banModal">
                <div class="ban-modal-box">
                    <div class="ban-modal-title" id="banModalTitle">Бан игрока</div>
                    <div class="ban-options">
                        <button class="btn btn-danger" id="banQuickBtn">⚡ Быстрый бан</button>
                        <button class="btn btn-outline" id="banExtendedBtn">📝 Расширенный</button>
                    </div>
                    <div class="ban-extended" id="banExtended">
                        <div class="form-group">
                            <label>Причина</label>
                            <input type="text" id="banModalReason" placeholder="Например: Читы" value="Нарушение">
                        </div>
                        <div class="form-group">
                            <label>Срок (дни, 0 = перманент)</label>
                            <input type="number" id="banModalDuration" value="0">
                        </div>
                    </div>
                    <div class="ban-modal-actions">
                        <button class="btn btn-outline" id="banModalCancel">Отмена</button>
                        <button class="btn btn-danger" id="banModalConfirm">Забанить</button>
                    </div>
                </div>
            </div>

            <div class="warn-modal-overlay" id="warnModal">
                <div class="warn-modal-box">
                    <div class="warn-modal-title">⚠️ Выдача варна</div>
                    <div class="form-group">
                        <label>Причина варна</label>
                        <input type="text" id="warnModalReason" placeholder="Например: Оскорбления" value="Нарушение правил">
                    </div>
                    <div class="warn-modal-actions">
                        <button class="btn btn-outline" id="warnModalCancel">Отмена</button>
                        <button class="btn" id="warnModalConfirm" style="background:rgba(241,196,15,0.2);color:#f1c40f;">⚠️ Выдать варн</button>
                    </div>
                </div>
            </div>

            <div class="modal-overlay" id="confirmModal">
                <div class="modal-box">
                    <div class="modal-title" id="modalTitle">Подтверждение</div>
                    <div class="modal-text" id="modalText">Вы уверены, что хотите выполнить это действие?</div>
                    <div class="modal-actions">
                        <button class="btn btn-outline" id="modalCancel">Отмена</button>
                        <button class="btn btn-danger" id="modalConfirm">Подтвердить</button>
                    </div>
                </div>
            </div>

            <div class="toast-container" id="toastContainer"></div>
        </div>

        <script>
        var currentUser = '<?= $user ?>';
        var currentUserAvatar = <?= json_encode($avatarPath ?: '') ?>;
        var API_URL = 'api.php';
        var launcherEnabled = false;
        var foundPlayer = null;
        var modalCallback = null;
        var banTargetNick = null;
        var warnTargetNick = null;
        var accessMap = <?= json_encode($access) ?>;
        </script>
        <script src="assets/js/panel.js?v=<?= time() ?>"></script>
    </body>
    </html>
    <?php
}
