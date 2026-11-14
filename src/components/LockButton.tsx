"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock } from "lucide-react";
import ForgotPinModal from "./ForgotPinModal";

export default function LockButton({ personId, isLocked }: { personId: string, isLocked: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  async function toggleLock(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    // If locking, no PIN needed
    if (!isLocked) {
      setLoading(true);
      await fetch(`/api/people/${personId}/lock`, { method: "PATCH" });
      setLoading(false);
      router.refresh();
      return;
    }

    // If unlocking, verify PIN
    setLoading(true);
    const res = await fetch(`/api/people/${personId}/unlock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    setLoading(false);

    if (res.ok) {
      setIsModalOpen(false);
      setPin("");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Invalid PIN");
    }
  }

  return (
    <>
      <button 
        onClick={() => isLocked ? setIsModalOpen(true) : toggleLock()}
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

      {/* Unlock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-center">Enter PIN to Unlock</h3>
              
              <form onSubmit={toggleLock}>
                <input 
                  type="password" 
                  maxLength={6} 
                  autoFocus
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)} 
                  className="w-full text-center text-2xl tracking-[0.5em] rounded-lg border border-slate-300 px-3 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="••••••" 
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || pin.length !== 6} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                    Unlock
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => { setIsModalOpen(false); setShowForgot(true); }} className="text-sm text-red-500 hover:underline">
                  Forgot PIN?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ForgotPinModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </>
  );
}