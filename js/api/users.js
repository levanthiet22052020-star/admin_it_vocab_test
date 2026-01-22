const usersApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/users${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/admin/users/${id}`);
    },

    async update(id, userData) {
        return apiRequest(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    async delete(id) {
        return apiRequest(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    },

    async ban(id) {
        return apiRequest(`/admin/users/${id}/ban`, {
            method: 'POST'
        });
    },

    async unban(id) {
        return apiRequest(`/admin/users/${id}/unban`, {
            method: 'POST'
        });
    },

    async getStats() {
        return apiRequest('/admin/users/stats');
    },

    async search(query) {
        return apiRequest(`/admin/users/search?q=${encodeURIComponent(query)}`);
    }
};
