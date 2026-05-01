let selectedService = null;
let currentServices = [];
let currentQueue = [];

async function fetchApi(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data.data || data;
}

function isActiveService(service) {
  return service.isActive === true || service.isActive === 1 || service.is_active === true || service.is_active === 1;
}

function getDuration(service) {
  return service.expectedDuration || service.expected_duration || service.duration || 0;
}

function getCurrentUserName() {
  try {
    const user = JSON.parse(localStorage.getItem("qs_user") || "{}");
    return user.name || user.userName || user.email || "Guest";
  } catch {
    return "Guest";
  }
}

async function loadPage() {
  try {
    currentServices = await fetchApi("http://localhost:3000/api/services");
    currentQueue = await fetchApi("http://localhost:3000/api/queue");

    const list = document.getElementById("serviceList");

    const servicesToShow = currentServices.filter(isActiveService);

    if (!servicesToShow.length) {
      list.innerHTML = `
        <div style="color:#aaa; text-align:center; padding:20px">
          No active services found.
        </div>
      `;
      return;
    }

    list.innerHTML = servicesToShow.map(service => {
      const peopleAhead = currentQueue.filter(q =>
        q.serviceId === service.id && q.status === "waiting"
      ).length;

      return `
        <div class="service-option" data-service-id="${service.id}">
          <div class="service-option-left">
            <div class="service-name">${service.name}</div>
            <div class="service-meta">${service.description || ""}</div>
            <div class="service-meta" style="margin-top:4px;">
              ${getDuration(service)} min · ${peopleAhead} people ahead
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
            <span class="pill pill-open">Open</span>
            <span style="color:#aaa; font-size:20px;">›</span>
          </div>
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Join Queue load failed:", err);
    document.getElementById("serviceList").innerHTML = `
      <div style="color:#aaa; text-align:center; padding:20px">
        Could not load services.
      </div>
    `;
  }
}

function selectService(id, card) {
  const service = currentServices.find(s => s.id === id);
  if (!service) return;

  selectedService = service;

  document.querySelectorAll(".service-option").forEach(el => {
    el.classList.remove("service-selected");
  });

  card.classList.add("service-selected");

  const peopleAhead = currentQueue.filter(q =>
    q.serviceId === service.id && q.status === "waiting"
  ).length;

  document.getElementById("selectedServiceName").textContent = service.name;
  document.getElementById("selectedDesc").textContent = service.description || "";
  document.getElementById("selectedWait").textContent = getDuration(service);
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
  if (!selectedService) {
    alert("Please select a service first.");
    return;
  }

  try {
    const result = await fetchApi("http://localhost:3000/api/queue/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serviceId: selectedService.id,
        userName: getCurrentUserName()
      })
    });

    document.getElementById("confirmPos").textContent = "#" + (result.position || "—");
    document.getElementById("confirmService").textContent = selectedService.name;
    document.getElementById("joinConfirm").style.display = "block";
    document.getElementById("joinBtn").style.display = "none";

    await loadPage();

  } catch (err) {
    console.error("Join failed:", err);
    alert(err.message || "Could not join queue.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPage();

  const serviceList = document.getElementById("serviceList");
  serviceList.addEventListener("click", (e) => {
    const card = e.target.closest(".service-option");
    if (!card) return;

    const id = Number(card.dataset.serviceId);
    selectService(id, card);
  });
});

window.addEventListener("pageshow", loadPage);
