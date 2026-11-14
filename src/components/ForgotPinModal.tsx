"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function ForgotPinModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [recovery, setRecovery] = useState("");
  const [newPin, setNewPin] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/pin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recovery, newPin }),
    });

    setLoading(false);

    if (res.ok) {
      alert("PIN reset successfully! You can now unlock accounts with your new PIN.");
      onClose();
      setRecovery("");
      setNewPin("");
    } else {
      const data = await res.json();
      alert(data.error || "Invalid recovery text");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg text-red-600">Reset PIN</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-4">
            Enter the secret Recovery Text you set in Settings to create a new PIN.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Recovery Text</label>
            <input type="text" required value={recovery} onChange={(e) => setRecovery(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Your secret text..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New 6-Digit PIN</label>
            <input type="password" maxLength={6} required value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. 123456" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 mt-2">
            {loading ? "Resetting..." : "Reset PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}