var PLAYERS_DB = [{
    id: 'test_1',
    nick: 'Test',
    status: 'оффлайн',
    donate: 0,
    money: 0,
    warns: 0,
    banned: false,
    uuid: 'UUID-TEST-001',
    ip: '127.0.0.1',
    server: 'Helvel',
}];
var banList = [];
var transactions = [];
var actionHistory = [];
var miniOnlineHistory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0];

function callAPI(action, data, callback) {
    var formData = new FormData();
    formData.append('action', action);
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            formData.append(key, data[key]);
        }
    }
    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(function(response) { 
        return response.text().then(function(text) {
            try {
                return JSON.parse(text);
            } catch(e) {
                console.error('Ответ сервера:', text);
                return {success: false, message: 'Сервер вернул HTML вместо JSON'};
            }
        });
    })
    .then(function(json) {
        if (callback) callback(json);
    })
    .catch(function(err) {
        showToast('Ошибка соединения: ' + err.message, 'error');
        if (callback) callback({success: false, message: err.message});
    });
}

function getTime() {
    return new Date().toLocaleTimeString();
}

function getLogTag(type) {
    var tags = {
        info: '[INFO]',
        warn: '[WARN]',
        error: '[ERROR]',
        success: '[SUCCESS]',
        donate: '[DONATE]',
        ban: '[BAN]',
        reset: '[RESET]',
        admin: '[ADMIN]',
        unban: '[UNBAN]',
        money: '[MONEY]',
        user: '[USER]',
        server: '[SERVER]',
        leader: '[LEADER]'
    };
    return tags[type] || '[LOG]';
}

function getDateTime() {
    return new Date().toLocaleString();
}

function showToast(msg, type) {
    if (type === undefined) type = 'info';
    var c = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = msg + '<button class="close" onclick="this.parentElement.remove()">✕</button>';
    c.appendChild(t);
    setTimeout(function() {
        if (t.parentElement) t.remove();
    }, 5000);
}

function showConfirm(title, text, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalText').textContent = text;
    modalCallback = callback;
    document.getElementById('confirmModal').classList.add('active');
}

document.getElementById('modalCancel').addEventListener('click', function() {
    document.getElementById('confirmModal').classList.remove('active');
    modalCallback = null;
});

document.getElementById('modalConfirm').addEventListener('click', function() {
    document.getElementById('confirmModal').classList.remove('active');
    if (typeof modalCallback === 'function') {
        modalCallback();
        modalCallback = null;
    }
});

setInterval(function() {
    if (currentUser) {
        loadAvatarForUser(currentUser);
    }
}, 15000);

function loadStats() {
    callAPI('getStats', {}, function(res) {
        if (res.success) {
            var onlineAll = Number(res.online || 0);
            var onlineHelvel = Number(res.onlineHelvel || 0);
            var onlineMagnum = Number(res.onlineMagnum || 0);

            document.getElementById('statOnlineAll').textContent = onlineAll;
            document.getElementById('statOnlineHelvel').textContent = onlineHelvel;
            document.getElementById('statOnlineMagnum').textContent = onlineMagnum;
            document.getElementById('statOnlineHelvelPeak').textContent = res.onlineHelvelPeak || 0;
            document.getElementById('statOnlineMagnumPeak').textContent = res.onlineMagnumPeak || 0;
            document.getElementById('statOnlineAllPeakTime').textContent = res.onlineAllPeakTime || '00:00:00';
            document.getElementById('statOnlineAllTime').textContent = res.onlineAllTime || '00:00:00';
            document.getElementById('statAccounts').textContent = res.accounts || 0;
            document.getElementById('statBanned').textContent = res.banned || 0;
            document.getElementById('dashTotalDonate').textContent = res.totalDonate || 0;
            document.getElementById('dashTotalMoney').textContent = (res.totalMoney || 0) + ' руб.';
            document.getElementById('totalDonate').textContent = res.totalDonate || 0;
            document.getElementById('totalMoney').textContent = (res.totalMoney || 0) + ' руб.';
            document.getElementById('topDonate').textContent = res.topDonate || 0;
            document.getElementById('topMoney').textContent = (res.topMoney || 0) + ' руб.';

            if (Array.isArray(res.onlineHistory) && res.onlineHistory.length) {
                miniOnlineHistory = res.onlineHistory.slice(-24);
            } else if (onlineAll > 0 || onlineHelvel > 0 || onlineMagnum > 0) {
                miniOnlineHistory = miniOnlineHistory.slice(1).concat([onlineAll]);
            }
            renderMiniOnlineChart(miniOnlineHistory);
            document.getElementById('chartCurrentMini').textContent = onlineAll;
            document.getElementById('chartPeakMini').textContent = Math.max.apply(null, miniOnlineHistory) || onlineAll || 0;
        }
    });
    loadLogs();
}

function loadLogs() {
    var box = document.getElementById('logsBox');
    if (!box) return;

    callAPI('getLogs', {}, function(res) {
        if (res.success && res.logs) {
            box.innerHTML = '';
            var classes = { info: 'info', warn: 'warn', error: 'error', success: 'success', donate: 'donate', ban: 'ban', reset: 'reset', admin: 'admin', unban: 'unban', money: 'money' };
            for (var i = 0; i < res.logs.length; i++) {
                var log = res.logs[i];
                var cls = classes[log.type] || 'info';
                var tag = getLogTag(log.type);
                var div = document.createElement('div');
                div.dataset.target = log.target || '';
                var date = new Date(log.created_at);
                var timeStr = date.toLocaleTimeString();
                div.innerHTML = '<span class="time">[' + timeStr + ']</span> <span class="' + cls + '">' + tag + ' ' + log.message + '</span>';
                box.appendChild(div);
            }
            if (res.logs.length === 0) {
                box.innerHTML = '';
            }
        }
    });
}

function addLog(type, message, targetNick) {
    if (targetNick === undefined) targetNick = '';
    callAPI('addLog', {type: type, message: message, target: targetNick}, function(res) {
        if (res.success) {
            loadLogs();
        }
    });
    var box = document.getElementById('logsBox');
    var time = getTime();
    var classes = { info: 'info', warn: 'warn', error: 'error', success: 'success', donate: 'donate', ban: 'ban', reset: 'reset', admin: 'admin', unban: 'unban', money: 'money' };
    var cls = classes[type] || 'info';
    var tag = getLogTag(type);
    var div = document.createElement('div');
    div.dataset.target = targetNick || '';
    div.innerHTML = '<span class="time">[' + time + ']</span> <span class="' + cls + '">' + tag + ' ' + message + '</span>';
    box.insertBefore(div, box.firstChild);
    if (box.children.length > 50) box.removeChild(box.lastChild);
}

function toggleLauncher() {
    var toggle = document.getElementById('toggleLauncher');
    var statusText = document.getElementById('toggleStatusText');
    var newStatus = launcherEnabled ? 'off' : 'on';
    toggle.style.transition = 'transform 0.1s';
    toggle.style.transform = 'scale(0.85)';
    setTimeout(function() {
        toggle.style.transform = 'scale(1)';
    }, 100);
    launcherEnabled = newStatus === 'on';
    if (launcherEnabled) {
        toggle.classList.add('active');
        statusText.textContent = 'Включён';
        statusText.style.color = '#2ecc71';
        toggle.style.boxShadow = '0 0 30px rgba(46, 204, 113, 0.4)';
        showToast('Лаунчер включён', 'success');
    } else {
        toggle.classList.remove('active');
        statusText.textContent = 'Выключен';
        statusText.style.color = '#ff3b30';
        toggle.style.boxShadow = 'none';
        showToast('Лаунчер выключен', 'error');
    }
    localStorage.setItem('launcher_status', newStatus);
    addLog('info', currentUser + ' ' + (launcherEnabled ? 'включил' : 'выключил') + ' лаунчер');
}

