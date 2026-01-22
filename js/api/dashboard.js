const dashboardApi = {
    async getStats() {
        return apiRequest('/admin/dashboard/stats');
    },

    async getRecentActivities(limit = 10) {
        return apiRequest(`/admin/dashboard/activities?limit=${limit}`);
    },

    async getChartData(type, period = 'week') {
        return apiRequest(`/admin/dashboard/charts/${type}?period=${period}`);
    },

    async getOverview() {
        return apiRequest('/admin/dashboard/overview');
    }
};
