let map;
let marker;
let selectedPatientId = null;
let locationHistory = [];
let mapInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    const patientSelect = document.getElementById('gpsPatientSelect');
    const refreshBtn = document.getElementById('refreshBtn');
    const viewInMapsBtn = document.getElementById('viewInMapsBtn');

    // Load patients into dropdown
    loadPatients();

    // Initialize map
    initMap();

    // Event listeners
    patientSelect.addEventListener('change', (e) => {
        selectedPatientId = e.target.value;
        if (selectedPatientId) {
            startLocationTracking(selectedPatientId);
        } else {
            stopLocationTracking();
            resetMap();
        }
    });

    refreshBtn.addEventListener('click', () => {
        if (selectedPatientId) {
            updatePatientLocation(selectedPatientId);
        }
    });

    viewInMapsBtn.addEventListener('click', () => {
        if (marker && marker.getPosition()) {
            const pos = marker.getPosition();
            window.open(`https://www.google.com/maps?q=${pos.lat()},${pos.lng()}`);
        }
    });

    // Initialize map every 10 seconds if patient selected
    setInterval(() => {
        if (selectedPatientId && mapInitialized) {
            updatePatientLocation(selectedPatientId);
        }
    }, 10000);
});

function initMap() {
    // Default to center of the US
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4
    });
    mapInitialized = true;
}

async function loadPatients() {
    try {
        const snapshot = await db.collection('patients').get();
        const select = document.getElementById('gpsPatientSelect');
        select.innerHTML = '<option value="">Select a patient</option>';
        
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function startLocationTracking(patientId) {
    // Clear any existing markers
    if (marker) {
        marker.setMap(null);
    }

    // Get initial location
    updatePatientLocation(patientId);
}

function stopLocationTracking() {
    // Clear any existing markers
    if (marker) {
        marker.setMap(null);
    }
}

function resetMap() {
    if (map) {
        map.setCenter({ lat: 39.8283, lng: -98.5795 });
        map.setZoom(4);
    }
}

async function updatePatientLocation(patientId) {
    try {
        const doc = await db.collection('patients').doc(patientId).get();
        if (!doc.exists) return;

        const patient = doc.data();
        const locationRef = realtimeDb.ref(`locations/${patientId}`);
        
        locationRef.once('value', (snapshot) => {
            const location = snapshot.val();
            if (location) {
                // Update location history
                locationHistory.unshift({
                    timestamp: new Date().toLocaleString(),
                    lat: location.lat,
                    lng: location.lng
                });
                updateLocationHistory();

                // Update map
                const position = new google.maps.LatLng(location.lat, location.lng);
                
                if (marker) {
                    marker.setPosition(position);
                } else {
                    marker = new google.maps.Marker({
                        position: position,
                        map: map,
                        title: patient.name
                    });
                }

                // Center map on marker
                map.setCenter(position);
                map.setZoom(15);
            }
        });
    } catch (error) {
        console.error('Error updating patient location:', error);
    }
}

function updateLocationHistory() {
    const historyElement = document.getElementById('locationHistory');
    historyElement.innerHTML = '';
    
    // Show last 5 locations
    const recentLocations = locationHistory.slice(0, 5);
    
    recentLocations.forEach(loc => {
        const div = document.createElement('div');
        div.className = 'location-entry';
        div.innerHTML = `
            <p><strong>${loc.timestamp}</strong></p>
            <p>Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}</p>
        `;
        historyElement.appendChild(div);
    });
}
