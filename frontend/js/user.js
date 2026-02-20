async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    if (path.includes("queue"))         return mockQueue();
    if (path.includes("services"))      return mockServices();
    if (path.includes("notifications")) return mockNotifications();
    return [];
  }
}

function mockQueue() {
  return [
    { id: 101, serviceId: 1, userName: "Alex",  status: "waiting", position: 1, estimatedWait: 0  },
    { id: 102, serviceId: 1, userName: "Blake", status: "waiting", position: 2, estimatedWait: 15 },
    { id: 201, serviceId: 2, userName: "Casey", status: "waiting", position: 1, estimatedWait: 0  }
  ];
}

function mockServices() {
  return [
    { id: 1, name: "Academic Advising",     description: "Meet with an academic advisor to discuss degree planning", expectedDuration: 15, priority: "medium", isActive: true },
    { id: 2, name: "Financial Aid Assistance", description: "Help with FAFSA and financial aid questions",           expectedDuration: 20, priority: "high",   isActive: true },
    { id: 3, name: "IT Help Desk",           description: "Technical support for university systems",                expectedDuration: 10, priority: "low",    isActive: true },
    { id: 4, name: "Registration Support",   description: "Assistance with course registration issues",              expectedDuration: 12, priority: "medium", isActive: true }
  ];
}

function mockNotifications() {
  return [
    { id: 1, type: "queue_update",   message: "You joined Academic Advising. Current position: 2", time: "2 min ago" },
    { id: 2, type: "status_change",  message: "You are close to being served",                      time: "Just now"  }
  ];
}

async function loadDashboard() {
  const queue         = await loadJSON("../mock-data/queue.json");
  const services      = await loadJSON("../mock-data/services.json");
  const notifications = await loadJSON("../mock-data/notifications.json");

  // Show Blake's entry (position 2) as the current user
  const user = queue.find(q => q.userName === "Blake") || queue[0];

  document.getElementById("statusText").textContent   = user.status.charAt(0).toUpperCase() + user.status.slice(1);
  document.getElementById("positionText").textContent = user.position;
  document.getElementById("waitText").textContent     = user.estimatedWait;

  // Active services
  const activeServices = services.filter(s => s.isActive);
  document.getElementById("serviceTable").innerHTML = activeServices.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.expectedDuration} min</td>
      <td><span class="pill pill-open">Open</span></td>
    </tr>
  `).join("");

  // Notifications
  document.getElementById("notifMeta").textContent = notifications.length + " new";
  document.getElementById("notifList").innerHTML = notifications.map(n => `
    <div class="notif-item">
      <div class="notif-dot unread"></div>
      <div>
        <div class="notif-text">${n.message}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join("");
}

loadDashboard();
