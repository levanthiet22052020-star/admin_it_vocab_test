const topicsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/topic/topics${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/topic/topics/${id}`);
    },

    async create(topic) {
        return apiRequest('/topic/topics', {
            method: 'POST',
            body: JSON.stringify(topic)
        });
    },

    async update(id, topic) {
        return apiRequest(`/topic/topics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(topic)
        });
    },

    async delete(id) {
        return apiRequest(`/topic/topics/${id}`, {
            method: 'DELETE'
        });
    },

    async restore(id) {
        return apiRequest(`/topic/topics/${id}/restore`, {
            method: 'PUT'
        });
    },

    async getQuizzes(topicId) {
        return apiRequest(`/topic/topics/${topicId}/quizzes`);
    }
};
