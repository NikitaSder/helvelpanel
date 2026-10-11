<div id="tab-server" class="tab">
    <div class="row-3 anim-fade-up">
        <div class="card">
            <div class="card-title">📱 HELVEL MOBILE</div>
            <div class="server-controls">
                <button class="btn btn-purple" id="restartServerBtnHelvel">🔄 Рестарт</button>
            </div>
            <div class="mt-16 text-muted" style="font-size:14px;">
                Статус: <span id="serverStatusLabelHelvel" style="color:#ff3b30;font-weight:600;">Остановлен</span>
            </div>
        </div>
        <div class="card">
            <div class="card-title">📱 MAGNUM MOBILE</div>
            <div class="server-controls">
                <button class="btn btn-purple" id="restartServerBtnMagnum">🔄 Рестарт</button>
            </div>
            <div class="mt-16 text-muted" style="font-size:14px;">
                Статус: <span id="serverStatusLabelMagnum" style="color:#ff3b30;font-weight:600;">Остановлен</span>
            </div>
        </div>
        <div class="card">
            <div class="card-title"> NULL </div>
            <div class="mt-16 text-muted" style="font-size:14px;">
                Статус: <span id="serverStatusLabelNull" style="color:#ff3b30;font-weight:600;">Нет связи с сервером</span>
            </div>
        </div>
    </div>
    <div class="card anim-fade-up">
        <div class="card-title">📊 Логи серверов</div>
        <div class="logs-box" id="serverLogs"></div>
    </div>
</div>