function searchPlayer() {
    var query = document.getElementById('searchPlayer').value.trim();
    var resultDiv = document.getElementById('searchResult');
    var serverSelect = document.getElementById('searchServer');
    var selectedServer = serverSelect ? (serverSelect.value || '').toLowerCase() : '';

    if (!query) { resultDiv.style.display = 'none'; foundPlayer = null; return; }

    var player = null;
    for (var i = 0; i < PLAYERS_DB.length; i++) {
        var candidate = PLAYERS_DB[i];
        var candidateServer = String(candidate.server || '').toLowerCase();
        var sameNick = candidate.nick && candidate.nick.toLowerCase() === query.toLowerCase();
        var sameServer = !selectedServer || candidateServer === selectedServer;

        if (sameNick && sameServer) {
            player = candidate;
            break;
        }
    }

    if (player) {
        foundPlayer = player;
        document.getElementById('resultNick').textContent = player.nick;
        document.getElementById('resultIp').textContent = player.ip || '—';
        document.getElementById('resultUuid').textContent = player.uuid || '—';
        document.getElementById('resultStatus').textContent = player.banned ? 'Забанен' : (player.status || 'оффлайн');
        document.getElementById('resultDonate').textContent = player.donate;
        document.getElementById('resultMoney').textContent = player.money + ' руб.';
        document.getElementById('resultWarns').textContent = (player.warns || 0) + '/3';
        document.getElementById('resultBanned').textContent = player.banned ? 'Да' : 'Нет';
        resultDiv.style.display = 'block';
        showToast('Игрок ' + player.nick + ' найден на сервере ' + (player.server || 'не указан'), 'success');
    } else {
        foundPlayer = null;
        resultDiv.style.display = 'none';
        showToast('Игрок не найден на выбранном сервере', 'error');
    }
}

function updateBanTable() {
    var tbody = document.getElementById('banTableBody');
    if (banList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center" style="padding:20px;">Нет забаненных игроков</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < banList.length; i++) {
        var b = banList[i];
        var displayName = b.type === 'uuid' ? b.id : (b.playerNick || b.id);
        html += '<tr><td>' + displayName + '</td><td>' + b.reason + '</td><td>' + b.duration + '</td><td><span class="badge ' + (b.type === 'uuid' ? 'badge-purple' : 'badge-blue') + '">' + (b.type === 'uuid' ? 'UUID' : 'Аккаунт') + '</span></td><td><span class="badge badge-red">' + b.status + '</span></td><td><button class="btn btn-sm btn-outline" onclick="unbanPlayer(' + i + ')">Снять</button></td></tr>';
    }
    tbody.innerHTML = html;
}

function unbanPlayer(index) {
    var b = banList[index];
    var p = null;
    for (var i = 0; i < PLAYERS_DB.length; i++) {
        if (PLAYERS_DB[i].id === b.id) {
            p = PLAYERS_DB[i];
            break;
        }
    }
    if (p) { p.banned = false; p.warns = 0; }
    banList.splice(index, 1);
    addLog('unban', currentUser + ' снял бан с ' + b.id, p ? p.nick : '');
    showToast('Бан снят с ' + b.id, 'success');
    if (foundPlayer) searchPlayer();
}

function addAction(type, target, details) {
    if (details === undefined) details = '';
    var texts = {
        kick: 'Кикнут ' + target,
        ban: 'Забанен ' + target + (details ? ' (' + details + ')' : ''),
        unban: 'Разбанен ' + target,
        donate: 'Донат ' + target + ' ' + details,
        money: 'Деньги ' + target + ' ' + details + ' руб.',
        reset: 'Обнулён ' + target,
        warn: 'Варн ' + target + (details ? ' (' + details + ')' : '')
    };
    actionHistory.unshift({ type: type, target: target, details: details, text: texts[type] || type + ' ' + target, timestamp: getDateTime(), playerId: target });
    if (actionHistory.length > 20) actionHistory.pop();
    updateRecentActions();
}

function updateRecentActions() {
    var container = document.getElementById('recentActions');
    if (actionHistory.length === 0) { container.innerHTML = '<div class="text-muted" style="padding:8px 0; font-size:13px;">Нет действий</div>'; return; }
    var html = '';
    for (var i = 0; i < actionHistory.length; i++) {
        var a = actionHistory[i];
        html += '<div class="log-item"><span class="log-text"><span class="time">[' + a.timestamp + ']</span> ' + a.text + '</span><button class="undo-btn" onclick="undoAction(' + i + ')" title="Отменить">↩️</button></div>';
    }
    container.innerHTML = html;
}

function undoAction(index) {
    var action = actionHistory[index];
    if (!action) return;
    addLog('admin', currentUser + ' отменил действие: ' + action.text, action.target);
    showToast('Откат: ' + action.text + ' (отменил ' + currentUser + ')', 'info');
    actionHistory.splice(index, 1);
    updateRecentActions();
}

function addTransactionLog(message) {
    var box = document.getElementById('transactionLogs');
    var time = getTime();
    var div = document.createElement('div');
    div.innerHTML = '<span class="time">[' + time + ']</span> <span class="donate">' + message + '</span>';
    box.insertBefore(div, box.firstChild);
    if (box.children.length > 30) box.removeChild(box.lastChild);
}

