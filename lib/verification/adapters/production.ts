import { VerificationAdapter } from '../types';

export class ProductionOtpAdapter implements VerificationAdapter {
  private channel: 'TELEGRAM' | 'EMAIL';

  constructor(channel: 'TELEGRAM' | 'EMAIL') {
    this.channel = channel;
  }

  async sendOtpCode(target: string, code: string): Promise<boolean> {
    const maxRetries = 3;
    const delays = [1000, 2000, 4000];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        let success = false;

        if (this.channel === 'TELEGRAM') {
          // Telegram Bot API send message
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN is not configured');
            return false;
          }
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: target,
              text: `Кафе DAYMOHKCOFEE\nКод подтверждения заказа: ${code}\nДействителен 10 минут.`,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          success = response.ok;
        } else {
          // Resend Email API
          const resendApiKey = process.env.RESEND_API_KEY;
          if (!resendApiKey) {
            console.error('RESEND_API_KEY is not configured');
            return false;
          }
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'DAYMOHKCOFEE <orders@daymohkcofee.com>',
              to: [target],
              subject: 'Код подтверждения заказа DAYMOHKCOFEE',
              html: `<p>Ваш код подтверждения заказа: <strong>${code}</strong></p><p>Действителен 10 минут.</p>`,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          success = response.ok;
        }

        if (success) return true;
      } catch (err) {
        console.warn(`[ProductionOtpAdapter] Attempt ${attempt + 1} failed for ${target}`);
      }

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }

    return false;
  }
}
