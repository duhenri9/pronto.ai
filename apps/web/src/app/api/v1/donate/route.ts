import { NextRequest, NextResponse } from 'next/server';

const MIN_AMOUNT = 500; // R$ 5,00 em centavos
const MAX_AMOUNT = 10000000; // R$ 100.000,00 em centavos
const ABACATE_API_URL = 'https://api.abacatepay.com/v2/transparents/create';

interface AbacateCreateResponse {
  data?: {
    id: string;
    amount: number;
    status: string;
    brCode?: string;
    brCodeBase64?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    pixCode?: string;
    expiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string | null;
  success?: boolean | { message?: string };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, method } = body;
    const apiKey = process.env.ABACATE_PAY_API_KEY ?? process.env.ABACATE_PAY_API;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Valor deve ser entre R$ ${MIN_AMOUNT / 100} e R$ ${MAX_AMOUNT / 100}` },
        { status: 400 },
      );
    }

    // Validate method
    if (!method || !['PIX', 'CREDIT_CARD'].includes(method)) {
      return NextResponse.json(
        { error: 'Método deve ser PIX ou CREDIT_CARD' },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Doações Pix ainda não estão configuradas neste ambiente.' },
        { status: 503 },
      );
    }

    if (method === 'PIX') {
      const upstream = await fetch(ABACATE_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          expiresIn: 3600,
          description: 'Doação para o projeto Pronto.IA',
          metadata: {
            source: 'pronto-ia-web',
            kind: 'donation',
          },
        }),
        cache: 'no-store',
      });

      const data = (await upstream.json()) as AbacateCreateResponse;
      const pixCode =
        data.data?.brCode?.trim() ||
        data.data?.pixCode?.trim() ||
        '';
      const qrCode =
        data.data?.brCodeBase64?.trim() ||
        data.data?.qrCodeBase64?.trim() ||
        data.data?.qrCode?.trim() ||
        '';

      if (!upstream.ok || !data.data?.id || !pixCode || !qrCode) {
        return NextResponse.json(
          { error: data.error ?? 'Não foi possível gerar o Pix agora.' },
          { status: upstream.status || 502 },
        );
      }

      return NextResponse.json({
        donationId: data.data.id,
        status: data.data.status.toLowerCase(),
        pixCode,
        qrCode,
        expiresAt: data.data.expiresAt ?? null,
      });
    }

    return NextResponse.json(
      { error: 'Método ainda não implementado.' },
      { status: 501 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 },
    );
  }
}
