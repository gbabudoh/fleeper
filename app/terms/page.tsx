import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: [
      {
        sub: "Agreement",
        body: "By creating a Fleeper account or using any Fleeper service, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.",
      },
      {
        sub: "Eligibility",
        body: "You must be at least 18 years old and legally capable of entering into a binding contract in your jurisdiction. By using Fleeper, you represent that you meet these requirements.",
      },
      {
        sub: "Updates",
        body: "We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use of the service after the effective date constitutes acceptance.",
      },
    ],
  },
  {
    title: "2. The Service",
    content: [
      {
        sub: "What Fleeper Provides",
        body: "Fleeper is a payment gateway that enables you to receive payments and automatically route the proceeds to multiple bank accounts according to percentage splits you configure. We are not a bank.",
      },
      {
        sub: "Payment Processing",
        body: "Card payments are processed by Stripe, Inc. Bank transfers are facilitated via Plaid Technologies, Inc. By using Fleeper, you also agree to the applicable terms of these third-party processors.",
      },
      {
        sub: "Platform Fees",
        body: "Fleeper charges a platform fee on each transaction processed. The current fee schedule is displayed on our Pricing page and in your dashboard. We reserve the right to adjust fees with 30 days' notice.",
      },
      {
        sub: "Availability",
        body: "We aim for 99.99% uptime but do not guarantee uninterrupted access. Planned maintenance will be communicated in advance. We are not liable for losses arising from temporary unavailability.",
      },
    ],
  },
  {
    title: "3. Account Responsibilities",
    content: [
      {
        sub: "Account Security",
        body: "You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately at security@fleeper.com if you suspect unauthorised access to your account.",
      },
      {
        sub: "Accurate Information",
        body: "You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. Providing false information may result in account termination.",
      },
      {
        sub: "One Account Per Person",
        body: "Each individual or business entity may maintain only one active Fleeper account. Creating multiple accounts to circumvent restrictions or fees is prohibited.",
      },
    ],
  },
  {
    title: "4. Acceptable Use",
    content: [
      {
        sub: "Permitted Use",
        body: "Fleeper may only be used for lawful business purposes — receiving payment for goods, services, or creative work you legitimately provide.",
      },
      {
        sub: "Prohibited Activities",
        body: "You may not use Fleeper for money laundering, fraud, gambling, adult content, illegal goods or services, weapons, or any activity that violates applicable law. Violations will result in immediate account suspension and potential law enforcement referral.",
      },
      {
        sub: "No Reverse Engineering",
        body: "You may not attempt to reverse engineer, decompile, or extract source code from any part of the Fleeper platform.",
      },
      {
        sub: "No Automated Abuse",
        body: "You may not use automated tools, bots, or scripts to abuse the platform, generate fraudulent transactions, or circumvent rate limits.",
      },
    ],
  },
  {
    title: "5. Payouts & Funds",
    content: [
      {
        sub: "Payout Schedule",
        body: "Funds are routed to your connected bank accounts according to your configured split percentages, typically within 1–2 business days of settlement. International transfers may take longer.",
      },
      {
        sub: "Holds & Disputes",
        body: "We may place a hold on funds if we detect suspicious activity, receive a chargeback, or are required to by law. We will notify you promptly and work to resolve holds as quickly as possible.",
      },
      {
        sub: "Chargebacks",
        body: "If a payer initiates a chargeback, the disputed amount plus any associated fees may be debited from your account or future payouts. You are responsible for providing evidence to contest chargebacks.",
      },
    ],
  },
  {
    title: "6. Intellectual Property",
    content: [
      {
        sub: "Fleeper IP",
        body: "The Fleeper name, logo, product design, and all associated intellectual property are owned by Fleeper Ltd. Nothing in these Terms grants you any right to use our IP without written permission.",
      },
      {
        sub: "Your Content",
        body: "You retain ownership of any content you upload to Fleeper (e.g., payment link descriptions, profile information). You grant us a limited licence to display and process this content as necessary to provide the service.",
      },
    ],
  },
  {
    title: "7. Limitation of Liability",
    content: [
      {
        sub: "No Consequential Damages",
        body: "To the maximum extent permitted by law, Fleeper is not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.",
      },
      {
        sub: "Liability Cap",
        body: "Our total liability to you for any claim arising from use of the service is limited to the fees you paid to Fleeper in the 12 months preceding the claim.",
      },
      {
        sub: "AS IS",
        body: "The service is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.",
      },
    ],
  },
  {
    title: "8. Termination",
    content: [
      {
        sub: "By You",
        body: "You may close your account at any time from your account settings. Outstanding payouts will be processed before closure.",
      },
      {
        sub: "By Fleeper",
        body: "We may suspend or terminate your account immediately if you breach these Terms, engage in fraudulent activity, or pose a risk to other users or the platform.",
      },
      {
        sub: "Effect of Termination",
        body: "Upon termination, your right to access the service ceases. We will process any outstanding legitimate payouts owed to you, subject to applicable holds.",
      },
    ],
  },
  {
    title: "9. Governing Law",
    content: [
      {
        sub: "Jurisdiction",
        body: "These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
      },
      {
        sub: "Disputes",
        body: "We encourage you to contact us at legal@fleeper.com before initiating formal proceedings. We will make good faith efforts to resolve disputes amicably.",
      },
    ],
  },
  {
    title: "10. Contact",
    content: [
      {
        sub: "General Enquiries",
        body: "support@fleeper.com — we aim to respond within 2 business days.",
      },
      {
        sub: "Legal Notices",
        body: "Fleeper Ltd, legal@fleeper.com. Registered in England & Wales.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(155deg, #F0FFFA 0%, #E4FFF6 14%, #F8FFFE 30%, #EAFFF8 48%, #F7F5FF 66%, #F0EDFF 82%, #F8F5FF 100%)" }}>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
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
            style={{ background: "rgba(139,92,246,0.10)", color: "#7C3AED", border: "1px solid rgba(139,92,246,0.22)" }}>
            Legal
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: "#0E0C22" }}>Terms of Service</h1>
          <p className="text-base" style={{ color: "rgba(14,12,34,0.52)" }}>
            Last updated <strong>March 17, 2026</strong>. Please read these terms carefully before using Fleeper. They govern your use of our platform and services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.title} className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(32px)",
                border: "1px solid rgba(139,92,246,0.14)",
                boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 8px 32px rgba(100,60,220,0.06), 0 2px 8px rgba(0,0,0,0.04)",
              }}>
              <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #8B5CF6, #00D4A8, transparent)" }} />
              <div className="p-7">
                <h2 className="text-lg font-black mb-5" style={{ color: "#0E0C22" }}>{section.title}</h2>
                <div className="space-y-4">
                  {section.content.map((item) => (
                    <div key={item.sub} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#8B5CF6" }} />
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
          <Link href="/privacy"  className="font-medium transition-colors hover:text-[#0E0C22]">Privacy Policy</Link>
          <span style={{ color: "rgba(14,12,34,0.18)" }}>·</span>
          <Link href="/security" className="font-medium transition-colors hover:text-[#0E0C22]">Security</Link>
          <span style={{ color: "rgba(14,12,34,0.18)" }}>·</span>
          <Link href="/"         className="font-medium transition-colors hover:text-[#0E0C22]">Home</Link>
        </div>
      </main>
    </div>
  );
}
