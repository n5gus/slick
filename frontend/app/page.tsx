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
          <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block [text-shadow:var(--glow-text)]">MANBEAR BULL CAPITAL — BRENTOIL PERPETUALS</span>
          <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight mb-6">
            The News Breaks.<br />
            We're Already In.
          </h1>
          <p className="text-text-secondary max-w-lg mb-12 text-sm leading-relaxed">
            Three specialized AI agents monitor live Middle East crisis feeds, score geopolitical conviction with Gemini, and execute leveraged BRENTOIL positions on Hyperliquid — autonomously, 24/7, before traditional desks boot up on Monday open.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-8 py-3 bg-accent text-bg-primary text-xs font-medium tracking-widest uppercase hover:opacity-90 transition-opacity drop-shadow-[var(--glow-cyan)]">
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

      <footer className="py-8 px-8 border-t border-border bg-bg-primary flex flex-col md:flex-row justify-between items-center text-xs tracking-widest uppercase text-text-muted">
        <span>SLICK by ManBearBull Capital</span>
        <span>Google Gemini Hackathon — Miami 2026</span>
      </footer>
    </div>
  );
}
