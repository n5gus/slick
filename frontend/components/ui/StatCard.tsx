export function StatCard({ title, value, unit, highlight }: { title: string, value: string | number, unit?: string, highlight?: 'positive' | 'negative' | 'neutral' }) {
    let valueColor = 'text-text-primary';
    if (highlight === 'positive') valueColor = 'text-positive';
    if (highlight === 'negative') valueColor = 'text-negative';

    return (
        <div className="p-4 border border-border bg-bg-elevated rounded-none flex flex-col justify-between h-full">
            <span className="text-xs tracking-widest text-text-secondary uppercase mb-2 block">{title}</span>
            <div className="flex items-baseline gap-1 mt-auto">
                <span className={`text-2xl font-mono ${valueColor}`}>{value}</span>
                {unit && <span className="text-xs tracking-widest text-text-secondary uppercase font-mono">{unit}</span>}
            </div>
        </div>
    );
}
