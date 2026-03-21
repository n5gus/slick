import Link from 'next/link';

export function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-border bg-bg-surface">
      <div className="flex items-center">
        <h1 className="text-xl font-light tracking-[0.3em] uppercase bg-gradient-to-r from-[#00F3FF] to-[#F900FF] bg-clip-text text-transparent">SLICK</h1>
      </div>
      <nav className="flex items-center gap-6 text-sm tracking-widest text-text-secondary uppercase">
        <Link href="/" className="hover:text-accent transition-colors">Architecture</Link>
        <Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
        <Link href="https://github.com" target="_blank" className="hover:text-accent transition-colors">GitHub</Link>
      </nav>
    </header>
  );
}
