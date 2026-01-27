document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadDashboardData();
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

    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const totalUsers = users.length || 1;

    const dayData = dayNames.map((day, index) => {
        const baseValue = Math.floor(totalUsers * (0.3 + Math.random() * 0.7));
        return { day, value: Math.max(baseValue, 1) };
    });

    const maxValue = Math.max(...dayData.map(d => d.value), 1);

    container.innerHTML = dayData.map(item => {
        const height = Math.max((item.value / maxValue) * 180, 20);
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                <div style="background: #00B4D8; width: 40px; height: ${height}px; border-radius: 8px 8px 0 0;" title="${item.value} người dùng"></div>
                <span style="font-size: 0.75rem; color: #717182;">${item.day}</span>
            </div>
        `;
    }).join('');
}

function renderVocabGrowthChart(wordsData) {
    const container = document.getElementById('vocabGrowthChart');
    if (!container) return;

    const totalWords = wordsData.total || wordsData.items?.length || 100;

    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    const growthData = months.map((month, index) => {
        const value = Math.floor(totalWords * ((index + 1) / months.length) * (0.7 + Math.random() * 0.3));
        return { month, value: Math.max(value, 10) };
    });

    const maxValue = Math.max(...growthData.map(d => d.value), 1);
    const chartWidth = 400;
    const chartHeight = 180;
    const padding = 20;
    const xStep = (chartWidth - padding * 2) / (growthData.length - 1);

    const points = growthData.map((item, index) => {
        const x = padding + index * xStep;
        const y = chartHeight - (item.value / maxValue) * (chartHeight - 40);
        return `${x},${y}`;
    }).join(' ');

    const circles = growthData.map((item, index) => {
        const x = padding + index * xStep;
        const y = chartHeight - (item.value / maxValue) * (chartHeight - 40);
        return `<circle cx="${x}" cy="${y}" r="5" fill="#9038FF" title="${item.value} từ"/>`;
    }).join('');

    const labels = growthData.map((item, index) => {
        const x = padding + index * xStep;
        return `<text x="${x}" y="${chartHeight + 15}" font-size="10" fill="#717182" text-anchor="middle">${item.month}</text>`;
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
