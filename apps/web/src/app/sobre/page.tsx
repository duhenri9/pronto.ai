import { Rocket, Globe, Users, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D97E]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            A missão é{' '}
            <span className="bg-gradient-to-r from-[#00D97E] to-[#00B4D8] bg-clip-text text-transparent">
              capacitar o Brasil
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#9DA1B4] max-w-2xl mx-auto leading-relaxed">
            Somos uma plataforma educacional que conecta as oportunidades da Inteligência Artificial ao dia a dia 
            das pessoas, começando por quem faz a economia girar: o microempreendedor brasileiro.
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-24 px-6 bg-[#0F1535]/50">
        <div className="max-w-3xl mx-auto">
          <p className="text-3xl md:text-4xl font-light leading-relaxed text-white/90">
            A revolução da IA não pode ser privilégio de grandes corporações. 
            Enquanto o mundo avança, 15 milhões de meis estão ficando para trás. 
            Nós existimos para mudar isso.
          </p>
          <p className="text-xl text-[#9DA1B4] mt-8 leading-relaxed">
            Sem login, sem senha, sem app novo. Apenas uma mentora no WhatsApp, 
            pronta para transformar conhecimento em resultado prático.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            {
              icon: Globe,
              title: 'Acesso universal',
              text: 'Se você tem WhatsApp, você tem acesso. Democratizar a IA é a nossa prioridade.',
            },
            {
              icon: Users,
              title: 'Feito para pessoas',
              text: 'A Maria não fala "tecniquês". Ela fala a sua língua, com acolhimento e respeito.',
            },
            {
              icon: Rocket,
              title: 'Resultado real',
              text: 'Cada microlição é desenhada para gerar uma ação imediata no seu negócio.',
            },
            {
              icon: Shield,
              title: 'Ética e transparência',
              text: 'Você não é o produto. Seus dados são protegidos e cada real gasto é público.',
            },
          ].map((item) => (
            <div key={item.title} className="group p-6 rounded-2xl bg-[#1A2150]/50 border border-[#252B54] hover:border-[#00D97E]/30 transition-all duration-300">
              <item.icon className="w-8 h-8 text-[#00D97E] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white/90 mb-2">{item.title}</h3>
              <p className="text-sm text-[#9DA1B4] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quem faz acontecer */}
      <section className="py-24 px-6 bg-[#0F1535]/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white/90 mb-6">Quem faz acontecer</h2>
          <p className="text-lg text-[#9DA1B4] max-w-2xl mx-auto mb-12">
            O Pronto.IA é desenvolvido pela WM3 DIGITAL LTDA, uma empresa brasileira de tecnologia 
            que combina inteligência artificial, engenharia de software e design de produto para criar 
            experiências que importam.
          </p>
          <div className="inline-block bg-[#1A2150] border border-[#252B54] rounded-xl px-8 py-6 text-left">
            <p className="text-sm text-[#757994]">
              WM3 DIGITAL LTDA<br />
              CNPJ: 55.060.419/0001-20<br />
              São Paulo — SP — Brasil
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold text-white/90 mb-4">Faça parte dessa história</h2>
        <p className="text-[#9DA1B4] mb-8">Apoie o projeto ou comece a aprender agora.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2 bg-[#1A2150] border border-[#252B54] text-white px-6 py-3 rounded-full hover:border-[#00D97E]/30 transition-colors"
          >
            Apoie o projeto
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/5511999999999?text=Oi%20Maria%21"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#00D97E] text-[#0F1535] px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Falar com a Maria
          </a>
        </div>
      </section>
    </main>
  );
}