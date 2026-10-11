<div id="tab-logs" class="tab">
    <div class="card anim-fade-up">
        <div class="card-title">📜 Логи системы</div>
        <div style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" id="clearLogsBtn">🗑️ Очистить</button>
            <div style="display:flex; gap:8px; align-items:center; margin-left:auto;">
                <input type="text" id="logFilterInput" placeholder="Фильтр по нику..." style="padding:6px 12px; background:rgba(26,26,34,0.6); border:2px solid rgba(255,255,255,0.05); border-radius:8px; color:#fff; font-size:13px; font-family:inherit; outline:none; width:160px;">
                <button class="btn btn-sm btn-outline" id="logFilterBtn">🔍</button>
                <button class="btn btn-sm btn-outline" id="logFilterClear">✕</button>
            </div>
        </div>
        <div class="logs-box" id="logsBox"></div>
        <div style="margin-top:12px;">
            <div style="font-size:12px; color:#555; margin-bottom:6px;">📋 Недавние действия</div>
            <div id="recentActions"></div>
        </div>
    </div>
</div>
