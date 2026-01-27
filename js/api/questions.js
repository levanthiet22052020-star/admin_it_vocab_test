const questionsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/quiz/quizzes${query ? '?' + query : ''}`);
    },

    async getById(id) {
        throw new Error('Get question by ID not supported by server API');
    },

    async create(question) {
        throw new Error('Create question not supported by server API');
    },

    async update(id, question) {
        throw new Error('Update question not supported by server API');
    },

    async delete(id) {
        throw new Error('Delete question not supported by server API');
    },

    async getByTopic(topicId) {
        return apiRequest(`/topic/topics/${topicId}/quizzes`);
    }
};
