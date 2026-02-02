const usersApi = {
    async getLeaderboardXP() {
        return apiRequest('/leaderboard/xp');
    },

    async getLeaderboardStreak() {
        return apiRequest('/leaderboard/streak');
    },

    async getProfile() {
        return apiRequest('/profile');
    },

    async updateProfile(data) {
        return apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/users?${query}`);
    }
};
