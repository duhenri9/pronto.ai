'use client';

import { useState } from 'react';
import { Heart, X, Copy, Check, Coffee, Rocket, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/* ── Tiers de valor ── */
const VALUE_TIERS = [
  {
    id: 'cafezinho',
    label: 'Cafezinho',
    icon: Coffee,
    accent: '#F59E0B',
    values: [
      { label: 'R$ 5', cents: 500 },
      { label: 'R$ 10', cents: 1000 },
      { label: 'R$ 20', cents: 2000 },
    ],
  },
  {
    id: 'apoio',
    label: 'Apoio',
    icon: Heart,
    accent: '#00D97E',
    values: [
      { label: 'R$ 50', cents: 5000 },
      { label: 'R$ 100', cents: 10000 },
      { label: 'R$ 200', cents: 20000 },
    ],
  },
  {
    id: 'impacto',
    label: 'Impacto',
    icon: Rocket,
    accent: '#8B5CF6',
    values: [
      { label: 'R$ 500', cents: 50000 },
      { label: 'R$ 1.000', cents: 100000 },
      { label: 'R$ 2.500', cents: 250000 },
    ],
  },
] as const;

type DonationState = 'idle' | 'selecting' | 'loading' | 'success' | 'error';

function QRCodePlaceholder() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-36 w-36 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-[3px] p-3">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-[2px] ${Math.random() > 0.4 ? 'bg-white/80' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>
      <p className="font-mono text-micro text-[#757994]">QR Code Pix</p>
    </div>
  );
}

