const express = require("express");
const cors = require("cors");
require("./data/db");

const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");
const queueRoutes = require("./routes/queue");
const servicesRoutes = require("./routes/services");
const reportsRoutes = require("./routes/reports");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QueueSmart backend running"
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
