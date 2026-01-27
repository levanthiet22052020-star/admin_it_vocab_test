document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();
    await loadFeedback();
});

let allFeedback = [];

async function loadFeedback() {
    const tbody = document.getElementById('feedbackTableBody');

    try {
        console.log('Đang gọi API feedback...');
        const data = await feedbackApi.getAll();
        console.log('Feedback API response:', data);

        allFeedback = data.items || data.feedbacks || data.list || [];
        console.log('Số lượng feedback:', allFeedback.length);

        if (allFeedback.length === 0) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Không có góp ý nào trong hệ thống</td></tr>`;
            }
            return;
        }

        renderFeedbackTable(allFeedback);
        updateStats(allFeedback, data.total);
    } catch (error) {
        console.error('Error loading feedback:', error);
        console.error('Error message:', error.message);

        if (tbody) {
            let errorMessage = 'Không thể tải dữ liệu góp ý';

            if (error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('quyền')) {
                errorMessage = 'Bạn không có quyền Admin. Endpoint /feedback/admin yêu cầu role ADMIN.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                errorMessage = 'Không thể kết nối đến server API.';
            }

            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: red;">${errorMessage}<br><small style="color: #666;">Chi tiết: ${error.message}</small></td></tr>`;
        }
    }
}

function updateStats(feedbacks, total) {
    const totalCount = total || feedbacks.length;
    const pending = feedbacks.filter(f => f.status === 'open' || !f.status).length;
    const inProgress = feedbacks.filter(f => f.status === 'resolved').length;
    const completed = feedbacks.filter(f => f.status === 'closed').length;

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = totalCount;
    if (statValues[1]) statValues[1].textContent = pending;
    if (statValues[2]) statValues[2].textContent = inProgress;
    if (statValues[3]) statValues[3].textContent = completed;
}

function renderFeedbackTable(feedbacks) {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;

    if (feedbacks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Không có góp ý nào</td></tr>`;
        return;
    }

    const reasonBadges = {
        'bug': 'badge-red',
        'feature': 'badge-purple',
        'content': 'badge-orange',
        'other': 'badge-gray',
        'suggestion': 'badge-blue'
    };

    const reasonLabels = {
        'bug': 'Báo lỗi',
        'feature': 'Yêu cầu tính năng',
        'content': 'Vấn đề nội dung',
        'other': 'Khác',
        'suggestion': 'Đề xuất'
    };

    tbody.innerHTML = feedbacks.map(fb => `
        <tr data-id="${fb.id || fb._id}">
            <td style="max-width: 300px;">
                <p style="font-weight: 500;" class="truncate">${fb.title || ''}</p>
                <p style="font-size: 0.75rem; color: var(--muted-foreground);" class="truncate">${fb.content || ''}</p>
            </td>
            <td>
                <div>
                    <p style="font-weight: 500;">${fb.createdBy?.fullName || fb.createdBy?.name || 'Ẩn danh'}</p>
                    <p style="font-size: 0.75rem; color: var(--muted-foreground);">${fb.createdBy?.email || ''}</p>
                </div>
            </td>
            <td><span class="badge ${reasonBadges[fb.reason] || 'badge-gray'}">${reasonLabels[fb.reason] || fb.reason || 'Khác'}</span></td>
            <td style="font-size: 0.875rem; color: var(--muted-foreground);">${formatDate(fb.createdAt)}</td>
            <td><span class="badge ${getStatusBadge(fb.status)}">${getStatusLabel(fb.status)}</span></td>
            <td class="table-actions">
                <button class="btn btn-ghost btn-icon" onclick="viewFeedback('${fb.id || fb._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-icon" onclick="deleteFeedback('${fb.id || fb._id}')">
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
        countEl.textContent = `Hiển thị ${feedbacks.length} góp ý`;
    }
}

function getStatusBadge(status) {
    const badges = {
        'open': 'badge-blue',
        'resolved': 'badge-green',
        'closed': 'badge-gray'
    };
    return badges[status] || 'badge-blue';
}

function getStatusLabel(status) {
    const labels = {
        'open': 'Đang mở',
        'resolved': 'Đã giải quyết',
        'closed': 'Đã đóng'
    };
    return labels[status] || status || 'Đang mở';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function viewFeedback(id) {
    const fb = allFeedback.find(f => (f.id || f._id) === id);
    if (fb) {
        alert(`Tiêu đề: ${fb.title || 'Không có'}\n\nLý do: ${fb.reason || 'Không có'}\n\nNội dung:\n${fb.content || 'Không có nội dung'}`);
    }
}

async function deleteFeedback(id) {
    if (confirm('Bạn có chắc muốn xóa góp ý này?')) {
        try {
            await feedbackApi.delete(id);
            await loadFeedback();
        } catch (error) {
            alert('Không thể xóa góp ý: ' + error.message);
        }
    }
}

const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const filtered = allFeedback.filter(fb =>
            (fb.title || '').toLowerCase().includes(query) ||
            (fb.content || '').toLowerCase().includes(query) ||
            (fb.createdBy?.fullName || '').toLowerCase().includes(query)
        );
        renderFeedbackTable(filtered);
    });
}

const filterSelect = document.querySelector('.filter-select');
if (filterSelect) {
    filterSelect.addEventListener('change', function (e) {
        const value = e.target.value;
        if (value === 'all') {
            renderFeedbackTable(allFeedback);
        } else {
            const filtered = allFeedback.filter(fb => fb.status === value);
            renderFeedbackTable(filtered);
        }
    });
}
