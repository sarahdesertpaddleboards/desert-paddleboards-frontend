import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { getClassProducts, getClassSessions } from "../../lib/classApi";

// Class details page for /classes/:id
export default function ClassDetailPage() {
  const [match, params] = useRoute("/classes/:id");
  const [, navigate] = useLocation();

  const classId = Number(params?.id);

  const [classProduct, setClassProduct] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function toDateSafe(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatStart(s: any): string {
    const start = toDateSafe(s?.startTime);
    return start ? start.toLocaleString() : "TBA";
  }

  useEffect(() => {
    if (!match || !Number.isFinite(classId)) return;

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);

        // Load class products and find the one for this id
        const products = await getClassProducts();
        const found = (Array.isArray(products) ? products : []).find((p) => Number(p.id) === classId);

        // Load sessions and filter to this class product id
        const allSessions = await getClassSessions();

        const filtered = (Array.isArray(allSessions) ? allSessions : [])
          .filter((s) => Number(s.classProductId) === classId)
          .sort((a, b) => {
            const aStart = toDateSafe(a?.startTime)?.getTime() ?? 0;
            const bStart = toDateSafe(b?.startTime)?.getTime() ?? 0;
            return aStart - bStart;
          });

        if (isMounted) {
          setClassProduct(found ?? null);
          setSessions(filtered);
        }
      } catch (err) {
        console.error("CLASS DETAIL: failed to load", err);
        if (isMounted) {
          setClassProduct(null);
          setSessions([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [match, classId]);

  if (!match) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {loading ? (
        <p>Loading...</p>
      ) : !classProduct ? (
        <p>Class not found.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">{classProduct.name}</h1>
          <p className="text-gray-700 mb-6">{classProduct.description}</p>

          <h2 className="text-xl font-semibold mb-3">Upcoming sessions</h2>

          {sessions.length === 0 ? (
            <div>No upcoming sessions for this class.</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <button
                  key={s.id}
                  className="w-full text-left border rounded-lg p-4 hover:bg-gray-50"
                  onClick={() => navigate(`/sessions/${s.id}`)}
                >
                  {/* IMPORTANT: use startTime, not date */}
                  <div className="font-semibold">{formatStart(s)}</div>

                  {typeof s.seatsAvailable === "number" && typeof s.seatsTotal === "number" ? (
                    <div className="text-sm text-gray-600">
                      Seats: {s.seatsAvailable}/{s.seatsTotal}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
