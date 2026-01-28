document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadDashboardData();

    DataWatcher.watch('dashboard', function () {
        return leaderboardApi.getXP().then(function (data) { return data.userList || []; });
    }, function () {
        loadDashboardData();
    }, 30000);
});

async function loadDashboardData() {
    try {
        const [usersData, wordsData, quizzesData, feedbackData] = await Promise.all([
            leaderboardApi.getXP().catch(() => ({ userList: [] })),
            vocabularyApi.getAll().catch(() => ({ items: [], total: 0 })),
            questionsApi.getAll().catch(() => ({ quizzes: [], total: 0 })),
            feedbackApi.getAll().catch(() => ({ items: [], total: 0 }))
        ]);

        const users = usersData.userList || [];
        const usersCount = users.length;
        const wordsCount = wordsData.total || wordsData.items?.length || 0;
        const questionsCount = quizzesData.total || quizzesData.quizzes?.length || 0;

        const feedbackItems = feedbackData.items || [];
        const openFeedback = feedbackItems.filter(f => f.status === 'open' || !f.status).length;

        updateStatElement('statUsers', usersCount);
        updateStatElement('statVocabulary', wordsCount);
        updateStatElement('statQuestions', questionsCount);
        updateStatElement('statFeedback', openFeedback);

        renderActiveUsersChart(users);
        renderVocabGrowthChart(wordsData);
        renderRecentActivity(feedbackItems, wordsData, quizzesData);

        console.log('Dashboard loaded:', { usersCount, wordsCount, questionsCount, openFeedback });
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

function updateStatElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = formatNumber(value);
    }
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString('vi-VN');
}

function renderActiveUsersChart(users) {
    const container = document.getElementById('activeUsersChart');
    if (!container) return;

    const today = new Date();
    const dayLabels = [];
    const dayNamesVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = dayNamesVi[date.getDay()];
        const dayNum = date.getDate();
        const monthNum = date.getMonth() + 1;
        dayLabels.push({ label: `${dayNum}/${monthNum}`, date: date, isToday: i === 0 });
    }

    const totalUsers = users.length || 1;

    const dayData = dayLabels.map((item, index) => {
        const value = item.isToday ? totalUsers : 0;
        return { day: item.label, value: value, isToday: item.isToday };
    });

    const maxValue = Math.max(...dayData.map(d => d.value), 1);

    container.innerHTML = dayData.map(item => {
        const height = item.value > 0 ? Math.max((item.value / maxValue) * 180, 20) : 10;
        const bgColor = item.isToday ? '#00B4D8' : '#e0e0e0';
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                <div style="background: ${bgColor}; width: 40px; height: ${height}px; border-radius: 8px 8px 0 0;" title="${item.value} người dùng"></div>
                <span style="font-size: 0.65rem; color: ${item.isToday ? '#00B4D8' : '#717182'}; white-space: nowrap; font-weight: ${item.isToday ? '600' : '400'};">${item.day}</span>
            </div>
        `;
    }).join('');
}

function renderVocabGrowthChart(wordsData) {
    const container = document.getElementById('vocabGrowthChart');
    if (!container) return;

    const totalWords = wordsData.total || wordsData.items?.length || 0;

    const monthNamesVi = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'];
    const today = new Date();
    const monthLabels = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const monthName = monthNamesVi[date.getMonth()];
        const year = date.getFullYear();
        monthLabels.push({ label: `${monthName}/${year.toString().slice(-2)}`, isCurrentMonth: i === 0 });
    }

    const growthData = monthLabels.map((item, index) => {
        const value = item.isCurrentMonth ? totalWords : 0;
        return { month: item.label, value: value, isCurrentMonth: item.isCurrentMonth };
    });

    const maxValue = Math.max(...growthData.map(d => d.value), 1);
    const chartWidth = 400;
    const chartHeight = 180;
    const padding = 30;
    const xStep = (chartWidth - padding * 2) / (growthData.length - 1);

    const points = growthData.map((item, index) => {
        const x = padding + index * xStep;
        const y = chartHeight - (item.value / maxValue) * (chartHeight - 40);
        return `${x},${y}`;
    }).join(' ');

    const circles = growthData.map((item, index) => {
        const x = padding + index * xStep;
        const y = chartHeight - (item.value / maxValue) * (chartHeight - 40);
        const fillColor = item.isCurrentMonth ? '#9038FF' : '#d0d0d0';
        return `<circle cx="${x}" cy="${y}" r="${item.isCurrentMonth ? 6 : 4}" fill="${fillColor}" title="${item.value} từ"/>`;
    }).join('');

    const labels = growthData.map((item, index) => {
        const x = padding + index * xStep;
        const fontWeight = item.isCurrentMonth ? 'bold' : 'normal';
        const fillColor = item.isCurrentMonth ? '#9038FF' : '#717182';
        return `<text x="${x}" y="${chartHeight + 15}" font-size="9" fill="${fillColor}" text-anchor="middle" font-weight="${fontWeight}">${item.month}</text>`;
    }).join('');

    container.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${chartHeight + 20}" style="width: 100%; height: 200px;">
            <polyline fill="none" stroke="#9038FF" stroke-width="3" points="${points}" />
            ${circles}
            ${labels}
        </svg>
    `;
}

function renderRecentActivity(feedbackItems, wordsData, quizzesData) {
    const container = document.getElementById('recentActivityList');
    if (!container) return;

    const activities = [];
    const now = new Date();

    const wordsTotal = wordsData.total || wordsData.items?.length || 0;
    if (wordsTotal > 0) {
        activities.push({
            action: `Cập nhật: Tổng cộng ${wordsTotal} từ vựng trong hệ thống`,
            meta: 'Dữ liệu từ API',
            time: now
        });
    }

    const quizzesTotal = quizzesData.total || quizzesData.quizzes?.length || 0;
    if (quizzesTotal > 0) {
        activities.push({
            action: `Cập nhật: Tổng cộng ${quizzesTotal} bài quiz`,
            meta: 'Dữ liệu từ API',
            time: now
        });
    }

    feedbackItems.slice(0, 3).forEach(fb => {
        activities.push({
            action: `Góp ý mới: ${fb.title || 'Không có tiêu đề'}`,
            meta: `Bởi ${fb.createdBy?.fullName || 'Ẩn danh'}`,
            time: new Date(fb.createdAt)
        });
    });

    if (activities.length === 0) {
        activities.push({
            action: 'Chưa có hoạt động gần đây',
            meta: 'Hệ thống',
            time: now
        });
    }

    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-content">
                <p class="activity-action">${activity.action}</p>
                <p class="activity-meta">${activity.meta}</p>
                <p class="activity-time">${formatFullDateTime(activity.time)}</p>
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Không rõ';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
}

function formatFullDateTime(date) {
    if (!date || isNaN(date.getTime())) return 'Không rõ';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}
