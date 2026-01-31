import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Server, Activity, Database, Cpu, Wifi, Network, Clock, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- MOCK DATA ---
const TOTAL_CELLS = 24;
const LINKS = [
    { id: 2, name: "LINK 2 (CRIT)", capacity: 1000 },
    { id: 3, name: "LINK 3 (DONOR)", capacity: 800 },
    { id: 4, name: "LINK 4", capacity: 800 },
];

const generateInitialCells = () => {
    return Array.from({ length: TOTAL_CELLS }, (_, i) => ({
        id: i + 1,
        // Deterministic "True" needs
        trueThroughput: Math.random() > 0.6 ? 450 : 150, // >400 is CRIT
        // Visual State
        currentLink: null, // Initially unassigned/mixed
        tempLink: 2, // For shuffling effect
        isStable: false
    }));
};

// Heatmap Data Generator
const TIME_SLOTS = 20;
const generateHeatmapData = (cells) => {
    // Generate raw time series for each cell
    return cells.map(cell => {
        const isProblematic = cell.trueThroughput > 400; // High load cells have more "loss" blocks
        const history = Array.from({ length: TIME_SLOTS }, (_, t) => {
            const rand = Math.random();
            if (isProblematic && rand > 0.7) return 'LOSS'; // 30% chance of loss block
            if (rand > 0.4) return 'TRAFFIC'; // 60% chance of normal traffic
            return 'IDLE';
        });
        return { cellId: cell.id, history, isProblematic };
    });
};

