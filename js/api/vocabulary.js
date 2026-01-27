const vocabularyApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/dictionary/words${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/dictionary/words/${id}`);
    },

    async getPinned(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/dictionary/pinned${query ? '?' + query : ''}`);
    },

    async pin(wordId) {
        return apiRequest(`/dictionary/words/${wordId}/pin`, {
            method: 'PUT'
        });
    },

    async unpin(wordId) {
        return apiRequest(`/dictionary/words/${wordId}/pin`, {
            method: 'DELETE'
        });
    },

    async updateNote(wordId, note) {
        return apiRequest(`/dictionary/words/${wordId}/note`, {
            method: 'PUT',
            body: JSON.stringify({ note })
        });
    }
};
