const questionsApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/quiz/quizzes${query ? '?' + query : ''}`);
    },

    async getByTopic(topicId) {
        return apiRequest(`/topic/topics/${topicId}/quizzes`);
    },

    async getAttempts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/quiz/attempts${query ? '?' + query : ''}`);
    },

    async startAttempt(data) {
        return apiRequest('/quiz/attempts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getAttempt(attemptId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/quiz/attempts/${attemptId}${query ? '?' + query : ''}`);
    },

    async getQuestion(attemptId, cursor) {
        return apiRequest(`/quiz/attempts/${attemptId}/questions/${cursor}`);
    },

    async submitAnswer(attemptId, data) {
        return apiRequest(`/quiz/attempts/${attemptId}/submit`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async finishAttempt(attemptId) {
        return apiRequest(`/quiz/attempts/${attemptId}/finish`, {
            method: 'POST'
        });
    },

    async abandonAttempt(attemptId) {
        return apiRequest(`/quiz/attempts/${attemptId}/abandon`, {
            method: 'POST'
        });
    },

    async reviewAttempt(attemptId) {
        return apiRequest(`/quiz/attempts/${attemptId}/review`);
    },

    async nextBatch(attemptId) {
        return apiRequest(`/quiz/attempts/${attemptId}/next-batch`, {
            method: 'POST'
        });
    },

    async updateAnswer(attemptAnswerId, data) {
        return apiRequest(`/quiz/attempt-answers/${attemptAnswerId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};
