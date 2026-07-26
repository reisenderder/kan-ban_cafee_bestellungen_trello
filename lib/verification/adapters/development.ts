import { VerificationAdapter } from '../types';

export class DevelopmentOtpAdapter implements VerificationAdapter {
  async sendOtpCode(target: string, code: string): Promise<boolean> {
    // Development mode adapter: logs to console without real SMS/Email/Telegram costs
    console.log(`[DevOtpAdapter] Target: ${target} | Code: [REDACTED IN LOGS]`);
    return true;
  }
}
