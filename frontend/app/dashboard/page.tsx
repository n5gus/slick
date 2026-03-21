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
    liquidity_available: 148500,
    liquidity_max: 500000,
    liquidations: 12400,
    mark_price: 104.77,
    bollinger_upper: 105.12,
    bollinger_lower: 104.42
  });

  const [agentStatus, setAgentStatus] = useState({
    sentinel: { status: "MONITORING", lastHeadline: "Scanning BB Strategy (1m TF / 1 Sigma)" },
    quant: { status: "LIVE" },
    orchestrator: { status: "ARMED", lastScore: "0.44" }
  });

  const [logs, setLogs] = useState<TradeLog[]>([
    { timestamp: '09:14:32', headline: 'Iran IRGC vessels shadow tanker in Strait of Hormuz', action: 'EXECUTE' },
    { timestamp: '09:09:17', headline: 'Tick: $104.77 [U: 105.12 | L: 104.42]', action: 'HOLD' },
    { timestamp: '09:04:01', headline: 'Saudi Aramco reports pipeline pressure anomaly near Abqaiq', action: 'EXECUTE' },
    { timestamp: '08:59:45', headline: 'Tick: $104.65 [U: 105.08 | L: 104.30]', action: 'HOLD' },
    { timestamp: '08:54:28', headline: 'OPEC+ emergency session called — Vienna, 48hr notice', action: 'HOLD' },
    { timestamp: '08:49:12', headline: 'Tick: $104.51 [U: 104.95 | L: 104.14]', action: 'HOLD' },
    { timestamp: '08:44:03', headline: 'Israeli cabinet convenes unscheduled security meeting', action: 'HOLD' },
    { timestamp: '08:38:55', headline: 'Tick: $104.33 [U: 104.81 | L: 103.98]', action: 'HOLD' },
  ]);

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
      
      <div className="border-b border-border bg-bg-primary px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-accent-cyan">
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono tracking-widest uppercase">
            SLICK / <span className="text-text-primary">LIVE OPS</span>
          </span>
          <LiveClock />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-border px-3 py-1 bg-bg-elevated">
            <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span className="text-xs tracking-widest uppercase font-mono">SWARM ACTIVE — BRENTOIL PERPETUALS</span>
          </div>
          <a 
            href="https://app.hyperliquid.xyz/tradeHistory/0x517CFeae25Ac7D49aD70037b253B9f24C7E556Cf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 border border-border px-3 py-1 bg-bg-elevated hover:border-accent-magenta transition-colors group"
          >
            <span className="text-xs tracking-widest uppercase font-mono text-text-secondary group-hover:text-accent-magenta transition-colors">TRADER: 0x517C...56Cf</span>
            <span className="text-xs font-mono text-positive">+$0.81</span>
          </a>
        </div>
      </div>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 border border-border bg-bg-surface border-l-2 border-l-positive rounded-none">
            <span className="text-xs tracking-widest text-text-secondary uppercase block mb-2">Mark Price</span>
            <span className="text-3xl font-mono text-text-primary">
              ${marketInfo.mark_price.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-text-secondary mt-2 block">xyz:BRENTOIL PERP</span>
          </div>
          <div className="p-6 border border-border bg-bg-surface border-l-2 border-l-accent-cyan rounded-none">
            <span className="text-xs tracking-widest text-text-secondary uppercase block mb-2">BB Upper Band (1σ)</span>
            <span className="text-3xl font-mono text-text-primary">
              ${marketInfo.bollinger_upper.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-text-secondary mt-2 block">SHORT SIGNAL ABOVE</span>
          </div>
          <div className="p-6 border border-border bg-bg-surface border-l-2 border-l-negative rounded-none">
            <span className="text-xs tracking-widest text-text-secondary uppercase block mb-2">BB Lower Band (1σ)</span>
            <span className="text-3xl font-mono text-text-primary">
              ${marketInfo.bollinger_lower.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-text-secondary mt-2 block">LONG SIGNAL BELOW</span>
          </div>
        </div>

        {/* Conviction Score Bar */}
        <div className="p-6 border border-border bg-bg-surface mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs tracking-widest text-text-secondary uppercase">
              Gemini Conviction Score
            </span>
            <span className="font-mono text-lg text-text-primary">
              {agentStatus.orchestrator.lastScore === 'HOLD' ? '—' : agentStatus.orchestrator.lastScore}
            </span>
          </div>
          
          {/* Score bar: 0.0 to 1.0 */}
          <div className="w-full h-3 bg-bg-elevated border border-border overflow-hidden mb-3">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: agentStatus.orchestrator.lastScore === 'HOLD' 
                  ? '0%' 
                  : Number.isNaN(parseFloat(agentStatus.orchestrator.lastScore || '0')) ? '0%' : `${parseFloat(agentStatus.orchestrator.lastScore || '0') * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
                boxShadow: '0 0 12px rgba(0, 243, 255, 0.6)'
              }}
            />
          </div>
          
          {/* Threshold markers */}
          <div className="relative w-full flex justify-between text-xs font-mono text-text-secondary">
            <span>0.0 NO TRADE</span>
            <span className="absolute left-[85%] -translate-x-1/2 text-positive">0.85 THRESHOLD</span>
            <span>1.0 EXECUTE</span>
          </div>
          
          {/* Threshold line */}
          <div className="relative w-full h-px mt-1">
            <div 
              className="absolute top-0 w-px h-3 bg-positive opacity-60"
              style={{ left: '85%' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          
          {/* Left: Agent Status */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <span className="text-xs tracking-widest text-text-secondary uppercase block border-b border-border pb-2">
              Agent Status
            </span>
            <AgentStatusBadge 
              agent="Sentinel" 
              status={agentStatus.sentinel.status} 
              detail={agentStatus.sentinel.lastHeadline} 
            />
            <AgentStatusBadge 
              agent="Quant" 
              status={agentStatus.quant.status}
              detail="Polling xyz:BRENTOIL — 5s interval"
            />
            <AgentStatusBadge 
              agent="Orchestrator" 
              status={agentStatus.orchestrator.status} 
              detail={`Signal: ${agentStatus.orchestrator.lastScore}`}
            />
          </div>

          {/* Right: A2A Pipeline Visualization */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <span className="text-xs tracking-widest text-text-secondary uppercase block border-b border-border pb-2">
              A2A Signal Pipeline
            </span>
            
            <div className="border border-border bg-bg-surface p-6 flex flex-col gap-4">
              
              {/* Pipeline steps */}
              {[
                { 
                  step: '01', 
                  from: 'Antigravity Browser', 
                  to: 'Sentinel',
                  desc: 'Visual scrape — Reuters / Al Jazeera / X feeds',
                  color: 'var(--accent-cyan)'
                },
                { 
                  step: '02', 
                  from: 'Sentinel', 
                  to: 'Orchestrator',
                  desc: 'A2A POST /orchestrator/tasks/send — multimodal artifact',
                  color: 'var(--accent-cyan)'
                },
                { 
                  step: '03', 
                  from: 'Orchestrator', 
                  to: 'Quant',
                  desc: 'A2A GET /quant/liquidity — order book state',
                  color: 'var(--accent-cyan)'
                },
                { 
                  step: '04', 
                  from: 'Orchestrator', 
                  to: 'Gemini 1.5 Pro',
                  desc: 'Multimodal sentiment scoring — returns conviction score',
                  color: 'var(--accent-magenta)'
                },
                { 
                  step: '05', 
                  from: 'Orchestrator', 
                  to: 'Hyperliquid',
                  desc: 'hl-op trade buy xyz:BRENTOIL — if score > 0.85',
                  color: agentStatus.orchestrator.status === 'EXECUTING' 
                    ? 'var(--positive)' 
                    : 'var(--text-muted)'
                },
              ].map((node) => (
                <div key={node.step} className="flex items-start gap-4">
                  <span 
                    className="text-xs font-mono mt-0.5 shrink-0 w-6"
                    style={{ color: node.color }}
                  >
                    {node.step}
                  </span>
                  <div className="flex-1 border-l border-border pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-text-primary">{node.from}</span>
                      <span className="text-text-secondary text-xs">→</span>
                      <span className="text-xs font-mono" style={{ color: node.color }}>{node.to}</span>
                    </div>
                    <p className="text-xs text-text-secondary tracking-wide">{node.desc}</p>
                  </div>
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 animate-pulse"
                    style={{ backgroundColor: node.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width Trade Feed at bottom */}
        <div>
          <span className="text-xs tracking-widest text-text-secondary uppercase mb-4 block border-b border-border pb-2">
            Signal & Execution Log — Last 50 Ticks
          </span>
          <TradeFeed logs={logs} />
        </div>

      </main>
    </div>
  );
}
