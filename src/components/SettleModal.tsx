"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function SettleModal({ personId, netBalance }: { personId: string, netBalance: number }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/people/${personId}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settledAt: new Date(date).toISOString(),
        note,
        screenshots: [],
      }),
    });

    setLoading(false);

    if (res.ok) {
      setIsOpen(false);
      router.refresh();
      alert("Account settled successfully! Balance reset to 0.");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to settle account");
    }
  }

  if (netBalance === 0) {
    return (
      <button disabled className="mt-4 px-6 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
        Settle Account
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-4 px-6 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
      >
        Settle Account (৳ {netBalance.toLocaleString()})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden text-left">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">Settle Account</h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm mb-4">
            This will archive all current transactions and reset the balance to 0. History will not be deleted.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Settlement Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Handed over cash" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-2">
            {loading ? "Settling..." : "Confirm Settlement"}
          </button>
        </form>
      </div>
    </div>
  );
}