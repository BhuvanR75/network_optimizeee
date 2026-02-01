import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Activity, ShieldCheck, Zap, Network, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- CONFIGURATION ---
const SCENES = [
    { id: 0, duration: 4000, label: "SCENE 1: INITIAL TOPOLOGY (NORMAL STATE)" },
    { id: 1, duration: 4000, label: "SCENE 2: TRAFFIC INCREASE" },
    { id: 2, duration: 4000, label: "SCENE 3: CONGESTION EVENT" },
    { id: 3, duration: 3000, label: "SCENE 4: AI xAPP ACTIVATION" },
    { id: 4, duration: 5000, label: "SCENE 5: CELL MIGRATION" },
    { id: 5, duration: 5000, label: "SCENE 6: NETWORK OPTIMIZED" },
    { id: 6, duration: 99999, label: "FINAL: AI-DRIVEN FRONTHAUL OPTIMIZATION" }
];

// Node Positions (Grid Percentage)
const POS = {
    DU: { x: 50, y: 15 },
    AGG_A: { x: 30, y: 40 },
    AGG_B: { x: 70, y: 40 },
    CELL_1: { x: 20, y: 80 }, // The Migrant
    CELL_2: { x: 35, y: 80 },
    CELL_3: { x: 65, y: 80 },
    CELL_4: { x: 80, y: 80 },
};

