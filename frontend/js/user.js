function minutesAgoFromIso(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (diffMin === 0) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return diffMin + " min ago";
}

function getStoredNotifications() {
  try {
    const arr = JSON.parse(localStorage.getItem("qs_notifications") || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    if (path.includes("queue")) return mockQueue();
    if (path.includes("services")) return mockServices();
    if (path.includes("notifications")) return mockNotifications();
    return [];
  }
}

function mockQueue() {
  return [
    { id: 101, serviceId: 1, userName: "Alex", status: "waiting", position: 1, estimatedWait: 0 },
    { id: 102, serviceId: 1, userName: "Blake", status: "waiting", position: 2, estimatedWait: 15 },
    { id: 201, serviceId: 2, userName: "Casey", status: "waiting", position: 1, estimatedWait: 0 }
  ];
}

function mockServices() {
  return [
    { id: 1, name: "Academic Advising", description: "Meet with an academic advisor to discuss degree planning", expectedDuration: 15, priority: "medium", isActive: true },
    { id: 2, name: "Financial Aid Assistance", description: "Help with FAFSA and financial aid questions", expectedDuration: 20, priority: "high", isActive: true },
    { id: 3, name: "IT Help Desk", description: "Technical support for university systems", expectedDuration: 10, priority: "low", isActive: true },
    { id: 4, name: "Registration Support", description: "Assistance with course registration issues", expectedDuration: 12, priority: "medium", isActive: true }
  ];
}

function mockNotifications() {
  return [
    { id: 1, role: "user", message: "You joined Academic Advising. Current position: 2", read: false, created_at: new Date(Date.now() - 2 * 60000).toISOString() },
    { id: 2, role: "user", message: "You are close to being served", read: false, created_at: new Date().toISOString() }
  ];
}

async function loadDashboard() {
  const role = localStorage.getItem("qs_role") || "user";

  let queue = [];
  let services = [];
  let notifications = [];

  try {
    if (typeof loadQueue === "function") queue = await loadQueue();
    else queue = await loadJSON("../mock-data/queue.json");

    if (typeof loadServices === "function") services = await loadServices();
    else services = await loadJSON("../mock-data/services.json");

    if (typeof loadNotifications === "function") notifications = await loadNotifications();
    else notifications = await loadJSON("../mock-data/notifications.json");
  } catch {
    queue = await loadJSON("../mock-data/queue.json");
    services = await loadJSON("../mock-data/services.json");
    notifications = await loadJSON("../mock-data/notifications.json");
  }

  const user = queue.find(q => q.userName === "Blake") || queue[0] || { status: "waiting", position: "—", estimatedWait: "—" };

  const statusText = user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "—";
  document.getElementById("statusText").textContent = statusText;
  document.getElementById("positionText").textContent = user.position ?? "—";
  document.getElementById("waitText").textContent = user.estimatedWait ?? "—";

  const activeServices = (services || []).filter(s => s.isActive);
  document.getElementById("serviceTable").innerHTML = activeServices.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.expectedDuration} min</td>
      <td><span class="pill pill-open">Open</span></td>
    </tr>
  `).join("");

  const stored = getStoredNotifications();
  notifications = [...stored, ...(notifications || [])];

  const filteredNotifs = (notifications || []).filter(n => !n.role || n.role === role);

  document.getElementById("notifMeta").textContent = filteredNotifs.length + " new";
  document.getElementById("notifList").innerHTML = filteredNotifs.map(n => {
    const timeText = n.time || minutesAgoFromIso(n.created_at) || "";
    const unreadClass = (n.read === true) ? "" : "unread";
    return `
      <div class="notif-item">
        <div class="notif-dot ${unreadClass}"></div>
        <div>
          <div class="notif-text">${n.message || ""}</div>
          <div class="notif-time">${timeText}</div>
        </div>
      </div>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

window.addEventListener("focus", () => {
  loadDashboard();
});

window.addEventListener("pageshow", () => {
  loadDashboard();
});

window.addEventListener("storage", (e) => {
  if (e.key === "qs_notifications") loadDashboard();
});
