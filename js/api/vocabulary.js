const vocabularyApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/dictionary/words${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return apiRequest(`/dictionary/words/${id}`);
    },

    async create(vocabulary) {
        throw new Error('Create vocabulary not supported by server API');
    },

    async update(id, vocabulary) {
        throw new Error('Update vocabulary not supported by server API');
    },

    async delete(id) {
        throw new Error('Delete vocabulary not supported by server API');
    },

    async getPinned(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/dictionary/pinned${query ? '?' + query : ''}`);
    }
};
