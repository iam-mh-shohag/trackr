"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const [recoveryPin, setRecoveryPin] = useState("");
  const [newRecovery, setNewRecovery] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  async function handlePinChange(e: React.FormEvent) {
    e.preventDefault();
    setPinLoading(true);

    const res = await fetch("/api/settings/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin, newPin }),
    });

    setPinLoading(false);

    if (res.ok) {
      alert("PIN updated successfully!");
      setCurrentPin("");
      setNewPin("");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update PIN");
    }
  }

  async function handleRecoveryChange(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryLoading(true);

    const res = await fetch("/api/settings/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: recoveryPin, newRecovery }),
    });

    setRecoveryLoading(false);

    if (res.ok) {
      alert("Recovery text updated successfully!");
      setRecoveryPin("");
      setNewRecovery("");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update recovery text");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      </div>

      {/* Change PIN */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Change 6-Digit PIN</h3>
        <form onSubmit={handlePinChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Current PIN</label>
            <input type="password" maxLength={6} required value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="123456" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">New 6-Digit PIN</label>
            <input type="password" maxLength={6} required value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="654321" />
          </div>
          <button type="submit" disabled={pinLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {pinLoading ? "Updating..." : "Update PIN"}
          </button>
        </form>
      </div>

      {/* Change Recovery Text */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Update Recovery Text</h3>
        <p className="text-sm text-slate-500 mb-4">Used to reset your PIN if you forget it. Keep this secret and safe.</p>
        <form onSubmit={handleRecoveryChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Current PIN (to verify)</label>
            <input type="password" maxLength={6} required value={recoveryPin} onChange={(e) => setRecoveryPin(e.target.value)} className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="123456" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">New Recovery Text / Number</label>
            <input type="text" required value={newRecovery} onChange={(e) => setNewRecovery(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. my-secret-text" />
          </div>
          <button type="submit" disabled={recoveryLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {recoveryLoading ? "Updating..." : "Update Recovery"}
          </button>
        </form>
      </div>
    </div>
  );
}