console.log("data.js loaded");

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error("Failed to load " + path + " (" + res.status + ")");
  }
  return await res.json();
}

async function loadServices() {
  return await fetchJson("../mock-data/services.json");
}

async function loadQueue() {
  return await fetchJson("../mock-data/queue.json");
}

async function loadHistory() {
  return await fetchJson("../mock-data/history.json");
}

async function loadNotifications() {
  return await fetchJson("../mock-data/notifications.json");
}

window.loadServices = loadServices;
window.loadQueue = loadQueue;
window.loadHistory = loadHistory;
window.loadNotifications = loadNotifications;
