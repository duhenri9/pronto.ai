import { LogoLight } from '../components/LogoLight';
import { MariaAvatar } from '../components/MariaAvatar';
import { WhatsAppChat } from '../components/WhatsAppChat';
import { VerticalCards } from '../components/VerticalCards';
import { OutcomeSection } from '../components/OutcomeSection';
import { Footer } from '../components/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <LogoLight />
          <div className="flex items-center gap-8">
            <a href="#trilhas" className="text-body-s text-text-secondary hover:text-text-primary transition-colors">
              trilhas
            </a>
            <a href="#para-empresas" className="text-body-s text-text-secondary hover:text-text-primary transition-colors">
              para empresas
            </a>
            <a
              href="https://wa.me/5511999999999?text=Oi%20Maria!%20Quero%20começar"
              className="rounded-md bg-green-500 px-4 py-2 text-body-s font-medium text-green-900 hover:bg-green-400 transition-colors"
            >
              entrar
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-container items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-32">
          {/* Left: Copy */}
          <div>
            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-micro font-medium text-green-800">
              grátis para começar
            </span>
            <h1 className="mt-6 text-display-xl leading-[0.96] tracking-display text-neutral-900 lg:text-display-2xl">
              A Maria te ensina a usar IA pra ganhar mais.
            </h1>
            <p className="mt-4 font-serif text-body-l italic text-text-secondary">
              5 minutos por dia, no WhatsApp. Sem aula chata, sem termo difícil.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://wa.me/5511999999999?text=Oi%20Maria!%20Quero%20começar"
                className="rounded-md bg-green-500 px-5 py-3 text-body-m font-medium text-green-900 hover:bg-green-400 transition-colors"
              >
                começar agora →
              </a>
              <span className="text-micro text-text-tertiary">2 min · sem cadastro</span>
            </div>
          </div>

          {/* Right: WhatsApp Chat Preview */}
          <div className="flex justify-center">
            <WhatsAppChat />
          </div>
        </div>

        {/* Gradient accent */}
        <div className="absolute -top-40 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-green-500/5 blur-3xl" />
      </section>

      {/* Verticals */}
      <section id="trilhas" className="border-t border-border-subtle py-20">
        <div className="mx-auto max-w-container px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-micro font-medium uppercase tracking-micro text-green-600">
              3 verticais piloto
            </span>
            <h2 className="mt-3 text-display-m tracking-display text-neutral-900">
              Trilha feita pro seu negócio.
            </h2>
            <p className="mt-4 font-serif text-body-l italic text-text-secondary">
              A Maria te conecta com quem entende o seu ramo. Cada vertical tem uma especialista própria.
            </p>
          </div>
          <VerticalCards />
        </div>
      </section>

      {/* Outcome Section */}
      <OutcomeSection />

      {/* CTA */}
      <section className="border-t border-border-subtle py-20">
        <div className="mx-auto max-w-container px-6 text-center">
          <MariaAvatar size={96} />
          <h2 className="mt-8 text-display-m tracking-display text-neutral-900">
            Bora começar?
          </h2>
          <p className="mt-4 mx-auto max-w-md font-serif text-body-l italic text-text-secondary">
            O primeiro passo é o mais fácil. Manda um "oi" pra Maria no WhatsApp e ela cuida do resto.
          </p>
          <a
            href="https://wa.me/5511999999999?text=Oi%20Maria!%20Quero%20começar"
            className="mt-8 inline-block rounded-md bg-green-500 px-8 py-4 text-body-m font-medium text-green-900 hover:bg-green-400 transition-colors"
          >
            falar com a Maria →
          </a>
          <p className="mt-4 text-micro text-text-tertiary">
            grátis · sem cadastro · 5 minutos por dia
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
