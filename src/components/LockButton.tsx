"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock } from "lucide-react";

export default function LockButton({ personId, isLocked }: { personId: string, isLocked: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleLock() {
    let pin = null;
    
    if (isLocked) {
      pin = prompt("Enter 6-digit PIN to UNLOCK:");
      if (!pin) return; 
    }

    setLoading(true);
    const endpoint = isLocked ? "unlock" : "lock";
    const body = isLocked ? { pin } : {};

    const res = await fetch(`/api/people/${personId}/${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh(); // Reloads the page data
    } else {
      const data = await res.json();
      alert(data.error || "Failed to change lock status");
    }
  }

  return (
    <button 
      onClick={toggleLock}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
        isLocked 
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      }`}
    >
      {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
      {loading ? "Wait..." : isLocked ? 'Locked' : 'Unlocked'}
    </button>
  );
}