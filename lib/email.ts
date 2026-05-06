import { Resend } from "resend";
import { logger } from "./logger";
import { formatCents } from "./split-engine";

// Safely initialize Resend. If the key is missing (like in dev), it won't crash on boot.
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

if (!resendApiKey && process.env.NODE_ENV === "production") {
  logger.warn("RESEND_API_KEY is not set. Email delivery will silently fail in production.");
}

export interface PasswordResetEmailOptions {
  toEmail: string;
  resetUrl: string;
}

/**
 * Sends a premium HTML password reset email via Resend.
 * Falls back to logging the URL quietly in development if no API key is provided.
 */
export async function sendPasswordResetEmail({ toEmail, resetUrl }: PasswordResetEmailOptions) {
  if (!resend) {
    logger.warn(`Mailer bypassed (No API Key). [FORGOT PASSWORD] link for ${toEmail}: ${resetUrl}`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Fleeper Security <noreply@fleeper.com>",
      to: toEmail,
      subject: "Reset Your Fleeper Password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9fb; padding: 40px 0; color: #1e1e24;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06); border: 1px solid #eeeeef;">
            <div style="background-color: #8B5CF6; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">fleeper</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="margin-top: 0; font-size: 20px; color: #1e1e24; font-weight: 600;">Password Reset Request</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #4a4a52;">
                We received a request to reset the password for your Fleeper dashboard account associated with <strong>${toEmail}</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4a4a52; margin-bottom: 30px;">
                Click the button below to securely set a new password. This link will expire in exactly 1 hour.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="background-color: #8B5CF6; color: white; text-decoration: none; padding: 14px 32px; font-weight: 600; border-radius: 8px; font-size: 16px; display: inline-block;">Reset Password</a>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #8e8e99; margin-bottom: 0;">
                If you didn't request this reset, you can safely ignore this email. Your dashboard password will remain unchanged.
              </p>
            </div>
            <div style="background-color: #fcfcfd; border-top: 1px solid #eeeeef; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #aaaab2;">&copy; ${new Date().getFullYear()} Fleeper. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      logger.error({ error, toEmail }, "Failed to send password reset email via Resend");
      throw new Error(error.message);
    }

    logger.info({ toEmail, resendId: data?.id }, "Password reset email delivered successfully");
    return data;
  } catch (err) {
    logger.error({ err, toEmail }, "Exception during password reset email send");
    throw err;
  }
}

export interface PaymentReceiptEmailOptions {
  toEmail: string;
  sellerName: string;
  grossAmountCents: number;
  platformFeeCents: number;
  netAmountCents: number;
  currency: string;
  transactionId: string;
  description?: string;
  splits: Array<{ poolName: string; amountCents: number; color: string }>;
}

export async function sendPaymentReceiptEmail(opts: PaymentReceiptEmailOptions) {
  const {
    toEmail, sellerName, grossAmountCents, platformFeeCents,
    netAmountCents, currency, transactionId, description, splits,
  } = opts;

  if (!resend) {
    logger.warn({ transactionId, toEmail }, "Receipt email skipped — no RESEND_API_KEY");
    return;
  }

  const gross = formatCents(grossAmountCents, currency.toUpperCase());
  const fee   = formatCents(platformFeeCents, currency.toUpperCase());
  const net   = formatCents(netAmountCents,   currency.toUpperCase());

  const splitRows = splits
    .map(
      (s) =>
        `<tr>
          <td style="padding:8px 0;color:#4a4a52;font-size:14px;">${s.poolName}</td>
          <td style="padding:8px 0;color:#1e1e24;font-size:14px;font-weight:600;text-align:right;">
            ${formatCents(s.amountCents, currency.toUpperCase())}
          </td>
        </tr>`
    )
    .join("");

  try {
    const { data, error } = await resend.emails.send({
      from: "Fleeper Payments <receipts@fleeper.com>",
      to: toEmail,
      subject: `Payment receipt — ${gross} to ${sellerName}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9f9fb;padding:40px 0;color:#1e1e24;">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04);border:1px solid #eeeeef;">
            <div style="background:linear-gradient(135deg,#00FFCC,#00D4A8);padding:24px;text-align:center;">
              <h1 style="color:#0A2E28;margin:0;font-size:22px;font-weight:800;">Payment Received</h1>
              <p style="color:#0A2E28;margin:6px 0 0;opacity:0.7;font-size:14px;">Fleeper auto-routed your income</p>
            </div>
            <div style="padding:36px;">
              <p style="font-size:15px;color:#4a4a52;margin-top:0;">
                Hi <strong>${sellerName}</strong>, your payment of <strong>${gross}</strong>${description ? ` for <em>${description}</em>` : ""} has been processed and split into your income pools.
              </p>

              <div style="background:#f9f9fb;border-radius:10px;padding:20px;margin:24px 0;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0;color:#8e8e99;font-size:13px;">Gross amount</td>
                    <td style="padding:6px 0;color:#1e1e24;font-size:13px;text-align:right;">${gross}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#8e8e99;font-size:13px;">Platform fee (2.9% + $0.30)</td>
                    <td style="padding:6px 0;color:#EF4444;font-size:13px;text-align:right;">− ${fee}</td>
                  </tr>
                  <tr style="border-top:1px solid #eeeeef;">
                    <td style="padding:10px 0 6px;color:#1e1e24;font-size:14px;font-weight:700;">Net routed</td>
                    <td style="padding:10px 0 6px;color:#00A882;font-size:14px;font-weight:800;text-align:right;">${net}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size:13px;font-weight:700;color:#1e1e24;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Split breakdown</p>
              <table style="width:100%;border-collapse:collapse;">${splitRows}</table>

              <p style="font-size:12px;color:#aaaab2;margin-top:24px;margin-bottom:0;">
                Transaction ID: <code style="font-family:monospace;">${transactionId}</code>
              </p>
            </div>
            <div style="background:#fcfcfd;border-top:1px solid #eeeeef;padding:16px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaaab2;">&copy; ${new Date().getFullYear()} Fleeper. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      logger.error({ error, transactionId, toEmail }, "Receipt email failed");
      return;
    }

    logger.info({ transactionId, toEmail, resendId: data?.id }, "Payment receipt email sent");
  } catch (err) {
    logger.error({ err, transactionId, toEmail }, "Exception sending receipt email");
  }
}
