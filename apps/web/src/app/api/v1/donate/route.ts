import { NextRequest, NextResponse } from 'next/server';

const MIN_AMOUNT = 500; // R$ 5,00 em centavos
const MAX_AMOUNT = 10000000; // R$ 100.000,00 em centavos

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, method } = body;

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

    // Placeholder: simulate donation (ready for Abacate Pay integration)
    const donationId = `don_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const response: Record<string, unknown> = {
      donationId,
      status: 'pending',
    };

    if (method === 'PIX') {
      // TODO: Replace with real Abacate Pay PIX creation
      response.pixCode = `00020126580014br.gov.bcb.pix0136${donationId}5204000053039865802BR5925PRONTO IA CAPACITACAO6009SAO PAULO62070503***63041234`;
      response.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.pixCode as string)}`;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 },
    );
  }
}
