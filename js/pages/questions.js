document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadQuestions();
});

let allQuestions = [];
let filteredQuestions = [];
let allTopics = [];
let topicsMap = {};
let currentPage = 1;
const itemsPerPage = 10;

async function loadQuestions() {
    try {
        const [questionsData, topicsData] = await Promise.all([
            questionsApi.getAll(),
            topicsApi.getAll()
        ]);

        allTopics = topicsData.items || topicsData.topics || topicsData || [];
        topicsMap = {};
        allTopics.forEach(topic => {
            topicsMap[topic._id] = topic.name || topic.topicName;
        });

        allQuestions = (questionsData.quizzes || questionsData.items || questionsData || []).map(q => ({
            ...q,
            topicName: topicsMap[q.topicId] || q.topicName || q.topic || null
        }));

        filteredQuestions = [...allQuestions];
        currentPage = 1;
        renderQuestionsTable();
        updateStats(questionsData.total || allQuestions.length);
        populateTopicFilter();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionsTableBody').innerHTML = `
            <tr><td colspan="5" style="text-align: center; padding: 2rem;">Không thể tải dữ liệu câu hỏi</td></tr>
        `;
    }
}

function populateTopicFilter() {
    const filterSelect = document.getElementById('topicFilter');
    if (!filterSelect || allTopics.length === 0) return;

    filterSelect.innerHTML = '<option value="">Tất cả chủ đề</option>' +
        allTopics.map(t => `<option value="${t._id}">${t.name || t.topicName}</option>`).join('');
}

function updateStats(total) {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = total;
}

function renderQuestionsTable() {
    const tbody = document.getElementById('questionsTableBody');
    if (!tbody) return;

    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageQuestions = filteredQuestions.slice(startIndex, endIndex);

    if (filteredQuestions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Không có câu hỏi nào</td></tr>`;
        renderPagination(0);
        return;
    }

    const typeMapping = {
        'TOPIC': 'Theo chủ đề',
        'REVIEW': 'Ôn tập',
        'multiple-choice': 'Trắc nghiệm',
        'true-false': 'Đúng/Sai',
        'fill-blank': 'Điền từ'
    };

    tbody.innerHTML = pageQuestions.map(q => `
        <tr data-id="${q._id}">
            <td style="max-width: 350px;">
                <p style="font-weight: 500;" class="truncate">${q.quizTitle || q.question || q.title || 'Không xác định'}</p>
                <div class="answer-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>Số câu: ${q.questionCount || q.totalQuestions || '-'}</span>
                </div>
            </td>
            <td><span class="badge badge-outline">${typeMapping[q.quizType] || q.quizType || q.type || 'Trắc nghiệm'}</span></td>
            <td>${q.topicName || q.topic || '-'}</td>
            <td><span style="font-weight: 500;">${q.xp || 0} XP</span></td>
            <td class="table-actions">
                <button class="btn btn-ghost btn-icon" onclick="editQuestion('${q._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon" onclick="deleteQuestion('${q._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(totalPages);
    updateTableCount();
}

function renderPagination(totalPages) {
    let paginationContainer = document.getElementById('questionsPagination');

    if (!paginationContainer) {
        const tableCount = document.querySelector('.table-count');
        if (tableCount) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'questionsPagination';
            paginationContainer.className = 'pagination';
            tableCount.parentNode.insertBefore(paginationContainer, tableCount);
        }
    }

    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
        </button>
        <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
    `;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>
        `;
    }

    paginationHTML += `
        <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderQuestionsTable();
    document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateTableCount() {
    const countEl = document.querySelector('.table-count');
    if (countEl) {
        const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, filteredQuestions.length);
        countEl.textContent = `Hiển thị ${startIndex}-${endIndex} / ${filteredQuestions.length} câu hỏi (Trang ${currentPage}/${totalPages || 1})`;
    }
}

function editQuestion(id) {
    openModal('editModal');
}

function deleteQuestion(id) {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
        alert('Chức năng xóa chưa được hỗ trợ');
    }
}

const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        applyFilters();
    });
}

const topicFilter = document.getElementById('topicFilter');
if (topicFilter) {
    topicFilter.addEventListener('change', function (e) {
        applyFilters();
    });
}

function applyFilters() {
    const searchQuery = (document.querySelector('.search-input')?.value || '').toLowerCase();
    const selectedTopic = document.getElementById('topicFilter')?.value || '';

    filteredQuestions = allQuestions.filter(q => {
        const matchesSearch = !searchQuery ||
            (q.quizTitle || '').toLowerCase().includes(searchQuery) ||
            (q.topicName || '').toLowerCase().includes(searchQuery);

        const matchesTopic = !selectedTopic || q.topicId === selectedTopic;

        return matchesSearch && matchesTopic;
    });

    currentPage = 1;
    renderQuestionsTable();
}

