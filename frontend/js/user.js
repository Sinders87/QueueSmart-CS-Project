function minutesAgoFromIso(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = Math.max(0, Math.round((Date.now() - t) / 60000));

  if (diffMin === 0) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return `${diffMin} min ago`;
}

function getStoredNotifications() {
  try {
    const arr = JSON.parse(localStorage.getItem("qs_notifications") || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("qs_user") || "{}");
  } catch {
    return {};
  }
}

async function fetchApi(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  const data = await res.json();
  return data.data || data;
}

function renderStatus(queue) {
  const currentUser = getCurrentUser();

  const currentEntry =
    queue.find(item => item.userId === currentUser.id && item.status === "waiting") ||
    queue.find(item => item.userName === currentUser.name && item.status === "waiting") ||
    queue[0] ||
    {
      status: "waiting",
      position: "—",
      estimatedWait: "—"
    };

  const statusText = currentEntry.status
    ? currentEntry.status.charAt(0).toUpperCase() + currentEntry.status.slice(1)
    : "—";

  document.getElementById("statusText").textContent = statusText;
  document.getElementById("positionText").textContent = currentEntry.position ?? "—";
  document.getElementById("waitText").textContent = currentEntry.estimatedWait ?? "—";
}

function renderServices(services) {
  const table = document.getElementById("serviceTable");
  const activeServices = (services || []).filter(service => service.isActive);

  if (!activeServices.length) {
    table.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:20px;">No active services found.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = activeServices.map(service => `
    <tr>
      <td><strong>${service.name}</strong></td>
      <td>${service.expectedDuration} min</td>
      <td><span class="pill pill-open">Open</span></td>
    </tr>
  `).join("");
}

function renderNotifications(notifications, role) {
  const notifMeta = document.getElementById("notifMeta");
  const notifList = document.getElementById("notifList");

  const storedNotifications = getStoredNotifications();
  const sourceNotifications = storedNotifications.length > 0 ? storedNotifications : notifications;

  const filtered = (sourceNotifications || []).filter(item => !item.role || item.role === role);

  notifMeta.textContent = `${filtered.length} new`;

  if (!filtered.length) {
    notifList.innerHTML = `
      <div class="notif-item">
        <div>
          <div class="notif-text">No notifications yet.</div>
        </div>
      </div>
    `;
    return;
  }

  notifList.innerHTML = filtered.map(item => {
    const unreadClass = item.read === true ? "" : "unread";
    const timeText =
      item.time ||
      minutesAgoFromIso(item.created_at || item.timestamp) ||
      "";

    return `
      <div class="notif-item">
        <div class="notif-dot ${unreadClass}"></div>
        <div>
          <div class="notif-text">${item.message || item.serviceName || ""}</div>
          <div class="notif-time">${timeText}</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderDashboardError() {
  document.getElementById("statusText").textContent = "Error";
  document.getElementById("positionText").textContent = "—";
  document.getElementById("waitText").textContent = "—";

  document.getElementById("serviceTable").innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center; padding:20px;">Could not load services.</td>
    </tr>
  `;

  document.getElementById("notifMeta").textContent = "0 new";
  document.getElementById("notifList").innerHTML = `
    <div class="notif-item">
      <div>
        <div class="notif-text">Could not load notifications.</div>
      </div>
    </div>
  `;
}

async function loadDashboard() {
  const role = localStorage.getItem("qs_role") || "user";

  try {
    const queue = await fetchApi("http://localhost:3000/api/queue");
    const services = await fetchApi("http://localhost:3000/api/services");

    let notifications = [];
    try {
      notifications = await fetchApi("http://localhost:3000/api/notifications");
    } catch {
      notifications = await fetchApi("http://localhost:3000/api/history");
    }

    renderStatus(queue);
    renderServices(services);
    renderNotifications(notifications, role);
  } catch (err) {
    console.error("Dashboard load failed:", err);
    renderDashboardError();
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
window.addEventListener("focus", loadDashboard);
window.addEventListener("pageshow", loadDashboard);

window.addEventListener("storage", (e) => {
  if (e.key === "qs_notifications") {
    loadDashboard();
  }
});
