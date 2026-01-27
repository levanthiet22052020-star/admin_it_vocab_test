const feedbackApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/feedback/admin${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/feedback/${id}`);
    },

    async updateStatus(id, status) {
        return apiRequest(`/feedback/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async delete(id) {
        return apiRequest(`/feedback/${id}`, {
            method: 'DELETE'
        });
    },

    async deleteAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/feedback/admin${query ? '?' + query : ''}`, {
            method: 'DELETE'
        });
    }
};
