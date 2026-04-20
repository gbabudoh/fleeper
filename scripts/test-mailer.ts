import "dotenv/config";
import { sendPasswordResetEmail } from "../lib/email";

async function run() {
  console.log("🚀 Testing Fleeper Email Subsystem...");
  
  try {
    await sendPasswordResetEmail({
      toEmail: "developer@testfleeper.com",
      resetUrl: "https://fleeper.com/reset-password?token=safetoken123"
    });
    
    console.log("✅ Mailer execution completed successfully without crashing.");
    // Note: Because RESEND_API_KEY is null locally, it should fallback to the logger.warn bypass gracefully.
  } catch (err) {
    console.error("❌ Mailer crashed out:", err);
  }
}

run();
