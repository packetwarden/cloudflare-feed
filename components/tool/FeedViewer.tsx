"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type ThreatData, mockThreatData } from "@/lib/data/threats";
import { TelemetryBar } from "@/components/tool/TelemetryBar";

export function FeedViewer() {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<ThreatData | null>(null);

    useEffect(() => {
        setMounted(true);
        // Fetch data from our new Hono worker endpoint
        fetch("/api/feed")
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => {
                console.error("Failed to fetch threat data:", err);
                setData(mockThreatData);
            });

        // Setup polling every 60 seconds for live updates.
        // This matches the KV and Edge cache lifetimes (cacheTtl: 60) to prevent
        // wasted requests that would just return cached data.
        const interval = setInterval(() => {
            fetch("/api/feed")
                .then((res) => res.json())
                .then((json) => setData(json))
                .catch(console.error);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!mounted || !data) return (
        <div className="flex w-full h-[50vh] items-center justify-center font-mono text-muted-foreground animate-pulse text-sm tracking-widest uppercase">
            Initializing telemetry matrix...
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 },
    };

    return (
        <>
            <TelemetryBar lastUpdate={data.metadata.timestamp} />
            <div className="flex flex-col lg:flex-row min-h-screen pt-10">
                {/* Left Pane: Brutalist Telemetry Stats */}
                <aside className="w-full lg:w-1/4 xl:w-1/5 border-b lg:border-b-0 lg:border-r border-border bg-background p-6 flex flex-col gap-12">
                    <div className="space-y-2">
                        <h2 className="font-sans text-sm tracking-widest text-muted-foreground uppercase">
                            Total Event Volume
                        </h2>
                        <div className="font-mono text-5xl font-bold text-foreground">
                            {data.metadata.totalAttacks.toLocaleString()}
                        </div>
                        <div className="font-mono text-xs text-primary pt-2">
                            +12.5% [1H DELTA]
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-sans text-sm tracking-widest text-muted-foreground uppercase">
                            Distinct Threat Actors
                        </h2>
                        <div className="font-mono text-5xl font-bold text-foreground">
                            {data.metadata.totalIPs.toLocaleString()}
                        </div>
                        <div className="font-mono text-xs text-destructive pt-2">
                            ELEVATED RISK
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-sans text-sm tracking-widest text-muted-foreground uppercase pb-2 border-b border-border">
                            Top Attack Vectors
                        </h2>
                        {data.threats
                            .flatMap((t) => t.attackTypes)
                            .reduce((acc, curr) => {
                                const existing = acc.find((item) => item.type === curr.type);
                                if (existing) {
                                    existing.count += curr.count;
                                } else {
                                    acc.push({ ...curr });
                                }
                                return acc;
                            }, [] as { type: string; count: number }[])
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 5)
                            .map((vector, idx) => (
                                <div key={idx} className="flex justify-between items-center font-mono text-sm">
                                    <span className="text-muted-foreground">{vector.type}</span>
                                    <span className="text-primary">{vector.count.toLocaleString()}</span>
                                </div>
                            ))}
                    </div>
                </aside>

                {/* Right Pane: Animated Data Feed Matrix */}
                <main className="flex-1 overflow-x-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-10 bg-background/95 backdrop-blur z-40 border-b border-border">
                            <tr className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                                <th className="py-4 px-6 font-normal">Rank</th>
                                <th className="py-4 px-6 font-normal">Source Vector</th>
                                <th className="py-4 px-6 font-normal">Origin</th>
                                <th className="py-4 px-6 font-normal">Network (ASN)</th>
                                <th className="py-4 px-6 font-normal text-right">Event Count</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="font-mono text-sm"
                        >
                            {data.threats.map((threat) => (
                                <motion.tr
                                    key={threat.ip}
                                    variants={itemVariants}
                                    className="border-b border-border/50 hover:bg-secondary transition-colors group relative"
                                >
                                    {/* Brutalist hover indicator */}
                                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></td>

                                    <td className="py-4 px-6 text-muted-foreground group-hover:text-primary transition-colors">
                                        {String(threat.rank).padStart(3, "0")}
                                    </td>
                                    <td className="py-4 px-6 font-bold text-foreground">
                                        {threat.ip}
                                    </td>
                                    <td className="py-4 px-6">
                                        {threat.enrichment.country.toUpperCase()}
                                    </td>
                                    <td className="py-4 px-6 truncate max-w-[250px]">
                                        <span className="text-muted-foreground mr-2">[{threat.enrichment.asn}]</span>
                                        {threat.enrichment.org.toUpperCase()}
                                    </td>
                                    <td className="py-4 px-6 text-right text-primary">
                                        {threat.totalAttacks.toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </main>
            </div>
        </>
    );
}
