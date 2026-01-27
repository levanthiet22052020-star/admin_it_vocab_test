const itemApi = {
    async create(formData) {
        const token = getAuthToken();
        const response = await fetch(`${API_CONFIG.baseURL}/item`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create item');
        }
        return response.json();
    }
};
