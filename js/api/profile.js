const profileApi = {
    async get() {
        return apiRequest('/profile');
    },

    async update(data) {
        return apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async updateAvatar(formData) {
        const token = getAuthToken();
        const response = await fetch(`${API_CONFIG.baseURL}/profile/avatar`, {
            method: 'PUT',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update avatar');
        }
        return response.json();
    }
};
