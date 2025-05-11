// js/shared-navbar.js

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = location.pathname.split("/").pop();
  
    // Set title based on current page
    const isDashboard = currentPage === "dashboard.html";
    const navbarTitle = isDashboard ? "FallSpy Dashboard" : "FallSpy";
  
    const navbarHTML = `
      <header class="navbar">
        <h1>${navbarTitle}</h1>
        <nav class="nav-links">
          <a href="dashboard.html" class="nav-link">Dashboard</a>
          <a href="patients.html" class="nav-link">Patients</a>
          <a href="vitals.html" class="nav-link">Vitals</a>
          <a href="events.html" class="nav-link">Events</a>
          <a href="gps.html" class="nav-link">Live GPS</a>
          <a href="settings.html" class="nav-link">Settings</a>
          <button id="logoutBtn" class="btn btn-danger">Logout</button>
        </nav>
      </header>
    `;
  
    const container = document.getElementById("navbar-container");
    if (container) {
      container.innerHTML = navbarHTML;
  
      // Highlight the current page in navbar
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active");
        }
      });
  
      // Logout functionality
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          try {
            await auth.signOut();
            window.location.href = "index.html";
          } catch (err) {
            console.error("Logout error:", err);
          }
        });
      }
    }
  });
  