'use client';

import { Header } from '@/components/layout/Header';
import { AgentStatusBadge } from '@/components/ui/AgentStatusBadge';
import { TradeFeed } from '@/components/ui/TradeFeed';
import { MOCK_TRADES, MOCK_AGENT_STATUS, MOCK_MARKET } from '@/lib/mockData';
import { useEffect, useState } from 'react';

function LiveClock() {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const int = setInterval(updateTime, 1000);
    return () => clearInterval(int);
  }, []);

  return <span className="font-mono text-sm text-text-secondary">{time}</span>;
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary pb-12">
      <Header />
      
      {/* Top Bar */}
      <div className="border-b border-border bg-bg-surface px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono tracking-widest uppercase text-text-muted">
            SLICK / <span className="text-text-primary">DASHBOARD</span>
          </span>
          <LiveClock />
        </div>
        <div className="flex items-center gap-2 border border-border px-3 py-1 bg-bg-elevated">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-xs tracking-widest text-positive uppercase font-mono">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
          
          {/* Left Column: Agents */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-2 block border-b border-border pb-2">Swarm Telemetry</span>
            <AgentStatusBadge 
                agent="Sentinel" 
                status={MOCK_AGENT_STATUS.sentinel.status} 
                detail={MOCK_AGENT_STATUS.sentinel.lastHeadline} 
            />
            <AgentStatusBadge 
                agent="Quant" 
                status={MOCK_AGENT_STATUS.quant.status} 
            />
            <AgentStatusBadge 
                agent="Orchestrator" 
                status={MOCK_AGENT_STATUS.orchestrator.status} 
                score={MOCK_AGENT_STATUS.orchestrator.lastScore}
            />
          </div>

          {/* Right Column: Market Data */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-2 block border-b border-border pb-2">Microstructure & Liquidity</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-border bg-bg-surface flex flex-col justify-between">
                    <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block">Symbol</span>
                    <span className="text-2xl font-mono text-text-primary">{MOCK_MARKET.symbol}</span>
                </div>
                <div className="p-6 border border-border bg-bg-surface flex flex-col justify-between">
                    <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block">Funding Rate</span>
                    <span className="text-2xl font-mono text-text-primary">{MOCK_MARKET.funding_rate}</span>
                </div>
            </div>

            <div className="p-6 border border-border bg-bg-surface mt-2 flex flex-col">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-xs tracking-widest text-text-muted uppercase">Available Liquidity Depth</span>
                    <span className="text-xl font-mono text-text-primary">${MOCK_MARKET.liquidity_available.toLocaleString()} <span className="text-sm text-text-secondary">USD</span></span>
                </div>
                {/* Visual Fill Bar */}
                <div className="w-full h-2 bg-bg-elevated border border-border overflow-hidden">
                    <div 
                        className="h-full bg-accent" 
                        style={{ width: `${(MOCK_MARKET.liquidity_available / MOCK_MARKET.liquidity_max) * 100}%` }} 
                    />
                </div>
            </div>

            <div className="p-6 border border-border bg-bg-surface flex justify-between items-center mt-2">
                <span className="text-xs tracking-widest text-text-muted uppercase">Recent Liquidations</span>
                <span className="text-xl font-mono text-negative">${MOCK_MARKET.liquidations.toLocaleString()}</span>
            </div>

          </div>
        </div>

        {/* Bottom Trade Feed */}
        <div className="mt-8">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block border-b border-border pb-2">Execution Log</span>
            <TradeFeed trades={MOCK_TRADES} />
        </div>
      </main>
    </div>
  );
}
