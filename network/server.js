const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let metricsStore = [];

app.post("/api/metrics", (req, res) => {
    // 1. Destructure all incoming fields
    const {
        timestamp,
        source,
        destination,
        bandwidth_mbps,
        packets_sent,
        packets_received,
        packets_dropped,
        rx_errors,
        loss_rate,
        current_capacity_limit,
        agent_action,
        agent_reward,
        agent_epsilon
    } = req.body;

    if (!timestamp) return res.status(400).json({ success: false });

    // 2. Store Data
    metricsStore.push(req.body);
    if (metricsStore.length > 500) metricsStore.shift();

    // 3. Visual Dashboard Logic
    const lossPercent = (loss_rate * 100).toFixed(2);
    
    // Status Logic
    let status = "🟢 OPTIMAL";
    if (Math.abs(loss_rate - 0.01) > 0.02) status = "🔴 CRITICAL"; // >3% loss or 0%
    else if (Math.abs(loss_rate - 0.01) > 0.005) status = "🟡 TUNING";

    // 4. Print Dashboard
    console.log(`\n=========================================================`);
    console.log(`📡 NETWORK OPTIMIZATION SERVER       ${new Date().toLocaleTimeString()}`);
    console.log(`=========================================================`);
    console.log(`📊 STATUS             : ${status}`);
    console.log(`---------------------------------------------------------`);
    console.log(`📉 Packet Loss        : ${lossPercent} %  (Target: 1.00%)`);
    console.log(`📦 Throughput (Actual): ${bandwidth_mbps} Mbps`);
    console.log(`🚫 Dropped / Errors   : ${packets_dropped} / ${rx_errors || 0}`);
    console.log(`📨 Packets (Tx / Rx)  : ${packets_sent} / ${packets_received}`);
    console.log(`---------------------------------------------------------`);
    console.log(`🧠 AI AGENT STATE`);
    console.log(`---------------------------------------------------------`);
    console.log(`⚙️  Capacity Limit     : ${current_capacity_limit} Mbps`);
    console.log(`⚡  Action Taken       : ${agent_action}`);
    console.log(`🎁  Reward             : ${agent_reward}`);
    console.log(`🎲  Exploration (ε)    : ${agent_epsilon}`);
    console.log(`=========================================================\n`);

    res.status(200).json({ success: true });
});

app.get("/api/metrics", (req, res) => {
    res.json({ count: metricsStore.length, data: metricsStore });
});

app.delete("/api/metrics", (req, res) => {
    metricsStore = [];
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Metrics Server running on http://localhost:${PORT}`);
});