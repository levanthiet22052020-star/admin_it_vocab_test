const feedbackApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/feedback${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/admin/feedback/${id}`);
    },

    async updateStatus(id, status) {
        return apiRequest(`/admin/feedback/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async delete(id) {
        return apiRequest(`/admin/feedback/${id}`, {
            method: 'DELETE'
        });
    },

    async getStats() {
        return apiRequest('/admin/feedback/stats');
    },

    async getByStatus(status) {
        return apiRequest(`/admin/feedback?status=${status}`);
    },

    async getByCategory(category) {
        return apiRequest(`/admin/feedback?category=${category}`);
    }
};
