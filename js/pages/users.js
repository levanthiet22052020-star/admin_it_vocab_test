document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadLeaderboards();
    await loadUsers();

    await loadUsers();

    DataWatcher.watch('users', function () {
        return usersApi.getUsers({ page: currentPage, pageSize: 20 }).then(function (data) { return data.items || []; });
    }, function (data) {
        // Only auto-reload if on first page to avoid jumping
        if (currentPage === 1) {
            loadUsers();
        }
    }, 15000);
});

let allUsers = [];
let currentPage = 1;
let totalPages = 1;
let totalItems = 0;

async function loadLeaderboards() {
    try {
        const [xpData, streakData] = await Promise.all([
            leaderboardApi.getXP(),
            leaderboardApi.getStreak()
        ]);

        renderXPLeaderboard(xpData.userList || []);
        renderStreakLeaderboard(streakData.userList || []);
        renderRankLeaderboard(xpData.userList || []);
        renderTaskLeaderboard(xpData.userList || []);
    } catch (error) {
        console.error('Error loading leaderboards:', error);
        const containers = ['xpLeaderboard', 'streakLeaderboard', 'rankLeaderboard', 'taskLeaderboard'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p style="text-align:center;padding:1rem;color:#888;">Không thể tải dữ liệu</p>';
        });
    }
}

function renderXPLeaderboard(users) {
    const container = document.getElementById('xpLeaderboard');
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:1rem;color:#888;">Chưa có dữ liệu</p>';
        return;
    }

    const sorted = [...users].sort((a, b) => (b.value || 0) - (a.value || 0));

    container.innerHTML = sorted.slice(0, 5).map((user, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank rank-${index + 1}">${index + 1}</span>
            ${user.avatarURL ? `<img class="leaderboard-avatar" src="${user.avatarURL}" alt="avatar">` : `<span class="leaderboard-avatar" style="background: ${getAvatarColor(index)};">${getInitials(user.name)}</span>`}
            <div class="leaderboard-info">
                <span class="leaderboard-name">${user.name || 'Người dùng'}</span>
                <span class="leaderboard-value value-xp">${formatNumber(user.value)} XP</span>
            </div>
        </div>
    `).join('');
}

function renderStreakLeaderboard(users) {
    const container = document.getElementById('streakLeaderboard');
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:1rem;color:#888;">Chưa có dữ liệu</p>';
        return;
    }

    const sorted = [...users].sort((a, b) => (b.value || 0) - (a.value || 0));

    container.innerHTML = sorted.slice(0, 5).map((user, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank rank-${index + 1}">${index + 1}</span>
            <span class="leaderboard-avatar" style="background: ${getAvatarColor(index)};">${getInitials(user.name)}</span>
            <div class="leaderboard-info">
                <span class="leaderboard-name">${user.name || 'Người dùng'}</span>
                <span class="leaderboard-value value-spirit">${formatNumber(user.value)} spirit</span>
            </div>
        </div>
    `).join('');
}

