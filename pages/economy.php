<div id="tab-economy" class="tab">
    <div class="card anim-fade-up">
        <div class="card-title">💰 Статистика экономики</div>
        <div class="economy-stats">
            <div class="stat-item"><div class="stat-label">Всего доната</div><div class="stat-value" id="totalDonate">0</div></div>
            <div class="stat-item"><div class="stat-label">Всего денег</div><div class="stat-value" id="totalMoney">0 руб.</div></div>
            <div class="stat-item"><div class="stat-label">Топ донат</div><div class="stat-value" id="topDonate">0</div></div>
            <div class="stat-item"><div class="stat-label">Топ деньги</div><div class="stat-value" id="topMoney">0 руб.</div></div>
        </div>
        <div style="margin-top:16px;">
            <div class="row-2">
                <div class="stat-card-big">
                    <div class="stat-label">🏆 Топ донат</div>
                    <div id="topDonateList" style="margin-top:8px;"></div>
                </div>
                <div class="stat-card-big">
                    <div class="stat-label">🏆 Топ деньги (рубли)</div>
                    <div id="topMoneyList" style="margin-top:8px;"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="card anim-fade-up">
        <div class="card-title">💎 Управление донатом и деньгами</div>
        <div class="economy-actions">
            <div class="action-group">
                <div class="action-label">Выдать донат</div>
                <div class="form-group"><label>Ник</label><input type="text" id="ecoNick" placeholder="Введите ник"></div>
                <div class="form-group"><label>Сумма</label><input type="number" id="ecoAmount" value="100"></div>
                <button class="btn btn-success btn-block" id="ecoDonateBtn">💎 Выдать</button>
            </div>
            <div class="action-group">
                <div class="action-label">Выдать деньги (рубли)</div>
                <div class="form-group"><label>Ник</label><input type="text" id="ecoMoneyNick" placeholder="Введите ник"></div>
                <div class="form-group"><label>Сумма</label><input type="number" id="ecoMoneyAmount" value="1000"></div>
                <button class="btn btn-success btn-block" id="ecoMoneyBtn">💰 Выдать</button>
            </div>
            <div class="action-group">
                <div class="action-label">Установить баланс (донат)</div>
                <div class="form-group"><label>Ник</label><input type="text" id="ecoSetNick" placeholder="Введите ник"></div>
                <div class="form-group"><label>Баланс</label><input type="number" id="ecoSetAmount" value="0"></div>
                <button class="btn btn-purple btn-block" id="ecoSetBtn">📌 Установить</button>
            </div>
        </div>
    </div>
    <div class="card anim-fade-up">
        <div class="card-title">📋 История транзакций</div>
        <div class="logs-box" id="transactionLogs" style="min-height:120px;"></div>
        <button class="btn btn-outline btn-block mt-16" id="downloadReportBtn">📥 Скачать отчёт (TXT)</button>
    </div>
</div>
