const API_CONFIG = {
    baseURL: 'http://localhost:3000',
    timeout: 15000
};

const tokenStore = {
    getAccessToken() {
        return localStorage.getItem('accessToken');
    },
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },
    setTokens(tokens) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    },
    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = tokenStore.getAccessToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
                config.headers['Authorization'] = `Bearer ${tokenStore.getAccessToken()}`;
                const retryResponse = await fetch(url, config);
                return handleResponse(retryResponse);
            } else {
                tokenStore.clearTokens();
                window.location.href = 'index.html';
                throw new Error('Session expired');
            }
        }

        return handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API Error');
    }
    return data;
}

async function refreshToken() {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_CONFIG.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const tokens = await response.json();
            tokenStore.setTokens(tokens);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

function isAuthenticated() {
    return !!tokenStore.getAccessToken();
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}
