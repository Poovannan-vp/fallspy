// Main Application Script
document.addEventListener('DOMContentLoaded', () => {
    // TEMPORARY BYPASS - Skip login and go directly to dashboard
    console.warn('TEMPORARY LOGIN BYPASS ENABLED - Loading dashboard directly');
    if (window.location.pathname.endsWith('index.html') || 
        window.location.pathname.endsWith('/')) {
        loadPage('dashboard');
    }
    
    // Original auth check (commented out for temporary bypass)
    /*
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            if (window.location.pathname.endsWith('index.html') || 
                window.location.pathname.endsWith('/')) {
                loadPage('dashboard');
            }
        } else {
            // No user signed in
            if (!window.location.pathname.endsWith('index.html') && 
                !window.location.pathname.endsWith('/')) {
                window.location.href = 'index.html';
            }
        }
    });
    */
});

// Page loader function
function loadPage(pageName) {
    const app = document.getElementById('app');
    
    // Show loading state
    app.innerHTML = '<div id="loading">Loading page...</div>';

    // Fetch the page content
    fetch(`pages/${pageName}.html`)
        .then(response => response.text())
        .then(html => {
            app.innerHTML = html;
            loadPageScript(pageName);
        })
        .catch(err => {
            console.error('Failed to load page:', err);
            app.innerHTML = '<div class="error">Failed to load page</div>';
        });
}

// Load page-specific JavaScript
function loadPageScript(pageName) {
    const script = document.createElement('script');
    script.src = `js/pages/${pageName}.js`;
    script.onerror = () => console.log(`No script found for ${pageName}`);
    document.body.appendChild(script);
}

// Navigation functions
function navigateTo(page) {
    window.history.pushState({}, '', `#${page}`);
    loadPage(page);
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
    const page = window.location.hash.substring(1) || 'dashboard';
    loadPage(page);
});

// Initialize with current hash
if (window.location.hash) {
    loadPage(window.location.hash.substring(1));
}

// Make navigation and auth functions available globally
window.navigateTo = navigateTo;
window.loadPage = loadPage;
window.login = login;
window.logout = logout;

// Auth functions
function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function logout() {
    return auth.signOut();
}
