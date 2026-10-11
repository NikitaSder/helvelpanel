<div id="tab-dashboard" class="tab active">
    <div class="stats">
        <div class="stat anim-fade-up"><div class="label">Общий онлайн</div><div class="value" id="statOnlineAll">0</div><div class="sub">Обновлено: <span id="statOnlineAllTime">0</span></div></div>
        <div class="stat anim-fade-up"><div class="label">Пиковый онлайн</div><div class="value" id="statOnlineAllPeak">0</div><div class="sub">Обновлено: <span id="statOnlineAllPeakTime">0</span></div></div>
        <div class="stat anim-fade-up"><div class="label">Онлайн HELVEL</div><div class="value" id="statOnlineHelvel">0</div><div class="sub">Пик: <span id="statOnlineHelvelPeak">0</span></div></div>
        <div class="stat anim-fade-up"><div class="label">Онлайн MAGNUM</div><div class="value" id="statOnlineMagnum">0</div><div class="sub">Пик: <span id="statOnlineMagnumPeak">0</span></div></div>
        <div class="stat anim-fade-up"><div class="label">Зарегистрировано аккаунтов</div><div class="value" id="statAccounts">0</div><div class="sub">забанено: <span id="statBanned">0</span></div></div>
    </div>

    <div class="toggle-wrap anim-fade-up">
        <div class="info">
            <h4>🔘 Лаунчер</h4>
            <p id="toggleStatusText" style="color: #ff4757;">Выключен</p>
        </div>
        <button class="toggle" id="toggleLauncher"></button>
    </div>

    <div class="row-3 anim-fade-up">
        <div class="card">
            <div class="card-title">📊 Экономика</div>
            <div class="economy-stats" style="grid-template-columns:1fr 1fr;">
                <div class="stat-item"><div class="stat-label">Всего доната</div><div class="stat-value" id="dashTotalDonate">0</div></div>
                <div class="stat-item"><div class="stat-label">Всего денег</div><div class="stat-value" id="dashTotalMoney">0 руб.</div></div>
                <div class="stat-item"><div class="stat-label">Количество транзакций </div><div class="stat-value" id="dashTotalTransactions">0</div></div>
                <div class="stat-item"><div class="stat-label">Донат HELVEL</div><div class="stat-value" id="dashHelvelDonate">0</div></div>
                <div class="stat-item"><div class="stat-label">Донат MAGNUM</div><div class="stat-value" id="dashMagnumDonate">0</div></div>
                <div class="stat-item"><div class="stat-label">Донат NULL</div><div class="stat-value" id="dashNullDonate">0</div></div>
            </div>
        </div>
        <div class="card">
            <div class="card-title">🖥️ Сервера</div>
            <div class="server-status-list">
                <div class="server-status-item offline">
                    <div class="server-status-top">
                        <span class="server-name">HELVEL</span>
                        <span class="server-badge offline">Нет связи</span>
                    </div>
                    <div class="server-status-text">IP: 80.242.59.112</div>
                    <div class="server-status-text">Порт: 3421</div>
                </div>
                <div class="server-status-item offline">
                    <div class="server-status-top">
                        <span class="server-name">MAGNUM</span>
                        <span class="server-badge offline">Нет связи</span>
                    </div>
                    <div class="server-status-text">IP: 80.242.59.112</div>
                    <div class="server-status-text">Порт: 6097</div>
                </div>
                <div class="server-status-item offline">
                    <div class="server-status-top">
                        <span class="server-name">NULL</span>
                        <span class="server-badge offline">Нет связи</span>
                    </div>
                    <div class="server-status-text">IP:	80.242.59.112</div>
                    <div class="server-status-text">Порт: 3423</div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-title">📈 Онлайн за 24 часа (МСК)</div>
            <div class="online-chart-mini" id="onlineChartMini"></div>
            <div class="text-muted text-center" style="font-size:11px;">пик: <span id="chartPeakMini">0</span> | сейчас: <span id="chartCurrentMini">0</span></div>
        </div>
    </div>
</div>
