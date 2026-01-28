document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadTopics();

    DataWatcher.watch('topics', function () {
        return topicsApi.getAll().then(function (data) { return data.topics || data.items || data || []; });
    }, function (data) {
        allTopics = data;
        renderTopicsTable(data);
        updateStats(data.length);
    }, 15000);
});

let allTopics = [];

async function loadTopics() {
    try {
        const data = await topicsApi.getAll();
        allTopics = data.topics || data.items || data || [];
        renderTopicsTable(allTopics);
        updateStats(data.total || allTopics.length);
    } catch (error) {
        console.error('Error loading topics:', error);
        document.getElementById('topicsTableBody').innerHTML = `
            <tr><td colspan="4" style="text-align: center; padding: 2rem;">Không thể tải dữ liệu chủ đề</td></tr>
        `;
    }
}

function updateStats(total) {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = total;
}

function renderTopicsTable(topics) {
    const tbody = document.getElementById('topicsTableBody');
    if (!tbody) return;

    if (topics.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem;">Không có chủ đề nào</td></tr>`;
        return;
    }

    const colors = ['badge-blue', 'badge-green', 'badge-purple', 'badge-orange', 'badge-pink', 'badge-yellow'];

    tbody.innerHTML = topics.map((topic, index) => `
        <tr data-id="${topic._id}">
            <td>
                <div class="topic-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                        <path d="M7 7h.01"/>
                    </svg>
                    <span class="badge ${colors[index % colors.length]}">${topic.topicName || topic.name || 'Không xác định'}</span>
                </div>
            </td>
            <td class="truncate">${topic.description || '-'}</td>
            <td><span style="font-weight: 500;">${topic.maxLevel || topic.vocabularyCount || topic.wordCount || 0}</span></td>
            <td class="table-actions">
                <button class="btn btn-ghost btn-icon" onclick="editTopic('${topic._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon" onclick="deleteTopic('${topic._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    const countEl = document.querySelector('.table-count');
    if (countEl) {
        countEl.textContent = `Hiển thị ${topics.length} chủ đề`;
    }
}

function editTopic(id) {
    openModal('editModal');
}

function deleteTopic(id) {
    if (confirm('Bạn có chắc muốn xóa chủ đề này?')) {
        alert('Chức năng xóa chưa được hỗ trợ');
    }
}

const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const filtered = allTopics.filter(topic =>
            (topic.topicName || '').toLowerCase().includes(query) ||
            (topic.description || '').toLowerCase().includes(query)
        );
        renderTopicsTable(filtered);
    });
}
