import { NextRequest, NextResponse } from 'next/server';

const MIN_AMOUNT = 500; // R$ 5,00 em centavos
const MAX_AMOUNT = 10000000; // R$ 100.000,00 em centavos
const ABACATE_API_URL = 'https://api.abacatepay.com/v2/checkouts/create';
const DONATION_PRODUCT_ID = 'prod_Y1N66L21WAeexcX6YTxdYea2';

interface AbacateCheckoutResponse {
  data?: {
    id: string;
    url: string;
    amount: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string | null;
  success?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;
    const apiKey = process.env.ABACATE_PAY_API_KEY ?? process.env.ABACATE_PAY_API;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Valor deve ser entre R$ ${MIN_AMOUNT / 100} e R$ ${MAX_AMOUNT / 100}` },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Doa\u00e7\u00f5es ainda n\u00e3o est\u00e3o configuradas neste ambiente.' },
        { status: 503 },
      );
    }

    const quantity = Math.round(amount / 100);

    const upstream = await fetch(ABACATE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ id: DONATION_PRODUCT_ID, quantity }],
        methods: ['PIX'],
      }),
      cache: 'no-store',
    });

    const data = (await upstream.json()) as AbacateCheckoutResponse;

    if (!upstream.ok || !data.success || !data.data?.url) {
      return NextResponse.json(
        { error: data.error ?? 'N\u00e3o foi poss\u00edvel gerar o checkout agora.' },
        { status: upstream.status || 502 },
      );
    }

    return NextResponse.json({
      checkoutId: data.data.id,
      checkoutUrl: data.data.url,
      amount: data.data.amount,
    });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 },
    );
  }
}
