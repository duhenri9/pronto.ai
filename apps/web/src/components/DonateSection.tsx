'use client';

import { useState } from 'react';
import { Heart, X, Copy, Check, Sprout } from 'lucide-react';
import Link from 'next/link';

const DONATION_VALUES = [
  { label: 'R$ 10', cents: 1000 },
  { label: 'R$ 25', cents: 2500 },
  { label: 'R$ 50', cents: 5000 },
  { label: 'R$ 100', cents: 10000 },
];

type DonationState = 'idle' | 'selecting' | 'loading' | 'success' | 'error';

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
    if (!amount || amount < 500 || amount > 100000) return;

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

  const canDonate = selectedAmount !== null || (customAmount && parseFloat(customAmount) >= 5 && parseFloat(customAmount) <= 1000);

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
            className={`relative w-[95%] sm:w-full sm:max-w-[440px] bg-[#0F1535] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-elev-3 max-h-[95vh] overflow-y-auto transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
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
                <div className="flex items-center gap-2 mb-4">
                  <Sprout size={20} className="text-[#00D97E]" />
                  <h3 className="text-heading-s font-medium text-white/90">Por que apoiar?</h3>
                </div>
                <p className="text-body-s text-white/70 leading-relaxed">
                  O Pronto.IA capacita MEIs brasileiros para a era da IA — de graça, no WhatsApp, sem complicação.
                </p>
                <p className="mt-3 text-body-s text-white/70 leading-relaxed">
                  Cada real mantém a Maria no ar para quem mais precisa. Seu apoio paga os servidores, a IA e a equipe que faz isso acontecer.
                </p>
              </div>
            )}

            {/* ── Selecting state ── */}
            {state === 'selecting' && (
              <>
                <div className="border-t border-white/10 pt-6">
                  <p className="font-mono text-micro uppercase tracking-micro text-[#757994] mb-3">
                    Escolha o valor
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {DONATION_VALUES.map((v) => (
                      <button
                        key={v.cents}
                        onClick={() => { setSelectedAmount(v.cents); setCustomAmount(''); }}
                        className={`rounded-lg border p-3 text-heading-s font-medium transition-all duration-fast ease-out ${
                          selectedAmount === v.cents
                            ? 'border-[#00D97E] bg-[#00D97E]/10 text-[#00D97E]'
                            : 'border-white/10 bg-[#1A2150] text-white/90 hover:scale-105 hover:border-[#00D97E]/50'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <input
                      type="number"
                      min="5"
                      max="1000"
                      step="1"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                      placeholder="Outro valor: R$"
                      className="w-full rounded-lg border border-[#4D5274] bg-[#252B54] px-4 py-3 text-body-s text-white placeholder:text-[#757994] focus:border-[#00D97E] focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={!canDonate}
                    className="w-full rounded-lg bg-[#00D97E] py-3.5 text-body-m font-medium text-[#0F1535] hover:scale-[1.02] transition-all duration-fast ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Doar via Pix
                  </button>

                  <p className="mt-4 text-center text-micro text-[#757994]">
                    Sua doação é segura e transparente.{' '}
                    <Link href="/transparencia" className="text-[#00D97E] hover:underline" onClick={handleClose}>
                      Veja como usamos cada real →
                    </Link>
                  </p>
                </div>
              </>
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
                  <Check size={28} className="text-[#00D97E]" />
                </div>
                <p className="mt-4 text-heading-s font-medium text-white/90">Obrigado!</p>
                <p className="mt-2 text-center text-body-s text-white/70">
                  Você ajuda a capacitar o Brasil para a era da IA.
                </p>

                <div className="mt-5 w-full rounded-lg bg-[#1A2150] p-4">
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
