import { useState, useEffect, useMemo } from "react";
import {
  createAdminClassSession,
  fetchAdminClassSessions,
  updateAdminClassSession,
  deleteAdminClassSession,
  type AdminClassSession,
  type AdminClassProduct,
} from "@/lib/adminApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function availabilityTone(seatsAvailable: number, seatsTotal: number) {
  if (seatsAvailable <= 0) return { label: "Sold out", variant: "destructive" as const };
  if (seatsAvailable <= Math.max(2, Math.ceil(seatsTotal * 0.2))) {
    return { label: "Nearly full", variant: "secondary" as const };
  }
  return { label: "Available", variant: "outline" as const };
}

type SessionDraft = {
  startTime: string;
  endTime: string;
  seatsTotal: string;
  seatsAvailable: string;
};

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
  const [drafts, setDrafts] = useState<Record<number, SessionDraft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const selectedClassProduct = useMemo(
    () => classProducts.find((p) => p.id === classProductId) ?? null,
    [classProducts, classProductId]
  );

  async function load() {
    const all = await fetchAdminClassSessions();
    const filtered = (Array.isArray(all) ? all : []).filter(
      (s) => Number(s.classProductId) === Number(classProductId)
    );
    setSessions(filtered);
    setDrafts(
      Object.fromEntries(
        filtered.map((s) => [
          s.id,
          {
            startTime: toDatetimeLocalValue(s.startTime),
            endTime: toDatetimeLocalValue(s.endTime),
            seatsTotal: String(s.seatsTotal ?? ""),
            seatsAvailable: String(s.seatsAvailable ?? ""),
          },
        ])
      )
    );
  }

  useEffect(() => {
    if (classProductId) load();
    else {
      setSessions([]);
      setDrafts({});
    }
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

  async function saveSession(sessionId: number) {
    const draft = drafts[sessionId];
    if (!draft) return;

    try {
      setSavingId(sessionId);
      await updateAdminClassSession(sessionId, {
        startTime: draft.startTime,
        endTime: draft.endTime,
        seatsTotal: Number(draft.seatsTotal || 0),
        seatsAvailable: Number(draft.seatsAvailable || 0),
      });
      await load();
    } finally {
      setSavingId(null);
    }
  }

  async function removeSession(sessionId: number) {
    const confirmed = window.confirm(
      "Remove this session? This cannot be undone from the dashboard."
    );
    if (!confirmed) return;

    try {
      setDeletingId(sessionId);
      await deleteAdminClassSession(sessionId);
      await load();
    } finally {
      setDeletingId(null);
    }
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
          <Card>
            <CardContent className="p-4 space-y-1">
              <div className="font-medium">{selectedClassProduct?.name ?? "Selected class"}</div>
              <div className="text-sm text-muted-foreground">
                {sessions.length} session{sessions.length === 1 ? "" : "s"} currently listed
              </div>
            </CardContent>
          </Card>

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
            {sessions.map((s) => {
              const tone = availabilityTone(s.seatsAvailable, s.seatsTotal);
              const draft = drafts[s.id] ?? {
                startTime: toDatetimeLocalValue(s.startTime),
                endTime: toDatetimeLocalValue(s.endTime),
                seatsTotal: String(s.seatsTotal ?? ""),
                seatsAvailable: String(s.seatsAvailable ?? ""),
              };

              return (
                <Card key={s.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold">{formatDateTime(s.startTime)}</div>
                        <div className="text-sm text-muted-foreground">
                          Ends: {formatDateTime(s.endTime)}
                        </div>
                      </div>
                      <Badge variant={tone.variant}>{tone.label}</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start time</label>
                        <input
                          type="datetime-local"
                          className="border rounded p-2 w-full"
                          value={draft.startTime}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [s.id]: { ...draft, startTime: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End time</label>
                        <input
                          type="datetime-local"
                          className="border rounded p-2 w-full"
                          value={draft.endTime}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [s.id]: { ...draft, endTime: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Seats total</label>
                        <input
                          className="border rounded p-2 w-full"
                          value={draft.seatsTotal}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [s.id]: { ...draft, seatsTotal: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Seats available</label>
                        <input
                          className="border rounded p-2 w-full"
                          value={draft.seatsAvailable}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [s.id]: { ...draft, seatsAvailable: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Session ID: {s.id}
                      {typeof s.venueId === "number" ? ` • Venue ID: ${s.venueId}` : ""}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveSession(s.id)}
                        disabled={savingId === s.id || deletingId === s.id}
                      >
                        {savingId === s.id ? "Saving…" : "Save session"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeSession(s.id)}
                        disabled={deletingId === s.id || savingId === s.id}
                      >
                        {deletingId === s.id ? "Removing…" : "Remove session"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