function renderMiniOnlineChart(history) {
    var container = document.getElementById('onlineChartMini');
    if (!container) return;

    var source = Array.isArray(history) && history.length ? history.slice() : [];
    if (!source.length) {
        source = Array.isArray(miniOnlineHistory) ? miniOnlineHistory.slice() : [];
    }

    while (source.length < 24) {
        source.unshift(0);
    }
    if (source.length > 24) {
        source = source.slice(-24);
    }

    var values = source.map(function(value) {
        return Number(value) || 0;
    });

    var peak = Math.max.apply(null, values) || 0;
    var current = values[values.length - 1] || 0;
    var maxOnline = 1000;

    var svgWidth = Math.max(container.clientWidth || 320, 360);
    var svgHeight = 220;
    var paddingX = 52;
    var paddingY = 8;
    var baselineY = svgHeight - 12;
    var plotHeight = svgHeight - paddingY * 2 - 12;
    var step = (svgWidth - paddingX * 2) / values.length;
    var barWidth = Math.max(5, Math.min(13, step - 2));

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'none');

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'onlineChartGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    var stopA = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopA.setAttribute('offset', '0%');
    stopA.setAttribute('stop-color', '#60a5fa');

    var stopB = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopB.setAttribute('offset', '100%');
    stopB.setAttribute('stop-color', '#8b5cf6');

    gradient.appendChild(stopA);
    gradient.appendChild(stopB);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    var baseline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseline.setAttribute('x1', paddingX);
    baseline.setAttribute('x2', svgWidth);
    baseline.setAttribute('y1', baselineY);
    baseline.setAttribute('y2', baselineY);
    baseline.setAttribute('stroke', 'rgba(255,255,255,0.1)');
    baseline.setAttribute('stroke-width', '1');
    svg.appendChild(baseline);

    var scaleSteps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    for (var s = 0; s < scaleSteps.length; s++) {
        var scaleValue = scaleSteps[s];
        var scaleRatio = Math.min(1, Math.max(0, scaleValue / maxOnline));
        var scaleY = baselineY - scaleRatio * plotHeight;

        var gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', paddingX);
        gridLine.setAttribute('x2', svgWidth);
        gridLine.setAttribute('y1', scaleY);
        gridLine.setAttribute('y2', scaleY);
        gridLine.setAttribute('stroke', 'rgba(255,255,255,0.06)');
        gridLine.setAttribute('stroke-width', '1');
        svg.appendChild(gridLine);

        var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', paddingX - 10);
        label.setAttribute('y', scaleY + 4);
        label.setAttribute('fill', 'rgba(255,255,255,0.72)');
        label.setAttribute('font-size', '11');
        label.setAttribute('font-weight', '700');
        label.setAttribute('text-anchor', 'end');
        label.textContent = scaleValue;
        svg.appendChild(label);
    }

    var tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.display = 'none';

    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        var ratio = Math.min(1, Math.max(0, value / maxOnline));
        var barHeight = value > 0 ? Math.max(2, ratio * plotHeight) : 2;
        var x = paddingX + i * step + (step - barWidth) / 2;
        var y = baselineY - barHeight;

        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('rx', 5);
        rect.setAttribute('fill', value > 0 ? 'url(#onlineChartGradient)' : '#2a334a');
        rect.setAttribute('opacity', value > 0 ? '1' : '0.88');
        rect.setAttribute('data-value', value);
        rect.setAttribute('data-time', String(i).padStart(2, '0') + ':00');
        rect.style.cursor = 'pointer';

        rect.addEventListener('mouseenter', function(event) {
            var timeText = this.getAttribute('data-time');
            var valueText = this.getAttribute('data-value');
            tooltip.textContent = timeText + ' • Онлайн: ' + valueText;
            tooltip.style.display = 'block';

            var box = container.getBoundingClientRect();
            var left = event.clientX - box.left;
            var top = event.clientY - box.top - 18;
            left = Math.min(Math.max(left, 20), box.width - 20);
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';

            this.setAttribute('opacity', '1');
            this.setAttribute('stroke', 'rgba(255,255,255,0.8)');
            this.setAttribute('stroke-width', '1');
        });

        rect.addEventListener('mousemove', function(event) {
            var box = container.getBoundingClientRect();
            var left = event.clientX - box.left;
            var top = event.clientY - box.top - 18;
            left = Math.min(Math.max(left, 20), box.width - 20);
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        });

        rect.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
            var val = Number(this.getAttribute('data-value') || 0);
            this.setAttribute('opacity', val > 0 ? '1' : '0.88');
            this.removeAttribute('stroke');
            this.removeAttribute('stroke-width');
        });

        svg.appendChild(rect);
    }

    container.innerHTML = '';
    container.appendChild(svg);
    container.appendChild(tooltip);

    var peakNode = document.getElementById('chartPeakMini');
    if (peakNode) peakNode.textContent = peak;

    var currentNode = document.getElementById('chartCurrentMini');
    if (currentNode) currentNode.textContent = current;
}

function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : 'auto';
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function getAvatarUrl(user) {
    var base = 'avatar.php?user=' + encodeURIComponent(user);
    var stamp = Date.now();
    if (base.indexOf('v=') !== -1) {
        base = base.replace(/([?&])v=\d+/, '$1v=' + stamp);
    } else {
        base += '&v=' + stamp;
    }
    return base;
}

function setServerStatus(name, isOnline) {
    const items = document.querySelectorAll(".server-status-item");

    items.forEach(item => {
        const serverName = item.querySelector(".server-name").textContent.trim();

        if (serverName === name) {
            const badge = item.querySelector(".server-badge");

            if (isOnline == "online") {
                item.classList.remove("offline");
                item.classList.add("online");

                badge.classList.remove("offline");
                badge.classList.add("online");
                badge.textContent = "Включен";
            } else if (isOnline == "offline") {
                item.classList.remove("online");
                item.classList.add("offline");

                badge.classList.remove("online");
                badge.classList.add("offline");
                badge.textContent = "Выключен";
            } else {
                item.classList.remove("online");
                item.classList.add("offline");

                badge.classList.remove("online");
                badge.classList.add("offline");
                badge.textContent = "Нет связи";
            }
        }
    });
}


function loadAvatarForUser(user) {
    var key = 'helvel_avatar_' + user;
    var src = currentUserAvatar || localStorage.getItem(key) || '';
    if (src && src.indexOf('avatar.php?user=') === -1 && src.indexOf('http') !== 0 && src.indexOf('data:') !== 0) {
        src = 'avatar.php?user=' + encodeURIComponent(user);
    }
    if (src && src.indexOf('avatar.php?user=') !== -1) {
        src = getAvatarUrl(user);
    }
    var avatarImages = [
        document.getElementById('headerAvatarImg'),
        document.getElementById('sidebarAvatarImg'),
        document.getElementById('settingsAvatarImg')
    ];
    var placeholders = [
        document.getElementById('headerAvatarPlaceholder'),
        document.getElementById('sidebarAvatarPlaceholder'),
        document.getElementById('settingsAvatarPlaceholder')
    ];

    if (src && src.trim() !== '') {
        currentUserAvatar = src.trim();
        if (localStorage.getItem(key) !== currentUserAvatar) {
            localStorage.setItem(key, currentUserAvatar);
        }
        avatarImages.forEach(function(img) {
            if (img) {
                img.src = src.trim();
                img.style.display = 'block';
            }
        });
        placeholders.forEach(function(node) {
            if (node) node.style.display = 'none';
        });
    } else {
        avatarImages.forEach(function(img) {
            if (img) {
                img.src = '';
                img.style.display = 'none';
            }
        });
        placeholders.forEach(function(node) {
            if (node) node.style.display = 'flex';
        });
    }
}

function uploadAvatarFile(file) {
    if (!file) { showToast('Выберите изображение', 'error'); return; }
    var validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (validTypes.indexOf(file.type) === -1) {
        showToast('Поддерживаются только PNG, JPG, WEBP, GIF', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('Файл слишком большой. Максимум 5 МБ', 'error');
        return;
    }

    var formData = new FormData();
    formData.append('action', 'uploadAvatar');
    formData.append('avatar', file);

    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(json) {
        if (!json.success) {
            showToast(json.message || 'Ошибка загрузки аватара', 'error');
            return;
        }
        currentUserAvatar = json.avatar || currentUserAvatar;
        localStorage.setItem('helvel_avatar_' + currentUser, currentUserAvatar);
        loadAvatarForUser(currentUser);
        showToast('Аватар загружен на сервер', 'success');
        addLog('admin', currentUser + ' загрузил аватар');
    })
    .catch(function(err) {
        showToast('Ошибка: ' + err.message, 'error');
    });
}

function removeAvatar() {
    if (!currentUser) return;
    callAPI('removeAvatar', {}, function(res) {
        if (!res.success) {
            showToast(res.message || 'Ошибка удаления аватара', 'error');
            return;
        }
        currentUserAvatar = '';
        var key = 'helvel_avatar_' + currentUser;
        localStorage.removeItem(key);
        loadAvatarForUser(currentUser);
        showToast('Аватар удалён', 'info');
        addLog('admin', currentUser + ' удалил аватар');
    });
}

