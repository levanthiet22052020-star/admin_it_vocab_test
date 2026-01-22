document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng nhập...';

            if (errorMessage) {
                errorMessage.style.display = 'none';
            }

            try {
                await authApi.login(email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                if (errorMessage) {
                    errorMessage.textContent = error.message || 'Đăng nhập thất bại';
                    errorMessage.style.display = 'block';
                } else {
                    alert(error.message || 'Đăng nhập thất bại');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Đăng nhập';
            }
        });
    }
});