const LoadBalancingDemo = () => {
    const [sceneIdx, setSceneIdx] = useState(0);
    const scene = SCENES[sceneIdx];

    // --- TIMELINE CONTROLLER ---
    useEffect(() => {
        let timer;
        const playSequence = async () => {
            for (let i = 0; i < SCENES.length; i++) {
                setSceneIdx(i);
                await new Promise(r => setTimeout(r, SCENES[i].duration));
            }
        };
        playSequence();
        return () => clearTimeout(timer);
    }, []);

    // --- MIGRATION ANIMATION STATE ---
    // In Scene 5, Cell 1 moves from Agg A to Agg B
    const isMigration = sceneIdx === 4;
    const isPostMigration = sceneIdx >= 5;

    return (
        <div className="w-full h-screen bg-[#02040a] text-white overflow-hidden flex flex-col items-center justify-center relative font-mono selection:bg-blue-500/30">

            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0f172a_0%,#02040a_100%)] pointer-events-none" />
            <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] opacity-5 pointer-events-none">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="border-r border-blue-500/20 h-full" />
                ))}
            </div>

            {/* HEADER */}
            <div className="absolute top-8 left-8 z-50">
                <h1 className="text-xl font-bold tracking-widest text-gray-500 uppercase mb-2">
                    5G O-RAN DASHBOARD
                </h1>
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse",
                        sceneIdx === 2 ? "bg-red-500" : "bg-green-500"
                    )} />
                    <span className="text-sm font-bold text-blue-400">{scene.label}</span>
                </div>
            </div>

            {/* --- MAIN STAGE --- */}
            <div className="relative w-full max-w-4xl h-[600px] z-10 transition-all duration-1000">

                {/* SVG CONNECTIONS */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <linearGradient id="linkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>

                    {/* DU Connections */}
                    <Link start={POS.DU} end={POS.AGG_A} />
                    <Link start={POS.DU} end={POS.AGG_B} />

                    {/* AGG A Connections */}
                    {/* The Problem Link: Agg A -> Cell 1 */}
                    {/* During migration (Scene 5), this link fades. After (Scene 6), it's gone. */}
                    {!isPostMigration && (
                        <Link
                            start={POS.AGG_A}
                            end={isMigration ? { x: 45, y: 70 } : POS.CELL_1} // Detach animation simulated
                            status={sceneIdx === 2 ? 'critical' : sceneIdx === 1 ? 'warning' : 'normal'}
                            isMigrating={isMigration}
                        />
                    )}

                    <Link start={POS.AGG_A} end={POS.CELL_2} />

                    {/* AGG B Connections */}
                    <Link start={POS.AGG_B} end={POS.CELL_3} />
                    <Link start={POS.AGG_B} end={POS.CELL_4} />

                    {/* NEW LINK: Agg B -> Cell 1 (Appears AFTER migration) */}
                    {isPostMigration && (
                        <Link
                            start={POS.AGG_B}
                            end={{ x: 55, y: 80 }}
                            status="new"
                            opacity={1}
                        />
                    )}

                </svg>

                {/* NODES */}
                {/* DU */}
                <Node pos={POS.DU} type="DU" label="Central DU" />

                {/* AGGREGATORS */}
                <Node pos={POS.AGG_A} type="AGG" label="Agg Link A" />
                <Node pos={POS.AGG_B} type="AGG" label="Agg Link B" />

                {/* CELLS */}
                {/* Cell 1: The Migrant */}
                <MigratingNode
                    pos={POS.CELL_1}
                    targetNode={POS.AGG_B} // Visual target parent for context
                    sceneIdx={sceneIdx}
                    label="Cell-01"
                />

                <Node pos={POS.CELL_2} type="CELL" label="Cell-02" />
                <Node pos={POS.CELL_3} type="CELL" label="Cell-03" />
                <Node pos={POS.CELL_4} type="CELL" label="Cell-04" />

                {/* OVERLAYS & LABELS */}
                {/* Congestion Warning (Scene 3) */}
                <AnimatePresence>
                    {sceneIdx === 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute z-50 bg-red-900/80 border border-red-500 text-red-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-2"
                            style={{ left: "22%", top: "60%" }}
                        >
                            <Activity size={12} className="animate-pulse" />
                            CONGESTION DETECTED
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* xApp Activation (Scene 4) */}
                <AnimatePresence>
                    {sceneIdx === 3 && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute z-50 bg-blue-900/80 wireframe-border text-blue-200 px-6 py-4 rounded-xl flex flex-col items-center gap-2 backdrop-blur-md"
                            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                        >
                            <Zap size={24} className="text-blue-400" />
                            <div className="text-lg font-bold">FH-Balancer-xApp ACTIVATED</div>
                            <div className="text-[10px] text-blue-300/70">CALCULATING OPTIMAL TOPOLOGY...</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Optimization Confirmed (Scene 6) */}
                <AnimatePresence>
                    {sceneIdx === 5 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="absolute top-20 right-20 text-green-500 flex flex-col items-end"
                        >
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <ShieldCheck /> NETWORK OPTIMIZED
                            </div>
                            <div className="text-xs text-green-500/50">DATA FLOW NORMALIZED</div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* FINAL TITLE CARD (Scene 7+) */}
            <AnimatePresence>
                {sceneIdx >= 6 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
                        className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center text-center p-8"
                    >
                        <motion.div
                            initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.5, duration: 1 }}
                        >
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4 drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
                                AI-DRIVEN FRONTHAUL OPTIMIZATION xAPP
                            </h1>
                            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6 rounded-full" />
                            <p className="text-gray-400 text-lg tracking-widest font-light">
                                TOPOLOGY INFERENCE • LOAD BALANCING • CONGESTION CONTROL
                            </p>
                            <div className="mt-12 flex gap-8 justify-center opacity-50">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center"><Network size={20} className="text-blue-500" /></div>
                                    <span className="text-[10px]">AUTO-SCALING</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center"><Activity size={20} className="text-blue-500" /></div>
                                    <span className="text-[10px]">REACTIVE</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

// --- SUB-COMPONENTS ---

const Node = ({ pos, type, label }) => {
    let style = "bg-gray-900 border-gray-700";
    let size = "w-4 h-4";

    if (type === 'DU') {
        style = "bg-black border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]";
        size = "w-16 h-16";
    } else if (type === 'AGG') {
        style = "bg-black border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]";
        size = "w-8 h-8";
    } else if (type === 'CELL') {
        style = "bg-gray-900 border-green-500/50";
        size = "w-6 h-6";
    }

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
            <div className={cn("rounded-full border-2 flex items-center justify-center z-10", size, style)}>
                {type === 'DU' && <Network size={24} className="text-blue-500" />}
            </div>
            <span className="mt-2 text-[10px] text-gray-500 font-bold tracking-wider whitespace-nowrap">{label}</span>
        </div>
    );
};