function renderRankLeaderboard(users) {
    const container = document.getElementById('rankLeaderboard');
    if (!container) return;

    const sorted = [...users].sort((a, b) => (b.rankLevel || 0) - (a.rankLevel || 0));

    if (sorted.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:1rem;color:#888;">Chưa có dữ liệu</p>';
        return;
    }

    container.innerHTML = sorted.slice(0, 5).map((user, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank rank-${index + 1}">${index + 1}</span>
            ${user.avatarURL ? `<img class="leaderboard-avatar" src="${user.avatarURL}" alt="avatar">` : `<span class="leaderboard-avatar" style="background: ${getAvatarColor(index)};">${getInitials(user.name)}</span>`}
            <div class="leaderboard-info">
                <span class="leaderboard-name">${user.name || 'Người dùng'}</span>
                <span class="leaderboard-value value-rank">Cấp ${user.rankLevel || 1}</span>
            </div>
        </div>
    `).join('');
}

function renderTaskLeaderboard(users) {
    const container = document.getElementById('taskLeaderboard');
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:1rem;color:#888;">Chưa có dữ liệu</p>';
        return;
    }

    const sorted = [...users].sort((a, b) => (b.tasksCompleted || b.value || 0) - (a.tasksCompleted || a.value || 0));

    container.innerHTML = sorted.slice(0, 5).map((user, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank rank-${index + 1}">${index + 1}</span>
            <span class="leaderboard-avatar" style="background: ${getAvatarColor(index)};">${getInitials(user.name)}</span>
            <div class="leaderboard-info">
                <span class="leaderboard-name">${user.name || 'Người dùng'}</span>
                <span class="leaderboard-value value-task">${formatNumber(user.tasksCompleted || Math.floor(user.value / 20) || 0)} nhiệm vụ</span>
            </div>
        </div>
    `).join('');
}

function getRankBadgeClass(rankLevel) {
    const classes = {
        1: 'badge-orange',
        2: 'badge-gray',
        3: 'badge-yellow',
        4: 'badge-cyan',
        5: 'badge-blue'
    };
    return classes[rankLevel] || 'badge-orange';
}

async function loadUsers(page = 1, search = '') {
    try {
        const params = { page, pageSize: 20 };
        if (search) params.search = search;

        const data = await usersApi.getUsers(params);
        allUsers = data.items || [];
        currentPage = data.page;
        totalPages = data.totalPages;
        totalItems = data.total;

        renderUserStats({ total: totalItems, items: allUsers }); // We might need a separate stats API if we want full stats, but for now use what we have or just total
        renderUserTable(allUsers);
        renderPagination();
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('userTableBody').innerHTML = `
            <tr><td colspan="9" style="text-align: center; padding: 2rem;">Không thể tải dữ liệu người dùng</td></tr>
        `;
    }
}

function renderPagination() {
    const container = document.querySelector('.pagination-controls'); // Ensure this element exists in HTML or create it
    if (!container) return;

    // Simple pagination logic
    let html = '';
    if (totalPages > 1) {
        html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>`;
        html += `<span>Trang ${currentPage} / ${totalPages}</span>`;
        html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>`;
    }
    container.innerHTML = html;
}

window.changePage = function (page) {
    if (page < 1 || page > totalPages) return;
    loadUsers(page, document.querySelector('.search-input')?.value || '');
}

function renderUserStats(data) {
    // Note: With pagination, we calculate stats based on the returned total or separate API.
    // The current API returns 'total' users.
    // Active/Banned stats would require a specific stats endpoint or filtering on the backend.
    // For now, let's display the total count correctly.
    const totalUsers = data.total || 0;

    // We can't know exact active/banned counts without fetching ALL users or adding stats endpoint.
    // We will show "--" for now or simulate if possible, but total is accurate.

    const statsContainer = document.querySelector('.mini-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="mini-stat blue">
                <p class="mini-stat-value blue">${totalUsers}</p>
                <p class="mini-stat-label">Tổng người dùng</p>
            </div>
            <!--
            <div class="mini-stat green">
                <p class="mini-stat-value green">--</p>
                <p class="mini-stat-label">Hoạt động</p>
            </div>
            <div class="mini-stat red">
                <p class="mini-stat-value red">--</p>
                <p class="mini-stat-label">Bị cấm</p>
            </div>
            -->
        `;
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem;">Không có người dùng nào</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const status = getUserStatus(user);
        const statusBadge = getStatusBadge(status);
        const rankLevel = user.rankLevel || 1;
        const avatarHtml = user.avatarURL
            ? `<img class="avatar" src="${user.avatarURL}" alt="avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`
            : `<div class="avatar">${getInitials(user.name)}</div>`;

        const xpValue = user.currentXP || user.value || 0;

        return `
        <tr>
            <td>
                <div class="user-cell">
                    ${avatarHtml}
                    <span style="font-weight: 500;">${user.name || 'Người dùng'}</span>
                </div>
            </td>
            <td><span style="font-weight: 500;">Cấp ${rankLevel}</span></td>
            <td><span style="font-weight: 500;">${formatNumber(xpValue)}</span></td>
            <td>${statusBadge}</td>
        </tr>
    `}).join('');

    const countEl = document.querySelector('.table-count');
    if (countEl) {
        countEl.textContent = `Hiển thị ${users.length} / ${totalItems} người dùng`;
    }
}

function getUserStatus(user) {
    if (user.status === 'BANNED') return 'banned';

    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : new Date(user.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) return 'inactive_month';
    if (diffDays >= 14) return 'inactive_2weeks';
    return 'active';
}

function getStatusBadge(status) {
    const badges = {
        'active': '<span class="badge badge-green">Hoạt động</span>',
        'inactive_2weeks': '<span class="badge badge-yellow">Không hoạt động 2 tuần</span>',
        'inactive_month': '<span class="badge badge-red">Không hoạt động 1 tháng</span>',
        'banned': '<span class="badge badge-gray">Bị cấm</span>'
    };
    return badges[status] || badges['active'];
}

function getRankBadge(rankLevel) {
    const ranks = {
        1: { name: 'Đồng', class: 'badge-orange' },
        2: { name: 'Bạc', class: 'badge-gray' },
        3: { name: 'Vàng', class: 'badge-yellow' },
        4: { name: 'Bạch kim', class: 'badge-cyan' },
        5: { name: 'Kim cương', class: 'badge-blue' }
    };
    const rank = ranks[rankLevel] || ranks[1];
    return `<span class="badge ${rank.class} flex-center">${rank.name}</span>`;
}

