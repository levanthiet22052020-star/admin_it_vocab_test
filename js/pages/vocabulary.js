document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadVocabulary();
});

let allWords = [];

async function loadVocabulary() {
    try {
        const data = await vocabularyApi.getAll();
        allWords = data.items || data.words || data || [];
        renderVocabularyTable(allWords);
        updateStats(data.total || allWords.length);
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        document.getElementById('vocabularyTableBody').innerHTML = `
            <tr><td colspan="5" style="text-align: center; padding: 2rem;">Không thể tải dữ liệu từ vựng</td></tr>
        `;
    }
}

function updateStats(total) {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = total;
}

function renderVocabularyTable(words) {
    const tbody = document.getElementById('vocabularyTableBody');
    if (!tbody) return;

    if (words.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Không có từ vựng nào</td></tr>`;
        return;
    }

    const levelBadges = {
        1: { name: 'Cơ bản', class: 'badge-green' },
        2: { name: 'Trung bình', class: 'badge-yellow' },
        3: { name: 'Nâng cao', class: 'badge-red' }
    };

    tbody.innerHTML = words.map(word => `
        <tr data-id="${word.id || word._id}">
            <td style="font-weight: 500;">${word.term || word.word || 'Không xác định'}</td>
            <td class="truncate">${word.definition || word.meaningEN || word.meaningVN || '-'}</td>
            <td>${word.category || word.topicName || '-'}</td>
            <td><span class="badge ${levelBadges[word.level]?.class || 'badge-green'}">${levelBadges[word.level]?.name || 'Cơ bản'}</span></td>
            <td class="table-actions">
                <button class="btn btn-ghost btn-icon" onclick="editVocab('${word.id || word._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon" onclick="deleteVocab('${word.id || word._id}')">
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
        countEl.textContent = `Hiển thị ${words.length} từ vựng`;
    }
}

function editVocab(id) {
    openModal('editModal');
}

function deleteVocab(id) {
    if (confirm('Bạn có chắc muốn xóa từ vựng này?')) {
        alert('Chức năng xóa chưa được hỗ trợ');
    }
}

const searchInput = document.getElementById('searchInput') || document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const filtered = allWords.filter(word =>
            (word.term || '').toLowerCase().includes(query) ||
            (word.definition || '').toLowerCase().includes(query) ||
            (word.category || '').toLowerCase().includes(query)
        );
        renderVocabularyTable(filtered);
    });
}
