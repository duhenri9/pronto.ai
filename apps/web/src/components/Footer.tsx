import Link from 'next/link';
import { LogoLight } from './LogoLight';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-6">
          <LogoLight />
          <span className="font-mono text-micro uppercase tracking-micro text-text-tertiary">
            Pronto.IA · WM3 Digital · 2026
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/sobre" className="text-body-s text-text-secondary hover:text-text-primary transition-colors">
            sobre
          </Link>
          <Link href="/transparencia" className="text-body-s text-text-secondary hover:text-text-primary transition-colors">
            transparência
          </Link>
          <a href="#trilhas" className="text-body-s text-text-secondary hover:text-text-primary transition-colors">
            trilhas
          </a>
          <a href="#para-empresas" className="text-body-s text-text-secondary hover:text-text-primary transition-colors">
            para empresas
          </a>
          <a
            href="https://wa.me/5511999999999"
            className="text-body-s text-text-secondary hover:text-text-primary transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
