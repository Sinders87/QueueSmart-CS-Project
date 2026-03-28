const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");
const queueRoutes = require("./routes/queue");
const servicesRoutes = require("./routes/services");

app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/services", servicesRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QueueSmart backend running"
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
