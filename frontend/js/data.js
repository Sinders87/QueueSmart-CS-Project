console.log("data.js loaded");

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error("Failed to load " + path + " (" + res.status + ")");
  }
  return await res.json();
}

async function loadServices() {
  return await fetchJson("http://localhost:3000/api/services");
}

async function loadQueue() {
  return await fetchJson("http://localhost:3000/api/queue");
}

async function loadHistory() {
  return await fetchJson("http://localhost:3000/api/history");
}

async function loadNotifications() {
  return await fetchJson("http://localhost:3000/api/history");
}

window.loadServices = loadServices;
window.loadQueue = loadQueue;
window.loadHistory = loadHistory;
window.loadNotifications = loadNotifications;
