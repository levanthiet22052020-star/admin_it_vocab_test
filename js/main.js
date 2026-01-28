document.addEventListener('DOMContentLoaded', function () {
    var toggleBtn = document.getElementById('toggleSidebar');
    var sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });

        var isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }

    loadUserInfo();
});

function loadUserInfo() {
    var userNameEl = document.querySelector('.user-name');
    var userEmailEl = document.querySelector('.user-email');

    if (!userNameEl && !userEmailEl) return;

    try {
        var userStr = localStorage.getItem('user');
        if (userStr) {
            var user = JSON.parse(userStr);
            if (userNameEl) userNameEl.textContent = user.name || user.fullName || 'Admin';
            if (userEmailEl) userEmailEl.textContent = user.email || '';
        }
    } catch (e) {
        console.error('Error loading user info:', e);
    }
}

function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function showAlert(message) {
    alert(message);
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

var DataWatcher = {
    intervals: {},
    lastDataHash: {},

    hashData: function (data) {
        return JSON.stringify(data).length + '_' + (data.length || Object.keys(data).length || 0);
    },

    watch: function (name, fetchFn, onChangeFn, intervalMs) {
        var self = this;
        intervalMs = intervalMs || 10000;

        if (this.intervals[name]) {
            clearInterval(this.intervals[name]);
        }

        fetchFn().then(function (data) {
            self.lastDataHash[name] = self.hashData(data);
        }).catch(function () { });

        this.intervals[name] = setInterval(function () {
            fetchFn().then(function (data) {
                var newHash = self.hashData(data);
                if (self.lastDataHash[name] && self.lastDataHash[name] !== newHash) {
                    console.log('[DataWatcher] Data changed for:', name);
                    self.lastDataHash[name] = newHash;
                    onChangeFn(data);
                } else if (!self.lastDataHash[name]) {
                    self.lastDataHash[name] = newHash;
                }
            }).catch(function (err) {
                console.error('[DataWatcher] Error fetching:', name, err);
            });
        }, intervalMs);

        console.log('[DataWatcher] Watching:', name, 'every', intervalMs, 'ms');
    },

    unwatch: function (name) {
        if (this.intervals[name]) {
            clearInterval(this.intervals[name]);
            delete this.intervals[name];
            delete this.lastDataHash[name];
            console.log('[DataWatcher] Stopped watching:', name);
        }
    },

    unwatchAll: function () {
        var self = this;
        Object.keys(this.intervals).forEach(function (name) {
            self.unwatch(name);
        });
    }
};

window.addEventListener('beforeunload', function () {
    DataWatcher.unwatchAll();
});
