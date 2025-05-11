document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Load current user data
    loadUserData();

    // Load current settings
    loadSettings();

    // Form submissions
    document.getElementById('accountForm').addEventListener('submit', handleAccountUpdate);
    document.getElementById('notificationsForm').addEventListener('submit', handleNotificationUpdate);
    document.getElementById('appearanceForm').addEventListener('submit', handleAppearanceUpdate);
});

async function loadUserData() {
    const user = auth.currentUser;
    if (user) {
        document.getElementById('userName').value = user.displayName || 'Not set';
        document.getElementById('userEmail').value = user.email;
    }
}

async function loadSettings() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const doc = await db.collection('userSettings').doc(user.uid).get();
        if (doc.exists) {
            const settings = doc.data();
            
            // Notification settings
            if (settings.notifications) {
                document.getElementById('emailAlerts').checked = settings.notifications.emailAlerts;
                document.getElementById('pushNotifications').checked = settings.notifications.pushNotifications;
                document.getElementById('alertThreshold').value = settings.notifications.alertThreshold;
            }
            
            // Appearance settings
            if (settings.appearance) {
                document.getElementById('theme').value = settings.appearance.theme;
                document.getElementById('fontSize').value = settings.appearance.fontSize;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function handleAccountUpdate(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            currentPassword
        );
        
        // Reauthenticate user
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        alert('Password updated successfully');
        e.target.reset();
    } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password: ' + error.message);
    }
}

async function handleNotificationUpdate(e) {
    e.preventDefault();
    
    try {
        const user = auth.currentUser;
        if (!user) return;

        const settings = {
            notifications: {
                emailAlerts: document.getElementById('emailAlerts').checked,
                pushNotifications: document.getElementById('pushNotifications').checked,
                alertThreshold: document.getElementById('alertThreshold').value
            }
        };

        await db.collection('userSettings').doc(user.uid).set(settings, { merge: true });
        alert('Notification preferences saved');
    } catch (error) {
        console.error('Error saving notification settings:', error);
        alert('Failed to save notification preferences');
    }
}

async function handleAppearanceUpdate(e) {
    e.preventDefault();
    
    try {
        const user = auth.currentUser;
        if (!user) return;

        const settings = {
            appearance: {
                theme: document.getElementById('theme').value,
                fontSize: document.getElementById('fontSize').value
            }
        };

        await db.collection('userSettings').doc(user.uid).set(settings, { merge: true });
        alert('Appearance settings saved');
        
        // Apply theme immediately
        applyTheme(settings.appearance.theme);
    } catch (error) {
        console.error('Error saving appearance settings:', error);
        alert('Failed to save appearance settings');
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        // System default
        document.documentElement.removeAttribute('data-theme');
    }
}