const MigratingNode = ({ pos, targetNode, sceneIdx, label }) => {
    // Scene 4: Highlight Blue
    // Scene 5: Migrate
    // Scene 6+: Happy Green

    const isSelected = sceneIdx === 3;
    const isMigrating = sceneIdx === 4;
    const isOptimized = sceneIdx >= 5;

    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            animate={isMigrating ? {
                // Bezier-like curve? Framer motion handles standard tween mostly
                // We'll approximate the shift to Agg B's side.
                // Agg B is at x:70. If Cell 1 is at 20, typical child of Agg A.
                // It stays at y:80 but the LINK changes.
                // BUT the prompt says "Cell smoothly travels... to a under-utilized green link"
                // It implies attachment. Let's physically move it slightly closer to Agg B's cluster.
                left: "60%",
                x: 0
            } : {}}
            transition={{ duration: 4, type: "spring", bounce: 0.2 }}
        >
            <motion.div
                animate={isSelected ? { scale: 1.2, borderColor: "#3b82f6", boxShadow: "0 0 20px #3b82f6" }
                    : isOptimized ? { scale: 1, borderColor: "#22c55e", boxShadow: "0 0 10px #22c55e" }
                        : { borderColor: "#ef4444" } // Inherit bad status initially? Or normal green?
                }
                className={cn(
                    "w-8 h-8 rounded-full border-2 bg-black flex items-center justify-center transition-colors duration-500",
                    isOptimized ? "border-green-500" : isSelected ? "border-blue-500" : "border-gray-600"
                )}
            >
                <div className={cn("w-2 h-2 rounded-full", isOptimized ? "bg-green-500" : "bg-gray-500")} />
            </motion.div>
            <span className={cn("mt-2 text-[10px] font-bold tracking-wider", isSelected ? "text-blue-400" : "text-gray-500")}>
                {label}
            </span>
        </motion.div>
    );
};

const Link = ({ start, end, status = 'normal', isMigrating, opacity = 1 }) => {
    // Status: normal (green), warning (yellow), critical (red), new (blue/green)

    let stroke = "#22c55e"; // Green
    let strokeWidth = 1;
    let strokeOpacity = 0.3;
    let particleColor = "#22c55e";
    let particleSpeed = 2; // sec
    let particleCount = 3;

    if (status === 'warning') {
        stroke = "#f59e0b";
        strokeOpacity = 0.6;
        particleColor = "#f59e0b";
        particleSpeed = 1.5;
        particleCount = 5;
    } else if (status === 'critical') {
        stroke = "#ef4444";
        strokeWidth = 2;
        strokeOpacity = 0.8;
        particleColor = "#ef4444";
        particleSpeed = 4; // Slow/Jammed
        particleCount = 8;
    } else if (status === 'new') {
        stroke = "#06b6d4";
        strokeOpacity = 0.5;
        particleColor = "#06b6d4";
    }

    if (isMigrating) {
        strokeOpacity = 0.1; // Fading out
    }

    // Particle Animation Path
    // Need exact coordinates for motion path or just CSS animation on line? 
    // Framer motion path is complex without path strings.
    // Simplifying: Rendering SVG Line + CSS Dash array trick for particles

    return (
        <g>
            <motion.line
                x1={`${start.x}%`} y1={`${start.y}%`}
                x2={`${end.x}%`} y2={`${end.y}%`}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity * opacity}
                initial={false}
                animate={{ stroke, strokeWidth, strokeOpacity: strokeOpacity * opacity }}
                transition={{ duration: 1 }}
            />

            {/* TRAFFIC PARTICLES (Simplied as moving dots) */}
            {/* We will just create a few dots that traverse start->end */}
            {!isMigrating && Array.from({ length: particleCount }).map((_, i) => (
                <Particle
                    key={i}
                    start={start}
                    end={end}
                    color={particleColor}
                    duration={particleSpeed}
                    delay={i * (particleSpeed / particleCount)}
                    jammed={status === 'critical'}
                />
            ))}
        </g>
    );
};

const Particle = ({ start, end, color, duration, delay, jammed }) => {
    return (
        <motion.circle
            r={jammed ? 3 : 2}
            fill={color}
            initial={{ cx: `${end.x}%`, cy: `${end.y}%`, opacity: 0 }} // Upstream flow: Cell -> Agg -> DU
            animate={{
                cx: [`${end.x}%`, `${start.x}%`],
                cy: [`${end.y}%`, `${start.y}%`],
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay
            }}
        />
    );
};

export default LoadBalancingDemo;