const FirstStage = () => {
    const [cells, setCells] = useState(generateInitialCells());
    const [stage, setStage] = useState('RAW'); // RAW, OPTIMIZING, OPTIMIZED
    const [shufflingActive, setShufflingActive] = useState(true);

    // Heatmap State
    const [heatmapData, setHeatmapData] = useState([]);
    const [hoveredCell, setHoveredCell] = useState(null);

    // Initial Data Gen
    useEffect(() => {
        setHeatmapData(generateHeatmapData(cells));
    }, []);

    // --- LOGIC: THE SHUFFLE (Stage 1) ---
    // Simulates "Heuristic Analysis" where the system is guessing/ingesting
    useEffect(() => {
        if (!shufflingActive || stage !== 'RAW') return;

        const shuffleInterval = setInterval(() => {
            setCells(prev => prev.map(cell => ({
                ...cell,
                // Randomly bounce between links 2, 3, 4
                tempLink: LINKS[Math.floor(Math.random() * LINKS.length)].id
            })));
        }, 800); // Shuffle every 800ms

        return () => clearInterval(shuffleInterval);
    }, [shufflingActive, stage]);

    // --- LOGIC: THE OPTIMIZATION (Stage 2) ---
    const handleRunOptimization = () => {
        setShufflingActive(false);
        setStage('OPTIMIZING');

        // 1. "Settle" the nodes (Stop shuffling, move to true link)
        setTimeout(() => {
            setCells(prev => prev.map(cell => {
                // Determine Optimal Link based on True Throughput
                const bestLink = cell.trueThroughput > 400 ? 2 : 3;
                return {
                    ...cell,
                    tempLink: bestLink,
                    currentLink: bestLink, // Lock it in
                };
            }));

            // 2. Reveal Colors (Final State)
            setTimeout(() => {
                setStage('OPTIMIZED');
            }, 1000);

        }, 500);
    };

    const handleReset = () => {
        setStage('RAW');
        setShufflingActive(true);
        setCells(generateInitialCells());
    };

    // --- SORTING FOR HEATMAP ---
    // Raw: Sort by ID
    // Optimized: Sort by "Problematic" (Correlated pairs kept together)
    const sortedHeatmapData = [...heatmapData].sort((a, b) => {
        if (stage === 'OPTIMIZED') {
            // Group problematic cells (Red blocks) at the top
            if (a.isProblematic && !b.isProblematic) return -1;
            if (!a.isProblematic && b.isProblematic) return 1;
            return 0;
        }
        return a.cellId - b.cellId; // Default ID sort
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-8 font-mono overflow-y-auto selection:bg-cyan-500/30">

            <div className="flex gap-8 mb-12">
                {/* --- LEFT: HIERARCHICAL TREE TOPOLOGY --- */}
                <div className="flex-1 flex flex-col items-center relative">

                    {/* LEVEL 1: ROOT (CU) */}
                    <div className="relative z-10 mb-12 flex flex-col items-center">
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-1000 bg-gray-900",
                            stage === 'OPTIMIZED' ? "border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.5)]" : "border-gray-600"
                        )}>
                            <Server size={32} className={stage === 'OPTIMIZED' ? "text-blue-400" : "text-gray-500"} />
                        </div>
                        <div className="mt-2 text-sm font-bold tracking-widest text-gray-500">CENTRALIZED UNIT</div>

                        {/* Cable Trunk */}
                        <div className="absolute top-20 w-px h-12 bg-gray-700" />
                        <div className="absolute top-32 w-2/3 h-px bg-gray-700" /> {/* Horizontal Split */}
                    </div>

                    {/* LEVEL 2 & 3: BRANCHES (LINKS) & LEAVES (CELLS) */}
                    <div className="w-full grid grid-cols-3 gap-8">
                        <LayoutGroup>
                            {LINKS.map(link => (
                                <div key={link.id} className="flex flex-col items-center relative">
                                    {/* Vertical connector from Trunk */}
                                    <div className="absolute -top-12 w-px h-12 bg-gray-700" />

                                    {/* LINK NODE */}
                                    <div className={cn(
                                        "w-full p-3 rounded-lg border-2 mb-4 bg-gray-900/80 backdrop-blur transition-colors duration-1000 flex flex-col items-center z-10",
                                        stage === 'OPTIMIZED'
                                            ? link.id === 2 ? "border-red-500/50 shadow-red-900/20" : "border-cyan-500/50 shadow-cyan-900/20"
                                            : "border-gray-700"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Network size={16} />
                                            <span className="font-bold text-xs">{link.name}</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className={cn("h-full", stage === 'OPTIMIZED' ? (link.id === 2 ? "bg-red-500" : "bg-cyan-500") : "bg-gray-600")}
                                                initial={{ width: "30%" }}
                                                animate={{ width: stage === 'OPTIMIZED' ? (link.id === 2 ? "90%" : "45%") : "30%" }}
                                            />
                                        </div>
                                    </div>

                                    {/* LEAVES (CELLS) */}
                                    <div className="w-full min-h-[300px] border border-dashed border-gray-800 rounded-xl p-2 flex flex-wrap content-start gap-2 bg-black/20">
                                        <AnimatePresence>
                                            {cells.filter(c => c.tempLink === link.id).map(cell => (
                                                <CellNode
                                                    key={cell.id}
                                                    cell={cell}
                                                    stage={stage}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </LayoutGroup>
                    </div>

                </div>

                {/* --- RIGHT: LIVE SHUFFLING METRICS --- */}
                <div className="w-[450px] flex flex-col gap-6">

                    {/* Control Panel */}
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-100 mb-1 flex items-center gap-2">
                            <Activity className={stage === 'OPTIMIZED' ? "text-green-500" : "text-gray-500"} />
                            {stage === 'RAW' ? "HEURISTIC ANALYSIS" : "OPTIMIZATION COMPLETE"}
                        </h2>
                        <p className="text-xs text-gray-500 mb-6 font-mono">
                            {stage === 'RAW'
                                ? "Ingesting raw telemetry using O-RAN xApp..."
                                : "Topology reconfigured for SLA compliance."}
                        </p>

                        <button
                            onClick={stage === 'RAW' ? handleRunOptimization : handleReset}
                            className={cn(
                                "w-full py-4 rounded font-bold tracking-widest transition-all text-sm",
                                stage === 'RAW'
                                    ? "bg-gray-100 text-black hover:scale-[1.02]"
                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            )}
                        >
                            {stage === 'RAW' ? "RUN OPTIMIZATION ALGORITHM" : "RESET SIMULATION"}
                        </button>
                    </div>

                    {/* Simplified Live Table */}
                    <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-800 bg-black/40 font-mono text-[10px] text-gray-500 font-bold flex justify-between tracking-widest">
                            <span>LINK SEGMENT</span>
                            <span>LIVE RU RE-DISTRIBUTION</span>
                            <span>LOAD</span>
                        </div>

                        <div className="flex-1 p-4 space-y-4">
                            {LINKS.map(link => {
                                const activeCells = cells.filter(c => c.tempLink === link.id);
                                const totalLoad = activeCells.reduce((acc, curr) => acc + curr.trueThroughput, 0);

                                return (
                                    <div key={link.id} className="flex flex-col gap-2">
                                        {/* Row Header */}
                                        <div className="flex justify-between items-end border-b border-gray-800 pb-1">
                                            <span className={cn(
                                                "font-bold text-xs transition-colors duration-500",
                                                stage === 'OPTIMIZED'
                                                    ? link.id === 2 ? "text-red-400" : "text-cyan-400"
                                                    : "text-gray-400"
                                            )}>
                                                {link.name}
                                            </span>
                                            <span className="font-mono text-[10px] text-gray-600">{totalLoad} Mbps</span>
                                        </div>

                                        {/* The "Shuffling" Cell List */}
                                        <div className="flex flex-wrap gap-1 min-h-[40px]">
                                            <AnimatePresence mode='popLayout'>
                                                {activeCells.map(cell => (
                                                    <motion.span
                                                        layout
                                                        key={cell.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={cn(
                                                            "text-[9px] px-1.5 py-0.5 rounded border font-mono transition-colors duration-500",
                                                            stage === 'OPTIMIZED'
                                                                ? link.id === 2
                                                                    ? "bg-red-900/20 border-red-500/30 text-red-300"
                                                                    : "bg-cyan-900/20 border-cyan-500/30 text-cyan-300"
                                                                : "bg-gray-800 border-gray-700 text-gray-500"
                                                        )}
                                                    >
                                                        RU{cell.id}
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- BOTTOM: CORRELATED HEATMAP --- */}
            <div className="w-full border-t border-gray-800 pt-8 mt-4">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="text-purple-500" />
                        CORRELATED METRIC GRID
                    </h3>
                    <div className="flex gap-4 text-[10px] font-mono text-gray-500">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 border border-gray-700" /> IDLE</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500/40" /> TRAFFIC</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600" /> LOSS (CRIT)</div>
                    </div>
                </div>

                <div className="grid grid-cols-[60px_1fr] gap-2">
                    {/* Y-Axis Labels (Cell IDs) */}
                    <div className="flex flex-col gap-[2px]">
                        {sortedHeatmapData.map(row => (
                            <div key={row.cellId} className="h-4 text-[10px] font-mono text-gray-500 text-right pr-2 leading-4">
                                RU{row.cellId}
                            </div>
                        ))}
                    </div>

                    {/* The Grid */}
                    <div className="grid grid-cols-20 gap-[2px] w-full">
                        {sortedHeatmapData.map(row => (
                            <React.Fragment key={`row-${row.cellId}`}>
                                {row.history.map((status, i) => (
                                    <motion.div
                                        layout
                                        key={`${row.cellId}-${i}`}
                                        className={cn(
                                            "h-4 w-full rounded-[1px] transition-colors duration-300 relative group",
                                            status === 'LOSS' ? "bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]"
                                                : status === 'TRAFFIC' ? "bg-blue-500/40"
                                                    : "bg-gray-900"
                                        )}
                                        onMouseEnter={() => setHoveredCell(row.cellId)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-gray-700 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
                                            {status} (t{i})
                                        </div>
                                    </motion.div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Correlation Brackets (Overlay) */}
                    {stage === 'OPTIMIZED' && (
                        <div className="col-start-2 border-l-2 border-dashed border-red-500/30 absolute left-[70px] top-[140px] h-[30%] pointer-events-none">
                            <span className="absolute -left-20 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-mono bg-black/80 px-1 border border-red-900">
                                CORRELATED LOSS
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: VISUAL NODE ---
const CellNode = ({ cell, stage }) => {
    // Stage 1: Wireframe / Grayscale
    // Stage 2: Colored
    const isCrit = cell.trueThroughput > 400;

    return (
        <motion.div
            layoutId={`node-${cell.id}`}
            className={cn(
                "w-8 h-8 rounded flex items-center justify-center border text-[8px] font-bold shadow-lg transition-colors duration-1000",
                stage === 'OPTIMIZED'
                    ? isCrit
                        ? "bg-red-500 border-red-400 text-white shadow-red-500/40"
                        : "bg-cyan-500 border-cyan-400 text-white shadow-cyan-500/40"
                    : "bg-gray-800 border-gray-600 text-gray-500"
            )}
        >
            {cell.id}
        </motion.div>
    );
};

export default FirstStage;
