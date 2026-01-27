document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadLeaderboards();
    await loadUsers();
});

let allUsers = [];

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
            <span class="leaderboard-avatar" style="background: ${getAvatarColor(index)};">${getInitials(user.name)}</span>
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
            <span class="leaderboard-avatar" style="background: ${getAvatarColor(index)};">${getInitials(user.name)}</span>
            <div class="leaderboard-info">
                <span class="leaderboard-name">${user.name || 'Người dùng'}</span>
                <span class="leaderboard-badge ${getRankBadgeClass(user.rankLevel)}">${getRankName(user.rankLevel)}</span>
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

async function loadUsers() {
    try {
        const data = await leaderboardApi.getXP();
        allUsers = data.userList || [];

        renderUserStats(allUsers);
        renderUserTable(allUsers);
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('userTableBody').innerHTML = `
            <tr><td colspan="9" style="text-align: center; padding: 2rem;">Không thể tải dữ liệu người dùng</td></tr>
        `;
    }
}

function renderUserStats(users) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status !== 'BANNED').length;
    const bannedUsers = users.filter(u => u.status === 'BANNED').length;
    const platinumUsers = users.filter(u => u.rankLevel >= 4).length;

    const statsContainer = document.querySelector('.mini-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="mini-stat blue">
                <p class="mini-stat-value blue">${totalUsers}</p>
                <p class="mini-stat-label">Tổng người dùng</p>
            </div>
            <div class="mini-stat green">
                <p class="mini-stat-value green">${activeUsers || totalUsers}</p>
                <p class="mini-stat-label">Hoạt động</p>
            </div>
            <div class="mini-stat red">
                <p class="mini-stat-value red">${bannedUsers}</p>
                <p class="mini-stat-label">Bị cấm</p>
            </div>
            <div class="mini-stat purple">
                <p class="mini-stat-value purple">${platinumUsers}</p>
                <p class="mini-stat-label">Platinum</p>
            </div>
        `;
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">Không có người dùng nào</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const status = getUserStatus(user);
        const statusBadge = getStatusBadge(status);

        return `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="avatar">${getInitials(user.name)}</div>
                    <span style="font-weight: 500;">${user.name || 'Người dùng'}</span>
                </div>
            </td>
            <td>${user.email || '-'}</td>
            <td>${getRankBadge(user.rankLevel)}</td>
            <td><span style="font-weight: 500;">${formatNumber(user.value || 0)}</span></td>
            <td><span class="spirit-value">${formatNumber(user.spirit || 0)}</span></td>
            <td><span class="task-value">${formatNumber(user.tasksCompleted || Math.floor((user.value || 0) / 20))}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${statusBadge}</td>
            <td class="table-actions">
                <button class="btn btn-ghost btn-icon" onclick="editUser('${user.userID}')" title="Sửa thông tin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon text-orange" onclick="banUser('${user.userID}', '${user.name}')" title="Cấm người dùng">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="17" x2="22" y1="8" y2="13"/>
                        <line x1="22" x2="17" y1="8" y2="13"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon text-red" onclick="deleteUser('${user.userID}', '${user.name}')" title="Xóa tài khoản">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                </button>
            </td>
        </tr>
    `}).join('');

    const countEl = document.querySelector('.table-count');
    if (countEl) {
        countEl.textContent = `Hiển thị ${users.length} người dùng`;
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
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const filtered = allUsers.filter(user =>
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query)
        );
        renderUserTable(filtered);
    });
}
