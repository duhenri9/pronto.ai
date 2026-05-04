import { NextRequest, NextResponse } from 'next/server';

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 10000000;
const ABACATE_API_URL = 'https://api.abacatepay.com/v2';
const ABACATE_API_KEY = 'abc_prod_YAyHFKhfMstfFBgCB5rDMP14';

const PRODUCT_MAP: Record<number, string> = {
  500: 'prod_GBAQG3aZshSFQ1EgRaFWmMUP',
  1000: 'prod_hUFq0TtK3FpjNNWn65zpmZY6',
  2000: 'prod_u3utwEArCbMh4Ksy4Km56kcn',
  5000: 'prod_TtNnRJy0CZHWhg6FNdnrWTNh',
  10000: 'prod_uxuwaTDsN0prALt5XtjdHxnx',
  20000: 'prod_KaxKucZLXkqUqzbB0ZTgTa5U',
  50000: 'prod_gPUP2TqAepqCLJuReMesBdG0',
  100000: 'prod_hHD2yE6EEDRcLcXHarLtJMHY',
  250000: 'prod_xeHLnQ4kpZWpch0adsuhcJ0D',
};

const FALLBACK_PRODUCT_ID = 'prod_Y1N66L21WAeexcX6YTxdYea2';

async function getOrCreateProduct(amount: number) {
  if (PRODUCT_MAP[amount]) {
    return { productId: PRODUCT_MAP[amount], quantity: 1 };
  }

  try {
    const res = await fetch(`${ABACATE_API_URL}/products/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Doacao Pronto IA - R$ ${(amount / 100).toFixed(2)}`,
        price: amount,
        quantity: 999,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { productId: data.id, quantity: 1 };
    }
  } catch {}

  return { productId: FALLBACK_PRODUCT_ID, quantity: Math.round(amount / 100) };
}

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Valor invalido' }, { status: 400 });
    }

    const roundedAmount = Math.round(amount);
    if (roundedAmount < MIN_AMOUNT || roundedAmount > MAX_AMOUNT) {
      return NextResponse.json({ error: 'Valor fora do limite' }, { status: 400 });
    }

    const { productId, quantity } = await getOrCreateProduct(roundedAmount);

    const checkoutRes = await fetch(`${ABACATE_API_URL}/checkouts/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: [{ product_id: productId, quantity }],
        customer: { name: 'Doador Pronto IA' },
        success_url: 'https://pronto.ia',
      }),
    });

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text();
      console.error('AbacatePay checkout error:', errText);
      return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 });
    }

    const checkoutData = await checkoutRes.json();
    return NextResponse.json({ checkoutUrl: checkoutData.checkoutUrl });
  } catch (error) {
    console.error('Donate API error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
