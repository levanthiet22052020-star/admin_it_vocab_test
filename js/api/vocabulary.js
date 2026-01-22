const vocabularyApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/vocabulary${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/admin/vocabulary/${id}`);
    },

    async create(vocabulary) {
        return apiRequest('/admin/vocabulary', {
            method: 'POST',
            body: JSON.stringify(vocabulary)
        });
    },

    async update(id, vocabulary) {
        return apiRequest(`/admin/vocabulary/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vocabulary)
        });
    },

    async delete(id) {
        return apiRequest(`/admin/vocabulary/${id}`, {
            method: 'DELETE'
        });
    },

    async import(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = tokenStore.getAccessToken();
        const response = await fetch(`${API_CONFIG.baseURL}/admin/vocabulary/import`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: formData
        });
        return handleResponse(response);
    },

    async export(format = 'json', filters = {}) {
        const params = new URLSearchParams({ format, ...filters }).toString();
        const token = tokenStore.getAccessToken();
        const response = await fetch(`${API_CONFIG.baseURL}/admin/vocabulary/export?${params}`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        return response.blob();
    }
};
