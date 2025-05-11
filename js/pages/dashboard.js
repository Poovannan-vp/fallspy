document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard loaded");

    initDashboard();

    // Logout button logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                console.log("Logout button clicked");
                await auth.signOut(); // uses auth from firebase-config.js
                window.location.href = 'index.html'; // redirect to login/home page
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});

async function initDashboard() {
    try {
        const patientsSnapshot = await db.collection('patients').get();
        document.getElementById('totalPatients').textContent = patientsSnapshot.size;

        const alertsSnapshot = await db.collection('events')
            .where('status', '==', 'active')
            .get();
        document.getElementById('activeAlerts').textContent = alertsSnapshot.size;

        const recentEventsSnapshot = await db.collection('events')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        document.getElementById('recentEvents').textContent = recentEventsSnapshot.size;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}
