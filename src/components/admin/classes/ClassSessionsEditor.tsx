import { useState, useEffect } from "react";
import {
  createAdminClassSession,
  fetchAdminClassSessions,
  type AdminClassSession,
  type AdminClassProduct,
} from "@/lib/adminApi";

export default function ClassSessionsEditor({
  classProductId,
  classProducts,
  onSelectClassProduct,
}: {
  classProductId: number | null;
  classProducts: AdminClassProduct[];
  onSelectClassProduct: (id: number) => void;
}) {
  const [sessions, setSessions] = useState<AdminClassSession[]>([]);
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    seatsTotal: "",
  });

  async function load() {
    const all = await fetchAdminClassSessions();
    setSessions(
      (Array.isArray(all) ? all : []).filter(
        (s) => Number(s.classProductId) === Number(classProductId)
      )
    );
  }

  useEffect(() => {
    if (classProductId) load();
    else setSessions([]);
  }, [classProductId]);

  async function create() {
    if (!classProductId) return;

    await createAdminClassSession({
      classProductId,
      startTime: form.startTime,
      endTime: form.endTime,
      seatsTotal: Number(form.seatsTotal || 0),
      seatsAvailable: Number(form.seatsTotal || 0),
    });
    setForm({ startTime: "", endTime: "", seatsTotal: "" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-bold text-lg">Sessions</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1">Class product</label>
          <select
            className="border rounded p-2 w-full"
            value={classProductId ?? ""}
            onChange={(e) => onSelectClassProduct(Number(e.target.value))}
          >
            <option value="">Select a class product</option>
            {classProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!classProductId ? (
        <div className="border rounded p-4 text-muted-foreground">
          Choose a class product to manage its sessions.
        </div>
      ) : (
        <>
          <div className="border p-3 rounded space-y-2">
            <input
              className="border w-full p-2"
              placeholder="Start time: 2026-01-30T10:00"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <input
              className="border w-full p-2"
              placeholder="End time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
            <input
              className="border w-full p-2"
              placeholder="Total seats"
              value={form.seatsTotal}
              onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })}
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={create}
            >
              Add Session
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="border p-3 rounded">
                <div>
                  <strong>{s.startTime}</strong>
                </div>
                <div>
                  Seats: {s.seatsAvailable}/{s.seatsTotal}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
