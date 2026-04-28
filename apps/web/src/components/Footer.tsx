import Link from 'next/link';
import { LogoLight } from './LogoLight';

export function Footer() {
  return (
    <footer className="bg-[#0A0E1A] border-t border-[#1A2150] py-12">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-6">
          <LogoLight />
          <span className="font-mono text-micro uppercase tracking-micro text-[#757994]">
            Pronto.IA · WM3 Digital · 2026
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/sobre" className="text-body-s text-[#9DA1B4] hover:text-white transition-colors">
            sobre
          </Link>
          <Link href="/transparencia" className="text-body-s text-[#9DA1B4] hover:text-white transition-colors">
            transparência
          </Link>
          <Link href="/trilhas" className="text-body-s text-[#9DA1B4] hover:text-white transition-colors">
            trilhas
          </Link>
          <a href="#para-empresas" className="text-body-s text-[#9DA1B4] hover:text-white transition-colors">
            para empresas
          </a>
          <a
            href="https://wa.me/5511999999999"
            className="text-body-s text-[#9DA1B4] hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
