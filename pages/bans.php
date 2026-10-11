<div id="tab-bans" class="tab">
    <div class="row-2">
        <div class="card anim-fade-up">
            <div class="card-title">⛔ Выдать наказание</div>
            <div class="form-group"><label>Никнейм / UUID</label><input type="text" id="punishTarget" placeholder="Введите ник или UUID"></div>
            <div class="form-group"><label>Тип наказания</label>
                <select id="punishType">
                    <option value="ban">Бан аккаунта</option>
                    <option value="uuid">Бан по UUID</option>
                    <option value="warn">Варн</option>
                </select>
            </div>
            <div class="form-group"><label>Причина</label><input type="text" id="punishReason" placeholder="Например: Читы"></div>
            <div class="form-group"><label>Срок (дни, 0 = перманент, только для бана)</label><input type="number" id="punishDuration" value="0"></div>
            <button class="btn btn-danger btn-block" id="punishBtn">Выдать</button>
        </div>
        <div class="card anim-fade-up">
            <div class="card-title">✅ Снять наказание</div>
            <div class="form-group"><label>Никнейм / UUID</label><input type="text" id="unpunishTarget" placeholder="Введите ник или UUID"></div>
            <div class="form-group"><label>Тип наказания</label>
                <select id="unpunishType">
                    <option value="ban">Бан аккаунта</option>
                    <option value="uuid">Бан по UUID</option>
                    <option value="warn">Варн</option>
                </select>
            </div>
            <button class="btn btn-success btn-block" id="unpunishBtn">Снять</button>
        </div>
    </div>
    <div class="card anim-fade-up">
        <div class="card-title">📜 Список банов</div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>Игрок / UUID</th><th>Причина</th><th>Срок</th><th>Тип</th><th>Статус</th><th>Действие</th></tr></thead>
                <tbody id="banTableBody"></tbody>
            </table>
        </div>
    </div>
</div>
