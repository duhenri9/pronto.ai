import { MariaAvatar } from '@/components/MariaAvatar';
import { MariaTip } from '@/components/MariaTip';
import { WhatsAppChat } from '@/components/WhatsAppChat';
import { LearningJourney } from '@/components/LearningJourney';
import { VerticalCards } from '@/components/VerticalCards';
import { OutcomeSection } from '@/components/OutcomeSection';
import { DonateSection } from '@/components/DonateSection';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const WHATSAPP_URL =
  'https://wa.me/5511999999999?text=Oi%20Maria!%20Quero%20começar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Nav />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-20">
        <div className="mx-auto grid max-w-container items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          {/* Left: Copy */}
          <div>
            <span className="inline-block rounded-full bg-green-400/20 px-3 py-1 text-micro font-medium text-green-700">
              grátis para começar
            </span>
            <h1 className="mt-6 text-display-xl leading-none tracking-display text-neutral-900 lg:text-display-2xl">
              A Maria te ensina a usar IA pra ganhar mais.
            </h1>
            <p className="mt-4 font-serif text-body-l italic text-text-secondary">
              Uma plataforma educacional que potencializa e multiplica conhecimentos — conectando as oportunidades e desafios da Inteligência Artificial ao dia a dia das pessoas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={WHATSAPP_URL}
                className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-3 text-body-m font-medium text-green-900 hover:bg-green-400 transition-duration-fast transition-colors"
              >
                começar agora
                <span aria-hidden="true">&rarr;</span>
              </a>
              <span className="text-micro text-text-tertiary">
                2 min · sem cadastro
              </span>
            </div>
          </div>

          {/* Right: WhatsApp Chat Preview */}
          <div className="flex justify-center">
            <WhatsAppChat />
          </div>
        </div>

        {/* Gradient accent */}
        <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-green-500/5 blur-3xl" />
      </section>

      {/* ── Como funciona? ── */}
      <LearningJourney />

      {/* ── Verticals ── */}
      <section
        id="trilhas"
        className="scroll-mt-20 border-t border-border-subtle py-20 md:py-24"
      >
        <div className="mx-auto max-w-container px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-micro font-medium uppercase tracking-micro text-green-600">
              2 disponíveis · 2 em desenvolvimento
            </span>
            <h2 className="mt-3 text-display-m tracking-display text-neutral-900">
              Trilha feita pro seu negócio.
            </h2>
            <p className="mt-4 font-serif text-body-l italic text-text-secondary">
              A Maria te conecta com quem entende o seu ramo. Cada vertical tem
              uma pessoa especialista própria.
            </p>
          </div>
          <VerticalCards />
        </div>
      </section>

      {/* ── Outcome Section ── */}
      <OutcomeSection />

      {/* ── CTA ── */}
      <section className="border-t border-border-subtle py-20 md:py-24">
        <div className="mx-auto max-w-container px-6 text-center">
          <div className="relative flex flex-col items-center">
            <div className="mb-4">
              <MariaTip />
            </div>
            <MariaAvatar size={96} />
          </div>
          <h2 className="mt-8 text-display-m tracking-display text-neutral-900">
            Bora começar?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-serif text-body-l italic text-text-secondary">
            O primeiro passo é o mais fácil. Manda um &quot;oi&quot; pra Maria
            no WhatsApp e ela cuida do resto.
          </p>
          <a
            href={WHATSAPP_URL}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-green-500 px-8 py-4 text-body-m font-medium text-green-900 hover:bg-green-400 transition-duration-fast transition-colors"
          >
            falar com a Maria
            <span aria-hidden="true">&rarr;</span>
          </a>
          <p className="mt-4 text-micro text-text-tertiary">
            grátis · sem cadastro · 5 minutos por dia
          </p>
        </div>
      </section>

      <Footer />
      <DonateSection />
    </div>
  );
}
