import Link from 'next/link';

export function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-border bg-bg-surface">
      <div className="flex flex-col items-start justify-center overflow-visible">
        <h1 
          className="text-xl font-light tracking-[0.3em]"
          style={{
            background: 'linear-gradient(90deg, #00F3FF 0%, #F900FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(0, 243, 255, 0.5))'
          }}
        >
          SLICK
        </h1>
      </div>
      <nav className="flex items-center gap-6 text-sm tracking-widest text-text-secondary uppercase">
        <Link href="/" className="hover:text-accent transition-colors">Architecture</Link>
        <Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
        <Link href="https://github.com/algo-traders-club/slick" target="_blank" className="hover:text-accent transition-colors">GitHub</Link>
      </nav>
    </header>
  );
}
