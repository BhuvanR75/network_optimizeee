const express = require("express");
const cors = require("cors");
const http = require("http"); // Import HTTP
const { Server } = require("socket.io"); // Import Socket.io

const app = express();
const PORT = 5000;

// 1. Setup Server & Socket
app.use(cors());
app.use(express.json());

const server = http.createServer(app); // Wrap Express
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Allow your React Frontend URL
        methods: ["GET", "POST"]
    }
});

let metricsStore = [];

// Socket Connection Log
io.on("connection", (socket) => {
    console.log("⚡ Client connected to socket:", socket.id);
    
    // Optional: Send existing history immediately on connection
    socket.emit("init_history", metricsStore);
});

app.post("/api/metrics", (req, res) => {
    const {
        timestamp, bandwidth_mbps, packets_sent, packets_received, 
        packets_dropped, rx_errors, loss_rate, current_capacity_limit, 
        agent_action, agent_reward, agent_epsilon
    } = req.body;

    if (!timestamp) return res.status(400).json({ success: false });

    // 2. Store Data
    metricsStore.push(req.body);
    if (metricsStore.length > 500) metricsStore.shift();

    // 3. EMIT REAL-TIME UPDATE TO UI
    io.emit("metrics_update", req.body);

    // 4. Console Logging (Kept your existing formatting)
    const lossPercent = (loss_rate * 100).toFixed(2);
    let status = "🟢 OPTIMAL";
    if (Math.abs(loss_rate - 0.01) > 0.02) status = "🔴 CRITICAL";
    else if (Math.abs(loss_rate - 0.01) > 0.005) status = "🟡 TUNING";

    console.log(`\n--- [REAL-TIME PUSH] ---`);
    console.log(`📊 STATUS: ${status} | Loss: ${lossPercent}% | T-Put: ${bandwidth_mbps} Mbps`);
    console.log(`⚡ Action: ${agent_action} | Reward: ${agent_reward}`);

    res.status(200).json({ success: true });
});

app.get("/api/metrics", (req, res) => {
    res.json({ count: metricsStore.length, data: metricsStore });
});

app.delete("/api/metrics", (req, res) => {
    metricsStore = [];
    res.json({ success: true });
});

// Change app.listen to server.listen
server.listen(PORT, () => {
    console.log(`🚀 Real-time Server running on http://localhost:${PORT}`);
});