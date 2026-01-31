import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Server, Users, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

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
                <div className="text-[10px] text-gray-500 font-mono">{bandwidth.toFixed(0)} Gbps</div>
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
                    transition={{ type: "spring", stiffness: 40, damping: 20 }}
                >
                    {/* Flow Animation (Slower = Less Bandwidth, Faster = More) */}
                    <motion.div
                        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 relative"
                    />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: Math.max(0.5, 2 - (bandwidth / 100)), ease: "linear" }}
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
    const [isSurge, setIsSurge] = useState(false);

    // Core parameters that the "AI" manipulates
    const [state, setState] = useState({
        link2: { bandwidth: 30, buffer: 10, loss: 0.5 },
        link3: { bandwidth: 60, buffer: 5, loss: 0.2 },
        link4: { bandwidth: 40, buffer: 5, loss: 0.1 }
    });

    // REFS for precise control of the "Story"
    const surgeTimerRef = useRef(null);

    // --- PHYSICS ENGINE (The Closed-Loop System) ---
    useEffect(() => {
        const tick = setInterval(() => {
            setTime(t => t + 1);

            setState(curr => {
                let next = { ...curr };

                // 1. GENERATE LOAD (Traffic Pattern)
                // Normal Load: Random fluctuations
                // Surge Load: Massive spike targeting Link 2
                const baseLoad = { l2: 25, l3: 20, l4: 15 };
                const noise = () => Math.random() * 5 - 2.5;

                let incomingTraffic = {
                    l2: baseLoad.l2 + noise(),
                    l3: baseLoad.l3 + noise(),
                    l4: baseLoad.l4 + noise()
                };

                if (isSurge) {
                    incomingTraffic.l2 += 50; // MASSIVE spike (Requires ~75Gbps)
                }

                // 2. BUFFER PHYSICS (Queue fill rate)
                // If Traffic > Bandwidth, Buffer Fills. 
                // If Traffic < Bandwidth, Buffer Drains.
                const updateLink = (linkKey, traffic) => {
                    const link = { ...next[linkKey] }; // Shallow copy specific link
                    const capacity = link.bandwidth;

                    // Simple queue theory approximation
                    if (traffic > capacity) {
                        link.buffer = Math.min(100, link.buffer + (traffic - capacity) * 0.8);
                    } else {
                        link.buffer = Math.max(5, link.buffer - (capacity - traffic) * 1.5);
                    }

                    // 3. LOSS CALCULATION (Based on Buffer overflow + Random drop)
                    // If buffer is high, loss grows exponentially
                    if (link.buffer > 80) {
                        link.loss = Math.min(10, link.loss + 0.5); // Fast rise
                    } else if (link.buffer > 50) {
                        link.loss = Math.min(5, link.loss + 0.1);
                    } else {
                        link.loss = Math.max(0.1, link.loss * 0.9); // Decay
                    }

                    return link;
                };

                next.link2 = updateLink('link2', incomingTraffic.l2);
                next.link3 = updateLink('link3', incomingTraffic.l3);
                next.link4 = updateLink('link4', incomingTraffic.l4);

                // --- AI AGENT INTELLIGENCE (The "Actor") ---
                // Rule: If Link 2 Loss > 2.5% AND Buffer > 60%, INTERVENE
                if (next.link2.loss > 2.5 && next.link2.buffer > 60) {
                    // "Steal" bandwidth from Link 3 to Link 2
                    // This is the "Action"
                    const transferAmount = 1.5; // Gbps per tick adjustment (smooth)

                    if (next.link3.bandwidth > 10) {
                        next.link2.bandwidth = Math.min(90, next.link2.bandwidth + transferAmount);
                        next.link3.bandwidth = Math.max(10, next.link3.bandwidth - transferAmount);
                    }
                } else if (!isSurge && next.link2.bandwidth > 30) {
                    // Decay back to normal if surge is over
                    const decay = 0.5;
                    next.link2.bandwidth -= decay;
                    next.link3.bandwidth += decay;
                }

                return next;
            });

        }, 100); // 100ms Tick

        return () => clearInterval(tick);
    }, [isSurge]);

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
            if (newHistory.length > 50) newHistory.shift(); // Keep 5 seconds of data (10tick/s * 5s = 50)
            return newHistory;
        });
    }, [time, state]);

    const handleTriggerSurge = () => {
        setIsSurge(true);
        // Surge lasts for 5 seconds then stops
        if (surgeTimerRef.current) clearTimeout(surgeTimerRef.current);
        surgeTimerRef.current = setTimeout(() => setIsSurge(false), 8000);
    };

    const handleReset = () => {
        setIsSurge(false);
        setState({
            link2: { bandwidth: 30, buffer: 10, loss: 0.5 },
            link3: { bandwidth: 60, buffer: 5, loss: 0.2 },
            link4: { bandwidth: 40, buffer: 5, loss: 0.1 }
        });
        setHistory([]);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6 font-sans overflow-hidden flex flex-col selection:bg-cyan-500/30">
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
                        <span>STATUS: {isSurge ? "INTERVENTION ACTIVE" : "MONITORING"}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 rounded bg-gray-900 border border-gray-700 text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                        RESET SYSTEM
                    </button>
                    <button
                        onClick={handleTriggerSurge}
                        className={cn(
                            "px-6 py-2 rounded text-xs font-bold transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)]",
                            isSurge
                                ? "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-95"
                                : "bg-red-900/20 border border-red-800 text-red-500 hover:bg-red-900/40 hover:scale-105"
                        )}
                    >
                        {isSurge ? "⚠ SURGE IN PROGRESS" : "⚠ INJECT HUGE LOAD"}
                    </button>
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 grid grid-cols-12 gap-6 relative">

                {/* Visual Layer - Pipes & Buffers (The "Actor") */}
                <div className="col-span-8 flex flex-col justify-center relative pr-8">
                    {/* Brain Overlay */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Brain size={200} />
                    </div>

                    <div className="flex items-end mb-2">
                        <h2 className="text-xs font-mono text-gray-500 mb-4 block w-full border-b border-gray-800/50 pb-2">
                            ACTIVE TOPOLOGY Map & BANDWIDTH ALLOCATION
                        </h2>
                    </div>

                    <div className="flex w-full items-center">
                        <div className="w-full">
                            <Pipe label="LINK 2 (CRIT)" bandwidth={state.link2.bandwidth} errorRate={state.link2.loss} />
                        </div>
                        <div className="pl-4 pb-10">
                            <BufferGauge level={state.link2.buffer} label="L2" />
                        </div>
                    </div>

                    <div className="flex w-full items-center opacity-80">
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
                </div>

                {/* Data Layer - The "Critic" & History */}
                <div className="col-span-4 flex flex-col gap-4 bg-gray-900/20 rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm">
                    <h3 className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
                        <Activity size={14} />
                        REAL-TIME LOSS HISTORY
                    </h3>

                    <div className="flex-1 w-full min-h-0 bg-gray-950/50 rounded-lg border border-gray-800 relative overflow-hidden" style={{ height: '300px' }}>
                        {/* The dashed threshold line is rendered by Recharts, but we can exaggerate it here visually if needed */}
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 6]} hide />

                                {/* 3% Critical Threshold */}
                                <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} label={{ value: "SLA LIMIT (3%)", fill: "#ef4444", fontSize: 10 }} />

                                <Line
                                    type="monotone"
                                    dataKey="l2"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="l3"
                                    stroke="#06b6d4"
                                    strokeWidth={1.5}
                                    dot={false}
                                    strokeOpacity={0.5}
                                    isAnimationActive={false}
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
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">Q-VALUE (REWARD)</div>
                            <div className={cn("text-xl font-bold font-mono transition-colors", isSurge ? "text-yellow-400" : "text-green-400")}>
                                {isSurge ? "-0.842" : "+0.994"}
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">TOTAL THROUGHPUT</div>
                            <div className="text-xl font-bold text-white font-mono">
                                {(state.link2.bandwidth + state.link3.bandwidth + state.link4.bandwidth).toFixed(0)} Gbps
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
