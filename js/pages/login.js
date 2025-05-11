document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorElement = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const userCredential = await login(email, password);
            
            if(userCredential.user) {
                // Redirect to dashboard after successful login
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = error.message;
            
            // Handle specific Firebase auth errors
            if (error.code && error.code.startsWith('auth/')) {
                errorElement.textContent = 'Authentication error: ' + error.message;
            }
        }
    });
});
