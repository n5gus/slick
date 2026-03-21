export function AgentStatusBadge({ agent, status, detail, score }: { agent: string, status: string, detail?: string, score?: number }) {
    let dotColor = 'bg-text-secondary';
    if (status === 'MONITORING' || status === 'LIVE' || status === 'ARMED') dotColor = 'bg-positive';
    if (status === 'STANDBY') dotColor = 'bg-warning';
    if (status === 'OFFLINE') dotColor = 'bg-negative';

    return (
        <div className="border border-border bg-bg-surface p-6 rounded-none flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-medium tracking-tight text-text-primary mb-1">{agent}</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
                        <span className="text-xs tracking-widest text-text-secondary uppercase font-mono">{status}</span>
                    </div>
                </div>
                {score !== undefined && (
                    <div className="text-right">
                        <span className="block text-xs tracking-widest text-text-secondary uppercase mb-1">SCORE</span>
                        <span className={`font-mono ${score > 0.85 ? 'text-positive' : 'text-text-secondary'}`}>{score.toFixed(2)}</span>
                    </div>
                )}
            </div>
            {detail && (
                <div className="pt-4 border-t border-border mt-auto">
                    <p className="text-xs text-text-secondary truncate" title={detail}>{detail}</p>
                </div>
            )}
        </div>
    );
}
