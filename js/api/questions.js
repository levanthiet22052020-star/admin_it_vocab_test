const questionsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/questions${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/admin/questions/${id}`);
    },

    async create(question) {
        return apiRequest('/admin/questions', {
            method: 'POST',
            body: JSON.stringify(question)
        });
    },

    async update(id, question) {
        return apiRequest(`/admin/questions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(question)
        });
    },

    async delete(id) {
        return apiRequest(`/admin/questions/${id}`, {
            method: 'DELETE'
        });
    },

    async import(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = tokenStore.getAccessToken();
        const response = await fetch(`${API_CONFIG.baseURL}/admin/questions/import`, {
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
        const response = await fetch(`${API_CONFIG.baseURL}/admin/questions/export?${params}`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        return response.blob();
    },

    async getByTopic(topicId) {
        return apiRequest(`/admin/questions?topicId=${topicId}`);
    },

    async getByDifficulty(difficulty) {
        return apiRequest(`/admin/questions?difficulty=${difficulty}`);
    }
};
