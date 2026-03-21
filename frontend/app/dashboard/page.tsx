'use client';

import { Header } from '@/components/layout/Header';
import { AgentStatusBadge } from '@/components/ui/AgentStatusBadge';
import { TradeFeed } from '@/components/ui/TradeFeed';
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
  const [marketInfo, setMarketInfo] = useState({
    symbol: "xyz:BRENTOIL",
    funding_rate: "0.00%",
    liquidity_available: 0,
    liquidity_max: 500000,
    liquidations: 0,
    mark_price: 0,
    bollinger_upper: 0,
    bollinger_lower: 0
  });

  const [agentStatus, setAgentStatus] = useState({
    sentinel: { status: "MONITORING", lastHeadline: "Scanning BB Strategy (Live API)" },
    quant: { status: "LIVE" },
    orchestrator: { status: "ARMED", lastScore: "Hold" }
  });

  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealData = async () => {
        try {
            const res = await fetch('http://localhost:8000/quant/liquidity');
            const data = await res.json();
            if (data) {
                setMarketInfo({
                    symbol: data.symbol,
                    funding_rate: "0.00%", // Usually fetched separately
                    liquidity_available: data.available_liquidity_usd,
                    liquidity_max: 500000,
                    liquidations: data.recent_liquidations,
                    mark_price: data.mark_price,
                    bollinger_upper: data.bollinger_upper,
                    bollinger_lower: data.bollinger_lower
                });
                setAgentStatus({
                    sentinel: { status: "MONITORING", lastHeadline: `Mark: $${data.mark_price.toFixed(2)} | Action: ${data.signal}` },
                    quant: { status: "LIVE" },
                    orchestrator: { status: data.signal !== "HOLD" ? "EXECUTING" : "ARMED", lastScore: data.signal }
                });
            }
        } catch (err) {
            console.log("Awaiting API Connection...");
        }
    };

    fetchRealData();
    const intervalId = setInterval(fetchRealData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary pb-12">
      <Header />
      
      {/* Top Bar */}
      <div className="border-b border-border bg-bg-surface px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono tracking-widest uppercase text-text-muted">
            SLICK / <span className="text-text-primary">LIVE OPS</span>
          </span>
          <LiveClock />
        </div>
        <div className="flex items-center gap-2 border border-border px-3 py-1 bg-bg-elevated">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-xs tracking-widest text-positive uppercase font-mono">SWARM ACTIVE — REAL DATA</span>
        </div>
      </div>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
          
          {/* Left Column: Agents */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-2 block border-b border-border pb-2">Agent Status</span>
            <AgentStatusBadge 
                agent="Sentinel" 
                status={agentStatus.sentinel.status} 
                detail={agentStatus.sentinel.lastHeadline} 
            />
            <AgentStatusBadge 
                agent="Quant" 
                status={agentStatus.quant.status} 
            />
            <AgentStatusBadge 
                agent="Orchestrator" 
                status={agentStatus.orchestrator.status} 
                detail={`Signal: ${agentStatus.orchestrator.lastScore}`}
            />
          </div>

          {/* Right Column: Market Data */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-2 block border-b border-border pb-2">xyz:BRENTOIL Market State (Live Bollinger Bands)</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border border-border bg-bg-surface flex flex-col justify-between">
                    <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block">Mark Price</span>
                    <span className="text-2xl font-mono text-text-primary">${marketInfo.mark_price.toFixed(2)}</span>
                </div>
                <div className="p-6 border border-border bg-bg-surface flex flex-col justify-between">
                    <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block">BB upper</span>
                    <span className="text-2xl font-mono text-text-primary">${marketInfo.bollinger_upper.toFixed(2)}</span>
                </div>
                <div className="p-6 border border-border bg-bg-surface flex flex-col justify-between">
                    <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block">BB lower</span>
                    <span className="text-2xl font-mono text-text-primary">${marketInfo.bollinger_lower.toFixed(2)}</span>
                </div>
            </div>

            <div className="p-6 border border-border bg-bg-surface mt-2 flex flex-col">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-xs tracking-widest text-text-muted uppercase">Front-Line Liquidity Depth</span>
                    <span className="text-xl font-mono text-text-primary">${marketInfo.liquidity_available.toLocaleString()} <span className="text-sm text-text-secondary">USD</span></span>
                </div>
                <div className="w-full h-2 bg-bg-elevated border border-border overflow-hidden">
                    <div 
                        className="h-full bg-accent" 
                        style={{ width: `${Math.min((marketInfo.liquidity_available / marketInfo.liquidity_max) * 100, 100)}%` }} 
                    />
                </div>
            </div>

          </div>
        </div>

        {/* Bottom Trade Feed */}
        <div className="mt-8">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block border-b border-border pb-2">Signal & Execution Log</span>
            <TradeFeed trades={trades} />
        </div>
      </main>
    </div>
  );
}
