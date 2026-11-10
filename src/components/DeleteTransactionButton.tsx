"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteTransactionButton({ txId }: { txId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const pin = prompt("Enter 6-digit PIN to DELETE this transaction:");
    if (!pin) return; // User cancelled

    if (pin.length !== 6) {
      alert("PIN must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/transactions/${txId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh(); // Instantly reload the page data
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete transaction");
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
      title="Delete Transaction"
    >
      <Trash2 size={18} />
    </button>
  );
}