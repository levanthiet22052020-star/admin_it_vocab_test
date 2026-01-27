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
