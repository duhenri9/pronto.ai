import { describe, it, expect } from 'vitest';
import { ZAPIProvider, MetaCloudAPI, createWhatsAppProvider } from '../src/index';

describe('ZAPIProvider — HMAC verification', () => {
  const securityToken = 'test-security-token-for-hmac';
  const provider = new ZAPIProvider({
    instanceId: 'test-instance',
    token: 'test-token',
    securityToken,
  });

  it('verifies a valid HMAC-SHA256 signature', async () => {
    const crypto = await import('crypto');
    const body = '{"phone":"5511999999999","message":{"body":"Oi Maria"}}';
    const hash = crypto
      .createHmac('sha256', securityToken)
      .update(body)
      .digest('hex');

    const isValid = await provider.verifyPayload(body, hash);
    expect(isValid).toBe(true);
  });

  it('rejects an invalid HMAC signature', async () => {
    const body = '{"phone":"5511999999999"}';
    const badSignature = 'deadbeef1234567890';

    const isValid = await provider.verifyPayload(body, badSignature);
    expect(isValid).toBe(false);
  });

  it('rejects tampered body with correct-looking signature', async () => {
    const crypto = await import('crypto');
    const originalBody = '{"phone":"5511999999999"}';
    const hash = crypto
      .createHmac('sha256', securityToken)
      .update(originalBody)
      .digest('hex');

    // Tamper with the body but use the original signature
    const tamperedBody = '{"phone":"5511888888888"}';
    const isValid = await provider.verifyPayload(tamperedBody, hash);
    expect(isValid).toBe(false);
  });
});

describe('ZAPIProvider — webhook verification', () => {
  const provider = new ZAPIProvider({
    instanceId: 'test',
    token: 'test',
    securityToken: 'verify-token-123',
  });

  it('accepts subscribe mode with correct token', async () => {
    const isValid = await provider.verifyWebhook('subscribe', 'verify-token-123');
    expect(isValid).toBe(true);
  });

  it('rejects wrong token', async () => {
    const isValid = await provider.verifyWebhook('subscribe', 'wrong-token');
    expect(isValid).toBe(false);
  });

  it('rejects wrong mode', async () => {
    const isValid = await provider.verifyWebhook('unsubscribe', 'verify-token-123');
    expect(isValid).toBe(false);
  });
});

describe('ZAPIProvider — parseWebhook', () => {
  const provider = new ZAPIProvider({
    instanceId: 'test',
    token: 'test',
    securityToken: 'test',
  });

  it('parses a Z-API message event', () => {
    const payload = {
      phone: '5511999999999',
      message: {
        id: 'msg_abc123',
        body: 'Oi Maria',
        type: 'text',
      },
      timestamp: '2026-04-28T10:00:00Z',
      senderName: 'Ana Silva',
    };

    const events = provider.parseWebhook(payload);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('message');
    expect(events[0].phone).toBe('5511999999999');
    expect(events[0].text).toBe('Oi Maria');
    expect(events[0].messageId).toBe('msg_abc123');
    expect(events[0].profileName).toBe('Ana Silva');
  });

  it('returns empty array for non-message payload', () => {
    const events = provider.parseWebhook({});
    expect(events).toHaveLength(0);
  });
});

describe('MetaCloudAPI — HMAC verification', () => {
  const appSecret = 'test-app-secret-for-meta';
  const provider = new MetaCloudAPI({
    apiToken: 'test',
    phoneNumberId: 'test',
    verifyToken: 'test',
    appSecret,
  });

  it('verifies a valid Meta HMAC-SHA256 signature (sha256= format)', async () => {
    const crypto = await import('crypto');
    const body = '{"entry":[{"changes":[{"value":{"messages":[{"from":"5511999999999"}]}}]}]}';
    const expectedSig = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');

    const isValid = await provider.verifyPayload(body, expectedSig);
    expect(isValid).toBe(true);
  });

  it('rejects an invalid Meta HMAC signature', async () => {
    const body = '{"entry":[]}';
    const badSignature = 'sha256=deadbeef';

    const isValid = await provider.verifyPayload(body, badSignature);
    expect(isValid).toBe(false);
  });

  it('returns true when appSecret is not configured (dev mode)', async () => {
    const devProvider = new MetaCloudAPI({
      apiToken: 'test',
      phoneNumberId: 'test',
      verifyToken: 'test',
      appSecret: '', // empty = dev mode
    });

    const isValid = await devProvider.verifyPayload('any body', 'any signature');
    expect(isValid).toBe(true);
  });
});

describe('MetaCloudAPI — parseWebhook', () => {
  const provider = new MetaCloudAPI({
    apiToken: 'test',
    phoneNumberId: 'test',
    verifyToken: 'test',
    appSecret: 'test',
  });

  it('parses a Meta Cloud API message event', () => {
    const payload = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '5511999999999',
              id: 'wamid_HgQ',
              timestamp: '1714600000',
              text: { body: 'Oi Maria' },
              type: 'text',
            }],
            contacts: [{
              wa_id: '5511999999999',
              profile: { name: 'Ana Silva' },
            }],
          },
        }],
      }],
    };

    const events = provider.parseWebhook(payload);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('message');
    expect(events[0].phone).toBe('5511999999999');
    expect(events[0].text).toBe('Oi Maria');
    expect(events[0].profileName).toBe('Ana Silva');
  });

  it('parses status events', () => {
    const payload = {
      entry: [{
        changes: [{
          value: {
            statuses: [{
              id: 'wamid_HgQ',
              recipient_id: '5511999999999',
              status: 'delivered',
              timestamp: '1714600001',
            }],
          },
        }],
      }],
    };

    const events = provider.parseWebhook(payload);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('status');
    expect(events[0].status).toBe('delivered');
  });
});

describe('createWhatsAppProvider factory', () => {
  it('creates ZAPIProvider by default', () => {
    process.env.WHATSAPP_PROVIDER = 'zapi';
    const provider = createWhatsAppProvider();
    expect(provider).toBeInstanceOf(ZAPIProvider);
  });

  it('creates MetaCloudAPI when specified', () => {
    const provider = createWhatsAppProvider('cloud_api');
    expect(provider).toBeInstanceOf(MetaCloudAPI);
  });

  it('creates ZAPIProvider when env is zapi', () => {
    process.env.WHATSAPP_PROVIDER = 'zapi';
    const provider = createWhatsAppProvider();
    expect(provider).toBeInstanceOf(ZAPIProvider);
    delete process.env.WHATSAPP_PROVIDER;
  });
});