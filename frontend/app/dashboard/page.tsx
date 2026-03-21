'use client';

import { Header } from '@/components/layout/Header';
import { AgentStatusBadge } from '@/components/ui/AgentStatusBadge';
import { TradeFeed, TradeLog } from '@/components/ui/TradeFeed';
import { useEffect, useState } from 'react';

function LiveClock() {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
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
    liquidity_available: 0,
    liquidity_max: 500000,
    liquidations: 0,
    mark_price: 0,
    bollinger_upper: 0,
    bollinger_lower: 0
  });

  const [agentStatus, setAgentStatus] = useState({
    sentinel: { status: "MONITORING", lastHeadline: "Scanning BB Strategy (1m TF / 1 Sigma)" },
    quant: { status: "LIVE" },
    orchestrator: { status: "ARMED", lastScore: "Hold" }
  });

  const [logs, setLogs] = useState<TradeLog[]>([]);

  useEffect(() => {
    const fetchRealData = async () => {
        try {
            const res = await fetch('http://localhost:8000/quant/liquidity');
            const data = await res.json();
            if (data) {
                setMarketInfo({
                    symbol: data.symbol,
                    liquidity_available: data.available_liquidity_usd,
                    liquidity_max: 500000,
                    liquidations: data.recent_liquidations,
                    mark_price: data.mark_price,
                    bollinger_upper: data.bollinger_upper,
                    bollinger_lower: data.bollinger_lower
                });
                
                setAgentStatus({
                    sentinel: { status: "MONITORING", lastHeadline: `Mark: $${data.mark_price.toFixed(2)} | EMA: ${data.ohlc_5m}` },
                    quant: { status: "LIVE" },
                    orchestrator: { status: data.signal !== "HOLD" ? "EXECUTING" : "ARMED", lastScore: data.signal }
                });

                // Add to log stream
                setLogs(prev => {
                    const newLog = {
                        timestamp: new Date().toLocaleTimeString(),
                        headline: `Tick: $${data.mark_price.toFixed(2)} [U: ${data.bollinger_upper.toFixed(2)} | L: ${data.bollinger_lower.toFixed(2)}]`,
                        action: data.signal
                    };
                    return [newLog, ...prev].slice(0, 50); // keep last 50
                });
            }
        } catch (err) {
            console.log("Awaiting API Connection...");
        }
    };

    fetchRealData();
    const intervalId = setInterval(fetchRealData, 5000); // 5 sec pings
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary pb-12">
      <Header />
      
      <div className="border-b border-border bg-[#05050A] px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[#00ffcc]">
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono tracking-widest uppercase">
            MATRIX / <span className="text-white">LIVE TRADING</span>
          </span>
          <LiveClock />
        </div>
        <div className="flex items-center gap-2 border border-[#00ffcc]/30 px-3 py-1 bg-[#00ffcc]/10">
          <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-ping" />
          <span className="text-xs tracking-widest uppercase font-mono">AUTONOMOUS SWARM ONLINE</span>
        </div>
      </div>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-6 border border-[#2A2A35] bg-[#0A0A10] rounded-none">
                <span className="text-xs tracking-widest text-[#00ffcc]/70 uppercase block mb-1">Mark Price</span>
                <span className="text-3xl font-mono text-white">${marketInfo.mark_price.toFixed(2)}</span>
            </div>
            <div className="p-6 border border-[#2A2A35] bg-[#0A0A10] rounded-none">
                <span className="text-xs tracking-widest text-[#00ffcc]/70 uppercase block mb-1">BB Upper (1σ)</span>
                <span className="text-3xl font-mono text-white">${marketInfo.bollinger_upper.toFixed(2)}</span>
            </div>
            <div className="p-6 border border-[#2A2A35] bg-[#0A0A10] rounded-none">
                <span className="text-xs tracking-widest text-[#00ffcc]/70 uppercase block mb-1">BB Lower (1σ)</span>
                <span className="text-3xl font-mono text-white">${marketInfo.bollinger_lower.toFixed(2)}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          <div className="xl:col-span-4 flex flex-col gap-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-2 block border-b border-border pb-2">Swarm Telemetry</span>
            <AgentStatusBadge agent="Sentinel" status={agentStatus.sentinel.status} detail={agentStatus.sentinel.lastHeadline} />
            <AgentStatusBadge agent="Quant" status={agentStatus.quant.status} />
            <AgentStatusBadge agent="Orchestrator" status={agentStatus.orchestrator.status} detail={`Signal: ${agentStatus.orchestrator.lastScore}`} />
          </div>

          <div className="xl:col-span-8 flex flex-col gap-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-2 block border-b border-border pb-2">Terminal Execution Log</span>
            <TradeFeed logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}
