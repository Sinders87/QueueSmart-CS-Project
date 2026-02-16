async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Failed to load " + path);
  return await res.json();
}

async function getServices() {
  return await loadJson("../mock-data/services.json");
}

async function getQueue() {
  return await loadJson("../mock-data/queue.json");
}

async function getHistory() {
  return await loadJson("../mock-data/history.json");
}

async function getNotifications() {
  return await loadJson("../mock-data/notifications.json");
}

