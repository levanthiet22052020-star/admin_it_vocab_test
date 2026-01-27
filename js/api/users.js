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
    }
};
