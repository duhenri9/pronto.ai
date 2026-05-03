// ============================================
// PRONTO.IA — WhatsApp Cloud API Client
// ============================================
// Supports both Meta Cloud API (production) and
// Z-API (pilot / <1k students) via a unified interface.

// ---- Types ----

export interface WhatsAppProvider {
  sendMessage(params: SendTextParams): Promise<SendMessageResult>;
  sendInteractive(params: SendInteractiveParams): Promise<SendMessageResult>;
  sendTemplate(params: SendTemplateParams): Promise<SendMessageResult>;
  markAsRead(messageId: string): Promise<void>;
  verifyWebhook(mode: string, token: string): Promise<boolean>;
  verifyPayload(body: string, signature: string): Promise<boolean>;
  parseWebhook(body: unknown): ParsedWebhookEvent[];
  getMediaUrl(mediaId: string): Promise<string>;
  downloadMedia(url: string): Promise<Buffer>;
}

export interface SendTextParams {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface SendInteractiveParams {
  to: string;
  body: string;
  buttons: InteractiveButton[];
  header?: string;
  footer?: string;
}

export interface InteractiveButton {
  id: string;
  title: string; // max 20 chars
}

export interface SendTemplateParams {
  to: string;
  templateName: string;
  language: string;
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: { id: string };
  document?: { id: string; filename?: string };
}

export interface SendMessageResult {
  messageId: string;
  whatsappMessageId?: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface ParsedWebhookEvent {
  eventType: 'message' | 'status' | 'error';
  phone: string;
  waId?: string;
  messageId?: string;
  text?: string;
  mediaId?: string;
  mediaType?: string;
  status?: string;
  timestamp: string;
  profileName?: string;
  raw: unknown;
}

// ---- Meta Cloud API Implementation ----

const META_API_BASE = 'https://graph.facebook.com/v21.0';

export class MetaCloudAPI implements WhatsAppProvider {
  private apiToken: string;
  private phoneNumberId: string;
  private verifyToken: string;
  private appSecret: string;

  constructor(config?: {
    apiToken?: string;
    phoneNumberId?: string;
    verifyToken?: string;
    appSecret?: string;
  }) {
    this.apiToken =
      config?.apiToken ??
      process.env.WHATSAPP_API_TOKEN ??
      process.env.META_WHATSAPP_ACCESS_TOKEN ??
      '';
    this.phoneNumberId =
      config?.phoneNumberId ??
      process.env.WHATSAPP_PHONE_NUMBER_ID ??
      process.env.META_WHATSAPP_PHONE_NUMBER_ID ??
      '';
    this.verifyToken = config?.verifyToken ?? process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? '';
    this.appSecret = config?.appSecret ?? process.env.WHATSAPP_APP_SECRET ?? '';
  }

  async sendMessage(params: SendTextParams): Promise<SendMessageResult> {
    const url = `${META_API_BASE}/${this.phoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'text',
      text: {
        body: params.text,
        preview_url: params.previewUrl ?? false,
      },
    };

    return this.sendRequest(url, body);
  }

  async sendInteractive(params: SendInteractiveParams): Promise<SendMessageResult> {
    const url = `${META_API_BASE}/${this.phoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: params.body },
        action: {
          buttons: params.buttons.map((btn) => ({
            type: 'reply',
            reply: { id: btn.id, title: btn.title },
          })),
        },
        ...(params.header && { header: { type: 'text', text: params.header } }),
        ...(params.footer && { footer: { text: params.footer } }),
      },
    };

    return this.sendRequest(url, body);
  }

  async sendTemplate(params: SendTemplateParams): Promise<SendMessageResult> {
    const url = `${META_API_BASE}/${this.phoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.language },
        components: params.components,
      },
    };

    return this.sendRequest(url, body);
  }

  async markAsRead(messageId: string): Promise<void> {
    const url = `${META_API_BASE}/${this.phoneNumberId}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  }

  async verifyWebhook(mode: string, token: string): Promise<boolean> {
    return mode === 'subscribe' && token === this.verifyToken;
  }

  async verifyPayload(body: string, signature: string): Promise<boolean> {
    if (!this.appSecret) {
      // In dev without app secret configured, skip verification
      return true;
    }
    const crypto = await import('crypto');
    const expectedSig = 'sha256=' + crypto
      .createHmac('sha256', this.appSecret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSig);
    const sigBuf = Buffer.from(signature);

    // timingSafeEqual requires buffers of equal length — mismatched length = invalid
    if (expectedBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  }

  parseWebhook(body: unknown): ParsedWebhookEvent[] {
    const parsed = body as MetaWebhookPayload;
    const events: ParsedWebhookEvent[] = [];

    for (const entry of parsed?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        const value = change?.value;
        if (!value) continue;

        // Messages
        for (const msg of value.messages ?? []) {
          events.push({
            eventType: 'message',
            phone: msg.from,
            waId: value.contacts?.[0]?.wa_id,
            messageId: msg.id,
            text: msg.text?.body ?? msg.button?.text,
            mediaId: msg.image?.id ?? msg.document?.id ?? msg.audio?.id,
            mediaType: msg.image ? 'image' : msg.document ? 'document' : msg.audio ? 'audio' : undefined,
            timestamp: msg.timestamp,
            profileName: value.contacts?.[0]?.profile?.name,
            raw: msg,
          });
        }

        // Status updates
        for (const status of value.statuses ?? []) {
          events.push({
            eventType: 'status',
            phone: status.recipient_id,
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp,
            raw: status,
          });
        }
      }
    }

    return events;
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    const url = `${META_API_BASE}/${mediaId}`;
    const res = await fetch(url, { headers: this.headers() });
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    const res = await fetch(mediaUrl, { headers: this.headers() });
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // ---- Private ----

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async sendRequest(
    url: string,
    body: unknown,
  ): Promise<SendMessageResult> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        messages?: { id: string }[];
        error?: { message: string };
      };

