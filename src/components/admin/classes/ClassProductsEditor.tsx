import { useEffect, useState } from "react";
import {
  createAdminClassProduct,
  fetchAdminClassProducts,
  type AdminClassProduct,
} from "@/lib/adminApi";

export default function ClassProductsEditor() {
  const [items, setItems] = useState<AdminClassProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productKey: "",
    name: "",
    description: "",
    price: "",
    currency: "usd",
    capacity: "",
    imageUrl: "",
    active: true,
  });

  async function load() {
    const data = await fetchAdminClassProducts();
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    await createAdminClassProduct({
      productKey: form.productKey,
      name: form.name,
      description: form.description,
      price: Number(form.price || 0),
      currency: form.currency,
      capacity: Number(form.capacity || 0),
      imageUrl: form.imageUrl || "",
      active: form.active,
    });

    setForm({
      productKey: "",
      name: "",
      description: "",
      price: "",
      currency: "usd",
      capacity: "",
      imageUrl: "",
      active: true,
    });
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + New Class Product
      </button>

      {showForm && (
        <div className="border p-4 rounded space-y-3">
          <input
            className="border p-2 w-full"
            placeholder="productKey"
            value={form.productKey}
            onChange={(e) => setForm({ ...form, productKey: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className="border p-2 w-full"
            placeholder="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="price (cents)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="imageUrl"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={create}
          >
            Create
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {items.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <div className="text-gray-600">{p.productKey}</div>
            <div>Price: ${(p.price / 100).toFixed(2)}</div>
            <div>Capacity: {p.capacity}</div>
            <div>Status: {p.active ? "Active" : "Inactive"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
