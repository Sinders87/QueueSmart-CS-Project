async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    // Fallback mock data (used when opening via file:// without a local server)
    if (path.includes("queue"))         return mockQueue();
    if (path.includes("services"))      return mockServices();
    if (path.includes("notifications")) return mockNotifications();
    return [];
  }
}

function mockQueue() {
  return [
    { id: 1, userId: "u1", status: "Waiting", position: 3, estimatedWait: 12 },
    { id: 2, userId: "u2", status: "Waiting", position: 2, estimatedWait: 8  }
  ];
}

function mockServices() {
  return [
    { name: "General Enquiry",    priority: "Low",    expectedDuration: 10, isActive: true  },
    { name: "Technical Support",  priority: "High",   expectedDuration: 25, isActive: true  },
    { name: "Billing Assistance", priority: "Medium", expectedDuration: 15, isActive: true  },
    { name: "Account Setup",      priority: "Medium", expectedDuration: 20, isActive: false },
    { name: "Complaints",         priority: "High",   expectedDuration: 30, isActive: true  }
  ];
}

function mockNotifications() {
  return [
    { message: "You moved up to position 3 in the queue.",  time: "2 min ago",  read: false },
    { message: "Technical Support queue is now open.",       time: "10 min ago", read: false },
    { message: "Your session was saved successfully.",       time: "1 hr ago",   read: true  }
  ];
}

async function loadDashboard() {
  const queue         = await loadJSON("../mock-data/queue.json");
  const services      = await loadJSON("../mock-data/services.json");
  const notifications = await loadJSON("../mock-data/notifications.json");

  // --- Queue Status ---
  const user = queue[1] || queue[0];
  document.getElementById("statusText").textContent   = user.status;
  document.getElementById("positionText").textContent = user.position;
  document.getElementById("waitText").textContent     = user.estimatedWait;

  // --- Services Table ---
  document.getElementById("serviceTable").innerHTML = services.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td style="color:${s.priority === 'High' ? '#222' : s.priority === 'Medium' ? '#555' : '#888'};
                 font-weight:${s.priority === 'High' ? 'bold' : 'normal'}">
        ${s.priority}
      </td>
      <td>${s.expectedDuration} min</td>
      <td>
        <span class="pill ${s.isActive ? 'pill-open' : 'pill-closed'}">
          ${s.isActive ? 'Open' : 'Closed'}
        </span>
      </td>
    </tr>
  `).join("");

  // --- Notifications ---
  const unread = notifications.filter(n => !n.read).length;
  document.getElementById("notifMeta").textContent  = unread + " unread";
  document.getElementById("notifList").innerHTML = notifications.map(n => `
    <div class="notif-item">
      <div class="notif-dot ${n.read ? '' : 'unread'}"></div>
      <div>
        <div class="notif-text">${n.message}</div>
        <div class="notif-time">${n.time || ""}</div>
      </div>
    </div>
  `).join("");
}

loadDashboard();
