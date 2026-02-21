async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    if (path.includes("services")) return mockServices();
    if (path.includes("queue")) return mockQueue();
    return [];
  }
}

function mockServices() {
  return [
    { id: 1, name: "Academic Advising", description: "Meet with an academic advisor to discuss degree planning", expectedDuration: 15, priority: "medium", isActive: true },
    { id: 2, name: "Financial Aid Assistance", description: "Help with FAFSA and financial aid questions", expectedDuration: 20, priority: "high", isActive: true },
    { id: 3, name: "IT Help Desk", description: "Technical support for university systems", expectedDuration: 10, priority: "low", isActive: true },
    { id: 4, name: "Registration Support", description: "Assistance with course registration issues", expectedDuration: 12, priority: "medium", isActive: true }
  ];
}

function mockQueue() {
  return [
    { id: 101, serviceId: 1, userName: "Alex", status: "waiting", position: 1, estimatedWait: 0 },
    { id: 102, serviceId: 1, userName: "Blake", status: "waiting", position: 2, estimatedWait: 15 },
    { id: 201, serviceId: 2, userName: "Casey", status: "waiting", position: 1, estimatedWait: 0 }
  ];
}

function addNotification(message, role) {
  const key = "qs_notifications";
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }

  existing.unshift({
    id: Date.now(),
    role: role || (localStorage.getItem("qs_role") || "user"),
    message: message,
    read: false,
    created_at: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(existing));
}

let selectedService = null;

async function loadPage() {
  const services = await loadJSON("../mock-data/services.json");
  const queue = await loadJSON("../mock-data/queue.json");
  window._services = services;
  window._queue = queue;

  const list = document.getElementById("serviceList");
  list.innerHTML = services.map(s => {
    const peopleAhead = queue.filter(q => q.serviceId === s.id).length;
    return `
      <div class="service-option ${!s.isActive ? "service-disabled" : ""}"
           onclick="${s.isActive ? `selectService(${s.id}, event)` : ""}">
        <div class="service-option-left">
          <div class="service-name">${s.name}</div>
          <div class="service-meta">${s.description}</div>
          <div class="service-meta" style="margin-top:4px">${s.expectedDuration} min · ${peopleAhead} people ahead</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
          <span class="pill ${s.isActive ? "pill-open" : "pill-closed"}">${s.isActive ? "Open" : "Closed"}</span>
          ${s.isActive ? '<span style="color:#aaa; font-size:20px;">›</span>' : ""}
        </div>
      </div>
    `;
  }).join("");
}

function selectService(id, event) {
  const s = window._services.find(s => s.id === id);
  if (!s) return;
  selectedService = s;

  document.querySelectorAll(".service-option").forEach(el => el.classList.remove("service-selected"));
  event.currentTarget.classList.add("service-selected");

  const peopleAhead = (window._queue || []).filter(q => q.serviceId === s.id).length;

  document.getElementById("selectedServiceName").textContent = s.name;
  document.getElementById("selectedDesc").textContent = s.description;
  document.getElementById("selectedWait").textContent = s.expectedDuration;
  document.getElementById("selectedAhead").textContent = peopleAhead;

  document.getElementById("joinCard").style.display = "block";
  document.getElementById("joinConfirm").style.display = "none";
  document.getElementById("joinBtn").style.display = "inline-block";
  document.getElementById("joinCard").scrollIntoView({ behavior: "smooth" });
}

function clearSelection() {
  selectedService = null;
  document.querySelectorAll(".service-option").forEach(el => el.classList.remove("service-selected"));
  document.getElementById("joinCard").style.display = "none";
}

function joinQueue() {
  if (!selectedService) return;

  const peopleAhead = (window._queue || []).filter(q => q.serviceId === selectedService.id).length;
  const myPosition = peopleAhead + 1;

  document.getElementById("confirmPos").textContent = `#${myPosition}`;
  document.getElementById("confirmService").textContent = selectedService.name;
  document.getElementById("joinConfirm").style.display = "block";
  document.getElementById("joinBtn").style.display = "none";

  addNotification("You joined " + selectedService.name + ". Current position: " + myPosition, "user");
}

loadPage();
