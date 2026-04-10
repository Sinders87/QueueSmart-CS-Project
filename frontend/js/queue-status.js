function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

async function fetchApi(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  const data = await res.json();
  return data.data || data;
}

async function loadHistory() {
  const tbody = document.getElementById("historyTable");

  try {
    const history = await fetchApi("http://localhost:3000/api/history");

    if (!Array.isArray(history) || history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="color:#aaa; text-align:center; padding:28px;">
            No history yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = history.map(item => {
      const pill = item.outcome === "served"
        ? '<span class="pill pill-open">Served</span>'
        : '<span class="pill pill-closed">Left Queue</span>';

      return `
        <tr>
          <td>${formatDate(item.date)}</td>
          <td><strong>${item.serviceName}</strong></td>
          <td>${pill}</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("History load failed:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="color:#aaa; text-align:center; padding:28px;">
          Could not load history.
        </td>
      </tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadHistory);
