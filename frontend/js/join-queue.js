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
    message,
    read: false,
    created_at: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(existing));
}

async function fetchApi(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  const data = await res.json();
  return data.data || data;
}

let selectedService = null;

function renderServiceList(services, queue) {
  const list = document.getElementById("serviceList");

  if (!services.length) {
    list.innerHTML = `<div class="service-meta">No services available.</div>`;
    return;
  }

  list.innerHTML = services.map(service => {
    const peopleAhead = queue.filter(item => item.serviceId === service.id).length;

    return `
      <div class="service-option ${!service.isActive ? "service-disabled" : ""}"
           onclick="${service.isActive ? `selectService(${service.id}, event)` : ""}">
        <div class="service-option-left">
          <div class="service-name">${service.name}</div>
          <div class="service-meta">${service.description}</div>
          <div class="service-meta" style="margin-top:4px;">
            ${service.expectedDuration} min · ${peopleAhead} people ahead
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
          <span class="pill ${service.isActive ? "pill-open" : "pill-closed"}">
            ${service.isActive ? "Open" : "Closed"}
          </span>
          ${service.isActive ? '<span style="color:#aaa; font-size:20px;">›</span>' : ""}
        </div>
      </div>
    `;
  }).join("");
}

async function loadPage() {
  try {
    const services = await fetchApi("http://localhost:3000/api/services");
    const queue = await fetchApi("http://localhost:3000/api/queue");

    window._services = services;
    window._queue = queue;

    renderServiceList(services, queue);
  } catch (err) {
    console.error("Join queue page load failed:", err);
    document.getElementById("serviceList").innerHTML = `
      <div class="service-meta">Could not load services.</div>
    `;
  }
}

function selectService(id, event) {
  const service = (window._services || []).find(item => item.id === id);
  if (!service) return;

  selectedService = service;

  document.querySelectorAll(".service-option").forEach(el => {
    el.classList.remove("service-selected");
  });

  event.currentTarget.classList.add("service-selected");

  const peopleAhead = (window._queue || []).filter(item => item.serviceId === service.id).length;

  document.getElementById("selectedServiceName").textContent = service.name;
  document.getElementById("selectedDesc").textContent = service.description;
  document.getElementById("selectedWait").textContent = service.expectedDuration;
  document.getElementById("selectedAhead").textContent = peopleAhead;

  document.getElementById("joinCard").style.display = "block";
  document.getElementById("joinConfirm").style.display = "none";
  document.getElementById("joinBtn").style.display = "inline-block";
}

function clearSelection() {
  selectedService = null;

  document.querySelectorAll(".service-option").forEach(el => {
    el.classList.remove("service-selected");
  });

  document.getElementById("joinCard").style.display = "none";
}

async function joinQueue() {
  if (!selectedService) return;

  try {
    let position = (window._queue || []).filter(item => item.serviceId === selectedService.id).length + 1;

    try {
      const result = await fetchApi("http://localhost:3000/api/queue/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  serviceId: selectedService.id,
  userName: JSON.parse(localStorage.getItem("qs_user"))?.name || localStorage.getItem("qs_email") || "Guest"
})
      });

      position = result.position || position;
    } catch {
      console.warn("Join API not available, using current queue count for UI confirmation.");
    }

    document.getElementById("confirmPos").textContent = `#${position}`;
    document.getElementById("confirmService").textContent = selectedService.name;
    document.getElementById("joinConfirm").style.display = "block";
    document.getElementById("joinBtn").style.display = "none";

    addNotification(
      `You joined ${selectedService.name}. Current position: ${position}`,
      "user"
    );

    localStorage.setItem("qs_notifications_last_updated", String(Date.now()));

    await loadPage();
  } catch (err) {
    console.error("Join queue failed:", err);
    alert("Could not join queue.");
  }
}

document.addEventListener("DOMContentLoaded", loadPage);
window.addEventListener("pageshow", loadPage);
