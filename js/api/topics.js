const topicsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/topics${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/admin/topics/${id}`);
    },

    async create(topic) {
        return apiRequest('/admin/topics', {
            method: 'POST',
            body: JSON.stringify(topic)
        });
    },

    async update(id, topic) {
        return apiRequest(`/admin/topics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(topic)
        });
    },

    async delete(id) {
        return apiRequest(`/admin/topics/${id}`, {
            method: 'DELETE'
        });
    },

    async import(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = tokenStore.getAccessToken();
        const response = await fetch(`${API_CONFIG.baseURL}/admin/topics/import`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: formData
        });
        return handleResponse(response);
    },

    async export(format = 'json') {
        const token = tokenStore.getAccessToken();
        const response = await fetch(`${API_CONFIG.baseURL}/admin/topics/export?format=${format}`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        return response.blob();
    }
};
