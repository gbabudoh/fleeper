import Link from "next/link";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: [
      {
        sub: "Account Information",
        body: "When you create a Fleeper account, we collect your name, email address, and a hashed version of your password. We never store your password in plain text.",
      },
      {
        sub: "Financial Data",
        body: "To facilitate payment routing, we collect bank account tokens via Plaid's secure OAuth flow. We store only tokenised references — your actual account credentials are never held by Fleeper.",
      },
      {
        sub: "Transaction Data",
        body: "We record the details of every payment processed through your Fleeper link: gross amount, net amount, platform fee, routing splits, and timestamp. This data powers your dashboard analytics.",
      },
      {
        sub: "Usage & Log Data",
        body: "We automatically collect IP addresses, browser type, device identifiers, pages visited, and interaction events. This data is used to detect fraud, debug issues, and improve the product.",
      },
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      { sub: "Service Delivery",       body: "To process payments, execute income splits, and route funds to your connected accounts." },
      { sub: "Security & Fraud",       body: "To detect, investigate, and prevent fraudulent transactions, abuse, and violations of our Terms of Service." },
      { sub: "Product Improvement",    body: "To analyse usage patterns, diagnose bugs, and build new features. All analytics are performed on aggregated, anonymised data where possible." },
      { sub: "Communications",         body: "To send you receipts, routing confirmations, product updates, and support responses. You can opt out of marketing emails at any time." },
      { sub: "Legal Compliance",       body: "To meet our obligations under applicable laws including AML, KYC, and tax reporting requirements." },
    ],
  },
  {
    title: "Data Sharing",
    content: [
      { sub: "Payment Processors",     body: "We share necessary transaction data with Stripe to process card payments. Stripe's privacy policy governs their use of this data." },
      { sub: "Banking Partners",       body: "We share account-link tokens with Plaid to verify and connect your bank accounts. We do not share your full account details with any third party." },
      { sub: "Legal Requirements",     body: "We may disclose your information if required by law, court order, or to protect the rights, property, or safety of Fleeper, our users, or the public." },
      { sub: "No Data Sales",          body: "We do not sell, rent, or trade your personal information to any third party for marketing purposes. Full stop." },
    ],
  },
  {
    title: "Data Retention",
    content: [
      { sub: "Active Accounts",        body: "We retain your data for as long as your account is active and for a reasonable period thereafter to allow account recovery." },
      { sub: "Closed Accounts",        body: "Upon account closure, we anonymise personal identifiers within 30 days. Transaction records may be retained for up to 7 years to satisfy financial regulations." },
      { sub: "Logs & Analytics",       body: "Raw log data is retained for 90 days. Aggregated, anonymised analytics may be retained indefinitely." },
    ],
  },
  {
    title: "Your Rights",
    content: [
      { sub: "Access",                 body: "You can request a full export of your personal data at any time from your account settings." },
      { sub: "Correction",             body: "You can update your name, email, and account preferences directly in your dashboard." },
      { sub: "Deletion",               body: "You can request deletion of your account and associated data. Some transaction records may be retained for legal compliance." },
      { sub: "Portability",            body: "You can request your data in a machine-readable format (JSON or CSV) via our support team." },
      { sub: "Objection",              body: "You may object to certain processing activities. Contact support@fleeper.com with your request." },
    ],
  },
  {
    title: "Cookies",
    content: [
      { sub: "Session Cookies",        body: "We use strictly necessary session cookies to keep you logged in. These cannot be disabled without breaking core functionality." },
      { sub: "Analytics Cookies",      body: "With your consent, we use analytics cookies to understand how the product is used. You can opt out via your browser settings." },
      { sub: "No Tracking",            body: "We do not use third-party advertising cookies or sell cookie data to advertisers." },
    ],
  },
  {
    title: "Contact Us",
    content: [
      { sub: "Data Controller",        body: "Fleeper Ltd, registered in England & Wales." },
      { sub: "Privacy Enquiries",      body: "For all privacy-related questions or data requests, contact us at privacy@fleeper.com. We aim to respond within 5 business days." },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(155deg, #F0FFFA 0%, #E4FFF6 14%, #F8FFFE 30%, #EAFFF8 48%, #F7F5FF 66%, #F0EDFF 82%, #F8F5FF 100%)" }}>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.14) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,212,168,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fleeper.png" alt="Fleeper" style={{ height: "28px", width: "auto" }} />
        </Link>
        <Link href="/" className="text-sm font-medium transition-colors"
          style={{ color: "rgba(14,12,34,0.45)" }}>
          ← Back to home
        </Link>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: "rgba(0,212,168,0.10)", color: "#00A882", border: "1px solid rgba(0,212,168,0.22)" }}>
            Legal
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: "#0E0C22" }}>Privacy Policy</h1>
          <p className="text-base" style={{ color: "rgba(14,12,34,0.52)" }}>
            Last updated <strong>March 17, 2026</strong>. We take your privacy seriously. This policy explains exactly what data we collect, why, and how you can control it.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(32px)",
                border: "1px solid rgba(0,212,168,0.16)",
                boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 8px 32px rgba(0,212,168,0.07), 0 2px 8px rgba(0,0,0,0.04)",
              }}>
              <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #00FFCC, #00D4A8, transparent)" }} />
              <div className="p-7">
                <h2 className="text-lg font-black mb-5" style={{ color: "#0E0C22" }}>{section.title}</h2>
                <div className="space-y-4">
                  {section.content.map((item) => (
                    <div key={item.sub} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#00A882" }} />
                      <div>
                        <p className="text-sm font-bold mb-0.5" style={{ color: "#0E0C22" }}>{item.sub}</p>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(14,12,34,0.55)" }}>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-10 flex items-center justify-center gap-6 text-sm" style={{ color: "rgba(14,12,34,0.40)" }}>
          <Link href="/terms"    className="font-medium transition-colors hover:text-[#0E0C22]">Terms of Service</Link>
          <span style={{ color: "rgba(14,12,34,0.18)" }}>·</span>
          <Link href="/security" className="font-medium transition-colors hover:text-[#0E0C22]">Security</Link>
          <span style={{ color: "rgba(14,12,34,0.18)" }}>·</span>
          <Link href="/"         className="font-medium transition-colors hover:text-[#0E0C22]">Home</Link>
        </div>
      </main>
    </div>
  );
}