      if (!res.ok || data.error) {
        return {
          messageId: '',
          status: 'failed',
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      }

      return {
        messageId: data.messages?.[0]?.id ?? '',
        whatsappMessageId: data.messages?.[0]?.id,
        status: 'sent',
      };
    } catch (err) {
      return {
        messageId: '',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

// ---- Z-API Implementation (Pilot) ----

export class ZAPIProvider implements WhatsAppProvider {
  private instanceId: string;
  private token: string;
  private securityToken: string;
  private baseUrl: string;

  constructor(config?: {
    instanceId?: string;
    token?: string;
    securityToken?: string;
  }) {
    this.instanceId = config?.instanceId ?? process.env.ZAPI_INSTANCE_ID ?? '';
    this.token = config?.token ?? process.env.ZAPI_TOKEN ?? '';
    this.securityToken = config?.securityToken ?? process.env.ZAPI_SECURITY_TOKEN ?? '';
    this.baseUrl = `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }

  async sendMessage(params: SendTextParams): Promise<SendMessageResult> {
    const url = `${this.baseUrl}/send-text`;
    const body = {
      phone: params.to,
      message: params.text,
    };

    return this.sendRequest(url, body);
  }

  async sendInteractive(params: SendInteractiveParams): Promise<SendMessageResult> {
    const url = `${this.baseUrl}/send-button-list`;
    const body = {
      phone: params.to,
      message: params.body,
      optionList: params.buttons.map((btn) => ({
        id: btn.id,
        title: btn.title,
      })),
    };

    return this.sendRequest(url, body);
  }

  async sendTemplate(_params: SendTemplateParams): Promise<SendMessageResult> {
    // Z-API doesn't support templates directly — send as text
    return {
      messageId: '',
      status: 'failed',
      error: 'Templates not supported in Z-API pilot mode',
    };
  }

  async markAsRead(_messageId: string): Promise<void> {
    // Z-API doesn't support read receipts natively
  }

  async verifyWebhook(mode: string, token: string): Promise<boolean> {
    return mode === 'subscribe' && token === this.securityToken;
  }

  async verifyPayload(body: string, signature: string): Promise<boolean> {
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha256', this.securityToken)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(hash);
    const sigBuf = Buffer.from(signature);

    // timingSafeEqual requires buffers of equal length — mismatched length = invalid
    if (expectedBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  }

  parseWebhook(body: unknown): ParsedWebhookEvent[] {
    const data = body as ZAPIWebhookPayload;
    const events: ParsedWebhookEvent[] = [];

    if (data.message) {
      events.push({
        eventType: 'message',
        phone: data.phone ?? '',
        messageId: data.message?.id ?? data.msgId,
        text: data.message?.body ?? data.text,
        mediaType: data.message?.type === 'image' ? 'image' : data.message?.type === 'document' ? 'document' : undefined,
        timestamp: data.timestamp ?? new Date().toISOString(),
        profileName: data.senderName ?? data.pushName,
        raw: data,
      });
    }

    return events;
  }

  async getMediaUrl(_mediaId: string): Promise<string> {
    throw new Error('Z-API media download not implemented in pilot mode');
  }

  async downloadMedia(_url: string): Promise<Buffer> {
    throw new Error('Z-API media download not implemented in pilot mode');
  }

  // ---- Private ----

  private async sendRequest(
    url: string,
    body: unknown,
  ): Promise<SendMessageResult> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': this.securityToken,
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        messageId?: string;
        zaapId?: string;
        error?: string;
      };

      if (!res.ok || data.error) {
        return {
          messageId: '',
          status: 'failed',
          error: data.error ?? `HTTP ${res.status}`,
        };
      }

      return {
        messageId: data.zaapId ?? data.messageId ?? '',
        status: 'sent',
      };
    } catch (err) {
      return {
        messageId: '',
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

// ---- Factory ----

export function createWhatsAppProvider(
  provider?: 'cloud_api' | 'zapi',
): WhatsAppProvider {
  const mode = provider ?? (process.env.WHATSAPP_PROVIDER as 'zapi' | 'cloud_api') ?? 'zapi';

  if (mode === 'cloud_api') {
    return new MetaCloudAPI();
  }

  return new ZAPIProvider();
}

// ---- Webhook Payload Types ----

interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          button?: { text: string; payload: string };
          image?: { id: string; caption?: string };
          document?: { id: string; filename?: string };
          audio?: { id: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          recipient_id: string;
          status: string;
          timestamp: string;
        }>;
        contacts?: Array<{
          wa_id: string;
          profile?: { name: string };
        }>;
      };
    }>;
  }>;
}

interface ZAPIWebhookPayload {
  phone?: string;
  message?: {
    id?: string;
    body?: string;
    type?: string;
  };
  text?: string;
  msgId?: string;
  timestamp?: string;
  senderName?: string;
  pushName?: string;
}
