const feedbackApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/feedback/admin${query ? '?' + query : ''}`);
    },

    async getMy() {
        return apiRequest('/feedback/my');
    },

    async create(feedback) {
        return apiRequest('/feedback', {
            method: 'POST',
            body: JSON.stringify(feedback)
        });
    },

    async update(id, feedback) {
        return apiRequest(`/feedback/${id}`, {
            method: 'PUT',
            body: JSON.stringify(feedback)
        });
    },

    async delete(id) {
        return apiRequest(`/feedback/${id}`, {
            method: 'DELETE'
        });
    },

    async deleteAll() {
        return apiRequest('/feedback/admin', {
            method: 'DELETE'
        });
    }
};
