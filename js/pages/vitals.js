document.addEventListener('DOMContentLoaded', () => {
    const patientSelect = document.getElementById('patientSelect');
    const heartRateDisplay = document.getElementById('heartRate');
    const spo2Display = document.getElementById('spo2');
    const hrStatus = document.getElementById('hrStatus');
    const spo2Status = document.getElementById('spo2Status');
  
    let selectedPatientId = null;
    let vitalsRef = null;
  
    // Load patients into dropdown
    loadPatients();
  
    // Handle patient selection change
    patientSelect.addEventListener('change', (e) => {
      selectedPatientId = e.target.value;
      if (selectedPatientId) {
        startVitalsMonitoring(selectedPatientId);
      } else {
        stopVitalsMonitoring();
        resetVitalsDisplay();
      }
    });
  
    async function loadPatients() {
      try {
        const snapshot = await db.collection('patients').get();
        patientSelect.innerHTML = '<option value="">Select a patient</option>';
  
        snapshot.forEach(doc => {
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = doc.data().name;
          patientSelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    }
  
    function startVitalsMonitoring(patientId) {
      // Stop any existing monitoring
      stopVitalsMonitoring();
  
      // Start new monitoring
      vitalsRef = realtimeDb.ref(`vitals/${patientId}`);
      vitalsRef.on('value', (snapshot) => {
        const vitals = snapshot.val();
        if (vitals) {
          updateVitalsDisplay(vitals);
        }
      });
    }
  
    function stopVitalsMonitoring() {
      if (vitalsRef) {
        vitalsRef.off();
        vitalsRef = null;
      }
    }
  
    function updateVitalsDisplay(vitals) {
      // Update heart rate
      if (vitals.heartRate) {
        heartRateDisplay.textContent = vitals.heartRate;
        updateStatusIndicator(hrStatus, vitals.heartRate, 60, 100);
      }
  
      // Update SpO2
      if (vitals.spo2) {
        spo2Display.textContent = vitals.spo2;
        updateStatusIndicator(spo2Status, vitals.spo2, 90, 95);
      }
    }
  
    function updateStatusIndicator(element, value, warningThreshold, dangerThreshold) {
      element.className = 'status-indicator';
  
      if (value < dangerThreshold) {
        element.classList.add('status-danger');
      } else if (value < warningThreshold) {
        element.classList.add('status-warning');
      } else {
        element.classList.add('status-normal');
      }
    }
  
    function resetVitalsDisplay() {
      heartRateDisplay.textContent = '--';
      spo2Display.textContent = '--';
      hrStatus.className = 'status-indicator';
      spo2Status.className = 'status-indicator';
    }
  });
  