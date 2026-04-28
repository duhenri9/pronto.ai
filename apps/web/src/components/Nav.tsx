import Link from 'next/link';
import { LogoLight } from './LogoLight';

const WHATSAPP_URL =
  'https://wa.me/5511999999999?text=Oi%20Maria!%20Quero%20começar';

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0A0E1A]/80 backdrop-blur-md border-b border-[#1A2150]">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
        <Link href="/" className="flex-shrink-0">
          <LogoLight />
        </Link>
        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#trilhas"
            className="text-body-s text-text-secondary hover:text-text-primary transition-duration-fast transition-colors"
          >
            trilhas
          </Link>
          <Link
            href="/#para-empresas"
            className="text-body-s text-text-secondary hover:text-text-primary transition-duration-fast transition-colors"
          >
            para empresas
          </Link>
          <Link
            href="/sobre"
            className="text-body-s text-text-secondary hover:text-text-primary transition-duration-fast transition-colors"
          >
            sobre
          </Link>
          <Link
            href="/transparencia"
            className="text-body-s text-text-secondary hover:text-text-primary transition-duration-fast transition-colors"
          >
            transparência
          </Link>
          <a
            href={WHATSAPP_URL}
            className="rounded-md bg-green-500 px-4 py-2 text-body-s font-medium text-green-900 hover:bg-green-400 transition-duration-fast transition-colors"
          >
            entrar
          </a>
        </div>
        {/* Mobile CTA */}
        <a
          href={WHATSAPP_URL}
          className="rounded-md bg-green-500 px-4 py-2 text-body-s font-medium text-green-900 md:hidden"
        >
          entrar
        </a>
      </div>
    </nav>
  );
}
