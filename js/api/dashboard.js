const dashboardApi = {
    async getStats() {
        return {
            totalUsers: 0,
            totalTopics: 0,
            totalVocabulary: 0,
            totalQuestions: 0,
            message: 'Dashboard stats API not supported by server'
        };
    },

    async getRecentActivities(limit = 10) {
        return {
            activities: [],
            message: 'Activities API not supported by server'
        };
    },

    async getChartData(type, period = 'week') {
        return {
            data: [],
            message: 'Chart data API not supported by server'
        };
    },

    async getOverview() {
        return {
            message: 'Overview API not supported by server'
        };
    }
};
