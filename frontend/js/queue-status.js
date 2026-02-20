async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return mockQueue();
  }
}

function mockQueue() {
  return [
    { id: 101, serviceId: 1, userName: "Alex",  status: "waiting", position: 1, estimatedWait: 0  },
    { id: 102, serviceId: 1, userName: "Blake", status: "waiting", position: 2, estimatedWait: 15 },
    { id: 201, serviceId: 2, userName: "Casey", status: "waiting", position: 1, estimatedWait: 0  }
  ];
}

// Map status values from queue.json to step IDs
const STATUS_STEP = {
  "waiting":      "step-waiting",
  "almost ready": "step-almost",
  "served":       "step-served"
};

async function loadStatus() {
  const queue = await loadJSON("../mock-data/queue.json");

  // Current user = Blake (position 2)
  const user = queue.find(q => q.userName === "Blake") || queue[0];

  // Capitalise status for display
  const displayStatus = user.status.charAt(0).toUpperCase() + user.status.slice(1);
  document.getElementById("statusText").textContent   = displayStatus;
  document.getElementById("positionText").textContent = user.position;
  document.getElementById("waitText").textContent     = user.estimatedWait;

  // Highlight progress steps
  const steps       = ["step-waiting", "step-almost", "step-served"];
  const activeStep  = STATUS_STEP[user.status.toLowerCase()] || "step-waiting";
  const activeIndex = steps.indexOf(activeStep);

  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove("step-active", "step-done");
    if (i < activeIndex)      el.classList.add("step-done");
    else if (i === activeIndex) el.classList.add("step-active");
  });
}

function leaveQueue() {
  if (confirm("Are you sure you want to leave the queue?")) {
    window.location.href = "user-dashboard.html";
  }
}

loadStatus();
