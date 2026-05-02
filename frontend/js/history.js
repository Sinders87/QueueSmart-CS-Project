async function loadHistory() {
  const tbody = document.getElementById("historyTable");

  try {
    const res = await fetch("http://localhost:3000/api/history");
    if (!res.ok) throw new Error("Failed to load history");

    const data = await res.json();
    const history = data.data || data;

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
      const dateValue = item.created_at || item.timestamp || item.date;
      const messageValue = item.message || item.serviceName || "Queue activity";
      const statusValue = item.status || item.outcome || "sent";

      return `
        <tr>
          <td>${dateValue ? new Date(dateValue).toLocaleDateString("en-US") : "N/A"}</td>
          <td><strong>${messageValue}</strong></td>
          <td><span class="pill pill-open">${statusValue}</span></td>
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