function renderAccountsList() {
    if (currentUser !== 'Sobolev' && currentUser !== 'Sder') {
        var box = document.getElementById('accountsList');
        if (box) box.innerHTML = '<div class="text-muted" style="padding:20px;">Только Sobolev может управлять аккаунтами</div>';
        return;
    }
    callAPI('getUsers', {}, function(res) {
        if (!res.success) { showToast(res.message || 'Ошибка загрузки', 'error'); return; }
        var container = document.getElementById('accountsList');
        if (!container) return;
        container.innerHTML = '';
        var sortedLogins = Object.keys(res.users);
        sortedLogins.sort(function(a, b) {
            if (a === 'Sobolev') return -1;
            if (b === 'Sobolev') return 1;
            return a.localeCompare(b);
        });
        for (var idx = 0; idx < sortedLogins.length; idx++) {
            var login = sortedLogins[idx];
            var user = res.users[login];
            var isSelf = login === currentUser;
            var card = document.createElement('div');
            card.className = 'user-card';
            var roleDisplay = user.role || '';
            var avatarSrc = user.avatar ? ('avatar.php?user=' + encodeURIComponent(login) + '&v=' + Date.now()) : '';
            var html = '<div class="user-header">';
            html += '<div class="ua" style="overflow:hidden; display:flex; align-items:center; justify-content:center; width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,0.06); position:relative;">';
            if (avatarSrc) {
                html += '<img src="' + avatarSrc + '" alt="avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">';
            } else {
                html += '<span style="font-size:15px; font-weight:700; color:#fff; user-select: none;">' + login.charAt(0).toUpperCase() + '</span>';
            }
            html += '</div>';
            html += '<div><div class="uname">' + login + '</div><div class="urole">' + roleDisplay + (isSelf ? ' (вы)' : '') + '</div></div>';
            if (!isSelf) {
                html += '<div style="margin-left:auto; display:flex; gap:6px;">';
                html += '<button class="btn btn-sm btn-outline toggle-access-btn" data-login="' + login + '">Доступы</button>';
                html += '<button class="btn btn-sm btn-danger" onclick="deleteUser(\'' + login + '\')">Удалить</button>';
                html += '</div>';
            } else {
                html += '<div style="margin-left:auto;"><span style="color:#555;font-size:12px;">Вы не можете редактировать себя</span></div>';
            }
            html += '</div>';
            html += '<div class="access-section" id="access-' + login + '" style="display:none; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.05);">';
            html += '<div style="font-size:13px; font-weight:600; margin-bottom:8px;">Доступы для ' + login + ':</div>';

            var accessLabels = {
                dashboard: "Панель управления",
                players: "Игроки",
                bans: "Баны",
                economy: "Экономика",
                server: "Сервер",
                notify: "Уведомления",
                logs: "Логи",
                settings: "Настройки",
                accounts: "Аккаунты"
            }

            var accessKeys = Object.keys(user.access);
            for (var ak = 0; ak < accessKeys.length; ak++) {
                var key = accessKeys[ak];
                var isActive = user.access[key] ? 'active' : '';
                html += '<div class="access-toggle">';
                html += '<span class="label">' + key.charAt(0).toUpperCase() + key.slice(1) + '</span>';
                html += '<button class="toggle-sm ' + isActive + '" data-login="' + login + '" data-key="' + key + '"></button>';
                html += '</div>';
            }

            
            html += '<div style="margin-top:12px; display:flex; gap:8px;">';
            html += '<button class="btn btn-sm btn-outline" onclick="setUserPassword(\'' + login + '\')">🔑 Сменить пароль</button>';
            html += '<button class="btn btn-sm btn-outline" onclick="setUserRole(\'' + login + '\')">👥 Сменить роль</button>';
            html += '</div>';
            html += '</div>';
            card.innerHTML = html;
            container.appendChild(card);
        }
        document.querySelectorAll('.toggle-sm[data-login]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var login = this.dataset.login;
                var key = this.dataset.key;
                toggleAccess(login, key, this);
            });
        });
        document.querySelectorAll('.toggle-access-btn').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var login = this.dataset.login;
                var section = document.getElementById('access-' + login);
                if (section) {
                    if (section.style.display === 'none' || section.style.display === '') {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                }
            });
        });
    });
}

function updateNavVisibility() {
    var navItems = document.querySelectorAll('.sidebar .nav-item[data-tab]');
    var tabMap = { 'accounts': 'accounts', 'players': 'players', 'bans': 'bans', 'economy': 'economy', 'server': 'server', 'notify': 'notify', 'logs': 'logs', 'settings': 'settings' };
    navItems.forEach(function(item) {
        var tab = item.getAttribute('data-tab');
        if (tab === 'dashboard') return;
        if (currentUser === 'Sobolev') { item.style.display = 'flex'; return; }
        var key = tabMap[tab];
        if (key && accessMap[key] === true) { item.style.display = 'flex'; } else { item.style.display = 'none'; }
    });
    var groupLabels = document.querySelectorAll('.sidebar .nav-group .group-label');
    groupLabels.forEach(function(label) {
        var group = label.parentElement;
        var visibleItems = group.querySelectorAll('.nav-item[data-tab]:not([style*="display: none"])');
        if (visibleItems.length === 0) { group.style.display = 'none'; } else { group.style.display = 'block'; }
    });
}

function activateTab(tabName) {
    var normalized = (tabName || 'dashboard').replace('#', '').trim();
    if (!normalized) normalized = 'dashboard';
    var tab = document.getElementById('tab-' + normalized);
    var navItems = document.querySelectorAll('.sidebar .nav-item');

    navItems.forEach(function(item) {
        var isActive = item.getAttribute('data-tab') === normalized;
        item.classList.toggle('active', isActive);
    });

    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('id') === 'tab-' + normalized);
    });

    if (tab) {
        var target = normalized === 'dashboard' ? '' : '#' + normalized;
        if (window.history && window.history.replaceState) {
            var url = window.location.pathname + window.location.search + target;
            window.history.replaceState(null, '', url);
        }
    }
    closeSidebar();
}

function toggleAccess(login, key, button) {
    if (currentUser !== 'Sobolev' && currentUser !== 'Sder') { showToast('Только Sobolev может управлять доступами', 'error'); return; }
    if (login === 'Sobolev') { showToast('Нельзя менять доступы себе', 'error'); return; }
    var currentValue = button.classList.contains('active');
    callAPI('updateUserAccess', {login: login, key: key, value: !currentValue}, function(res) {
        if (res.success) {
            if (!currentValue) { button.classList.add('active'); } else { button.classList.remove('active'); }
            if (login === currentUser) { accessMap[key] = !currentValue; updateNavVisibility(); }
            showToast('Доступ "' + key + '" для ' + login + ' ' + (!currentValue ? 'включён' : 'выключен'), 'success');
            addLog('admin', currentUser + ' изменил доступ "' + key + '" для ' + login);
        } else {
            showToast(res.message || 'Ошибка изменения доступа', 'error');
        }
    });
}

function setUserPassword(login) {
    if (currentUser !== 'Sobolev' && currentUser !== 'Sder') { showToast('Только Sobolev может менять пароли', 'error'); return; }
    var newPass = prompt('Введите новый пароль для ' + login + ':');
    if (newPass && newPass.trim() !== '') {
        callAPI('changePassword', {login: login, password: newPass}, function(res) {
            if (res.success) {
                showToast('Пароль для ' + login + ' обновлён', 'success');
                addLog('admin', currentUser + ' сменил пароль для ' + login);
            } else {
                showToast(res.message || 'Ошибка', 'error');
            }
        });
    }
}

function setUserRole(login) {
    if (currentUser !== 'Sobolev' && currentUser !== 'Sder') { showToast('Только Sobolev может менять роль', 'error'); return; }
    var newRole = prompt('Введите роль для ' + login + ':');
    if (newRole && newRole.trim() !== '') {
        callAPI('changeRole', {login: login, newRole : newRole}, function(res) {
            if (res.success) {
                showToast('Роль для ' + login + ' обновлёна', 'success');
                addLog('admin', currentUser + ' сменил роль для ' + login);
            } else {
                showToast(res.message || 'Ошибка', 'error');
            }
        });
    }
}

function deleteUser(login) {
    if (currentUser !== 'Sobolev' && currentUser !== 'Sder') { showToast('Только Sobolev может удалять аккаунты', 'error'); return; }
    if (login === 'Sobolev') { showToast('Нельзя удалить этого пользователя', 'error'); return; }
    showConfirm('Удаление аккаунта', 'Вы уверены, что хотите удалить аккаунт "' + login + '"?', function() {
        callAPI('deleteUser', {login: login}, function(res) {
            if (res.success) {
                showToast('Аккаунт ' + login + ' удалён', 'success');
                addLog('admin', currentUser + ' удалил аккаунт ' + login);
                renderAccountsList();
                loadStats();
            } else {
                showToast(res.message || 'Ошибка удаления', 'error');
            }
        });
    });
}

