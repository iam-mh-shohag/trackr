"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import EditTransactionModal from "./EditTransactionModal";
import DeleteTransactionButton from "./DeleteTransactionButton";

export default function TransactionList({ 
  initialTransactions, 
  initialCursor, 
  personId, 
  channels 
}: { 
  initialTransactions: any[], 
  initialCursor: string | null, 
  personId: string, 
  channels: any[] 
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);

    const res = await fetch(`/api/people/${personId}/transactions?limit=50&cursor=${cursor}`);
    const data = await res.json();

    if (res.ok) {
      setTransactions((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    }
    setLoading(false);
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {transactions.map(t => (
          <div key={t._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-10 rounded-full ${t.direction === 'received' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium text-slate-800">
                  {t.direction === 'received' ? 'Received from' : 'Sent to'} {t.counterpartyName || 'Unknown'}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(t.transactionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-4">
              {t.screenshots && t.screenshots.length > 0 && (
                <a href={t.screenshots[0].url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700" title="View Receipt">
                  <ImageIcon size={18} />
                </a>
              )}
              <p className={`font-bold w-24 ${t.direction === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                {t.direction === 'received' ? '+' : '-'} ৳ {t.amount.toLocaleString()}
              </p>
              
              <EditTransactionModal transaction={t} channels={channels} />
              <DeleteTransactionButton txId={t._id} />
            </div>
          </div>
        ))}
      </div>

      {cursor && (
        <button 
          onClick={loadMore} 
          disabled={loading}
          className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "View All Transactions"}
        </button>
      )}
    </div>
  );
}