const leaderboardApi = {
    async getXP() {
        return apiRequest('/leaderboard/xp');
    },

    async getStreak() {
        return apiRequest('/leaderboard/streak');
    }
};
