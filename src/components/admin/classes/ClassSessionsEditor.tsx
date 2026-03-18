import { useState, useEffect } from "react";
import {
  createAdminClassSession,
  fetchAdminClassSessions,
  type AdminClassSession,
} from "@/lib/adminApi";

export default function ClassSessionsEditor({ classProductId }: { classProductId: number }) {
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
    load();
  }, [classProductId]);

  async function create() {
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
      <h2 className="font-bold text-lg">Sessions</h2>

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
    </div>
  );
}
