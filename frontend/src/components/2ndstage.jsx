import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Server, Users, Activity, ArrowLeftRight, X, GitCompare } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- NEW COMPONENT: RESOURCE BRIDGE (Popup Visualization) ---
// Implements "The Resource Bridge" - Muscle Animation Logic
const ResourceBridge = ({ bandwidth, action }) => {
    // 1. Calculate thickness based on bandwidth (e.g., 5.4 Mbps)
    // We scale it so 0 Mbps is thin and 10+ Mbps is thick
    // Using bandwidth (0-100 scale from parent) directly as percentage for this visual
    const pathThickness = Math.max(10, Math.min(100, bandwidth));

    return (
        <div className="flex items-center justify-between w-full h-64 bg-black/80 rounded-2xl p-10 border border-gray-800 shadow-2xl relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            {/* NODE 1: LINK 3 (Donor/Source) */}
            <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center relative shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
                    <span className="font-mono text-xs text-blue-400">L3</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono italic">DONOR</span>
            </div>

            {/* THE DYNAMIC PATH (The Animation Core) */}
            <div className="flex-1 px-4 relative flex flex-col items-center justify-center z-10">

                {/* AI Label */}
                <motion.div
                    initial={false}
                    animate={{ color: action === "DECREASE" ? "#fb923c" : "#22d3ee" }}
                    className="absolute -top-10 font-mono text-[10px] font-bold tracking-[0.2em]"
                >
                    {action === "DECREASE" ? "REDUCING OVERHEAD" : "MAXIMIZING FLOW"}
                </motion.div>

                {/* The "Muscle" Path */}
                <div className="w-full h-24 bg-gray-950/50 rounded-xl relative flex items-center justify-center border-x-2 border-dashed border-gray-800">

                    {/* The Flowing Bandwidth */}
                    <motion.div
                        className="w-full relative overflow-hidden flex items-center rounded-lg"
                        initial={false}
                        animate={{
                            height: `${pathThickness}%`,
                            backgroundColor: action === "DECREASE" ? "rgba(30, 41, 59, 0.5)" : "rgba(6, 182, 212, 0.4)"
                        }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    >
                        {/* Internal Flow Particles */}
                        <motion.div
                            className="absolute inset-0 w-[200%] h-full flex"
                            animate={{ x: action === "DECREASE" ? ["0%", "-50%"] : ["-50%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        >
                            <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.1)_20px,rgba(255,255,255,0.1)_21px)]" />
                        </motion.div>

                        {/* Core Pulse Line */}
                        <motion.div
                            className="w-full h-[2px] bg-cyan-400/50 shadow-[0_0_10px_#22d3ee]"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </motion.div>
                </div>
            </div>

            {/* NODE 2: LINK 2 (Critical/Target) */}
            <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-24 h-24 rounded-full bg-cyan-950/20 border-2 border-cyan-400 flex items-center justify-center relative shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <motion.div
                        animate={{ scale: action === "DECREASE" ? 1 : [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute inset-0 rounded-full border border-cyan-400/30"
                    />
                    <span className="font-mono text-sm text-cyan-400 font-bold">L2</span>
                </div>
                <span className="text-[10px] text-cyan-500 font-mono font-black">TARGET</span>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: CORRELATION HEATMAP ---
// Uses "Black Block" styling to show traffic vs loss correlation
const CellHeatmap = ({ cells }) => (
    <div className="mt-8 border-t border-gray-800 pt-6">
        <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
                <Activity size={10} className="text-cyan-500" /> Correlated Cell Groups (Traffic vs Loss)
            </span>
            <div className="flex gap-2 text-[8px] font-mono text-gray-600">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-900 border border-gray-800" /> HEALTHY</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-200 border border-gray-800" /> LOSS</div>
            </div>
        </div>

        {/* GitHub Style: Flex/Grid with fixed small sizes */}
        <div className="flex flex-wrap gap-[3px]">
            {cells.map((cell, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-3 w-3 border border-gray-800 transition-colors duration-500 rounded-[1px] relative group",
                        cell.hasLoss ? "bg-slate-200 shadow-[0_0_5px_rgba(255,255,255,0.4)]" : "bg-slate-900", // "Black/White" style
                        cell.active && "border-cyan-500/30"
                    )}
                >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-gray-700 text-[8px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        Cell-{i + 1}: {cell.hasLoss ? 'Loss detected' : 'Healthy'}
                    </div>
                </div>
            ))}
        </div>
        <div className="flex justify-between mt-1 text-[8px] font-mono text-gray-700 tracking-widest">
            <span>START</span>
            <span>CORRELATED GROUP #1 (LINK 2)</span>
        </div>
    </div>
);

const Pipe = ({ label, bandwidth, errorRate, isDonor = false }) => {
    // Bandwidth maps directly to width percentage (min 10%, max 100%)
    const widthPercent = Math.max(10, Math.min(100, bandwidth));

    const getColor = (rate) => {
        if (rate > 3) return "from-red-600 to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]"; // Pulsing Red
        if (rate > 1) return "from-yellow-500 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]"; // Warning
        return "from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"; // Optimal
    };

    const isCongested = errorRate > 3;

    return (
        <div className="flex items-center gap-6 w-full mb-10 group">
            <div className="w-24 text-right">
                <div className="text-cyan-100 font-mono text-sm font-bold">{label}</div>
                <div className="text-[10px] text-gray-500 font-mono flex flex-col items-end">
                    <span>{bandwidth.toFixed(2)} %</span>
                    <span className="text-[8px] opacity-50">UTILIZATION</span>
                </div>
            </div>

            <div className="flex-1 h-16 bg-gray-900/40 rounded-r-full rounded-l-md border border-gray-800 relative overflow-visible backdrop-blur-sm">
                {/* The Pipe Content - Physical Expansion */}
                <motion.div
                    className={cn(
                        "h-full rounded-r-full rounded-l-md bg-gradient-to-r relative overflow-hidden transition-colors duration-500",
                        getColor(errorRate)
                    )}
                    initial={false}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 20, duration: 2 }} // Smoother transition
                >
                    {/* Flow Animation (Slower = Less Bandwidth, Faster = More) */}
                    <motion.div
                        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 relative"
                    />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: Math.max(0.5, 2 - (widthPercent / 100)), ease: "linear" }}
                        style={{ skewX: -20 }}
                    />
                </motion.div>

                {/* Congestion Pulse Overlay */}
                <AnimatePresence>
                    {isCongested && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: [0, 0.4, 0], scale: [1, 1.05, 1] }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="absolute inset-0 rounded-r-full rounded-l-md bg-red-500/20 border-2 border-red-500/50 z-20 pointer-events-none"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Metrics & Critic Feedback */}
            <div className="w-32 font-mono text-xs pl-4 border-l border-gray-800">
                <div className={cn("text-2xl font-black tracking-tighter", isCongested ? "text-red-500 animate-pulse" : "text-emerald-400")}>
                    {errorRate.toFixed(2)}%
                </div>
                <div className="text-gray-500 text-[10px] flex justify-between">
                    <span>LOSS</span>
                    {isDonor && <span className="text-blue-400 font-bold">DONOR</span>}
                </div>
            </div>
        </div>
    );
};

