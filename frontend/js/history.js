async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return mockHistory();
  }
}

function mockHistory() {
  return [
    { id: 1, serviceId: 1, serviceName: "Academic Advising",       date: "2026-02-10", outcome: "served" },
    { id: 2, serviceId: 2, serviceName: "Financial Aid Assistance", date: "2026-02-05", outcome: "left"   }
  ];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

async function loadHistory() {
  const history = await loadJSON("../mock-data/history.json");
  const tbody   = document.getElementById("historyTable");

  if (!history.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:#aaa; text-align:center; padding:28px">No history yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map(h => {
    const pill = h.outcome === "served"
      ? '<span class="pill pill-open">Served</span>'
      : '<span class="pill pill-closed">Left Queue</span>';
    return `
      <tr>
        <td>${formatDate(h.date)}</td>
        <td><strong>${h.serviceName}</strong></td>
        <td>${pill}</td>
      </tr>`;
  }).join("");
}

loadHistory();
