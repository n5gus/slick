type Trade = {
    timestamp: string;
    headline: string;
    score: number;
    action: string;
};

export function TradeFeed({ trades }: { trades: Trade[] }) {
    return (
        <div className="w-full border border-border bg-bg-surface rounded-none overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-bg-elevated text-xs tracking-widest text-text-muted uppercase">
                <div className="col-span-3">TIMESTAMP</div>
                <div className="col-span-6">HEADLINE</div>
                <div className="col-span-1 text-right">SCORE</div>
                <div className="col-span-2 text-right">ACTION</div>
            </div>
            <div className="flex flex-col">
                {trades.map((trade, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-0 hover:bg-bg-elevated/50 transition-colors items-center font-mono text-sm">
                        <div className="col-span-3 text-text-secondary">{trade.timestamp}</div>
                        <div className="col-span-6 text-text-primary truncate font-sans text-xs tracking-tight">{trade.headline}</div>
                        <div className={`col-span-1 text-right ${trade.score > 0.85 ? 'text-positive' : 'text-text-secondary'}`}>
                            {trade.score.toFixed(2)}
                        </div>
                        <div className={`col-span-2 text-right text-xs tracking-widest ${trade.action === 'EXECUTED' ? 'text-positive' : 'text-text-muted'}`}>
                            {trade.action}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
