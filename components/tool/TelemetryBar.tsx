export function TelemetryBar({ lastUpdate }: { lastUpdate: string }) {
    return (
        <header className="fixed top-0 left-0 right-0 h-10 border-b border-border bg-background/95 backdrop-blur z-50 flex items-center justify-between px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]"></span>
                    <span className="text-primary font-bold">SYS_STATUS: ONLINE</span>
                </div>
                <div className="hidden sm:block">NODE: AZ-USEAST-01</div>
                <div className="hidden md:block">PROTOCOL: TCP/UDP SECURE</div>
            </div>

            <div className="flex items-center gap-6">
                <div>OP_MODE: OBSERVE</div>
                <div>LAST_INGEST: <span className="text-foreground">{new Date(lastUpdate).toLocaleTimeString()}</span></div>
            </div>
        </header>
    );
}
