<?php
require_once __DIR__ . '/includes/panel/bootstrap.php';
require_once __DIR__ . '/includes/panel/layout.php';

render_panel_layout($user, $role, $access);
