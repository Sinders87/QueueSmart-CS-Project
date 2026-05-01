const express = require("express");
const router = express.Router();
const db = require("../data/db");

router.get("/queue.csv", (req, res) => {
    const query = `
    SELECT
        qe.id,
        qe.userName,
        s.name AS serviceName,
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

        let csv = "ID,User,Service,Status,Position,Estimated Wait,Join Time\n";

        rows.forEach(row => {
            csv += `${row.id},${row.userName},${row.serviceName},${row.status},${row.position},${row.estimateWait},${row.joinTime}\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=queue-report.csv");
        res.send(csv);
    });

});

module.exports = router;