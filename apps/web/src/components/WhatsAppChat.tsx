import { MariaAvatar } from './MariaAvatar';

export function WhatsAppChat() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-sunken p-4">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-3 mb-3">
        <MariaAvatar size={32} />
        <div>
          <div className="text-body-s font-medium">Maria</div>
          <div className="text-micro text-green-600">online · respondendo...</div>
        </div>
      </div>

      {/* Messages — from brand manual scenario 01 */}
      <div className="flex flex-col gap-2">
        <div className="mr-auto max-w-[88%] rounded-xl rounded-bl-sm border border-border-subtle bg-surface px-3 py-2 text-body-s leading-relaxed">
          Oi! Eu sou a Maria. Antes da gente começar, me conta — como você prefere que eu te chame?
        </div>
        <div className="ml-auto rounded-xl rounded-br-sm bg-green-500 px-3 py-2 text-body-s font-medium text-green-900">
          Ana
        </div>
        <div className="mr-auto max-w-[88%] rounded-xl rounded-bl-sm border border-border-subtle bg-surface px-3 py-2 text-body-s leading-relaxed">
          Prazer, Ana! Aqui no Pronto.IA a gente faz uma coisa simples: te ajuda a usar IA pra ganhar mais com o seu negócio.
        </div>
        <div className="mr-auto max-w-[88%] rounded-xl rounded-bl-sm border border-border-subtle bg-surface px-3 py-2 text-body-s leading-relaxed">
          Me fala em duas linhas: o que você faz da vida?
        </div>
        <div className="ml-auto rounded-xl rounded-br-sm bg-green-500 px-3 py-2 text-body-s font-medium text-green-900">
          Sou manicure, atendo em casa
        </div>
        <div className="mr-auto max-w-[88%] rounded-xl rounded-bl-sm border border-border-subtle bg-surface px-3 py-2 text-body-s leading-relaxed">
          Aaah, manicure! Adorei. Tenho a Bia aqui com a gente — ela manja tudo de salão e estética. Em 5 minutinhos ela vai te mostrar a primeira coisa prática. Bora?
        </div>
        <div className="ml-auto rounded-xl rounded-br-sm bg-green-500 px-3 py-2 text-body-s font-medium text-green-900">
          bora!
        </div>
      </div>
    </div>
  );
}
