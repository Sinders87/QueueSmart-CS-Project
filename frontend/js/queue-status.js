async function fetchApi(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed: " + url);
  const data = await res.json();
  return data.data || data;
}

function getWait(entry) {
  return entry.estimatedWait || entry.estimated_wait || 0;
}

const STATUS_STEP = {
  "waiting": "step-waiting",
  "almost ready": "step-almost",
  "served": "step-served"
};

async function loadStatus() {
  try {
    const queue = await fetchApi("http://localhost:3000/api/queue");

    const user = queue[0] || {
      status: "waiting",
      position: "—",
      estimatedWait: "—"
    };

    const statusText = user.status
      ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
      : "—";

    document.getElementById("statusText").textContent = statusText;
    document.getElementById("positionText").textContent = user.position ?? "—";
    document.getElementById("waitText").textContent = getWait(user) ?? "—";

    const steps = ["step-waiting", "step-almost", "step-served"];
    const activeStep = STATUS_STEP[(user.status || "waiting").toLowerCase()] || "step-waiting";
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
    console.error("Queue Status failed:", err);
    document.getElementById("statusText").textContent = "Error";
    document.getElementById("positionText").textContent = "—";
    document.getElementById("waitText").textContent = "—";
  }
}

function leaveQueue() {
  if (confirm("Are you sure you want to leave the queue?")) {
    window.location.href = "user-dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", loadStatus);
