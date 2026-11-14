import Link from "next/link";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { ObjectId } from "mongodb";
import { Lock, Unlock, Plus } from "lucide-react";
import AddPersonModal from "@/components/AddPersonModal";

export const dynamic = "force-dynamic";

async function getPeople() {
  const db = await getDB();
  const people = await db
    .collection(COLLECTIONS.people)
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .toArray();
  const personIds = people.map((p) => p._id as ObjectId);

  const balances = await db
    .collection(COLLECTIONS.transactions)
    .aggregate([
      { $match: { personId: { $in: personIds }, settlementId: null } },
      {
        $group: {
          _id: "$personId",
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

  const balanceMap = new Map(
    balances.map((b) => [b._id.toString(), b.received - b.sent]),
  );

  // Calculate the grand total of all active people
  let grandTotal = 0;
  people.forEach((p) => {
    const balance = balanceMap.get((p._id as ObjectId).toString()) ?? 0;
    grandTotal += balance;
  });

  return {
    people: people.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      note: p.note,
      isLocked: p.isLocked,
      netBalance: balanceMap.get((p._id as ObjectId).toString()) ?? 0,
    })),
    grandTotal,
  };
}

export default async function Home() {
  const { people, grandTotal } = await getPeople();

  return (
    <div className="space-y-6">
      <div className=" rounded-xl p-6 text-center text-white shadow-sm mb-8">
        <p className="text-blue-100 font-medium mb-1">Total Money Held</p>
        <p className="text-4xl font-bold">৳ {grandTotal.toLocaleString()}</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">People</h2>
        <AddPersonModal />
      </div>

      {people.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500">No people added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map((person) => (
            <div
              key={person._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {person.name}
                  </h3>
                  {person.note && (
                    <p className="text-sm text-slate-500">{person.note}</p>
                  )}
                </div>
                <button
                  className={`p-2 rounded-full ${person.isLocked ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {person.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              </div>

              <div className="mb-5">
                <p className="text-sm text-slate-500 mb-1">Net Balance</p>
                <p
                  className={`text-2xl font-bold ${person.netBalance < 0 ? "text-red-600" : "text-slate-800"}`}
                >
                  ৳ {person.netBalance.toLocaleString()}
                </p>
              </div>

              <Link
                href={`/people/${person._id}`}
                className="block w-full text-center bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
