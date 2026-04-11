const STATUS_STEP = {
  "waiting": "step-waiting",
  "almost ready": "step-almost",
  "served": "step-served"
};

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

function renderStatusError() {
  document.getElementById("statusText").textContent = "Error";
  document.getElementById("positionText").textContent = "—";
  document.getElementById("waitText").textContent = "—";
}

async function loadStatus() {
  try {
    const queue = await fetchApi("http://localhost:3000/api/queue");
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

    const displayStatus = currentEntry.status
      ? currentEntry.status.charAt(0).toUpperCase() + currentEntry.status.slice(1)
      : "—";

    document.getElementById("statusText").textContent = displayStatus;
    document.getElementById("positionText").textContent = currentEntry.position ?? "—";
    document.getElementById("waitText").textContent = currentEntry.estimatedWait ?? "—";

    const steps = ["step-waiting", "step-almost", "step-served"];
    const activeStep = STATUS_STEP[(currentEntry.status || "waiting").toLowerCase()] || "step-waiting";
    const activeIndex = steps.indexOf(activeStep);

    steps.forEach((id, index) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.classList.remove("step-active", "step-done");

      if (index < activeIndex) {
        el.classList.add("step-done");
      } else if (index === activeIndex) {
        el.classList.add("step-active");
      }
    });
  } catch (err) {
    console.error("Queue status load failed:", err);
    renderStatusError();
  }
}

function leaveQueue() {
  if (confirm("Are you sure you want to leave the queue?")) {
    window.location.href = "user-dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", loadStatus);
