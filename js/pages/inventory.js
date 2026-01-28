document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadData();

    DataWatcher.watch('inventory', function () {
        return rewardApi.getRoadmap().then(function (data) { return data.milestones || data.rewards || data.items || []; });
    }, function (data) {
        allItems = data;
        renderItemsGrid(data);
        updateStats(data);
    }, 15000);
});

let allItems = [];

async function loadData() {
    try {
        const roadmapData = await rewardApi.getRoadmap();
        allItems = roadmapData.milestones || roadmapData.rewards || roadmapData.items || [];

        renderItemsGrid(allItems);
        updateStats(allItems);
    } catch (error) {
        console.error('Error loading data:', error);
        const grid = document.getElementById('itemsGrid');
        if (grid) {
            grid.innerHTML = `<div style="text-align: center; padding: 2rem; grid-column: 1/-1;">Không thể tải dữ liệu vật phẩm: ${error.message}</div>`;
        }
    }
}

function updateStats(items) {
    const total = items.length;
    const rankItems = items.filter(i => i.type === 'RANK').length;
    const streakItems = items.filter(i => i.type === 'STREAK').length;
    const claimable = items.filter(i => i.status === 'CLAIMABLE').length;

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = total;
    if (statValues[1]) statValues[1].textContent = rankItems;
    if (statValues[2]) statValues[2].textContent = streakItems;
    if (statValues[3]) statValues[3].textContent = claimable;
}

function renderItemsGrid(items) {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<div style="text-align: center; padding: 2rem; grid-column: 1/-1;">Không có vật phẩm nào</div>`;
        return;
    }

    const typeColors = {
        'RANK': 'cyan',
        'STREAK': 'purple'
    };

    const typeLabels = {
        'RANK': 'Phần thưởng XP',
        'STREAK': 'Phần thưởng Streak'
    };

    const statusLabels = {
        'LOCKED': 'Chưa mở khóa',
        'CLAIMABLE': 'Có thể nhận',
        'CLAIMED': 'Đã nhận'
    };

    const statusBadges = {
        'LOCKED': 'badge-gray',
        'CLAIMABLE': 'badge-green',
        'CLAIMED': 'badge-blue'
    };

    grid.innerHTML = items.map(item => `
        <div class="item-card" data-id="${item._id}">
            <div class="item-header">
                <div class="item-icon ${typeColors[item.type] || 'cyan'}">
                    ${item.rewards && item.rewards[0]?.itemImageURL ?
            `<img src="${item.rewards[0].itemImageURL}" alt="${item.rewards[0]?.name || ''}" style="width:24px;height:24px;object-fit:contain;">` :
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m7.5 4.27 9 5.15"/>
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                            <path d="m3.3 7 8.7 5 8.7-5"/>
                            <path d="M12 22V12"/>
                        </svg>`
        }
                </div>
                <span class="badge ${statusBadges[item.status] || 'badge-gray'}">${statusLabels[item.status] || item.status}</span>
            </div>
            <h3 class="item-name">${getRewardName(item)}</h3>
            <p class="item-description">${typeLabels[item.type] || item.type}</p>
            <div class="item-meta">
                <div class="item-price">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="8" cy="8" r="6"/>
                        <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
                        <path d="M7 6h1v4"/>
                        <path d="m16.71 13.88.7.71-2.82 2.82"/>
                    </svg>
                    ${item.requiredValue || 0} ${item.type === 'RANK' ? 'XP' : 'ngày'}
                </div>
                ${item.status === 'CLAIMABLE' ? `<button class="btn btn-primary btn-sm" onclick="claimReward('${item._id}')">Nhận</button>` : ''}
            </div>
        </div>
    `).join('');

    const countEl = document.querySelector('.table-count');
    if (countEl) {
        countEl.textContent = `Hiển thị ${items.length} vật phẩm`;
    }
}

function getRewardName(item) {
    if (item.rewards && item.rewards.length > 0) {
        return item.rewards.map(r => r.name || r.itemName).filter(Boolean).join(', ') || `Mốc ${item.requiredValue}`;
    }
    return `Mốc ${item.requiredValue} ${item.type === 'RANK' ? 'XP' : 'ngày'}`;
}

async function claimReward(milestoneId) {
    alert('Chức năng nhận thưởng cần được triển khai với inboxId');
}

const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const filtered = allItems.filter(item =>
            getRewardName(item).toLowerCase().includes(query) ||
            (item.type || '').toLowerCase().includes(query)
        );
        renderItemsGrid(filtered);
    });
}

const filterSelect = document.querySelector('.filter-select');
if (filterSelect) {
    filterSelect.addEventListener('change', function (e) {
        const value = e.target.value;
        if (value === 'all') {
            renderItemsGrid(allItems);
        } else if (value === 'reward') {
            renderItemsGrid(allItems.filter(item => item.type === 'RANK'));
        } else if (value === 'power-up') {
            renderItemsGrid(allItems.filter(item => item.type === 'STREAK'));
        } else {
            renderItemsGrid(allItems.filter(item => item.status === value.toUpperCase()));
        }
    });
}