function createAccount() {
    if (currentUser !== 'Sobolev' && currentUser !== 'Sder') { showToast('Только Sobolev может создавать аккаунты', 'error'); return; }
    var login = document.getElementById('newAccountLogin').value.trim();
    var pass = document.getElementById('newAccountPass').value.trim();
    if (!login) { showToast('Введите логин', 'error'); return; }
    if (!pass) { showToast('Введите пароль', 'error'); return; }
    callAPI('createUser', {login: login, password: pass}, function(res) {
        if (res.success) {
            document.getElementById('newAccountLogin').value = '';
            document.getElementById('newAccountPass').value = '';
            showToast('Аккаунт ' + login + ' создан', 'success');
            addLog('admin', currentUser + ' создал аккаунт ' + login);
            renderAccountsList();
            loadStats();
        } else {
            showToast(res.message || 'Ошибка создания', 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderMiniOnlineChart(miniOnlineHistory);
    if (window.ResizeObserver) {
        var chartObserver = new ResizeObserver(function() {
            renderMiniOnlineChart(miniOnlineHistory);
        });
        var chartContainer = document.getElementById('onlineChartMini');
        if (chartContainer) chartObserver.observe(chartContainer);
    }
    document.getElementById('hamburgerBtn').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
    var savedStatus = localStorage.getItem('launcher_status');
    if (savedStatus === 'on') {
        launcherEnabled = true;
        var toggle = document.getElementById('toggleLauncher');
        var statusText = document.getElementById('toggleStatusText');
        toggle.classList.add('active');
        statusText.textContent = 'Включён';
        statusText.style.color = '#2ecc71';
        toggle.style.boxShadow = '0 0 30px rgba(46, 204, 113, 0.4)';
    }
    if (document.getElementById('toggleLauncher')) {
      document.getElementById('toggleLauncher').addEventListener('click', toggleLauncher);
    }
    if (document.getElementById('clearLogsBtn')) {
      document.getElementById('clearLogsBtn').addEventListener('click', function() {
          var box = document.getElementById('logsBox');
          if (box) {
              box.innerHTML = '';
          }
          callAPI('hideAllLogs', {}, function(res) {
              if (res.success) {
                  loadLogs();
              }
          });
      });
    }
    if (document.getElementById('logFilterBtn')) {
      document.getElementById('logFilterBtn').addEventListener('click', function() {
          var box = document.getElementById('logsBox');
          var filter = document.getElementById('logFilterInput').value.trim().toLowerCase();
          var items = box.querySelectorAll('div');
          for (var i = 0; i < items.length; i++) {
              var el = items[i];
              var target = el.dataset.target || '';
              if (!filter || target.toLowerCase().includes(filter) || el.textContent.toLowerCase().includes(filter)) {
                  el.style.display = 'block';
              } else {
                  el.style.display = 'none';
              }
          }
      });
    }
    if (document.getElementById('logFilterClear')) {
      document.getElementById('logFilterClear').addEventListener('click', function() {
          document.getElementById('logFilterInput').value = '';
          document.getElementById('logFilterBtn').click();
      });
    }
    if (document.getElementById('searchBtn')) {
      document.getElementById('searchBtn').addEventListener('click', searchPlayer);
    }
    if (document.getElementById('searchPlayer')) {
      document.getElementById('searchPlayer').addEventListener('keydown', function(e) { if (e.key === 'Enter') searchPlayer(); });
    }
    if (document.getElementById('uploadAvatarBtn')) {
      document.getElementById('uploadAvatarBtn').addEventListener('click', function() {
          document.getElementById('avatarFileInput').click();
      });
    }
    if (document.getElementById('avatarFileInput')) {
      document.getElementById('avatarFileInput').addEventListener('change', function(event) {
          if (event.target && event.target.files && event.target.files[0]) {
              uploadAvatarFile(event.target.files[0]);
          }
      });
    }
    if (document.getElementById('applyAvatarBtn')) {
      document.getElementById('applyAvatarBtn').addEventListener('click', function() {
          var url = document.getElementById('avatarUrlInput').value.trim();
          setAvatarFromUrl(url);
          document.getElementById('avatarUrlInput').value = '';
      });
    }
    if (document.getElementById('removeAvatarBtn')) {
      document.getElementById('removeAvatarBtn').addEventListener('click', removeAvatar);
    }
    if (document.getElementById('createAccountBtn')) {
      document.getElementById('createAccountBtn').addEventListener('click', createAccount);
    }
    if (document.getElementById('saveSettingsBtn')) {
      document.getElementById('saveSettingsBtn').addEventListener('click', function() {
          var newLogin = document.getElementById('settingsUsername').value.trim();
          var newPass = document.getElementById('settingsNewPass').value.trim();
          if (!newLogin) { showToast('Логин не может быть пустым', 'error'); return; }
          if (newLogin !== currentUser) { showToast('Смена логина через БД пока не поддерживается', 'error'); return; }
          if (newPass) {
              callAPI('changePassword', {login: currentUser, password: newPass}, function(res) {
                  if (res.success) {
                      document.getElementById('settingsNewPass').value = '';
                      showToast('Пароль обновлён', 'success');
                      addLog('admin', currentUser + ' сменил пароль');
                  } else {
                      showToast(res.message || 'Ошибка', 'error');
                  }
              });
          }
          if (!newPass && newLogin === currentUser) { showToast('Настройки сохранены', 'success'); }
      });
    }
    if (document.getElementById('themeSelect')) {
      document.getElementById('themeSelect').addEventListener('change', function() {
          var theme = this.value;
          if (theme === 'light') { document.body.classList.add('light-theme'); } else { document.body.classList.remove('light-theme'); }
          localStorage.setItem('helvel_theme', theme);
      });
      var savedTheme = localStorage.getItem('helvel_theme') || 'dark';
      document.getElementById('themeSelect').value = savedTheme;
      if (savedTheme === 'light') { document.body.classList.add('light-theme'); }
    }
    if (document.getElementById('startServerBtn')) {
      document.getElementById('startServerBtn').addEventListener('click', function() {
          addLog('success', currentUser + ' запустил сервер');
          showToast('Сервер запущен', 'success');
          document.getElementById('dashServerStatus').textContent = '▶ Запущен';
          document.getElementById('dashServerStatus').style.color = '#2ecc71';
          document.getElementById('serverStatusLabel2').textContent = '▶ Запущен';
          document.getElementById('serverStatusLabel2').style.color = '#2ecc71';
      });
    }
    if (document.getElementById('stopServerBtn')) {
      document.getElementById('stopServerBtn').addEventListener('click', function() {
          addLog('error', currentUser + ' остановил сервер');
          showToast('Сервер остановлен', 'info');
          document.getElementById('dashServerStatus').textContent = '⏹ Остановлен';
          document.getElementById('dashServerStatus').style.color = '#ff3b30';
          document.getElementById('serverStatusLabel2').textContent = '⏹ Остановлен';
          document.getElementById('serverStatusLabel2').style.color = '#ff3b30';
      });
    }
    if (document.getElementById('restartServerBtn')) {
      document.getElementById('restartServerBtn').addEventListener('click', function() {
          addLog('warn', currentUser + ' перезагружает сервер...');
          showToast('Перезагрузка сервера...', 'info');
          setTimeout(function() {
              addLog('success', currentUser + ' перезагрузил сервер');
              showToast('Сервер перезагружен', 'success');
          }, 3000);
      });
    }
    if (document.getElementById('ecoDonateBtn')) {
      document.getElementById('ecoDonateBtn').addEventListener('click', function() {
          var nick = document.getElementById('ecoNick').value.trim();
          var amount = parseInt(document.getElementById('ecoAmount').value) || 0;
          if (!nick) { showToast('Введите ник игрока', 'error'); return; }
          if (amount <= 0) { showToast('Сумма должна быть больше 0', 'error'); return; }
          var player = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === nick.toLowerCase()) { player = PLAYERS_DB[i]; break; }
          }
          if (!player) { showToast('Игрок не найден', 'error'); return; }
          if (player.banned) { showToast('Игрок забанен', 'error'); return; }
          showConfirm('Подтверждение выдачи доната', 'Выдать ' + amount + ' доната игроку ' + player.nick + '?', function() {
              player.donate += amount;
              transactions.push({ from: currentUser, to: player.nick, type: 'donate', amount: amount, date: new Date().toISOString() });
              addLog('donate', currentUser + ' выдал донат игроку ' + player.nick + ' (' + amount + ')', player.nick);
              addTransactionLog(currentUser + ' выдал донат ' + player.nick + ' (+' + amount + ')');
              showToast('💎 ' + player.nick + ' выдано ' + amount + ' доната', 'success');
              addAction('donate', player.nick, amount);
              if (foundPlayer) searchPlayer();
              document.getElementById('ecoAmount').value = '100';
          });
      });
    }
    if (document.getElementById('ecoMoneyBtn')) {
      document.getElementById('ecoMoneyBtn').addEventListener('click', function() {
          var nick = document.getElementById('ecoMoneyNick').value.trim();
          var amount = parseInt(document.getElementById('ecoMoneyAmount').value) || 0;
          if (!nick) { showToast('Введите ник игрока', 'error'); return; }
          if (amount <= 0) { showToast('Сумма должна быть больше 0', 'error'); return; }
          var player = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === nick.toLowerCase()) { player = PLAYERS_DB[i]; break; }
          }
          if (!player) { showToast('Игрок не найден', 'error'); return; }
          if (player.banned) { showToast('Игрок забанен', 'error'); return; }
          showConfirm('Подтверждение выдачи денег', 'Выдать ' + amount + ' рублей игроку ' + player.nick + '?', function() {
              player.money += amount;
              transactions.push({ from: currentUser, to: player.nick, type: 'money', amount: amount, date: new Date().toISOString() });
              addLog('money', currentUser + ' выдал деньги игроку ' + player.nick + ' (' + amount + ' руб.)', player.nick);
              addTransactionLog(currentUser + ' выдал деньги ' + player.nick + ' (+' + amount + ' руб.)');
              showToast('💰 ' + player.nick + ' выдано ' + amount + ' рублей', 'success');
              addAction('money', player.nick, amount);
              if (foundPlayer) searchPlayer();
              document.getElementById('ecoMoneyAmount').value = '1000';
          });
      });
    }
    if (document.getElementById('ecoSetBtn')) {
      document.getElementById('ecoSetBtn').addEventListener('click', function() {
          var nick = document.getElementById('ecoSetNick').value.trim();
          var amount = parseInt(document.getElementById('ecoSetAmount').value) || 0;
          if (!nick) { showToast('Введите ник игрока', 'error'); return; }
          if (amount < 0) { showToast('Сумма не может быть отрицательной', 'error'); return; }
          var player = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === nick.toLowerCase()) { player = PLAYERS_DB[i]; break; }
          }
          if (!player) { showToast('Игрок не найден', 'error'); return; }
          if (player.banned) { showToast('Игрок забанен', 'error'); return; }
          showConfirm('Подтверждение установки баланса', 'Установить баланс доната игроку ' + player.nick + ' на ' + amount + '?', function() {
              player.donate = amount;
              transactions.push({ from: currentUser, to: player.nick, type: 'donate', amount: amount, date: new Date().toISOString() });
              addLog('admin', currentUser + ' установил баланс игрока ' + player.nick + ' на ' + amount + ' доната', player.nick);
              addTransactionLog(currentUser + ' установил баланс ' + player.nick + ' → ' + amount + ' доната');
              showToast('📌 ' + player.nick + ' баланс установлен на ' + amount + ' доната', 'success');
              if (foundPlayer) searchPlayer();
              document.getElementById('ecoSetAmount').value = '0';
          });
      });
    }
    if (document.getElementById('downloadReportBtn')) {
      document.getElementById('downloadReportBtn').addEventListener('click', function() {
          var text = '\uFEFF';
          text += '========================================\n';
          text += '       HELVEL - ОТЧЁТ ПО ТРАНЗАКЦИЯМ\n';
          text += '========================================\n\n';
          text += 'Дата генерации: ' + new Date().toLocaleString() + '\n\n';
          text += '--- ВСЕ ТРАНЗАКЦИИ ---\n';
          if (transactions.length === 0) { text += 'Нет транзакций\n'; } else {
              for (var i = 0; i < transactions.length; i++) {
                  var t = transactions[i];
                  var date = new Date(t.date);
                  var timeStr = date.toLocaleString();
                  var typeLabel = t.type === 'donate' ? 'донат' : 'деньги (рубли)';
                  text += t.from + ' выдал ' + typeLabel + ' игроку ' + t.to + ' (' + t.amount + ') | ' + timeStr + '\n';
              }
          }
          text += '\n========================================\n';
          text += 'Конец отчёта\n';
          var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          var link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'helvel_report_' + new Date().toISOString().slice(0, 10) + '.txt';
          link.click();
          URL.revokeObjectURL(link.href);
          showToast('Отчёт скачан', 'success');
      });
    }
    if (document.getElementById('notifyFullBtn')) {
      document.getElementById('notifyFullBtn').addEventListener('click', function() {
          var title = document.getElementById('notifyTitleFull').value.trim() || 'Уведомление';
          var msg = document.getElementById('notifyMessageFull').value.trim() || 'Тестовое уведомление';
          var type = document.getElementById('notifyTypeFull').value;
          showConfirm('Подтверждение отправки уведомления', 'Заголовок: "' + title + '"\nТекст: "' + msg + '"\nТип: ' + type + '\nОтправить всем игрокам?', function() {
              document.getElementById('notifyTitleFull').value = '';
              document.getElementById('notifyMessageFull').value = '';
              addLog('info', currentUser + ' отправил уведомление: "' + title + '"');
              showToast('Уведомление "' + title + '" отправлено', 'success');
          });
      });
    }
    if (document.getElementById('globalBtn')) {
      document.getElementById('globalBtn').addEventListener('click', function() {
          var msg = document.getElementById('globalMsg').value.trim();
          if (!msg) { showToast('Введите текст объявления', 'error'); return; }
          showConfirm('Подтверждение отправки объявления', 'Текст: "' + msg + '"\nОтправить в игру всем игрокам?', function() {
              document.getElementById('globalMsg').value = '';
              addLog('admin', currentUser + ' отправил глобальное объявление: "' + msg + '"');
              showToast('Глобальное объявление отправлено в игру', 'success');
          });
      });
    }
    if (document.getElementById('punishBtn')) {
      document.getElementById('punishBtn').addEventListener('click', function() {
          var target = document.getElementById('punishTarget').value.trim();
          var type = document.getElementById('punishType').value;
          var reason = document.getElementById('punishReason').value.trim() || 'Нарушение';
          var duration = parseInt(document.getElementById('punishDuration').value) || 0;
          var durationText = duration === 0 ? 'Перманент' : duration + ' дней';
          if (!target) { showToast('Введите ник или UUID', 'error'); return; }
          var player = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === target.toLowerCase() || PLAYERS_DB[i].uuid === target) {
                  player = PLAYERS_DB[i];
                  break;
              }
          }
          if (!player) { showToast('Игрок не найден', 'error'); return; }
          if (type === 'warn') {
              if (player.banned) { showToast('Игрок забанен', 'error'); return; }
              player.warns = (player.warns || 0) + 1;
              addLog('warn', currentUser + ' выдал варн игроку ' + player.nick + ' (' + reason + ') (теперь ' + player.warns + '/3)', player.nick);
              showToast('⚠️ Игрок ' + player.nick + ' получил варн (' + player.warns + '/3)', 'warning');
              addAction('warn', player.nick, reason);
              if (player.warns >= 3) {
                  var durText = '30 дней';
                  banList.push({ id: player.id, playerNick: player.nick, reason: 'Автоматический бан за 3 варна', duration: durText, type: 'account', status: 'Активен' });
                  player.banned = true;
                  player.warns = 0;
                  addLog('ban', currentUser + ' автоматически забанил игрока ' + player.nick + ' за 3 варна (срок: ' + durText + ')', player.nick);
                  showToast('Игрок ' + player.nick + ' автоматически забанен за 3 варна', 'error');
                  addAction('ban', player.nick, 'автоматически за 3 варна');
              }
              if (foundPlayer) searchPlayer();
              return;
          }
          if (type === 'ban' || type === 'uuid') {
              if (player.banned) { showToast('Игрок уже забанен', 'error'); return; }
              var banId = type === 'uuid' ? player.uuid : player.id;
              banList.push({ id: banId, playerNick: player.nick, reason: reason, duration: durationText, type: type, status: 'Активен' });
              player.banned = true;
              player.warns = 0;
              addLog('ban', currentUser + ' забанил игрока ' + player.nick + ' по ' + (type === 'uuid' ? 'UUID' : 'аккаунту') + ' (' + reason + ', срок: ' + durationText + ')', player.nick);
              showToast('Игрок ' + player.nick + ' забанен', 'error');
              addAction('ban', player.nick, reason + (type === 'uuid' ? ' (UUID)' : ''));
              if (foundPlayer) searchPlayer();
              document.getElementById('punishDuration').value = '0';
              return;
          }
      });
    }
    if (document.getElementById('unpunishBtn')) {
      document.getElementById('unpunishBtn').addEventListener('click', function() {
          var target = document.getElementById('unpunishTarget').value.trim();
          var type = document.getElementById('unpunishType').value;
          if (!target) { showToast('Введите ник или UUID', 'error'); return; }
          var player = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === target.toLowerCase() || PLAYERS_DB[i].uuid === target) {
                  player = PLAYERS_DB[i];
                  break;
              }
          }
          if (!player) { showToast('Игрок не найден', 'error'); return; }
          if (type === 'warn') {
              if (player.warns <= 0) { showToast('У игрока нет варнов', 'error'); return; }
              player.warns = 0;
              addLog('unban', currentUser + ' снял все варны с игрока ' + player.nick, player.nick);
              showToast('Варны сняты с ' + player.nick, 'success');
              if (foundPlayer) searchPlayer();
              return;
          }
          if (type === 'ban' || type === 'uuid') {
              if (!player.banned) { showToast('Игрок не забанен', 'error'); return; }
              var toRemove = [];
              for (var j = 0; j < banList.length; j++) {
                  if (banList[j].id === player.id || banList[j].id === player.uuid) {
                      toRemove.push(j);
                  }
              }
              for (var k = toRemove.length - 1; k >= 0; k--) {
                  banList.splice(toRemove[k], 1);
              }
              player.banned = false;
              player.warns = 0;
              addLog('unban', currentUser + ' снял бан с игрока ' + player.nick, player.nick);
              showToast('Бан снят с ' + player.nick, 'success');
              if (foundPlayer) searchPlayer();
              return;
          }
      });
    }
    if (document.getElementById('actionKick')) {
      document.getElementById('actionKick').addEventListener('click', function() {
          if (!foundPlayer) { showToast('Сначала найдите игрока', 'error'); return; }
          if (foundPlayer.banned) { showToast('Игрок забанен', 'error'); return; }
          addLog('admin', currentUser + ' кикнул игрока ' + foundPlayer.nick, foundPlayer.nick);
          showToast('Игрок ' + foundPlayer.nick + ' кикнут', 'success');
          addAction('kick', foundPlayer.nick);
      });
    }
    if (document.getElementById('actionBan')) {
      document.getElementById('actionBan').addEventListener('click', function() {
          if (!foundPlayer) { showToast('Сначала найдите игрока', 'error'); return; }
          banTargetNick = foundPlayer.nick;
          document.getElementById('banModalTitle').textContent = 'Бан игрока ' + foundPlayer.nick;
          document.getElementById('banModalReason').value = 'Нарушение';
          document.getElementById('banModalDuration').value = '0';
          document.getElementById('banExtended').style.display = 'none';
          document.getElementById('banModal').classList.add('active');
          if (foundPlayer && foundPlayer.banned) {
              document.getElementById('banModalConfirm').textContent = '✅ Разбанить';
              document.getElementById('banModalConfirm').className = 'btn btn-success';
          } else {
              document.getElementById('banModalConfirm').textContent = '⛔ Забанить';
              document.getElementById('banModalConfirm').className = 'btn btn-danger';
          }
      });
    }
    if (document.getElementById('actionWarn')) {
      document.getElementById('actionWarn').addEventListener('click', function() {
          if (!foundPlayer) { showToast('Сначала найдите игрока', 'error'); return; }
          if (foundPlayer.banned) { showToast('Игрок забанен', 'error'); return; }
          warnTargetNick = foundPlayer.nick;
          document.getElementById('warnModalReason').value = 'Нарушение правил';
          document.getElementById('warnModal').classList.add('active');
      });
    }
    if (document.getElementById('actionReset')) {
      document.getElementById('actionReset').addEventListener('click', function() {
          if (!foundPlayer) { showToast('Сначала найдите игрока', 'error'); return; }
          if (foundPlayer.banned) { showToast('Игрок забанен', 'error'); return; }
          showConfirm('Подтверждение обнуления', 'Обнулить донат и деньги игрока ' + foundPlayer.nick + '?', function() {
              foundPlayer.donate = 0;
              foundPlayer.money = 0;
              addLog('reset', currentUser + ' обнулил игрока ' + foundPlayer.nick, foundPlayer.nick);
              showToast('🔄 Игрок ' + foundPlayer.nick + ' обнулён', 'success');
              addAction('reset', foundPlayer.nick);
              searchPlayer();
          });
      });
    }
    if (document.getElementById('applyDonateBtn')) {
      document.getElementById('applyDonateBtn').addEventListener('click', function() {
          if (!foundPlayer) { showToast('Сначала найдите игрока', 'error'); return; }
          if (foundPlayer.banned) { showToast('Игрок забанен', 'error'); return; }
          var amount = parseInt(document.getElementById('donateAmountInput').value) || 0;
          if (amount <= 0) { showToast('Введите сумму больше 0', 'error'); return; }
          showConfirm('Подтверждение выдачи доната', 'Выдать ' + amount + ' доната игроку ' + foundPlayer.nick + '?', function() {
              foundPlayer.donate += amount;
              transactions.push({ from: currentUser, to: foundPlayer.nick, type: 'donate', amount: amount, date: new Date().toISOString() });
              addLog('donate', currentUser + ' выдал донат игроку ' + foundPlayer.nick + ' (' + amount + ')', foundPlayer.nick);
              addTransactionLog(currentUser + ' выдал донат ' + foundPlayer.nick + ' (+' + amount + ')');
              showToast('💎 ' + foundPlayer.nick + ' выдано ' + amount + ' доната', 'success');
              addAction('donate', foundPlayer.nick, amount);
              searchPlayer();
          });
      });
    }
    if (document.getElementById('applyMoneyBtn')) {
      document.getElementById('applyMoneyBtn').addEventListener('click', function() {
          if (!foundPlayer) { showToast('Сначала найдите игрока', 'error'); return; }
          if (foundPlayer.banned) { showToast('Игрок забанен', 'error'); return; }
          var amount = parseInt(document.getElementById('moneyAmountInput').value) || 0;
          if (amount <= 0) { showToast('Введите сумму больше 0', 'error'); return; }
          showConfirm('Подтверждение выдачи денег', 'Выдать ' + amount + ' рублей игроку ' + foundPlayer.nick + '?', function() {
              foundPlayer.money += amount;
              transactions.push({ from: currentUser, to: foundPlayer.nick, type: 'money', amount: amount, date: new Date().toISOString() });
              addLog('money', currentUser + ' выдал деньги игроку ' + foundPlayer.nick + ' (' + amount + ' руб.)', foundPlayer.nick);
              addTransactionLog(currentUser + ' выдал деньги ' + foundPlayer.nick + ' (+' + amount + ' руб.)');
              showToast('💰 ' + foundPlayer.nick + ' выдано ' + amount + ' рублей', 'success');
              addAction('money', foundPlayer.nick, amount);
              searchPlayer();
          });
      });
    }
    if (document.getElementById('banQuickBtn')) {
      document.getElementById('banQuickBtn').addEventListener('click', function() {
          document.getElementById('banExtended').style.display = 'none';
          var p = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === banTargetNick.toLowerCase()) {
                  p = PLAYERS_DB[i];
                  break;
              }
          }
          if (!p) { showToast('Игрок не найден', 'error'); return; }
          if (p.banned) { showToast('Игрок уже забанен', 'error'); return; }
          var found = false;
          for (var j = 0; j < banList.length; j++) {
              if (banList[j].id === p.id) { found = true; break; }
          }
          if (found) { showToast('Игрок уже в списке банов', 'error'); return; }
          banList.push({ id: p.id, playerNick: p.nick, reason: 'Нарушение', duration: 'Перманент', type: 'account', status: 'Активен' });
          p.banned = true;
          p.warns = 0;
          addLog('ban', currentUser + ' забанил игрока ' + p.nick + ' (быстрый бан, перманент)', p.nick);
          showToast('Игрок ' + p.nick + ' забанен (перманент)', 'error');
          addAction('ban', p.nick, 'перманент');
          document.getElementById('banModal').classList.remove('active');
          if (foundPlayer) searchPlayer();
      });
    }
    if (document.getElementById('banExtendedBtn')) {
      document.getElementById('banExtendedBtn').addEventListener('click', function() {
          document.getElementById('banExtended').style.display = 'block';
      });
    }
    if (document.getElementById('banModalCancel')) {
      document.getElementById('banModalCancel').addEventListener('click', function() {
          document.getElementById('banModal').classList.remove('active');
          banTargetNick = null;
      });
    }
    if (document.getElementById('banModalConfirm')) {
      document.getElementById('banModalConfirm').addEventListener('click', function() {
          var p = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === banTargetNick.toLowerCase()) {
                  p = PLAYERS_DB[i];
                  break;
              }
          }
          if (!p) { showToast('Игрок не найден', 'error'); document.getElementById('banModal').classList.remove('active'); return; }
          if (p.banned) {
              var index = -1;
              for (var j = 0; j < banList.length; j++) {
                  if (banList[j].id === p.id || banList[j].id === p.uuid) { index = j; break; }
              }
              if (index !== -1) {
                  banList.splice(index, 1);
                  p.banned = false;
                  p.warns = 0;
                  addLog('unban', currentUser + ' разбанил игрока ' + p.nick, p.nick);
                  showToast('Игрок ' + p.nick + ' разбанен', 'success');
                  addAction('unban', p.nick);
                  if (foundPlayer) searchPlayer();
              } else {
                  showToast('Не найден бан для этого игрока', 'error');
              }
              document.getElementById('banModal').classList.remove('active');
              return;
          }
          var reason = document.getElementById('banModalReason').value.trim() || 'Нарушение';
          var duration = parseInt(document.getElementById('banModalDuration').value) || 0;
          var durationText = duration === 0 ? 'Перманент' : duration + ' дней';
          var found = false;
          for (var k = 0; k < banList.length; k++) {
              if (banList[k].id === p.id) { found = true; break; }
          }
          if (found) { showToast('Игрок уже в списке банов', 'error'); document.getElementById('banModal').classList.remove('active'); return; }
          banList.push({ id: p.id, playerNick: p.nick, reason: reason, duration: durationText, type: 'account', status: 'Активен' });
          p.banned = true;
          p.warns = 0;
          addLog('ban', currentUser + ' забанил игрока ' + p.nick + ' (' + reason + ', срок: ' + durationText + ')', p.nick);
          showToast('Игрок ' + p.nick + ' забанен (' + durationText + ')', 'error');
          addAction('ban', p.nick, reason + ' (' + durationText + ')');
          if (foundPlayer) searchPlayer();
          document.getElementById('banModal').classList.remove('active');
      });
    }
    if (document.getElementById('warnModalCancel')) {
      document.getElementById('warnModalCancel').addEventListener('click', function() {
          document.getElementById('warnModal').classList.remove('active');
          warnTargetNick = null;
      });
    }
    if (document.getElementById('warnModalConfirm')) {
      document.getElementById('warnModalConfirm').addEventListener('click', function() {
          var p = null;
          for (var i = 0; i < PLAYERS_DB.length; i++) {
              if (PLAYERS_DB[i].nick.toLowerCase() === warnTargetNick.toLowerCase()) {
                  p = PLAYERS_DB[i];
                  break;
              }
          }
          if (!p) { showToast('Игрок не найден', 'error'); document.getElementById('warnModal').classList.remove('active'); return; }
          if (p.banned) { showToast('Игрок забанен', 'error'); document.getElementById('warnModal').classList.remove('active'); return; }
          var reason = document.getElementById('warnModalReason').value.trim() || 'Нарушение правил';
          p.warns = (p.warns || 0) + 1;
          addLog('warn', currentUser + ' выдал варн игроку ' + p.nick + ' (' + reason + ') (теперь ' + p.warns + '/3)', p.nick);
          showToast('⚠️ Игрок ' + p.nick + ' получил варн (' + p.warns + '/3)', 'warning');
          addAction('warn', p.nick, reason);
          if (p.warns >= 3) {
              var durText = '30 дней';
              banList.push({ id: p.id, playerNick: p.nick, reason: 'Автоматический бан за 3 варна', duration: durText, type: 'account', status: 'Активен' });
              p.banned = true;
              p.warns = 0;
              addLog('ban', currentUser + ' автоматически забанил игрока ' + p.nick + ' за 3 варна (срок: ' + durText + ')', p.nick);
              showToast('Игрок ' + p.nick + ' автоматически забанен за 3 варна', 'error');
              addAction('ban', p.nick, 'автоматически за 3 варна');
          }
          if (foundPlayer) searchPlayer();
          document.getElementById('warnModal').classList.remove('active');
      });
    }
    var navItems = document.querySelectorAll('.sidebar .nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function() {
            activateTab(this.dataset.tab);
        });
    }

    var initialTab = (window.location.hash || '').replace('#', '') || 'dashboard';
    activateTab(initialTab);

    loadAvatarForUser(currentUser);
    renderAccountsList();
    loadStats();
    setServerStatus("HELVEL", "online");
    setServerStatus("MAGNUM", "offline");
    setInterval(loadStats, 15000);
    updateNavVisibility();
});
