"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle } from "lucide-react";

interface Settings {
  platformFeePercent: number;
  platformFeeCents: number;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  maxApiKeysPerUser: number;
  supportEmail: string;
}

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";
const MUTED     = "rgba(7,26,23,0.48)";
const CARD      = { background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.94) 100%)", border: "1px solid rgba(0,255,204,0.24)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)" };
const INPUT_S   = { background: "linear-gradient(135deg, #FFFFFF 0%, rgba(240,255,252,0.80) 100%)", border: "1px solid rgba(0,255,204,0.30)", color: HEAD, boxShadow: "0 1px 4px rgba(0,255,204,0.10)" };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => setSettings(d.settings));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: `${MINT}40`, borderTopColor: MINT }} />
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #00FFCC, #00D4A8)" }} />
            <h1 className="text-2xl font-black" style={{ color: HEAD }}>Platform Settings</h1>
          </div>
          <p className="text-sm pl-4" style={{ color: MUTED }}>Global configuration for the Fleeper platform</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.02]"
          style={saved
            ? { background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", boxShadow: "0 4px 14px rgba(5,150,105,0.30)" }
            : { background: `linear-gradient(135deg, ${MINT}, #00D4A8)`, color: "#0A2E28", boxShadow: `0 4px 14px ${MINT}50` }}>
          {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> {saving ? "Saving…" : "Save Changes"}</>}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Fee configuration */}
        <div className="col-span-2 rounded-2xl overflow-hidden" style={CARD}>
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(to bottom, ${MINT}, #00D4A8)` }} />
              <h2 className="text-sm font-bold" style={{ color: HEAD }}>Fee Structure</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: MUTED }}>Platform fee (%)</label>
                <input type="number" step="0.1" min="0" max="100" value={settings.platformFeePercent}
                  onChange={(e) => setSettings(s => s ? { ...s, platformFeePercent: parseFloat(e.target.value) } : s)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: MUTED }}>Fixed fee (cents)</label>
                <input type="number" min="0" value={settings.platformFeeCents}
                  onChange={(e) => setSettings(s => s ? { ...s, platformFeeCents: parseInt(e.target.value) } : s)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
              </div>
            </div>
            <p className="text-xs mt-3 px-1" style={{ color: MUTED }}>
              Effective fee per transaction:{" "}
              <strong style={{ color: MINT_DARK }}>{settings.platformFeePercent}% + ${(settings.platformFeeCents / 100).toFixed(2)}</strong>
            </p>
          </div>
        </div>

        {/* Access control */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(to bottom, ${MINT}, #00D4A8)` }} />
              <h2 className="text-sm font-bold" style={{ color: HEAD }}>Access Control</h2>
            </div>
            <div className="space-y-1">
              {[
                { key: "registrationOpen", label: "Open registration", desc: "Allow new users to sign up" },
                { key: "maintenanceMode",  label: "Maintenance mode",  desc: "Block all user access with a maintenance page" },
              ].map(({ key, label, desc }) => {
                const on = (settings as unknown as Record<string, unknown>)[key] as boolean;
                return (
                  <div key={key} className="flex items-center justify-between py-4"
                    style={{ borderBottom: "1px solid rgba(0,255,204,0.10)" }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: HEAD }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{desc}</p>
                    </div>
                    <button onClick={() => setSettings(s => s ? { ...s, [key]: !on } : s)}
                      className="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0"
                      style={{ background: on ? MINT : "rgba(7,26,23,0.14)" }}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${on ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Limits & Contact */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(to bottom, ${MINT}, #00D4A8)` }} />
              <h2 className="text-sm font-bold" style={{ color: HEAD }}>Limits & Contact</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: MUTED }}>Max API keys per user</label>
                <input type="number" min="1" max="50" value={settings.maxApiKeysPerUser}
                  onChange={(e) => setSettings(s => s ? { ...s, maxApiKeysPerUser: parseInt(e.target.value) } : s)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: MUTED }}>Support email</label>
                <input type="email" value={settings.supportEmail}
                  onChange={(e) => setSettings(s => s ? { ...s, supportEmail: e.target.value } : s)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
