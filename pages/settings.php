<div id="tab-settings" class="tab">
    <div class="row-2">
        <div class="card anim-fade-up">
            <div class="card-title">Профиль</div>
            <div class="avatar-upload-area">
                <div class="avatar-preview">
                    <img id="settingsAvatarImg" src="" style="display:none;" alt="avatar">
                    <div class="placeholder" id="settingsAvatarPlaceholder"><?= strtoupper(substr($user,0,1)) ?></div>
                </div>
                <div>
                    <div class="avatar-input-group">
                        <input type="file" id="avatarFileInput" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;">
                        <button class="btn btn-sm" id="uploadAvatarBtn">📁 Загрузить</button>
                    </div>
                </div>
            </div>
            <div class="form-group" style="margin-top: 8px;"><label>Логин</label><input type="text" id="settingsUsername" value="<?= htmlspecialchars($user) ?>"></div>
            <div class="form-group"><label>Новый пароль</label><input type="password" id="settingsNewPass" placeholder="Введите новый пароль"></div>
            <button class="btn btn-block" id="saveSettingsBtn">💾 Сохранить настройки</button>
        </div>
        <div class="card anim-fade-up">
            <div class="card-title">⚙️ Настройки панели</div>
            <div class="form-group">
                <label>Тема</label>
                <select id="themeSelect">
                    <option value="dark">Тёмная</option>
                    <option value="light">Светлая</option>
                </select>
            </div>
            <div class="form-group">
                <label>Язык</label>
                <select id="langSelect">
                    <option value="ru">Русский</option>
                </select>
            </div>
        </div>
    </div>
</div>

<?php if ($user === 'Sobolev' || ($access['accounts'] ?? false)): ?>
<div id="tab-accounts" class="tab">
    <div class="card anim-fade-up">
        <div class="card-title">Управление аккаунтами</div>
        <div style="margin-bottom:16px;">
            <div class="form-group" style="display:flex; gap:10px; flex-wrap:wrap;">
                <input type="text" id="newAccountLogin" placeholder="Логин" style="flex:1; min-width:120px; padding:10px 14px; background:rgba(26,26,34,0.6); border:2px solid rgba(255,255,255,0.05); border-radius:10px; color:#fff; font-size:14px; font-family:inherit; outline:none;">
                <input type="text" id="newAccountPass" placeholder="Пароль" style="flex:1; min-width:120px; padding:10px 14px; background:rgba(26,26,34,0.6); border:2px solid rgba(255,255,255,0.05); border-radius:10px; color:#fff; font-size:14px; font-family:inherit; outline:none;">
                <button class="btn btn-success" id="createAccountBtn">Создать</button>
            </div>
        </div>
        <div id="accountsList"></div>
    </div>
</div>
<?php endif; ?>
