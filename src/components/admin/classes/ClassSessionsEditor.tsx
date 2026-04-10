import { useState, useEffect, useMemo } from "react";
import {
  createAdminClassSession,
  fetchAdminClassSessions,
  updateAdminClassSession,
  deleteAdminClassSession,
  fetchAdminVenues,
  type AdminClassSession,
  type AdminClassProduct,
  type AdminVenue,
} from "@/lib/adminApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
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
  venueId: string;
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
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [form, setForm] = useState({
    venueId: "",
    startTime: "",
    endTime: "",
    seatsTotal: "",
  });
  const [drafts, setDrafts] = useState<Record<number, SessionDraft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"upcoming" | "all" | "soldOut">("upcoming");

  const selectedClassProduct = useMemo(
    () => classProducts.find((p) => p.id === classProductId) ?? null,
    [classProducts, classProductId]
  );

  useEffect(() => {
    fetchAdminVenues().then((rows) => setVenues(Array.isArray(rows) ? rows : []));
  }, []);

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
            venueId: s.venueId ? String(s.venueId) : "",
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

    const seatsTotal = Number(form.seatsTotal || 0);
    if (!form.venueId || !form.startTime || !form.endTime || !Number.isFinite(seatsTotal) || seatsTotal <= 0) {
      toast.error("Venue, start time, end time, and seat count are required");
      return;
    }

    try {
      setCreating(true);
      await createAdminClassSession({
        classProductId,
        venueId: form.venueId ? Number(form.venueId) : null,
        startTime: form.startTime,
        endTime: form.endTime,
        seatsTotal,
        seatsAvailable: seatsTotal,
      });
      toast.success("Experience session created");
      setForm({ venueId: "", startTime: "", endTime: "", seatsTotal: "" });
      load();
    } catch (error) {
      console.error(error);
      toast.error("Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function saveSession(sessionId: number) {
    const draft = drafts[sessionId];
    if (!draft) return;

    try {
      setSavingId(sessionId);
      await updateAdminClassSession(sessionId, {
        venueId: draft.venueId ? Number(draft.venueId) : null,
        startTime: draft.startTime,
        endTime: draft.endTime,
        seatsTotal: Number(draft.seatsTotal || 0),
        seatsAvailable: Number(draft.seatsAvailable || 0),
      });
      toast.success("Experience session updated");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
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
      toast.success("Experience session removed");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Remove failed");
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => {
    const total = sessions.length;
    const soldOut = sessions.filter((s) => s.seatsAvailable <= 0).length;
    const upcoming = sessions.filter((s) => new Date(s.startTime).getTime() >= Date.now()).length;
    const upcomingNext7Days = sessions.filter((s) => {
      const time = new Date(s.startTime).getTime();
      const now = Date.now();
      const in7Days = now + 7 * 24 * 60 * 60 * 1000;
      return time >= now && time <= in7Days;
    }).length;
    return { total, soldOut, upcoming, upcomingNext7Days };
  }, [sessions]);

  const visibleSessions = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((session) => {
        const start = new Date(session.startTime).getTime();
        if (view === "upcoming") return start >= now;
        if (view === "soldOut") return session.seatsAvailable <= 0;
        return true;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [sessions, view]);

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, AdminClassSession[]>();
    for (const session of visibleSessions) {
      const label = formatShortDate(session.startTime);
      const existing = groups.get(label) ?? [];
      existing.push(session);
      groups.set(label, existing);
    }
    return Array.from(groups.entries());
  }, [visibleSessions]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-bold text-lg">Manage Experiences</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          This is your date-grouped availability board for scheduled experience sessions. Choose the experience product first, then create or update the actual sessions customers can book.
        </p>
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1">Experience product</label>
          <select
            className="border rounded p-2 w-full"
            value={classProductId ?? ""}
            onChange={(e) => onSelectClassProduct(Number(e.target.value))}
          >
            <option value="">Select an experience product</option>
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
          Choose an experience product to open its availability board.
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="font-medium">{selectedClassProduct?.name ?? "Selected experience product"}</div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1">{stats.total} sessions</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{stats.upcoming} upcoming</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{stats.upcomingNext7Days} in next 7 days</span>
                {stats.soldOut > 0 ? (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">{stats.soldOut} sold out</span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
            <div>
              <h3 className="font-semibold">Create experience session</h3>
              <p className="text-sm text-muted-foreground">
                Add a new scheduled session to the availability board for this experience product.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Venue</label>
                <select
                  className="border w-full p-2 rounded"
                  value={form.venueId}
                  onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                >
                  <option value="">Select venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} — {venue.city}, {venue.state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Start</label>
                <input
                  type="datetime-local"
                  className="border w-full p-2 rounded"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End</label>
                <input
                  type="datetime-local"
                  className="border w-full p-2 rounded"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Total seats</label>
                <input
                  className="border w-full p-2 rounded"
                  placeholder="12"
                  value={form.seatsTotal}
                  onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-muted-foreground">
                New sessions usually begin with available seats equal to total seats.
              </p>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={create}
                disabled={creating}
              >
                {creating ? "Creating..." : "Add experience session"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold">Availability board</h3>
                <p className="text-sm text-muted-foreground">
                  Review sessions by date, then edit the specific instances that need attention.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setView("upcoming")}
                  className={`rounded-full px-3 py-1 ${view === "upcoming" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setView("all")}
                  className={`rounded-full px-3 py-1 ${view === "all" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
                >
                  All sessions
                </button>
                <button
                  type="button"
                  onClick={() => setView("soldOut")}
                  className={`rounded-full px-3 py-1 ${view === "soldOut" ? "bg-blue-600 text-white" : "bg-slate-100"}`}
                >
                  Sold out
                </button>
              </div>
            </div>

            {groupedSessions.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground space-y-2">
                <div>No sessions match this view yet.</div>
                <div>Create a new session above, or switch between Upcoming, All sessions, and Sold out views.</div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedSessions.map(([dateLabel, dateSessions]) => {
                  const soldOutCount = dateSessions.filter((session) => session.seatsAvailable <= 0).length;
                  const nearlyFullCount = dateSessions.filter((session) => {
                    const tone = availabilityTone(session.seatsAvailable, session.seatsTotal);
                    return tone.label === "Nearly full";
                  }).length;

                  return (
                    <div key={dateLabel} className="space-y-3">
                      <div className="rounded-xl border bg-white p-4 flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h4 className="font-semibold">{dateLabel}</h4>
                          <p className="text-sm text-muted-foreground">
                            {dateSessions.length} session{dateSessions.length === 1 ? "" : "s"} on this date
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="rounded-full bg-slate-100 px-3 py-1">{dateSessions.length} total</span>
                          {nearlyFullCount > 0 ? (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{nearlyFullCount} nearly full</span>
                          ) : null}
                          {soldOutCount > 0 ? (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">{soldOutCount} sold out</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {dateSessions.map((s) => {
                          const tone = availabilityTone(s.seatsAvailable, s.seatsTotal);
                          const draft = drafts[s.id] ?? {
                            venueId: s.venueId ? String(s.venueId) : "",
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
                                    {(s.venueName || s.venueCity) && (
                                      <div className="text-sm text-muted-foreground">
                                        {s.venueName ?? "Venue TBD"}
                                        {s.venueCity && s.venueState ? ` • ${s.venueCity}, ${s.venueState}` : ""}
                                      </div>
                                    )}
                                  </div>
                                  <Badge variant={tone.variant}>{tone.label}</Badge>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Venue</label>
                                    <select
                                      className="border rounded p-2 w-full"
                                      value={draft.venueId}
                                      onChange={(e) =>
                                        setDrafts((prev) => ({
                                          ...prev,
                                          [s.id]: { ...draft, venueId: e.target.value },
                                        }))
                                      }
                                    >
                                      <option value="">Select venue</option>
                                      {venues.map((venue) => (
                                        <option key={venue.id} value={venue.id}>
                                          {venue.name} — {venue.city}, {venue.state}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
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
                                    {deletingId === s.id ? "Removing…" : "Remove experience session"}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
