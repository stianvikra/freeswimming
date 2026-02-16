import type { EmailOtpType } from "@supabase/supabase-js";

const EMAIL_OTP_TYPES: ReadonlySet<EmailOtpType> = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export function getEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value) return null;
  if (EMAIL_OTP_TYPES.has(value as EmailOtpType)) return value as EmailOtpType;
  return null;
}
