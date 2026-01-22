const inventoryApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/inventory${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/admin/inventory/${id}`);
    },

    async create(item) {
        return apiRequest('/admin/inventory', {
            method: 'POST',
            body: JSON.stringify(item)
        });
    },

    async update(id, item) {
        return apiRequest(`/admin/inventory/${id}`, {
            method: 'PUT',
            body: JSON.stringify(item)
        });
    },

    async delete(id) {
        return apiRequest(`/admin/inventory/${id}`, {
            method: 'DELETE'
        });
    },

    async toggleVisibility(id) {
        return apiRequest(`/admin/inventory/${id}/toggle-visibility`, {
            method: 'POST'
        });
    },

    async getStats() {
        return apiRequest('/admin/inventory/stats');
    },

    async getByType(type) {
        return apiRequest(`/admin/inventory?type=${type}`);
    }
};
