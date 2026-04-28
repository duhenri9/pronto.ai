"use client";

import { useState, useEffect, useRef } from "react";

const TIP_TEXT =
  "42% das médias e grandes empresas já usam IA para aumentar produtividade. Seu pequeno negócio também pode. Fonte: Sebrae + FGV IBRE + Google, 2026.";

const TYPING_SPEED = 40; // ms por caractere

export function MariaTip() {
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!isVisible) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < TIP_TEXT.length) {
        setDisplayedText(TIP_TEXT.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, TYPING_SPEED);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div
      ref={cardRef}
      className={`relative bg-[#1A2150] border border-[#252B54] rounded-2xl p-5 max-w-xs shadow-lg transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Ícone de silêncio */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#00D97E]/10 border border-[#00D97E]/20 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00D97E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
            <line x1="8" x2="16" y1="23" y2="23" />
            <line x1="23" x2="17" y1="3" y2="9" />
            <line x1="17" x2="23" y1="3" y2="9" />
          </svg>
        </div>
        <span className="text-xs font-medium text-[#00D97E] uppercase tracking-wider">
          Dica de Ouro da Maria
        </span>
      </div>

      {/* Texto com efeito de digitação */}
      <p className="text-sm text-[#9DA1B4] leading-relaxed min-h-[60px]">
        {displayedText}
        <span className="inline-block w-0.5 h-4 bg-[#00D97E] ml-0.5 animate-pulse" />
      </p>

      {/* Seta apontando para baixo (para o avatar) */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1A2150] border-r border-b border-[#252B54] rotate-45" />
    </div>
  );
}
