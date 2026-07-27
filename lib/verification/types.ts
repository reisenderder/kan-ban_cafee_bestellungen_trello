export type VerificationChannel = 'TELEGRAM' | 'EMAIL' | 'PHONE';

export interface OtpGenerationOptions {
  channel: VerificationChannel;
  targetAddress: string;
  orderDraftId?: string;
}

export interface OtpVerificationResult {
  success: boolean;
  message: string;
  trustedChannelId?: string;
  resolutionCaseCreated?: boolean;
}

export interface VerificationAdapter {
  sendOtpCode(target: string, code: string): Promise<boolean>;
}