function formatBRL(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DonateSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [state, setState] = useState<DonationState>('selecting');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDonate = async () => {
    const amount = selectedAmount ?? Math.round(parseFloat(customAmount) * 100);
    if (!amount || amount < 500 || amount > 10000000) return;

    setState('loading');
    try {
      const res = await fetch('/api/v1/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: 'PIX' }),
      });
      const data = await res.json();
      if (data.pixCode) {
        setPixCode(data.pixCode);
        setState('success');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setState('selecting');
      setSelectedAmount(null);
      setCustomAmount('');
      setPixCode('');
      setCopied(false);
    }, 150);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setState('selecting');
  };

  const canDonate = selectedAmount !== null || (customAmount && parseFloat(customAmount) >= 5 && parseFloat(customAmount) <= 100000);

  const buttonText = selectedAmount
    ? `Doar ${formatBRL(selectedAmount)} via Pix`
    : customAmount && parseFloat(customAmount) >= 5
      ? `Doar R$ ${parseFloat(customAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} via Pix`
      : 'Escolha um valor';

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#00D97E] px-5 py-3 text-body-s font-medium text-[#0F1535] shadow-elev-2 hover:scale-105 transition-all duration-fast ease-out"
        aria-label="Apoie o Pronto.IA"
      >
        <Heart size={18} strokeWidth={2} className="animate-pulse" />
        Apoie
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <div
            className={`relative w-[95%] sm:w-full sm:max-w-[480px] bg-[#0F1535] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-elev-3 max-h-[95vh] overflow-y-auto transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#757994] hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* ── CTA emocional ── */}
            {state === 'selecting' && (
              <div className="mb-6">
                <h3 className="text-heading-s font-medium text-white/90 mb-2">
                  Cada real capacita um MEI brasileiro para a era da IA
                </h3>
                <p className="text-body-s text-white/70 leading-relaxed">
                  O Pronto.IA treina MEIs de graça, no WhatsApp, sem complicação. Seu apoio paga os servidores, a IA e a equipe que faz isso acontecer.
                </p>
              </div>
            )}

            {/* ── Selecting state ── */}
            {state === 'selecting' && (
              <div className="border-t border-white/10 pt-6">
                <p className="font-mono text-micro uppercase tracking-micro text-[#757994] mb-4">
                  Escolha o valor
                </p>

                {/* Value tiers */}
                <div className="space-y-5 mb-5">
                  {VALUE_TIERS.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <div key={tier.id}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <Icon size={16} style={{ color: tier.accent }} />
                          <span className="text-caption font-medium text-white/80">{tier.label}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {tier.values.map((v) => (
                            <button
                              key={v.cents}
                              onClick={() => { setSelectedAmount(v.cents); setCustomAmount(''); }}
                              className={`rounded-lg border p-3 text-body-s font-medium transition-all duration-fast ease-out ${
                                selectedAmount === v.cents
                                  ? 'border-transparent text-white shadow-elev-1'
                                  : 'border-white/10 bg-[#1A2150] text-white/80 hover:scale-105 hover:border-white/25'
                              }`}
                              style={selectedAmount === v.cents ? { backgroundColor: tier.accent, color: tier.accent === '#F59E0B' ? '#0F1535' : '#fff' } : undefined}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom value */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Wallet size={16} className="text-[#757994]" />
                    <span className="text-caption font-medium text-white/80">Outro valor</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-s text-[#757994]">R$</span>
                    <input
                      type="number"
                      min="5"
                      max="100000"
                      step="1"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                      placeholder="0,00"
                      className="w-full rounded-lg border border-[#4D5274] bg-[#252B54] pl-11 pr-4 py-3 text-body-s text-white placeholder:text-[#757994] focus:border-[#00D97E] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Donate button */}
                <button
                  onClick={handleDonate}
                  disabled={!canDonate}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#00D97E] py-3.5 text-body-m font-medium text-[#0F1535] hover:scale-[1.02] transition-all duration-fast ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Heart size={16} fill="#0F1535" />
                  {buttonText}
                  {canDonate && <ArrowRight size={16} />}
                </button>

                <p className="mt-4 text-center text-micro text-[#757994]">
                  Sua doação é segura e transparente.{' '}
                  <Link href="/transparencia" className="text-[#00D97E] hover:underline" onClick={handleClose}>
                    Veja como usamos cada real →
                  </Link>
                </p>
              </div>
            )}

            {/* ── Loading ── */}
            {state === 'loading' && (
              <div className="flex flex-col items-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00D97E] border-t-transparent" />
                <p className="mt-4 text-body-s text-white/70">Gerando Pix...</p>
              </div>
            )}

            {/* ── Success ── */}
            {state === 'success' && (
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00D97E]/20">
                  <Heart size={28} className="text-[#00D97E]" fill="#00D97E" />
                </div>
                <p className="mt-4 text-heading-s font-medium text-white/90">Obrigado</p>
                <p className="mt-2 text-center text-body-s text-white/70">
                  Você ajuda a capacitar o Brasil para a era da IA.
                </p>

                {/* QR Code placeholder */}
                <div className="mt-5">
                  <QRCodePlaceholder />
                </div>

                {/* Copia-e-cola */}
                <div className="mt-4 w-full rounded-lg bg-[#1A2150] p-4">
                  <p className="font-mono text-micro uppercase tracking-micro text-[#757994] mb-2">
                    Código copia-e-cola
                  </p>
                  <p className="text-caption text-white/80 break-all select-all leading-relaxed">{pixCode}</p>
                </div>

                <button
                  onClick={handleCopy}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-body-s text-white/80 hover:bg-white/5 transition-colors"
                >
                  {copied ? <Check size={16} className="text-[#00D97E]" /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar código'}
                </button>

                <p className="mt-5 text-micro text-[#757994]">
                  <Link href="/transparencia" className="text-[#00D97E] hover:underline" onClick={handleClose}>
                    Veja como usamos cada real →
                  </Link>
                </p>
              </div>
            )}

            {/* ── Error ── */}
            {state === 'error' && (
              <div className="flex flex-col items-center py-6">
                <p className="text-body-s text-red-400">Algo deu errado — tente de novo.</p>
                <button
                  onClick={() => setState('selecting')}
                  className="mt-4 rounded-lg border border-white/10 px-4 py-2.5 text-body-s text-white/80 hover:bg-white/5 transition-colors"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
