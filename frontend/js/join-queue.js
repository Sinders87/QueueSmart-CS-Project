async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    if (path.includes("services")) return mockServices();
    if (path.includes("queue"))    return mockQueue();
    return [];
  }
}

function mockServices() {
  return [
    { id: 1, name: "General Enquiry",    priority: "Low",    expectedDuration: 10, isActive: true,  peopleAhead: 3  },
    { id: 2, name: "Technical Support",  priority: "High",   expectedDuration: 25, isActive: true,  peopleAhead: 7  },
    { id: 3, name: "Billing Assistance", priority: "Medium", expectedDuration: 15, isActive: true,  peopleAhead: 2  },
    { id: 4, name: "Account Setup",      priority: "Medium", expectedDuration: 20, isActive: false, peopleAhead: 0  },
    { id: 5, name: "Complaints",         priority: "High",   expectedDuration: 30, isActive: true,  peopleAhead: 5  }
  ];
}

function mockQueue() {
  return [
    { id: 1, userId: "u1", status: "Waiting", position: 3, estimatedWait: 12 }
  ];
}

let selectedService = null;

async function loadPage() {
  const services = await loadJSON("../mock-data/services.json");
  const list = document.getElementById("serviceList");

  list.innerHTML = services.map(s => `
    <div class="service-option ${!s.isActive ? 'service-disabled' : ''}" 
         onclick="${s.isActive ? `selectService(${s.id})` : ''}">
      <div class="service-option-left">
        <div class="service-name">${s.name}</div>
        <div class="service-meta">${s.expectedDuration} min · ${s.peopleAhead ?? '?'} people ahead</div>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span class="pill ${s.isActive ? 'pill-open' : 'pill-closed'}">${s.isActive ? 'Open' : 'Closed'}</span>
        ${s.isActive ? '<span style="color:#aaa; font-size:18px;">›</span>' : ''}
      </div>
    </div>
  `).join("");

  // Store services for later use
  window._services = services;
}

function selectService(id) {
  const s = window._services.find(s => s.id === id);
  if (!s) return;
  selectedService = s;

  // Highlight selected
  document.querySelectorAll(".service-option").forEach(el => el.classList.remove("service-selected"));
  event.currentTarget.classList.add("service-selected");

  // Populate details card
  document.getElementById("selectedServiceName").textContent = s.name;
  document.getElementById("selectedWait").textContent        = s.expectedDuration;
  document.getElementById("selectedAhead").textContent       = s.peopleAhead ?? "—";

  // Show join card
  document.getElementById("joinCard").style.display    = "block";
  document.getElementById("joinConfirm").style.display = "none";
  document.getElementById("joinBtn").style.display     = "inline-block";
  document.getElementById("joinCard").scrollIntoView({ behavior: "smooth" });
}

function clearSelection() {
  selectedService = null;
  document.querySelectorAll(".service-option").forEach(el => el.classList.remove("service-selected"));
  document.getElementById("joinCard").style.display = "none";
}

function joinQueue() {
  if (!selectedService) return;
  const position = (selectedService.peopleAhead ?? 0) + 1;
  document.getElementById("confirmPos").textContent = `#${position}`;
  document.getElementById("joinConfirm").style.display = "block";
  document.getElementById("joinBtn").style.display     = "none";
}

loadPage();