const BufferGauge = ({ level, label }) => {
    // Level 0-100
    const isCritical = level > 80;

    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className="relative w-8 h-32 bg-gray-900 border border-gray-700 rounded-full overflow-hidden">
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent z-20 pointer-events-none" />

                {/* Liquid Level */}
                <motion.div
                    className={cn(
                        "absolute bottom-0 w-full transition-colors duration-300",
                        isCritical ? "bg-gradient-to-t from-red-600 to-red-400" : "bg-gradient-to-t from-cyan-600 to-blue-400"
                    )}
                    initial={{ height: "0%" }}
                    animate={{ height: `${level}%` }}
                    transition={{ type: "spring", bounce: 0, damping: 15 }}
                />

                {/* Tick Marks */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between py-2 px-1 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full h-px bg-gray-800/50" />
                    ))}
                </div>
            </div>
            <span className={cn("text-[10px] font-mono font-bold transition-colors", isCritical ? "text-red-400" : "text-gray-500")}>
                {level.toFixed(0)}%
            </span>
        </div>
    );
};

const Dashboard = () => {
    // --- SIMULATION STATE ---
    // Links: [Link 2 (Critical), Link 3 (Donor), Link 4 (Donor)]
    const [history, setHistory] = useState([]);
    const [time, setTime] = useState(0);
    const [heatmapCells, setHeatmapCells] = useState(Array(24).fill({ hasLoss: false, active: true }));
    const [isBridgeOpen, setIsBridgeOpen] = useState(false); // Popup State


    // AI Constants from Backend Logs
    const CAPACITY_LIMIT = 9.4; // Mbps
    const TARGET_LOSS = 1.0; // %
    const REWARD = -2;
    const EXPLORATION = 0.06;
    const ACTION = "HOLD";

    // Core parameters that the "AI" manipulates
    const [state, setState] = useState({
        link2: { bandwidth: 90, buffer: 10, loss: 0.00 }, // Initial state from logs
        link3: { bandwidth: 60, buffer: 5, loss: 0.2 },
        link4: { bandwidth: 40, buffer: 5, loss: 0.1 }
    });
    const [aiState, setAiState] = useState({
        action: "HOLD ▬",
        reward: 0,
        epsilon: 0
    });

    // --- POPUP DEMO STATE ---
    // Auto-oscillate the values when popup is open to show off the animation
    // const [demoBandwidth, setDemoBandwidth] = useState(50);
    // const [demoAction, setDemoAction] = useState("EXPAND");

    // useEffect(() => {
    //     if (isBridgeOpen) {
    //         const interval = setInterval(() => {
    //             setDemoBandwidth(prev => prev > 50 ? 20 : 95); // Big swings for visibility
    //             setDemoAction(prev => prev === "EXPAND" ? "DECREASE" : "EXPAND");
    //         }, 3000); // 3-second breathing cycle
    //         return () => clearInterval(interval);
    //     }
    // }, [isBridgeOpen]);

    useEffect(() => {
        const fetchLatestMetrics = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/metrics');
                const result = await response.json();
                console.log("API Response:", result);

                if (result.data && result.data.length > 0) {
                    // Get the very last entry sent by the Python script
                    const latest = result.data[result.data.length - 1];
                    const capacity = latest.current_capacity_limit || 10; // Prevent div by zero

                    // 1. Update the AI Labels
                    setAiState({
                        // Store the raw action for the header ("DECREASE ▼" or "HOLD ▬")
                        action: latest.agent_action || "INITIALIZING...",
                        reward: latest.agent_reward !== undefined ? latest.agent_reward : 0,
                        epsilon: latest.agent_epsilon !== undefined ? latest.agent_epsilon : 0
                    });

                    // 2. Update the visual Pipes and Gauges
                    setState(curr => ({
                        ...curr,
                        link2: {
                            // Ratio of actual throughput to current AI-set limit
                            bandwidth: (latest.bandwidth_mbps / capacity) * 100,
                            loss: latest.loss_rate * 100, // Convert to percentage
                            buffer: (latest.bandwidth_mbps / capacity) * 90
                        },
                        // Link 3 & 4 remain static background actors for now, just adding slight noise
                        link3: { ...curr.link3, bandwidth: 60 + Math.random() * 2, loss: 0.1 },
                        link4: { ...curr.link4, bandwidth: 40 + Math.random() * 2, loss: 0.1 }
                    }));

                    // 3. Update the Graph
                    setTime(t => t + 1);
                }
            } catch (err) {
                console.error("Dashboard failed to reach Metrics Server:", err);
            }
        };

        const interval = setInterval(fetchLatestMetrics, 1000); // Sync every 1s
        return () => clearInterval(interval);
    }, []);

    // --- HISTORY TRACKER (The Graph) ---
    useEffect(() => {
        setHistory(prev => {
            const newPoint = {
                time: time,
                l2: state.link2.loss,
                l3: state.link3.loss,
                l4: state.link4.loss
            };
            const newHistory = [...prev, newPoint];
            if (newHistory.length > 25) newHistory.shift();
            return newHistory;
        });
    }, [time, state]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6 font-sans overflow-hidden flex flex-col selection:bg-cyan-500/30 relative">

            {/* --- POPUP MODAL (RESOURCE BRIDGE) --- */}
            <AnimatePresence>
                {isBridgeOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        {/* Close Button - Outside the modal for easy click, or top right inside */}
                        <div className="absolute top-10 right-10 z-50">
                            <button
                                onClick={() => setIsBridgeOpen(false)}
                                className="group flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                                <span className="text-xs font-mono font-bold text-red-400 group-hover:text-white">CLOSE VIEW</span>
                                <X size={18} className="text-red-400 group-hover:text-white" />
                            </button>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-[900px] bg-[#0c0c0e] border border-gray-800 rounded-2xl p-8 shadow-2xl relative"
                        >
                            <h2 className="text-xl font-bold font-mono text-cyan-400 mb-6 flex items-center gap-2">
                                <GitCompare size={20} />
                                CROSS-LINK RESOURCE ALLOCATION (DEMO MODE)
                            </h2>

                            {/* We use the demo state here to show off the animation */}
                            <ResourceBridge
                                bandwidth={state.link2.bandwidth}
                                action={aiState.action && aiState.action.includes("DECREASE") ? "DECREASE" : "EXPAND"}
                            />

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
                                    <h4 className="text-[10px] text-gray-500 font-mono mb-2">SOURCE METRICS (L3)</h4>
                                    <div className="flex justify-between text-sm font-mono">
                                        <span>Capacity excess:</span>
                                        <span className="text-blue-400">+12%</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-mono">
                                        <span>Jitter:</span>
                                        <span className="text-blue-400">4ms</span>
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
                                    <h4 className="text-[10px] text-gray-500 font-mono mb-2">TARGET HEALTH (L2)</h4>
                                    <div className="flex justify-between text-sm font-mono">
                                        <span>SLA Status:</span>
                                        <span className="text-green-400">COMPLIANT</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-mono">
                                        <span>Predicted Loss:</span>
                                        <span className="text-green-400">0.02%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex justify-between items-end border-b border-gray-800 pb-4 mb-4">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                        NEURO-FLOW V2.0
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                        <Activity size={12} className="text-emerald-500" />
                        <span>AGENT: DEEP Q-NETWORK (DQN)</span>
                        <span className="text-gray-700">|</span>
                        <span>ACTION: <span className="text-yellow-400 font-bold">{aiState.action}</span></span>
                        <span className="text-gray-700">|</span>
                        <span>STATUS: <span className="text-cyan-400">SYSTEM ONLINE</span></span>
                    </div>
                </div>

                {/* Backend Telemetry Badge */}
                <div className="flex flex-col items-end text-[10px] font-mono text-gray-500">
                    <div>SERVER: <span className="text-green-500">ONLINE</span></div>
                    <div>EXPLORATION (ε): <span className="text-white">{aiState.epsilon.toFixed(4)}</span></div>
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 grid grid-cols-12 gap-6 relative">

                {/* Visual Layer - Pipes & Buffers (The "Actor") */}
                <div className="col-span-8 flex flex-col justify-center relative pr-8">
                    {/* Brain Overlay with pulsing based on Exploration Rate */}
                    <div className="absolute top-0 right-0 p-4 pointer-events-none transition-opacity duration-1000" style={{ opacity: EXPLORATION * 2 }}>
                        <Brain size={200} className="text-purple-500 animate-pulse" />
                    </div>

                    <div className="flex items-end mb-8">
                        <h2 className="text-xs font-mono text-gray-500 mb-4 block w-full border-b border-gray-800/50 pb-2">
                            ACTIVE TOPOLOGY Map & BANDWIDTH ALLOCATION
                        </h2>
                    </div>

                    <div className="flex w-full items-center relative">
                        <div className="w-full">
                            <Pipe label="LINK 2 (CRIT)" bandwidth={state.link2.bandwidth} errorRate={state.link2.loss} />
                        </div>
                        <div className="pl-4 pb-10">
                            <BufferGauge level={state.link2.buffer} label="L2" />
                        </div>

                        {/* --- BRIDGE TRIGGER BUTTON (Gap between L2 and L3) --- */}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20">
                            <button
                                onClick={() => setIsBridgeOpen(true)}
                                className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-purple-500/50 rounded-full text-[10px] font-bold text-purple-400 hover:bg-purple-900/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            >
                                <GitCompare size={12} />
                                VIEW RESOURCE BRIDGE
                            </button>
                        </div>
                    </div>

                    <div className="flex w-full items-center opacity-80 mt-2">
                        <div className="w-full">
                            <Pipe label="LINK 3 (DONOR)" bandwidth={state.link3.bandwidth} errorRate={state.link3.loss} isDonor />
                        </div>
                        <div className="pl-4 pb-10">
                            <BufferGauge level={state.link3.buffer} label="L3" />
                        </div>
                    </div>

                    <div className="flex w-full items-center opacity-60">
                        <div className="w-full">
                            <Pipe label="LINK 4" bandwidth={state.link4.bandwidth} errorRate={state.link4.loss} />
                        </div>
                        <div className="pl-4 pb-10">
                            <BufferGauge level={state.link4.buffer} label="L4" />
                        </div>
                    </div>

                    {/* NEW HEATMAP COMPONENT */}
                    <CellHeatmap cells={heatmapCells} />
                </div>

                {/* Data Layer - The "Critic" & History */}
                <div className="col-span-4 flex flex-col gap-4 bg-gray-900/20 rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm">
                    <h3 className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
                        <Activity size={14} />
                        REAL-TIME LOSS HISTORY
                    </h3>

                    <div className="flex-1 w-full min-h-0 bg-gray-950/50 rounded-lg border border-gray-800 relative overflow-hidden" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 6]} hide />

                                {/* 1% Stability Threshold */}
                                <ReferenceLine y={1} stroke="#22d3ee" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: "TARGET (1%)", fill: "#22d3ee", fontSize: 10 }} />

                                <Line
                                    type="monotone"
                                    dataKey="l2"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={false}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="l3"
                                    stroke="#06b6d4"
                                    strokeWidth={1.5}
                                    dot={false}
                                    strokeOpacity={0.5}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Legend */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 pointer-events-none">
                            <div className="flex items-center gap-2 text-[10px] font-mono">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-gray-400">LINK 2 (TARGET)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-50" />
                                <span className="text-gray-400">LINK 3 (DONOR)</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {/* Stats Cards - Located at the bottom of the right-hand column */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">Q-VALUE (REWARD)</div>

                            {/* CHANGE 1: Use aiState.reward instead of REWARD */}
                            {/* CHANGE 2: Dynamic text color (Green for positive, Red for negative) */}
                            <div className={cn(
                                "text-xl font-bold font-mono",
                                aiState.reward >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                                {aiState.reward.toFixed(2)}
                            </div>

                            {/* CHANGE 3: Dynamic label based on the reward value */}
                            <div className="text-[8px] text-red-500/60 mt-1 uppercase">
                                {aiState.reward < 0 ? "Penalty: Optimizing..." : "Reward: Stable"}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">ACTUAL T-PUT</div>
                            <div className="text-xl font-bold text-white font-mono">
                                {state.link2.bandwidth.toFixed(1)}% <span className="text-[10px] text-gray-500">of Cap</span>
                            </div>
                            <div className="text-[8px] text-gray-500 mt-1 uppercase">
                                CAPACITY: {CAPACITY_LIMIT} Mbps
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
