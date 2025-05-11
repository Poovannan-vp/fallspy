document.addEventListener('DOMContentLoaded', () => {
    const patientFilter = document.getElementById('patientFilter');
    const dateFilter = document.getElementById('dateFilter');
    const exportBtn = document.getElementById('exportBtn');
    const eventsTable = document.getElementById('eventsTable').getElementsByTagName('tbody')[0];

    // Load patients into filter dropdown
    loadPatients();

    // Load initial events
    loadEvents();

    // Set up event listeners
    patientFilter.addEventListener('change', loadEvents);
    dateFilter.addEventListener('change', loadEvents);
    exportBtn.addEventListener('click', exportToCSV);

    async function loadPatients() {
        try {
            const snapshot = await db.collection('patients').get();
            patientFilter.innerHTML = '<option value="">All Patients</option>';
            
            snapshot.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = doc.data().name;
                patientFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    async function loadEvents() {
        try {
            const patientSnapshot = await db.collection('patients').get();
            const patientMap = {};
            patientSnapshot.forEach(doc => {
                const data = doc.data();
                patientMap[doc.id] = data.name || 'Unknown';
            });
    
            const eventSnapshot = await db.collection('events').orderBy('timestamp', 'desc').get();
            const events = [];
            eventSnapshot.forEach(doc => {
                events.push(doc.data());
            });
    
            const displayedPatients = new Set();
            eventsTable.innerHTML = '';
    
            // Display recent events and mark which patients already have events
            events.forEach(event => {
                displayedPatients.add(event.patientId);
    
                const timestamp = event.timestamp.toDate().toLocaleString();
                const statusClass = getStatusClass(event.severity);
    
                const row = eventsTable.insertRow();
                row.innerHTML = `
                    <td>${timestamp}</td>
                    <td>${event.patientName || 'Unknown'}</td>
                    <td class="${statusClass}">${event.type}</td>
                    <td>${event.details || ''}</td>
                    <td class="${statusClass}">${event.severity || 'normal'}</td>
                `;
            });
    
            // For patients with no events, show "No fall"
            Object.entries(patientMap).forEach(([id, name]) => {
                if (!displayedPatients.has(id)) {
                    const row = eventsTable.insertRow();
                    row.innerHTML = `
                        <td>-</td>
                        <td>${name}</td>
                        <td class="event-normal">No fall</td>
                        <td>-</td>
                        <td class="event-normal">normal</td>
                    `;
                }
            });
    
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }
    

    async function exportToCSV() {
        try {
            // Get current filtered events
            const snapshot = await db.collection('events').get();
            if (snapshot.empty) {
                alert('No events to export');
                return;
            }

            // Create CSV content
            let csvContent = "Timestamp,Patient,Event Type,Details,Severity\n";
            
            snapshot.forEach(doc => {
                const event = doc.data();
                const timestamp = event.timestamp.toDate().toLocaleString();
                const patientName = event.patientName || 'Unknown';
                const details = event.details || '';
                
                csvContent += `"${timestamp}","${patientName}","${event.type}","${details}","${event.severity}"\n`;
            });

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `events_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting events:', error);
            alert('Failed to export events');
        }
    }
});