function getRankName(rankLevel) {
    const ranks = {
        1: 'Đồng',
        2: 'Bạc',
        3: 'Vàng',
        4: 'Bạch kim',
        5: 'Kim cương'
    };
    return ranks[rankLevel] || 'Đồng';
}

function getAvatarColor(index) {
    const colors = ['#ec4899', '#8b5cf6', '#f97316', '#22c55e', '#06b6d4'];
    return colors[index % colors.length];
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

function editUser(userId) {
    const user = allUsers.find(u => u.userID === userId);
    if (!user) return;

    const hasRelatedData = (user.value || 0) > 0 || (user.tasksCompleted || 0) > 0;

    if (hasRelatedData) {
        const confirmEdit = confirm(
            `Người dùng "${user.name}" có dữ liệu liên quan:\n` +
            `- XP: ${formatNumber(user.value || 0)}\n` +
            `- Nhiệm vụ: ${formatNumber(user.tasksCompleted || Math.floor((user.value || 0) / 20))}\n\n` +
            `Việc sửa đổi thông tin có thể ảnh hưởng đến các bảng xếp hạng và lịch sử hoạt động.\n\n` +
            `Bạn có chắc muốn tiếp tục?`
        );
        if (!confirmEdit) return;
    }

    alert(`Đang mở form sửa thông tin người dùng: ${user.name}\n\nChức năng này sẽ được kết nối với API.`);
}

function banUser(userId, userName) {
    const user = allUsers.find(u => u.userID === userId);
    if (!user) return;

    const status = getUserStatus(user);
    let message = `Bạn có chắc muốn cấm người dùng "${userName}"?`;

    if (status === 'inactive_2weeks') {
        message = `Người dùng "${userName}" không hoạt động trong 2 tuần.\n\nBạn có chắc muốn cấm tài khoản này?`;
    } else if (status === 'inactive_month') {
        message = `Người dùng "${userName}" không hoạt động trong hơn 1 tháng.\n\nĐề xuất: Cấm tài khoản do không hoạt động quá lâu.\n\nBạn có chắc muốn cấm?`;
    } else if (status === 'banned') {
        const confirmUnban = confirm(`Người dùng "${userName}" hiện đang bị cấm.\n\nBạn có muốn bỏ cấm tài khoản này?`);
        if (confirmUnban) {
            alert(`Đã bỏ cấm người dùng: ${userName}\n\nChức năng này sẽ được kết nối với API.`);
        }
        return;
    }

    const confirmBan = confirm(message);
    if (confirmBan) {
        alert(`Đã cấm người dùng: ${userName}\n\nChức năng này sẽ được kết nối với API.`);
    }
}

function deleteUser(userId, userName) {
    const user = allUsers.find(u => u.userID === userId);
    if (!user) return;

    const status = getUserStatus(user);
    let message = `CẢNH BÁO: Hành động này không thể hoàn tác!\n\n`;

    if (status === 'inactive_month') {
        message += `Người dùng "${userName}" không hoạt động trong hơn 1 tháng.\n`;
        message += `Theo quy định, tài khoản không hoạt động quá 1 tháng có thể bị xóa.\n\n`;
    } else if (status !== 'inactive_2weeks' && status !== 'banned') {
        message += `Người dùng "${userName}" vẫn đang hoạt động!\n`;
        message += `Việc xóa tài khoản đang hoạt động không được khuyến nghị.\n\n`;
    }

    const hasRelatedData = (user.value || 0) > 0;
    if (hasRelatedData) {
        message += `Tài khoản này có dữ liệu liên quan:\n`;
        message += `- XP: ${formatNumber(user.value || 0)}\n`;
        message += `- Nhiệm vụ: ${formatNumber(user.tasksCompleted || Math.floor((user.value || 0) / 20))}\n\n`;
        message += `Tất cả dữ liệu sẽ bị xóa vĩnh viễn!\n\n`;
    }

    message += `Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${userName}"?`;

    const confirmDelete = confirm(message);
    if (confirmDelete) {
        const doubleConfirm = confirm(`Xác nhận lần cuối: Xóa tài khoản "${userName}"?`);
        if (doubleConfirm) {
            alert(`Đã xóa tài khoản: ${userName}\n\nChức năng này sẽ được kết nối với API.`);
        }
    }
}

const searchInput = document.querySelector('.search-input');
if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', function (e) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            loadUsers(1, e.target.value);
        }, 500);
    });
}
