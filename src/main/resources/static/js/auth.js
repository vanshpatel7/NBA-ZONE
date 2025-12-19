// NBA-ZONE Authentication Module

const API_BASE_URL = 'http://localhost:8080/api';

// Token Management
const TokenManager = {
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    getAccessToken() {
        return localStorage.getItem('accessToken');
    },

    getRefreshToken() {
        return localStorage.setItem('refreshToken');
    },

    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
    },

    setUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    isAuthenticated() {
        return !!this.getAccessToken();
    }
};

// Password Strength Checker
function checkPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!strengthFill || !strengthText) return;

    const strength = checkPasswordStrength(password);

    strengthFill.className = 'strength-fill ' + strength;
    strengthText.className = 'strength-text ' + strength;

    if (strength === 'weak') {
        strengthText.textContent = 'Weak password';
    } else if (strength === 'medium') {
        strengthText.textContent = 'Medium password';
    } else {
        strengthText.textContent = 'Strong password';
    }
}

// Validate password requirements
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[@$!%*?&]/.test(password)
    };

    const allMet = Object.values(requirements).every(req => req);
    return { valid: allMet, requirements };
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

// Hide error message
function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('show');
    }
}

// Show loading state
function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Login Function
async function login(usernameOrEmail, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usernameOrEmail,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store tokens and user info
        TokenManager.setTokens(data.accessToken, data.refreshToken);
        TokenManager.setUserInfo({
            username: data.username,
            role: data.role
        });

        return data;
    } catch (error) {
        throw error;
    }
}

// Register Function
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle validation errors
            if (data.username) throw new Error(data.username);
            if (data.email) throw new Error(data.email);
            if (data.password) throw new Error(data.password);
            throw new Error(data.error || 'Registration failed');
        }

        // Store tokens and user info
        TokenManager.setTokens(data.accessToken, data.refreshToken);
        TokenManager.setUserInfo({
            username: data.username,
            role: data.role
        });

        return data;
    } catch (error) {
        throw error;
    }
}

// Logout Function
function logout() {
    TokenManager.clearTokens();
    window.location.href = '/login.html';
}

// Check if user is authenticated and redirect
function checkAuth() {
    if (TokenManager.isAuthenticated()) {
        // If on login or register page, redirect to home
        if (window.location.pathname.includes('login.html') ||
            window.location.pathname.includes('register.html')) {
            window.location.href = '/dashboard.html';
        }
    }
}

// Initialize Login Page
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Password toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
        const password = document.getElementById('password').value;

        // Clear previous errors
        hideError('generalError');

        // Validate
        if (!usernameOrEmail || !password) {
            showError('generalError', 'Please fill in all fields');
            return;
        }

        setLoading('loginBtn', true);

        try {
            await login(usernameOrEmail, password);
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } catch (error) {
            showError('generalError', error.message);
        } finally {
            setLoading('loginBtn', false);
        }
    });
}

// Initialize Register Page
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Password strength indicator
    passwordInput.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    // Confirm password validation
    confirmPasswordInput.addEventListener('input', (e) => {
        if (e.target.value && e.target.value !== passwordInput.value) {
            showError('confirmPasswordError', 'Passwords do not match');
            e.target.classList.add('error');
        } else {
            hideError('confirmPasswordError');
            e.target.classList.remove('error');
        }
    });

    // Form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = confirmPasswordInput.value;

        // Clear previous errors
        hideError('generalError');
        hideError('usernameError');
        hideError('emailError');
        hideError('passwordError');
        hideError('confirmPasswordError');

        // Validate
        let hasError = false;

        if (!username || username.length < 3 || username.length > 20) {
            showError('usernameError', 'Username must be 3-20 characters');
            hasError = true;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError('usernameError', 'Username can only contain letters, numbers, and underscores');
            hasError = true;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('emailError', 'Please enter a valid email');
            hasError = true;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            showError('passwordError', 'Password must contain uppercase, lowercase, number, and special character');
            hasError = true;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        setLoading('registerBtn', true);

        try {
            await register(username, email, password);
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } catch (error) {
            showError('generalError', error.message);
        } finally {
            setLoading('registerBtn', false);
        }
    });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Export functions for use in other scripts
window.AuthModule = {
    TokenManager,
    login,
    register,
    logout,
    checkAuth
};
