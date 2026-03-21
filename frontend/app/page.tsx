'use client';

import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  const agents = [
    { name: 'Sentinel', role: 'Visual news scraper via Antigravity Browser Engine', status: 'MONITORING' },
    { name: 'Quant', role: 'Dominates Hyperliquid chart DOM & order book micro-structure', status: 'LIVE' },
    { name: 'Orchestrator', role: 'Gemini 3.1 Pro continuous conviction scoring & CLI execution hook', status: 'ARMED' },
  ];

  const flowSteps = ['[Browser Agent]', '→', '[Sentinel]', '→', '[Orchestrator]', '→', '[Quant]', '→', '[Gemini]', '→', '[Hyperliquid]'];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-start px-8 py-24 max-w-5xl mx-auto w-full">
        <span className="text-xs tracking-widest text-text-muted uppercase mb-4 block">MANBEARBULL CAPITAL</span>
        <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight mb-6">
          Geopolitical Alpha.<br />
          On-Chain Execution.
        </h1>
        <p className="text-text-secondary max-w-lg mb-12 text-sm leading-relaxed">
          An autonomous agent swarm trading Brent Crude Oil perpetuals on Hyperliquid — before traditional institutions open their terminals.
        </p>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="px-8 py-3 bg-accent text-bg-primary text-xs font-medium tracking-widest uppercase hover:opacity-90 transition-opacity">
            Launch Dashboard
          </Link>
          <Link href="https://github.com/algo-traders-club/slick" className="px-8 py-3 bg-transparent border border-border text-text-primary text-xs font-medium tracking-widest uppercase hover:bg-bg-elevated transition-colors">
            View on GitHub
          </Link>
        </div>
      </main>

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
            <span className="text-xs tracking-widest text-text-muted uppercase mb-8 block text-left">Execution Flow</span>
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
        <span>Built for Google Gemini Hackathon 2026</span>
      </footer>
    </div>
  );
}
