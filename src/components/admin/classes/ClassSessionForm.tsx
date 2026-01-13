// src/components/admin/classes/ClassSessionForm.tsx
// Modal form for creating or editing class sessions

import { useState } from "react";
import { publicApi } from "@/lib/publicApi";
import { Button } from "@/components/ui/button";

export default function ClassSessionForm({
  products,
  session,
  onClose,
  onSaved,
}: {
  products: any[];
  session?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    classProductId: session?.classProductId || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    seatsTotal: session?.seatsTotal || 10,
    seatsAvailable: session?.seatsAvailable || 10,
  });

  function updateForm(e: any) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "seatsTotal" ? Number(value) : value,
      ...(name === "seatsTotal"
        ? { seatsAvailable: Number(value) }
        : {}),
    });
  }

  async function save() {
    try {
      if (session) {
        await publicApi.patch(`/class-sessions/${session.id}`, form);
      } else {
        await publicApi.post("/class-sessions", form);
      }

      onSaved();
    } catch (err) {
      console.error("SAVE SESSION ERROR", err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {session ? "Edit Session" : "Create Session"}
        </h2>

        {/* CLASS PRODUCT SELECTOR */}
        <label className="block mb-2">Class</label>
        <select
          name="classProductId"
          value={form.classProductId}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
        >
          <option value="">Select a class</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* START TIME */}
        <label className="block mb-2">Start Time</label>
        <input
          type="datetime-local"
          name="startTime"
          value={form.startTime}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
        />

        {/* END TIME */}
        <label className="block mb-2">End Time</label>
        <input
          type="datetime-local"
          name="endTime"
          value={form.endTime}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
        />

        {/* CAPACITY */}
        <label className="block mb-2">Total Seats</label>
        <input
          type="number"
          name="seatsTotal"
          value={form.seatsTotal}
          onChange={updateForm}
          min={1}
          className="border p-2 w-full mb-4"
        />

        {/* AUTO seatsAvailable */}
        <label className="block mb-2 text-gray-600 text-sm">
          Seats Available (auto set)
        </label>
        <input
          type="number"
          value={form.seatsAvailable}
          disabled
          className="border p-2 w-full mb-4 bg-gray-100"
        />

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-6">
          <Button onClick={save}>{session ? "Save Changes" : "Create"}</Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
