'use client';

import { motion } from 'framer-motion';

export type TradeLog = {
    timestamp: string;
    headline: string;
    action: string;
};

export function TradeFeed({ logs }: { logs: TradeLog[] }) {
    return (
        <div className="w-full border border-border bg-[#05050A] rounded-none overflow-hidden font-mono">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#1A1A24] bg-[#0A0A10] text-[#00ffcc] text-xs tracking-widest uppercase">
                <div className="col-span-3 opacity-70">RUNTIME</div>
                <div className="col-span-6 opacity-70">AGENT_STDOUT</div>
                <div className="col-span-3 text-right opacity-70">EXECUTION_STATUS</div>
            </div>
            <div className="flex flex-col h-[300px] overflow-y-auto">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-[#00ffcc]/50 text-sm italic">
                        <span className="animate-pulse">Awaiting Quant Signal...</span>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#1A1A24] items-center text-sm"
                        >
                            <div className="col-span-3 text-[#00ffcc]/60">{log.timestamp}</div>
                            <div className="col-span-6 text-white truncate">{log.headline}</div>
                            <div className={`col-span-3 text-right tracking-widest text-[#00ffcc] ${log.action !== 'HOLD' ? 'font-bold' : 'opacity-60'}`}>
                                [ {log.action} ]
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
