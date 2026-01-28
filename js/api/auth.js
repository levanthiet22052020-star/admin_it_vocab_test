const authApi = {
    async login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        tokenStore.setTokens(data);
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            localStorage.setItem('user', JSON.stringify({ email: email, name: email.split('@')[0] }));
        }
        return data;
    },

    async register(name, email, password) {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    },

    async logout() {
        const refreshToken = tokenStore.getRefreshToken();
        if (refreshToken) {
            try {
                await apiRequest('/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken })
                });
            } catch (e) {
                console.error('Logout API error:', e);
            }
        }
        tokenStore.clearTokens();
        window.location.href = 'index.html';
    },

    async sendCode(email, purpose) {
        return apiRequest('/auth/send-code', {
            method: 'POST',
            body: JSON.stringify({ email, purpose })
        });
    },

    async verifyCode(email, purpose, code) {
        return apiRequest('/auth/verify-code', {
            method: 'POST',
            body: JSON.stringify({ email, purpose, code })
        });
    },

    async newPassword(resetToken, newPassword) {
        return apiRequest('/auth/new-password', {
            method: 'POST',
            body: JSON.stringify({ resetToken, newPassword })
        });
    }
};
