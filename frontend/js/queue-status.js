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
    { id: 1, userId: "u1", status: "Waiting",      position: 3, estimatedWait: 12 },
    { id: 2, userId: "u2", status: "Almost Ready",  position: 1, estimatedWait: 2  }
  ];
}

// Maps status string to which step is active
const STATUS_STEP = {
  "Waiting":      "step-waiting",
  "Almost Ready": "step-almost",
  "Served":       "step-served"
};

async function loadStatus() {
  const queue = await loadJSON("../mock-data/queue.json");
  const user  = queue[1] || queue[0];

  document.getElementById("statusText").textContent   = user.status;
  document.getElementById("positionText").textContent = user.position;
  document.getElementById("waitText").textContent     = user.estimatedWait;

  // Highlight the correct step
  const steps = ["step-waiting", "step-almost", "step-served"];
  const activeStep = STATUS_STEP[user.status] || "step-waiting";
  const activeIndex = steps.indexOf(activeStep);

  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    if (i < activeIndex) {
      el.classList.add("step-done");
      el.classList.remove("step-active");
    } else if (i === activeIndex) {
      el.classList.add("step-active");
      el.classList.remove("step-done");
    } else {
      el.classList.remove("step-active", "step-done");
    }
  });
}

function leaveQueue() {
  if (confirm("Are you sure you want to leave the queue?")) {
    window.location.href = "user-dashboard.html";
  }
}

loadStatus();
