// src/pages/admin/ClassSessionsAdmin.tsx
// Admin interface for managing class sessions

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/publicApi";
import { Button } from "@/components/ui/button";

import ClassCalendar from "@/components/admin/classes/ClassCalendar";
import ClassSessionForm from "@/components/admin/classes/ClassSessionForm";

export default function ClassSessionsAdmin() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    loadSessions();
    loadProducts();
  }, []);

  async function loadSessions() {
    try {
      const res = await publicApi.get("/class-sessions");
      setSessions(res.data || []);
    } catch (err) {
      console.error("LOAD SESSIONS ERROR", err);
    }
  }

  async function loadProducts() {
    try {
      const res = await publicApi.get("/class-products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("LOAD CLASS PRODUCTS ERROR", err);
    }
  }

  async function deleteSession(id: number) {
    if (!confirm("Delete this session?")) return;
    try {
      await publicApi.delete(`/class-sessions/${id}`);
      loadSessions();
    } catch (err) {
      console.error("DELETE SESSION ERROR", err);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Class Sessions (Admin)</h1>

      {/* CREATE SESSION BUTTON */}
      <Button className="mb-6" onClick={() => setCreating(true)}>
        Create New Session
      </Button>

      {/* CALENDAR VIEW */}
      <ClassCalendar
        sessions={sessions}
        products={products}
        onSelectSession={(s) => setEditingSession(s)}
      />

      {/* SESSION LIST BELOW CALENDAR */}
      <h2 className="text-xl font-semibold mt-8 mb-4">
        All Sessions (List View)
      </h2>

      <div className="space-y-3">
        {sessions.map((s) => {
          const product = products.find((p) => p.id === s.classProductId);

          return (
            <div
              key={s.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">
                  {product?.name || "Unknown Class"}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(s.startTime).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {s.seatsAvailable} seats remaining
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setEditingSession(s)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => deleteSession(s.id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE SESSION MODAL */}
      {creating && (
        <ClassSessionForm
          products={products}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            loadSessions();
          }}
        />
      )}

      {/* EDIT SESSION MODAL */}
      {editingSession && (
        <ClassSessionForm
          products={products}
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSaved={() => {
            setEditingSession(null);
            loadSessions();
          }}
        />
      )}
    </div>
  );
}
