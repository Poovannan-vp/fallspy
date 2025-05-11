document.addEventListener('DOMContentLoaded', () => {
    if (!window.db) {
        console.error("❌ Firestore is NOT initialized!");
        alert("Database initialization failed! Check firebase-config.js");
        return;
    }

    const modal = document.getElementById('patientModal');
    const addPatientBtn = document.getElementById('addPatientBtn');
    const closeBtn = document.getElementById('closeModal'); // Fixed selector
    const patientForm = document.getElementById('patientForm');
    const patientsTable = document.getElementById('patientsTable').getElementsByTagName('tbody')[0];

    addPatientBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(); // open empty form
    });

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    patientForm.addEventListener('submit', handlePatientSubmit);

    loadPatients();

    function openModal(patient = null) {
        document.getElementById('modalTitle').textContent = patient ? 'Edit Patient' : 'Add New Patient';
        document.getElementById('patientId').value = patient ? patient.id : '';
        document.getElementById('patientName').value = patient ? patient.name : '';
        document.getElementById('patientAge').value = patient ? patient.age : '';
        document.getElementById('deviceId').value = patient ? patient.deviceId : '';
        document.getElementById('caregiver').value = patient ? patient.caregiver : '';
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        patientForm.reset();
    }

    async function handlePatientSubmit(e) {
        e.preventDefault();

        const patientData = {
            name: document.getElementById('patientName').value,
            age: document.getElementById('patientAge').value,
            deviceId: document.getElementById('deviceId').value,
            caregiver: document.getElementById('caregiver').value,
            photoUrl: 'https://via.placeholder.com/150'
        };

        const patientId = document.getElementById('patientId').value;

        try {
            if (patientId) {
                await db.collection('patients').doc(patientId).update(patientData);
                console.log('✅ Patient Updated:', patientId);
            } else {
                const docRef = await db.collection('patients').add(patientData);
                console.log('✅ Patient Added with ID:', docRef.id);
            }
            closeModal();
            loadPatients();
        } catch (error) {
            console.error('❌ Error saving patient:', error);
            alert('Failed to save patient: ' + error.message);
        }
    }

    async function loadPatients() {
        try {
            const snapshot = await db.collection('patients').get();
            patientsTable.innerHTML = '';

            snapshot.forEach(doc => {
                const patient = doc.data();
                const row = patientsTable.insertRow();
                row.innerHTML = `
                    <td><img src="${patient.photoUrl}" class="patient-photo" alt="Patient"></td>
                    <td>${patient.name}</td>
                    <td>${patient.age}</td>
                    <td>${patient.deviceId}</td>
                    <td>${patient.caregiver || 'None'}</td>
                    <td>
                        <button class="btn edit-btn" data-id="${doc.id}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${doc.id}">Delete</button>
                    </td>
                `;
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editPatient(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deletePatient(btn.dataset.id));
            });
        } catch (error) {
            console.error('❌ Error loading patients:', error);
        }
    }

    async function editPatient(patientId) {
        try {
            const doc = await db.collection('patients').doc(patientId).get();
            if (doc.exists) {
                const patient = doc.data();
                patient.id = patientId; // Needed for form
                openModal(patient);
            } else {
                alert("❌ Patient not found.");
            }
        } catch (error) {
            console.error("❌ Error editing patient:", error);
        }
    }

    async function deletePatient(patientId) {
        const confirmDelete = confirm("Are you sure you want to delete this patient?");
        if (!confirmDelete) return;

        try {
            await db.collection('patients').doc(patientId).delete();
            console.log("🗑️ Deleted patient:", patientId);
            loadPatients(); // Refresh table
        } catch (error) {
            console.error("❌ Error deleting patient:", error);
            alert("Failed to delete patient: " + error.message);
        }
    }
});
