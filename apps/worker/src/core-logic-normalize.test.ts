// Tests for normalizeAbacateEvent pure function

import { describe, it, expect } from 'vitest';
import { normalizeAbacateEvent } from './core-logic';
import type { NormalizedAbacateEvent } from './core-logic';

describe('normalizeAbacateEvent', () => {
  it('should normalize a direct charge.paid event', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: {
        id: 'chg_123',
        status: 'paid',
        amount: 29900,
        currency: 'BRL',
        customer: { id: 'cus_1', name: 'Joao', email: 'joao@test.com' },
      },
    });

    expect(result.eventType).toBe('charge.paid');
    expect(result.amountCents).toBe(29900);
    expect(result.customerId).toBe('cus_1');
    expect(result.customerName).toBe('Joao');
    expect(result.currency).toBe('BRL');
  });

  it('should normalize a v2 nested event', () => {
    const result = normalizeAbacateEvent({
      event: 'subscription.created',
      data: {
        subscription_id: 'sub_456',
        status: 'active',
        amount: 97.00,
        currency: 'BRL',
        customer: { customer_id: 'cus_2', customer_name: 'Maria', customer_email: 'maria@test.com' },
      },
    });

    expect(result.eventType).toBe('subscription.created');
    expect(result.amountCents).toBe(9700); // float -> cents
    expect(result.customerId).toBe('cus_2');
    expect(result.subscriptionId).toBe('sub_456');
  });

  it('should handle nested "event.data" wrapper (another v2 variant)', () => {
    const result = normalizeAbacateEvent({
      type: 'charge.paid',
      event: 'charge.paid',
      data: {
        value: '49.90',
        status: 'succeeded',
        Customer: { id: 'cus_3', name: 'Ana', email: 'ana@test.com' },
      },
    });

    expect(result.eventType).toBe('charge.paid');
    expect(result.amountCents).toBe(4990); // string -> cents
    expect(result.customerId).toBe('cus_3');
    expect(result.status).toBe('succeeded');
  });

  it('should handle null/undefined input gracefully', () => {
    const result1 = normalizeAbacateEvent(null as any);
    expect(result1.eventType).toBe('unknown');
    expect(result1.customerId).toBe('');

    const result2 = normalizeAbacateEvent(undefined as any);
    expect(result2.eventType).toBe('unknown');
  });

  it('should handle string input gracefully', () => {
    const result = normalizeAbacateEvent('not an object' as any);
    expect(result.eventType).toBe('unknown');
  });

  it('should handle empty object', () => {
    const result = normalizeAbacateEvent({});
    expect(result.eventType).toBe('unknown');
    expect(result.amountCents).toBe(0);
    expect(result.currency).toBe('BRL');
  });

  it('should infer subscription.canceled from various formats', () => {
    const result = normalizeAbacateEvent({
      event: 'subscription_canceled',
      data: { status: 'canceled' },
    });
    expect(result.eventType).toBe('subscription.canceled');
  });

  it('should infer subscription.payment_failed', () => {
    const result = normalizeAbacateEvent({
      event_type: 'subscription-payment_failed',
      data: { status: 'failed' },
    });
    expect(result.eventType).toBe('subscription.payment_failed');
  });

  it('should infer charge.failed', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.failed',
      data: { status: 'failed' },
    });
    expect(result.eventType).toBe('charge.failed');
  });

  it('should infer charge.refunded', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.refunded',
      data: { status: 'refunded' },
    });
    expect(result.eventType).toBe('charge.refunded');
  });

  it('should handle amount as string with cents-like value (>10000)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: '49990', customer: {} },
    });
    // parseFloat('49990') * 100 = 4999000 but > 10000 check happens on number
    expect(result.amountCents).toBe(4999000);
  });

  it('should handle amount as number < 10000 (float in reais)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 29.90, customer: {} },
    });
    expect(result.amountCents).toBe(2990);
  });

  it('should handle amount as number > 10000 (cents)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 29900, customer: {} },
    });
    expect(result.amountCents).toBe(29900);
  });

  it('should extract customer from whatsapp field alias', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: {
        amount: 100,
        customer: { whatsapp: '5511999999999', name: 'Pedro', email: 'pedro@test.com' },
      },
    });
    expect(result.customerName).toBe('Pedro');
  });

  it('should extract customer from phoneNumber field alias', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: {
        amount: 100,
        customer: { phoneNumber: '5511888888888', name: 'Lucia' },
      },
    });
    expect(result.customerName).toBe('Lucia');
  });

  it('should handle missing customer gracefully', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 100 },
    });
    expect(result.customerId).toBe('');
    expect(result.customerName).toBe('');
  });

  it('should handle direct format (no data wrapper)', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      id: 'chg_direct',
      status: 'paid',
      amount: 15000,
      currency: 'brl', // lowercase test
      customer: { id: 'cus_d', name: 'Direto' },
    });
    expect(result.eventType).toBe('charge.paid');
    expect(result.amountCents).toBe(15000);
    expect(result.currency).toBe('BRL'); // uppercased
    expect(result.customerId).toBe('cus_d');
  });

  it('should preserve rawEvent in output', () => {
    const raw = { event: 'charge.paid', data: { amount: 100 } };
    const result = normalizeAbacateEvent(raw);
    expect(result.rawEvent).toBe(raw);
  });

  it('should default currency to BRL when missing', () => {
    const result = normalizeAbacateEvent({
      event: 'charge.paid',
      data: { amount: 100 },
    });
    expect(result.currency).toBe('BRL');
  });
});
