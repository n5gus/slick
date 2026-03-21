'use client';

import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function LandingPage() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const agents = [
    { name: 'Sentinel', role: 'Navigates Reuters and Al Jazeera in real-time. Captures breaking headlines and screenshots. Bypasses bot protection. Fires multimodal artifacts upstream.', status: 'MONITORING' },
    { name: 'Quant', role: 'Polls the BRENTOIL order book depth, funding rates, and liquidation cascades via hyperliquid-operator. Returns structured JSON on demand.', status: 'LIVE' },
    { name: 'Orchestrator', role: 'Receives the news artifact. Queries the Quant. Feeds both to Gemini 3.1 Pro for conviction scoring. Fires the trade if score exceeds 0.85.', status: 'ARMED' },
  ];

  const flowSteps = ['[Browser Agent]', '→', '[Sentinel]', '→', '[Orchestrator]', '→', '[Quant]', '→', '[Gemini]', '→', '[Hyperliquid]'];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-border w-full">
        {/* Video background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/slick-bg.mp4"
        />

        {/* Audio Toggle Button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-8 z-20 p-3 bg-bg-elevated/80 border border-border text-text-primary hover:bg-bg-surface transition-colors rounded-none outline-none focus:ring-1 focus:ring-accent"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-[#05050A]/70" />

        {/* Optional: cyan vignette edge glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#05050A_100%)]" />

        {/* Your hero content sits above */}
        <div className="relative z-10 flex flex-col justify-center items-start px-8 max-w-5xl mx-auto w-full">
          <span className="text-xs tracking-widest text-text-secondary uppercase mb-4 block tracking-[0.25em]">MANBEARBULL CAPITAL — BRENTOIL PERPETUALS</span>
          <h1 
            className="text-5xl md:text-7xl font-light leading-tight tracking-tight mb-6"
            style={{
              background: 'linear-gradient(95deg, #F4F4F5 0%, #00F3FF 50%, #F900FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The News Breaks.<br />
            We&apos;re Already In.
          </h1>
          <p className="text-text-primary/80 max-w-lg mb-12 text-sm leading-relaxed font-light">
            Three specialized AI agents monitor live Middle East crisis feeds, score geopolitical conviction with Gemini, and execute leveraged BRENTOIL positions on Hyperliquid — autonomously, 24/7, before traditional desks boot up on Monday open.
          </p>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-8 py-3 text-bg-primary text-xs font-medium tracking-widest uppercase hover:opacity-90 transition-opacity"
              style={{
                background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
                boxShadow: '0 0 24px rgba(0, 243, 255, 0.35)'
              }}
            >
              Launch Dashboard
            </Link>
            <Link href="https://github.com/algo-traders-club/slick" className="px-8 py-3 bg-transparent border border-border text-text-primary text-xs font-medium tracking-widest uppercase hover:bg-bg-elevated transition-colors">
              View on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="px-8 py-24 bg-bg-surface border-t border-border w-full">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <span className="text-[10px] tracking-widest text-text-muted uppercase block mb-3">Architecture</span>
            <h2 className="text-2xl font-light text-text-primary tracking-tight">The Swarm</h2>
            <p className="text-sm text-text-primary/70 mt-2 max-w-xl font-light">
              Three autonomous agents negotiate over Google&apos;s A2A protocol. No human in the loop.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {agents.map((agent, i) => (
              <div key={i} className="p-6 border border-border bg-bg-primary rounded-none flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'MONITORING' || agent.status === 'LIVE' || agent.status === 'ARMED' ? 'bg-positive' : 'bg-warning'} animate-pulse`} />
                  <span className="text-xs tracking-widest text-text-primary uppercase font-mono">{agent.name}</span>
                </div>
                <p className="text-sm text-text-secondary tracking-tight mt-auto">{agent.role}</p>
              </div>
            ))}
          </div>

          {/* Flow Diagram */}
          <div className="text-center w-full overflow-hidden border border-border bg-bg-primary p-6">
            <span className="text-xs tracking-widest text-text-muted uppercase mb-8 block text-left">A2A Signal Pipeline</span>
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono tracking-widest uppercase text-text-primary">
              {flowSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`${step === '→' ? 'text-text-muted' : ''}`}
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="px-8 py-24 bg-bg-primary border-t border-border w-full">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            
            {/* Left: The narrative */}
            <div>
              <span className="text-[10px] tracking-widest text-text-muted uppercase block mb-3">The Opportunity</span>
              <h2 className="text-2xl font-light text-text-primary tracking-tight mb-6">
                Traditional oil markets close.<br />Conflict does not.
              </h2>
              <p className="text-sm text-text-primary/70 font-light leading-relaxed mb-4">
                NYMEX crude futures halt at 5pm Friday. When missiles fly at 2am Sunday, 
                institutional desks are dark. Hyperliquid&apos;s BRENTOIL perpetual trades 
                continuously — 24 hours a day, 7 days a week.
              </p>
              <p className="text-sm text-text-primary/70 font-light leading-relaxed mb-4">
                Standard algorithmic bots cannot process breaking visual news. 
                Web scrapers get blocked by Cloudflare on Reuters and Al Jazeera. 
                Human traders are asleep.
              </p>
              <p className="text-sm text-text-primary/70 font-light leading-relaxed">
                Slick exploits the window between when news breaks and when 
                traditional institutions can act — measured in minutes, traded in milliseconds.
              </p>
            </div>

            {/* Right: The edge — stats/facts */}
            <div className="flex flex-col gap-4">
              {[
                { 
                  stat: '48–72hrs', 
                  label: 'Average institutional reaction time to weekend geopolitical events',
                  accent: 'var(--accent-cyan)'
                },
                { 
                  stat: '24 / 7', 
                  label: 'Hyperliquid BRENTOIL perpetual trading — no market close, no gaps',
                  accent: 'var(--accent-cyan)'
                },
                { 
                  stat: '< 5 sec', 
                  label: 'Slick A2A pipeline latency from headline capture to trade execution',
                  accent: 'var(--accent-magenta)'
                },
                { 
                  stat: '0.85', 
                  label: 'Gemini conviction threshold — only high-certainty events trigger execution',
                  accent: 'var(--accent-magenta)'
                },
              ].map((item, i) => (
                <div key={i} className="p-5 border border-border bg-bg-surface flex items-start gap-5">
                  <span 
                    className="text-2xl font-mono font-light shrink-0 w-24"
                    style={{ color: item.accent }}
                  >
                    {item.stat}
                  </span>
                  <p className="text-xs text-text-primary/70 font-light leading-relaxed pt-1">{item.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="px-8 py-20 bg-bg-surface border-t border-border w-full">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-10">
            <span className="text-[10px] tracking-widest text-text-muted uppercase block mb-3">Built With</span>
            <h2 className="text-2xl font-light text-text-primary tracking-tight">The Stack</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Google Gemini', role: 'Multimodal AI', tag: 'INTELLIGENCE' },
              { name: 'Google A2A', role: 'Agent Protocol', tag: 'COMMS' },
              { name: 'Antigravity', role: 'Browser Agent', tag: 'ACQUISITION' },
              { name: 'Hyperliquid', role: 'Perp DEX', tag: 'EXECUTION' },
              { name: 'FastAPI', role: 'Python Backend', tag: 'INFRA' },
              { name: 'uv', role: 'Package Manager', tag: 'TOOLING' },
            ].map((tech, i) => (
              <div key={i} className="p-4 border border-border bg-bg-primary flex flex-col gap-2">
                <span className="text-[9px] tracking-widest text-text-muted uppercase font-mono">{tech.tag}</span>
                <span className="text-sm font-medium text-text-primary">{tech.name}</span>
                <span className="text-[11px] text-text-primary/60">{tech.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-bg-primary w-full">
        
        {/* Footer top: links grid */}
        <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          
          <div>
            <span
              className="text-lg font-light tracking-[0.25em] block mb-4"
              style={{
                background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SLICK
            </span>
            <p className="text-xs text-text-primary/60 font-light leading-relaxed">
              Autonomous geopolitical alpha on Brent Crude perpetuals.
            </p>
          </div>

          <div>
            <span className="text-[10px] tracking-widest text-text-muted uppercase block mb-4">Product</span>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-xs text-text-primary/70 hover:text-text-primary transition-colors">Live Dashboard</Link>
              <Link href="https://github.com/algo-traders-club/slick" className="text-xs text-text-primary/70 hover:text-text-primary transition-colors">GitHub Repository</Link>
              <Link href="https://github.com/algo-traders-club/slick/blob/main/GEMINI.md" className="text-xs text-text-primary/70 hover:text-text-primary transition-colors">GEMINI.md</Link>
            </div>
          </div>

          <div>
            <span className="text-[10px] tracking-widest text-text-muted uppercase block mb-4">Architecture</span>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-primary/70">Sentinel Agent</span>
              <span className="text-xs text-text-primary/70">Quant Agent</span>
              <span className="text-xs text-text-primary/70">Orchestrator Agent</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] tracking-widest text-text-muted uppercase block mb-4">Hackathon</span>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-primary/70">Google Gemini Hackathon</span>
              <span className="text-xs text-text-primary/70">Miami — 2026</span>
              <span className="text-xs text-text-primary/70">ManBearBull Capital</span>
            </div>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-border px-8 py-5 max-w-screen-2xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
            © 2026 ManBearBull Capital — MIT License
          </span>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
              Powered by Gemini 1.5 Pro
            </span>
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
              A2A Protocol v0.1
            </span>
            <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
              xyz:BRENTOIL
            </span>
          </div>
        </div>

      </footer>
    </div>
  );
}
