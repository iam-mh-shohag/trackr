import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { ObjectId } from "mongodb";
import LockButton from "@/components/LockButton";
import AddTransactionModal from "@/components/AddTransactionModal";
import AddChannelModal from "@/components/AddChannelModal";
import TransactionList from "@/components/TransactionList";
import { ArrowLeft } from "lucide-react";
import SettleModal from "@/components/SettleModal";

export const dynamic = "force-dynamic";

async function getPersonDetail(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDB();
  const person = await db
    .collection(COLLECTIONS.people)
    .findOne({ _id: new ObjectId(id) });
  if (!person) return null;

  // Get channels with balances
  const channels = await db
    .collection(COLLECTIONS.channels)
    .find({ personId: new ObjectId(id), isActive: true })
    .toArray();
  const channelBalances = await db
    .collection(COLLECTIONS.transactions)
    .aggregate([
      { $match: { personId: new ObjectId(id), settlementId: null } },
      {
        $group: {
          _id: "$channelId",
          received: {
            $sum: {
              $cond: [{ $eq: ["$direction", "received"] }, "$amount", 0],
            },
          },
          sent: {
            $sum: { $cond: [{ $eq: ["$direction", "sent"] }, "$amount", 0] },
          },
        },
      },
    ])
    .toArray();

  const balMap = new Map(
    channelBalances.map((c) => [c._id.toString(), c.received - c.sent]),
  );

  const channelsWithBalance = channels.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
    type: c.type,
    balance: balMap.get((c._id as ObjectId).toString()) ?? 0,
  }));

  // Get recent 10 transactions
  const transactions = await db
    .collection(COLLECTIONS.transactions)
    .find({ personId: new ObjectId(id), settlementId: null })
    .sort({ _id: -1 })
    .limit(10)
    .toArray();

  // ADD THIS: Fetch past settlements
  const settlements = await db
    .collection(COLLECTIONS.settlements)
    .find({ personId: new ObjectId(id) })
    .sort({ settledAt: -1 })
    .toArray();

  const settlementList = settlements.map((s) => ({
    _id: s._id.toString(),
    settledAt: s.settledAt,
    snapshotBalance: s.snapshotBalance,
    note: s.note,
  }));

  return {
    _id: person._id.toString(),
    name: person.name,
    note: person.note,
    isLocked: person.isLocked,
    channels: channelsWithBalance,
    transactions: transactions.map((t) => ({
      _id: t._id.toString(),
      channelId: t.channelId.toString(),
      direction: t.direction,
      amount: t.amount,
      counterpartyName: t.counterpartyName,
      transactionDate: t.transactionDate,
      screenshots: t.screenshots,
    })),
    nextCursor:
      transactions.length === 10 ? transactions[9]._id.toString() : null,
    settlements: settlementList,
  };
}

export default async function PersonDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPersonDetail(id);

  if (!data) return notFound();

  const netBalance = data.channels.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/"
          className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{data.name}</h2>
          <p className="text-sm text-slate-500">{data.note}</p>
        </div>
        <LockButton personId={data._id} isLocked={data.isLocked} />
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
        <p className="text-sm text-slate-500 mb-1">Net Balance</p>
        <p
          className={`text-4xl font-bold ${netBalance < 0 ? "text-red-600" : "text-slate-800"}`}
        >
          ৳ {netBalance.toLocaleString()}
        </p>
        <SettleModal personId={data._id} netBalance={netBalance} />
      </div>

      {/* Channels */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800">Channels</h3>
          <AddChannelModal personId={data._id} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.channels.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600 mb-1">
                {c.name}
              </p>
              <p
                className={`text-lg font-bold ${c.balance < 0 ? "text-red-600" : "text-slate-800"}`}
              >
                ৳ {c.balance.toLocaleString()}
              </p>
            </div>
          ))}
          {data.channels.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full">
              No channels added yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Transactions
          </h3>
          <AddTransactionModal personId={data._id} channels={data.channels} />
        </div>

        <TransactionList
          key={data.transactions[0]?._id || "empty"}
          initialTransactions={data.transactions}
          initialCursor={data.nextCursor}
          personId={data._id}
          channels={data.channels}
        />
      </div>

      {/* Past Settlements */}
      {data.settlements.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Past Settlements
          </h3>
          <div className="space-y-3">
            {data.settlements.map((s: any) => (
              <div
                key={s._id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    Settled on {new Date(s.settledAt).toLocaleDateString()}
                  </p>
                  {s.note && <p className="text-sm text-slate-500">{s.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">
                    Archived Balance
                  </p>
                  <p
                    className={`font-bold ${s.snapshotBalance < 0 ? "text-red-600" : "text-slate-800"}`}
                  >
                    ৳ {s.snapshotBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
