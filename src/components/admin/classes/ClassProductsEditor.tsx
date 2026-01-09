import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function ClassProductsEditor() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productKey: "",
    name: "",
    description: "",
    price: "",
    currency: "usd",
    capacity: "",
    imageUrl: "",
  });

  async function load() {
    const res = await axios.get(`${API_BASE}/admin/class-products`, {
      withCredentials: true,
    });
    setItems(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    await axios.post(`${API_BASE}/admin/class-products`, form, {
      withCredentials: true,
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
          {Object.keys(form).map((key) => (
            <input
              key={key}
              className="border p-2 w-full"
              placeholder={key}
              value={form[key as keyof typeof form]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          ))}
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={create}
          >
            Create
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {items.map((p: any) => (
          <div key={p.id} className="border p-4 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <div className="text-gray-600">{p.productKey}</div>
            <div>Price: ${(p.price / 100).toFixed(2)}</div>
            <div>Capacity: {p.capacity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
