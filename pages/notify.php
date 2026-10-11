<div id="tab-notify" class="tab">
    <div style="display:flex; justify-content:center; align-items:center; min-height:60vh;">
        <div class="card anim-fade-up" style="width:100%; max-width:700px; margin:0;">
            <div class="card-title" style="justify-content:center;">Уведомление на лаунчер</div>
            <div class="form-group"><label>Заголовок</label><input type="text" id="notifyTitleFull" placeholder="Важное объявление"></div>
            <div class="form-group"><label>Текст</label><textarea id="notifyMessageFull" placeholder="Текст уведомления..."></textarea></div>
            <div class="form-group"><label>Тип</label>
                <select id="notifyTypeFull">
                    <option value="all">Общее</option>
                    <option value="admin">Для администрации</option>
                    <option value="test">Для тестеров</option>
                </select>
            </div>
            <button class="btn btn-block" id="notifyFullBtn">📨 Отправить</button>
        </div>
    </div>
</div>
