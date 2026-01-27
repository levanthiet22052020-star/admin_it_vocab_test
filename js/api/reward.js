const rewardApi = {
    async getRoadmap(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/reward/roadmap${query ? '?' + query : ''}`);
    },

    async claim(inboxId) {
        return apiRequest(`/reward/inbox/${inboxId}/claim`, {
            method: 'POST'
        });
    }
};
