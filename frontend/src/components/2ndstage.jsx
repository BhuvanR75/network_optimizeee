import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Router, Server, Activity, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { io } from 'socket.io-client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- COMPONENT: ROUTER NODE ---
const RouterNode = ({ label, ip, isSource = false }) => (
    <div className="flex flex-col items-center gap-4 relative z-20">
        <div className={cn(
            "w-32 h-32 rounded-3xl border-4 flex items-center justify-center relative shadow-[0_0_60px_rgba(0,0,0,0.8)] bg-[#050505] transition-transform duration-500 hover:scale-105",
            isSource ? "border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.3)]" : "border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)]"
        )}>
            <div className="absolute inset-2 border-2 border-dashed border-gray-800 opacity-30 rounded-2xl" />
            <Router size={56} className={cn("relative z-10", isSource ? "text-indigo-400" : "text-cyan-400")} />
            
            {/* Blinking Light */}
            <div className="absolute -top-3 -right-3 w-5 h-5 bg-green-500 rounded-full border-4 border-black animate-pulse shadow-[0_0_15px_#22c55e]" />
        </div>
        <div className="text-center">
            <h3 className="text-2xl font-black font-mono tracking-tighter text-white">{label}</h3>
            <span className="text-xs text-gray-500 font-mono bg-black/50 px-3 py-1 rounded border border-gray-800 backdrop-blur-md">
                {ip}
            </span>
        </div>
    </div>
);

// --- COMPONENT: ULTRA-DYNAMIC LINK ---
const DynamicLink = ({ capacity, throughput, loss }) => {
    // --- THE "MASSIVE FACTOR" SCALING ---
    // Min Capacity (4 Mbps) -> 4px height (Thread)
    // Max Capacity (12 Mbps) -> 450px height (Massive Tunnel)
    // We use a power curve so the growth feels explosive
    
    const minCap = 4.0;
    const maxCap = 12.0;
    const rawPct = Math.max(0, Math.min(1, (capacity - minCap) / (maxCap - minCap)));
    
    // Power curve: Makes higher values significantly larger than lower ones
    const explosivePct = Math.pow(rawPct, 1.5); 
    
    // Map to pixels: 4px to 450px
    const pipeHeight = 4 + (explosivePct * 446);

    const isCongested = loss > 1.5;
    const pipeColor = isCongested ? "rgba(239, 68, 68, 0.9)" : "rgba(6, 182, 212, 0.9)";
    const glowColor = isCongested ? "rgba(239, 68, 68, 0.6)" : "rgba(34, 211, 238, 0.4)";

    return (
        <div className="flex-1 relative h-[500px] flex items-center justify-center px-10 perspective-[1000px]">
            
            {/* Reference Grid lines to show scale */}
            <div className="absolute inset-0 flex flex-col justify-center items-center opacity-20 pointer-events-none">
                 {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-gray-700 my-4" />
                 ))}
            </div>

            {/* BANDWIDTH NUMBER (Floating) */}
            <motion.div 
                className="absolute top-10 z-30 flex flex-col items-center"
                animate={{ y: isCongested ? [0, -5, 0] : 0 }}
            >
                <div className="text-[10px] text-gray-400 font-mono tracking-[0.3em] uppercase bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-gray-800 mb-2">
                    Current Capacity
                </div>
                <div className={cn(
                    "text-5xl font-black font-mono drop-shadow-2xl transition-colors duration-300", 
                    isCongested ? "text-red-500" : "text-white"
                )}>
                    {capacity.toFixed(1)}
                    <span className="text-lg text-gray-500 ml-2">Mbps</span>
                </div>
            </motion.div>

            {/* --- THE PIPE ITSELF --- */}
            <motion.div
                className="w-full relative z-10 rounded-lg border-y-2 overflow-hidden"
                initial={false}
                animate={{ 
                    height: pipeHeight,
                    backgroundColor: isCongested ? "rgba(50,0,0,0.5)" : "rgba(0,20,30,0.5)",
                    borderColor: isCongested ? "#ef4444" : "#22d3ee",
                    boxShadow: `0 0 ${30 + (explosivePct * 100)}px ${glowColor}` // Massive Glow
                }}
                transition={{ type: "spring", stiffness: 40, damping: 15 }}
            >
                {/* 1. Inner Texture (Grid) */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                
                {/* 2. Moving Particles (Data Flow) */}
                <motion.div
                    className="absolute inset-0 w-[200%] h-full flex items-center"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: Math.max(0.1, 1.5 - (throughput / 8)), // Speed Control
                        ease: "linear" 
                    }}
                >
                    {/* The "Data" pattern */}
                    <div className={cn(
                        "w-full h-full",
                        isCongested 
                            ? "bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(239,68,68,0.5)_50px,rgba(239,68,68,0.8)_55px)]"
                            : "bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(34,211,238,0.5)_50px,rgba(255,255,255,0.8)_55px)]"
                    )} />
                </motion.div>

                {/* 3. Congestion Flash Overlay */}
                <AnimatePresence>
                    {isCongested && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.6, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                            className="absolute inset-0 bg-red-600 mix-blend-overlay"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* THROUGHPUT (Bottom Label) */}
            <div className="absolute bottom-10 z-30">
                 <div className="flex items-center gap-3 bg-black/80 px-5 py-2 rounded-full border border-gray-700 backdrop-blur-xl shadow-2xl">
                    <div className={cn("w-3 h-3 rounded-full", isCongested ? "bg-red-500 animate-ping" : "bg-emerald-500 shadow-[0_0_10px_#10b981]")} />
                    <span className="text-xs font-mono text-gray-400 tracking-widest">ACTUAL TRAFFIC:</span>
                    <span className="text-2xl font-bold font-mono text-white">{throughput.toFixed(2)} Mbps</span>
                 </div>
            </div>

        </div>
    );
};


