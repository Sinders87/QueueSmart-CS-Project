async function fetchApi(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed: " + url);
  const data = await res.json();
  return data.data || data;
}

function isActiveService(service) {
  return service.isActive === true || service.isActive === 1 || service.is_active === true || service.is_active === 1;
}

function getDuration(service) {
  return service.expectedDuration || service.expected_duration || service.duration || 0;
}

function getWait(entry) {
  return entry.estimatedWait || entry.estimated_wait || 0;
}

function minutesAgoFromIso(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (diffMin === 0) return "Just now";
  if (diffMin === 1) return "1 min ago";
  return diffMin + " min ago";
}

async function loadDashboard() {
  try {
    const queue = await fetchApi("http://localhost:3000/api/queue");
    const services = await fetchApi("http://localhost:3000/api/services");

    let notifications = [];
    try {
      const currentUser = JSON.parse(localStorage.getItem("qs_user") || "{}");
      const userName = currentUser.name || currentUser.email || "";

      notifications = await fetchApi(
        "http://localhost:3000/api/history/notifications/" + encodeURIComponent(userName)
      );
    } catch {
      notifications = [];
    }

    const currentEntry = queue[0] || {
      status: "waiting",
      position: "—",
      estimatedWait: "—"
    };

    const statusText = currentEntry.status
      ? currentEntry.status.charAt(0).toUpperCase() + currentEntry.status.slice(1)
      : "—";

    document.getElementById("statusText").textContent = statusText;
    document.getElementById("positionText").textContent = currentEntry.position ?? "—";
    document.getElementById("waitText").textContent = getWait(currentEntry) ?? "—";

    const activeServices = services.filter(isActiveService);
    const serviceTable = document.getElementById("serviceTable");

    if (!activeServices.length) {
      serviceTable.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center; padding:28px;">
            No active services found.
          </td>
        </tr>
      `;
    } else {
      serviceTable.innerHTML = activeServices.map(service => `
        <tr>
          <td><strong>${service.name}</strong></td>
          <td>${getDuration(service)} min</td>
          <td><span class="pill pill-open">Open</span></td>
        </tr>
      `).join("");
    }

    const notifMeta = document.getElementById("notifMeta");
    const notifList = document.getElementById("notifList");

    notifMeta.textContent = notifications.length + " new";

    if (!notifications.length) {
      notifList.innerHTML = `
        <div class="notif-item">
          <div class="notif-text">No notifications yet.</div>
        </div>
      `;
    } else {
      notifList.innerHTML = notifications.map(n => `
        <div class="notif-item">
          <div class="notif-dot unread"></div>
          <div>
            <div class="notif-text">${n.message || n.serviceName || ""}</div>
            <div class="notif-time">${minutesAgoFromIso(n.created_at || n.timestamp)}</div>
          </div>
        </div>
      `).join("");
    }

  } catch (err) {
    console.error("Dashboard load failed:", err);

    document.getElementById("statusText").textContent = "Error";
    document.getElementById("positionText").textContent = "—";
    document.getElementById("waitText").textContent = "—";

    document.getElementById("serviceTable").innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:28px;">
          Could not load services.
        </td>
      </tr>
    `;

    document.getElementById("notifMeta").textContent = "0 new";
    document.getElementById("notifList").innerHTML = `
      <div class="notif-item">
        <div class="notif-text">Could not load notifications.</div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
window.addEventListener("pageshow", loadDashboard);
