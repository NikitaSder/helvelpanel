<div id="tab-players" class="tab">
    <div class="card anim-fade-up">
        <div class="card-title">Поиск игрока</div>
        <div class="form-group">
            <label>Никнейм</label><input type="text" id="searchPlayer" placeholder="Введите ник игрока" value="Test">
            <label style="margin-top:8px;">Сервер</label>
            <select id="searchServer">
                <option value="helvel">HELVEL</option>
            </select>
        </div>
        <button class="btn" id="searchBtn">🔍 Найти</button>
        <div class="player-search-result" id="searchResult">
            <div class="info-line"><span class="label">Никнейм</span><span class="value" id="resultNick">—</span></div>
            <div class="info-line"><span class="label">IP-адрес</span><span class="value" id="resultIp">—</span></div>
            <div class="info-line"><span class="label">UUID (железо)</span><span class="value" id="resultUuid">—</span></div>
            <div class="info-line"><span class="label">Статус</span><span class="value" id="resultStatus">—</span></div>
            <div class="info-line"><span class="label">Донат</span><span class="value" id="resultDonate">—</span></div>
            <div class="info-line"><span class="label">Деньги</span><span class="value" id="resultMoney">—</span></div>
            <div class="info-line"><span class="label">Варны</span><span class="value" id="resultWarns">—</span></div>
            <div class="info-line"><span class="label">Забанен</span><span class="value" id="resultBanned">—</span></div>
            <div class="actions">
                <button class="btn btn-sm btn-outline" id="actionKick">Кик</button>
                <button class="btn btn-sm btn-danger" id="actionBan">Бан</button>
                <button class="btn btn-sm" style="background:rgba(241,196,15,0.15);color:#f1c40f;" id="actionWarn">Варн</button>
                <button class="btn btn-sm btn-purple" id="actionReset">Обнулить</button>
            </div>
            <div style="margin-top:12px;">
                <div class="form-group" style="margin-bottom:8px;">
                    <label style="font-size:11px;">Сумма доната</label>
                    <input type="number" id="donateAmountInput" placeholder="Сумма" value="100" style="width:100%; padding:8px 12px; background:rgba(26,26,34,0.6); border:2px solid rgba(255,255,255,0.05); border-radius:8px; color:#fff; font-size:14px;">
                </div>
                <button class="btn btn-sm btn-success" id="applyDonateBtn">💎 Выдать донат</button>
            </div>
            <div style="margin-top:8px;">
                <div class="form-group" style="margin-bottom:8px;">
                    <label style="font-size:11px;">Сумма денег (рубли)</label>
                    <input type="number" id="moneyAmountInput" placeholder="Сумма" value="1000" style="width:100%; padding:8px 12px; background:rgba(26,26,34,0.6); border:2px solid rgba(255,255,255,0.05); border-radius:8px; color:#fff; font-size:14px;">
                </div>
                <button class="btn btn-sm btn-success" id="applyMoneyBtn">💰 Выдать деньги</button>
            </div>
        </div>
    </div>
</div>