const Dashboard = () => {
    const [socketData, setSocketData] = useState({
        capacity: 10.0,
        throughput: 0.0,
        loss: 0.0,
        action: "INITIALIZING",
        reward: 0
    });
    
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        
        socket.on('metrics_update', (data) => {
            setSocketData({
                capacity: data.current_capacity_limit || 10,
                throughput: data.bandwidth_mbps || 0,
                loss: (data.loss_rate || 0) * 100,
                action: data.agent_action || "HOLD",
                reward: data.agent_reward || 0
            });

            setHistory(prev => {
                const newPoint = {
                    time: new Date().toLocaleTimeString(),
                    loss: (data.loss_rate || 0) * 100
                };
                const newHist = [...prev, newPoint];
                if(newHist.length > 50) newHist.shift();
                return newHist;
            });
        });

        return () => socket.disconnect();
    }, []);

    // Helper for trend icons
    const getActionIcon = () => {
        if(socketData.action.includes("INCREASE")) return <TrendingUp size={20} />;
        if(socketData.action.includes("DECREASE")) return <TrendingDown size={20} />;
        return <Activity size={20} />;
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col p-6 overflow-hidden selection:bg-indigo-500/30">
            
            {/* HEADER */}
            <header className="flex justify-between items-end border-b border-gray-800 pb-6 mb-4 bg-black z-50">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">NEURO</span>-LINK V4
                    </h1>
                    <div className="flex gap-6 text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Server size={14} className="text-emerald-500"/> LIVE SOCKET FEED</span>
                        <span className="text-indigo-400">RL-AGENT: DEEP Q-NETWORK</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Cumulative Reward</div>
                    <div className={cn("text-4xl font-black font-mono", socketData.reward > 0 ? "text-emerald-400" : "text-rose-500")}>
                        {socketData.reward.toFixed(2)}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col gap-6">
                
                {/* 1. VISUALIZATION STAGE (Takes most space) */}
                <div className="flex-[3] bg-[#08080a] rounded-[2rem] border border-gray-900 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                    
                    {/* Deep Space Background Effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-80 pointer-events-none" />
                    
                    {/* Main Stage */}
                    <div className="relative z-10 w-full max-w-7xl flex items-center justify-between gap-12 px-12">
                        <RouterNode label="R1" ip="10.0.0.1" isSource />
                        
                        <DynamicLink 
                            capacity={socketData.capacity} 
                            throughput={socketData.throughput} 
                            loss={socketData.loss}
                        />

                        <RouterNode label="R2" ip="10.0.0.2" />
                    </div>

                    {/* AI Action Pill */}
                    <div className="absolute bottom-8 z-40">
                         <div className={cn(
                             "flex items-center gap-4 px-8 py-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl transition-all duration-300",
                             socketData.action.includes("INCREASE") ? "bg-indigo-950/50 border-indigo-500 text-indigo-200" :
                             socketData.action.includes("DECREASE") ? "bg-orange-950/50 border-orange-500 text-orange-200" :
                             "bg-gray-900/80 border-gray-700 text-gray-400"
                         )}>
                             <div className={cn("p-2 rounded-lg text-black", 
                                 socketData.action.includes("INCREASE") ? "bg-indigo-400" :
                                 socketData.action.includes("DECREASE") ? "bg-orange-400" : "bg-gray-400"
                             )}>
                                 {getActionIcon()}
                             </div>
                             <div>
                                 <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">AI Decision</div>
                                 <div className="text-xl font-black font-mono">{socketData.action}</div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* 2. METRICS ROW */}
                <div className="h-48 grid grid-cols-12 gap-6">
                    
                    {/* Loss Graph */}
                    <div className="col-span-8 bg-gray-900/40 rounded-3xl border border-gray-800 p-6 relative backdrop-blur-sm">
                        <h4 className="absolute top-6 left-6 text-xs font-bold font-mono text-gray-400 flex items-center gap-2">
                            <Activity size={16} className="text-rose-500" /> REAL-TIME PACKET LOSS (%)
                        </h4>
                        <div className="w-full h-full pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <YAxis domain={[0, 6]} hide />
                                    <Line 
                                        type="monotone" 
                                        dataKey="loss" 
                                        stroke="#f43f5e" 
                                        strokeWidth={3} 
                                        dot={false}
                                        isAnimationActive={false} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Efficiency Card */}
                    <div className="col-span-4 bg-gray-900/40 rounded-3xl border border-gray-800 p-6 flex flex-col justify-center items-center backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                        
                        <div className="relative z-10 text-center">
                            <div className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest mb-2">Link Efficiency</div>
                            <div className="text-6xl font-black text-white tracking-tighter">
                                {((socketData.throughput / socketData.capacity) * 100).toFixed(0)}<span className="text-2xl text-gray-600">%</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-800 rounded-full mt-6 overflow-hidden relative z-10">
                            <motion.div 
                                className={cn("h-full transition-all duration-300", 
                                    socketData.loss > 0 ? "bg-rose-500" : "bg-emerald-400"
                                )}
                                animate={{ width: `${Math.min(100, (socketData.throughput / socketData.capacity) * 100)}%` }} 
                            />
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Dashboard;