import { NextRequest, NextResponse } from 'next/server';

const MIN_AMOUNT = 500; // R$ 5,00 em centavos
const MAX_AMOUNT = 10000000; // R$ 100.000,00 em centavos
// Endpoint oficial AbacatePay para gerar QR Code Pix dinâmico.
// Ref: https://docs.abacatepay.com/pages/pix-qrcode/create
const ABACATE_API_URL = 'https://api.abacatepay.com/v1/pixQrCode/create';

interface AbacateCreateResponse {
  data?: {
    id: string;
    amount: number;
    status: string;
    devMode?: boolean;
    brCode?: string;
    brCodeBase64?: string;
    platformFee?: number;
    expiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
    // Campos legados/alternativos mantidos por defesa em profundidade
    qrCode?: string;
    qrCodeBase64?: string;
    pixCode?: string;
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
      const externalId = `don_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Payload no formato esperado pelo endpoint v1/pixQrCode/create.
      // Doação é anônima: customer não é enviado (campo opcional na API).
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
            externalId,
            source: 'pronto-ia-web',
            kind: 'donation',
          },
        }),
        cache: 'no-store',
      });

      const rawText = await upstream.text();
      let data: AbacateCreateResponse = {};
      try {
        data = rawText ? (JSON.parse(rawText) as AbacateCreateResponse) : {};
      } catch {
        // resposta não-JSON (ex.: HTML de erro do edge): mantemos data = {}
      }

      const pixCode =
        data.data?.brCode?.trim() ||
        data.data?.pixCode?.trim() ||
        '';
      const qrCode =
        data.data?.brCodeBase64?.trim() ||
        data.data?.qrCodeBase64?.trim() ||
        data.data?.qrCode?.trim() ||
        '';

      if (!upstream.ok || !data.data?.id) {
        // Log no servidor para diagnóstico — visível em vercel logs / railway logs.
        console.error('[donate] AbacatePay falhou', {
          status: upstream.status,
          error: data.error,
          bodySnippet: rawText.slice(0, 500),
        });
        return NextResponse.json(
          { error: data.error ?? 'Não foi possível gerar o Pix agora.' },
          { status: upstream.status || 502 },
        );
      }

      // Aceita resposta mesmo sem qrCode base64: o front gera fallback a partir do brCode.
      // Só recusa se nem o copia-e-cola vier.
      if (!pixCode) {
        console.error('[donate] AbacatePay retornou sem brCode/pixCode', {
          dataKeys: Object.keys(data.data ?? {}),
        });
        return NextResponse.json(
          { error: 'Resposta inválida do provedor de pagamento.' },
          { status: 502 },
        );
      }

      return NextResponse.json({
        donationId: data.data.id,
        status: (data.data.status ?? 'pending').toLowerCase(),
        pixCode,
        qrCode,
        expiresAt: data.data.expiresAt ?? null,
      });
    }

    return NextResponse.json(
      { error: 'Método ainda não implementado.' },
      { status: 501 },
    );
  } catch (err) {
    console.error('[donate] erro interno', err);
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 },
    );
  }
}
