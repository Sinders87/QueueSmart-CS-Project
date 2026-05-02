const express = require("express");
const router = express.Router();
const db = require("../data/db");

// Full queue activity report with users, services, queue activity, and wait times
router.get("/queue.csv", (req, res) => {
  const query = `
    SELECT
      qe.id,
      qe.userName,
      s.name AS serviceName,
      s.expectedDuration,
      s.priority,
      qe.status,
      qe.position,
      qe.estimateWait,
      qe.joinTime
    FROM queue_entries qe
    JOIN services s ON qe.serviceId = s.id
    ORDER BY qe.joinTime DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to generate report." });
    }

    // Section 1: Queue Activity with User and Service Info
    let csv = "=== QUEUESMART REPORT ===\n\n";
    csv += "QUEUE ACTIVITY\n";
    csv += "ID,User,Service,Priority,Status,Position,Estimated Wait (min),Join Time\n";

    rows.forEach(row => {
      csv += `${row.id},${row.userName},${row.serviceName},${row.priority},${row.status},${row.position},${row.estimateWait},${row.joinTime}\n`;
    });

    // Section 2: Wait Time Summary
    csv += "\nWAIT TIME SUMMARY BY SERVICE\n";
    csv += "Service,Total Users,Avg Estimated Wait (min),Users Served,Users Waiting,Users Canceled\n";

    const serviceStats = {};
    rows.forEach(row => {
      if (!serviceStats[row.serviceName]) {
        serviceStats[row.serviceName] = {
          total: 0, totalWait: 0, served: 0, waiting: 0, canceled: 0
        };
      }
      serviceStats[row.serviceName].total++;
      serviceStats[row.serviceName].totalWait += row.estimateWait || 0;
      if (row.status === 'served') serviceStats[row.serviceName].served++;
      if (row.status === 'waiting') serviceStats[row.serviceName].waiting++;
      if (row.status === 'canceled') serviceStats[row.serviceName].canceled++;
    });

    Object.entries(serviceStats).forEach(([name, stats]) => {
      const avg = stats.total > 0 ? (stats.totalWait / stats.total).toFixed(1) : 0;
      csv += `${name},${stats.total},${avg},${stats.served},${stats.waiting},${stats.canceled}\n`;
    });

    // Section 3: User Participation Summary
    csv += "\nUSER PARTICIPATION SUMMARY\n";
    csv += "User,Total Queue Joins,Times Served,Times Left Early\n";

    const userStats = {};
    rows.forEach(row => {
      if (!userStats[row.userName]) {
        userStats[row.userName] = { total: 0, served: 0, canceled: 0 };
      }
      userStats[row.userName].total++;
      if (row.status === 'served') userStats[row.userName].served++;
      if (row.status === 'canceled') userStats[row.userName].canceled++;
    });

    Object.entries(userStats).forEach(([name, stats]) => {
      csv += `${name},${stats.total},${stats.served},${stats.canceled}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=queue-report.csv");
    res.send(csv);
  });
});

module.exports = router;