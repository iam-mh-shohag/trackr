"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";

export default function AddTransactionModal({ personId, channels }: { personId: string, channels: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [direction, setDirection] = useState<"received" | "sent">("received");
  const [channelId, setChannelId] = useState(channels[0]?._id || "");
  const [amount, setAmount] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [screenshot, setScreenshot] = useState<any>(null);

  // Handle Image Upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setScreenshot(data); // Save the { url, thumbnailUrl, ... } object
      } else {
        alert("Failed to upload image");
      }
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/people/${personId}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
        direction,
        amount: Number(amount),
        counterpartyName,
        transactionDate: new Date(date).toISOString(),
        screenshots: screenshot ? [screenshot] : [],
      }),
    });

    setLoading(false);

    if (res.ok) {
      setIsOpen(false);
      setAmount("");
      setCounterpartyName("");
      setScreenshot(null);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add transaction");
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
      >
        <Plus size={14} /> Add Transaction
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">Add Transaction</h3>
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
              {channels.length === 0 && <option value="">No channels created yet</option>}
              {channels.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount (BDT)</label>
            <input type="number" required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. 5000" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{direction === "received" ? "Sender Name (Optional)" : "Recipient Name (Optional)"}</label>
            <input type="text" value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Hasan" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {/* Screenshot Upload Section */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Screenshot (Optional)</label>
            {screenshot ? (
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <ImageIcon size={16} /> Image attached
                </div>
                <button type="button" onClick={() => setScreenshot(null)} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                  <Upload size={20} className="mb-1" />
                  <p className="text-xs">{uploading ? "Uploading..." : "Click to upload image"}</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <button type="submit" disabled={loading || uploading || !channelId} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-2">
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}