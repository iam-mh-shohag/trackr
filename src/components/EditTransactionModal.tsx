"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

export default function EditTransactionModal({ transaction, channels }: { transaction: any, channels: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pre-fill state with the existing transaction data
  const [direction, setDirection] = useState<"received" | "sent">(transaction.direction);
  const [channelId, setChannelId] = useState(transaction.channelId);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [counterpartyName, setCounterpartyName] = useState(transaction.counterpartyName || "");
  // Format date to YYYY-MM-DD for the input
  const [date, setDate] = useState(new Date(transaction.transactionDate).toISOString().split("T")[0]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/transactions/${transaction._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
        direction,
        amount: Number(amount),
        counterpartyName,
        transactionDate: new Date(date).toISOString(),
      }),
    });

    setLoading(false);

    if (res.ok) {
      setIsOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update transaction");
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="Edit Transaction"
      >
        <Pencil size={18} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">Edit Transaction</h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setDirection("received")} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${direction === "received" ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-slate-200 text-slate-600"}`}>Received</button>
            <button type="button" onClick={() => setDirection("sent")} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${direction === "sent" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-600"}`}>Sent</button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Channel</label>
            <select value={channelId} onChange={(e) => setChannelId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {channels.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount (BDT)</label>
            <input type="number" required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{direction === "received" ? "Sender Name" : "Recipient Name"}</label>
            <input type="text" value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-2">
            {loading ? "Updating..." : "Update Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}