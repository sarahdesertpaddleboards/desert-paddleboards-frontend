import { useEffect, useMemo, useState } from "react";
import {
  createAdminClassProduct,
  deleteAdminClassProduct,
  fetchAdminClassProducts,
  updateAdminClassProduct,
  type AdminClassProduct,
} from "@/lib/adminApi";
import { toast } from "sonner";

type ProductDraftMap = Record<
  number,
  {
    productKey: string;
    name: string;
    description: string;
    price: string;
    currency: string;
    capacity: string;
    imageUrl: string;
    active: boolean;
  }
>;

function buildDrafts(items: AdminClassProduct[]): ProductDraftMap {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      {
        productKey: item.productKey ?? "",
        name: item.name ?? "",
        description: item.description ?? "",
        price: typeof item.price === "number" ? (item.price / 100).toFixed(2) : "",
        currency: item.currency ?? "usd",
        capacity: String(item.capacity ?? ""),
        imageUrl: item.imageUrl ?? "",
        active: item.active !== false,
      },
    ]),
  );
}

function inferExperienceFamily(value: string) {
  const text = value.toLowerCase();
  if (text.includes("private")) return "Private offering";
  if (text.includes("soundbath")) return "Soundbath";
  if (text.includes("yoga")) return "Yoga";
  if (text.includes("event")) return "Event";
  return "Experience";
}

function inferAudience(value: string) {
  const text = value.toLowerCase();
  if (text.includes("private")) return "Private group";
  if (text.includes("public")) return "Public session";
  if (text.includes("event")) return "Custom event";
  return "General booking";
}

export default function ClassProductsEditor() {
  const [items, setItems] = useState<AdminClassProduct[]>([]);
  const [drafts, setDrafts] = useState<ProductDraftMap>({});
  const [showForm, setShowForm] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
    const list = Array.isArray(data) ? data : [];
    setItems(list);
    setDrafts(buildDrafts(list));
  }

  useEffect(() => {
    load();
  }, []);

  function updateDraft(id: number, field: keyof ProductDraftMap[number], value: string | boolean) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function create() {
    const price = Number(form.price);
    const capacity = Number(form.capacity);

    if (!form.productKey.trim() || !form.name.trim() || !Number.isFinite(price) || !Number.isFinite(capacity)) {
      toast.error("Product key, name, price, and capacity are required");
      return;
    }

    await createAdminClassProduct({
      productKey: form.productKey.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Math.round(price * 100),
      currency: form.currency.trim() || "usd",
      capacity,
      imageUrl: form.imageUrl.trim() || "",
      active: form.active,
    });

    toast.success("Experience product created");
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

  async function saveItem(item: AdminClassProduct) {
    const draft = drafts[item.id];
    if (!draft) return;

    const price = Math.round(parseFloat(draft.price) * 100);
    const capacity = Number(draft.capacity);

    if (!draft.productKey.trim() || !draft.name.trim() || !Number.isFinite(price) || !Number.isFinite(capacity)) {
      toast.error("Product key, name, price, and capacity are required");
      return;
    }

    try {
      setSavingId(item.id);
      await updateAdminClassProduct(item.id, {
        productKey: draft.productKey.trim(),
        name: draft.name.trim(),
        description: draft.description.trim(),
        price,
        currency: draft.currency.trim() || "usd",
        capacity,
        imageUrl: draft.imageUrl.trim() || "",
        active: draft.active,
      });
      toast.success("Experience product updated");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(item: AdminClassProduct) {
    const confirmed = window.confirm(`Delete experience product "${item.name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await deleteAdminClassProduct(item.id);
      toast.success("Experience product deleted");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const summary = useMemo(() => {
    const active = items.filter((item) => item.active).length;
    const inactive = items.length - active;
    return { total: items.length, active, inactive };
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Experience Products</h2>
        <p className="text-muted-foreground max-w-3xl">
          Create and manage the reusable experience types you sell in real life. These are the templates behind bookable sessions, for example floating soundbath, private pool soundbath, yoga class, or private event.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1">{summary.total} experience product{summary.total === 1 ? "" : "s"}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">{summary.active} active</span>
        {summary.inactive > 0 ? (
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">{summary.inactive} inactive</span>
        ) : null}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {showForm ? "Close" : "Add experience product"}
      </button>

      {showForm && (
        <div className="border p-4 rounded space-y-3 bg-slate-50">
          <div>
            <h3 className="font-semibold">Create experience product</h3>
            <p className="text-sm text-muted-foreground">
              Define a reusable experience type first, then schedule its actual sessions in Manage Experiences.
            </p>
          </div>

          <input
            className="border p-2 w-full"
            placeholder="Product key, e.g. floating-soundbath-public-pool"
            value={form.productKey}
            onChange={(e) => setForm({ ...form, productKey: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Experience name, e.g. Floating Soundbath - Public Pool"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className="border p-2 w-full"
            placeholder="Describe the experience customers are booking"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Price in USD, e.g. 75.00"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Currency, e.g. usd"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Default capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Image URL (optional)"
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
            Create experience product
          </button>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground space-y-2">
          <div>No experience products yet.</div>
          <div>Create an experience product first, then use Manage Experiences to add actual bookable sessions.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((p) => {
            const draft = drafts[p.id] ?? {
              productKey: p.productKey ?? "",
              name: p.name ?? "",
              description: p.description ?? "",
              price: typeof p.price === "number" ? (p.price / 100).toFixed(2) : "",
              currency: p.currency ?? "usd",
              capacity: String(p.capacity ?? ""),
              imageUrl: p.imageUrl ?? "",
              active: p.active !== false,
            };
            const family = inferExperienceFamily(`${draft.name} ${draft.productKey}`);
            const audience = inferAudience(`${draft.name} ${draft.productKey}`);

            return (
              <div key={p.id} className="border p-4 rounded bg-white shadow-sm space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{family}</span>
                  <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{audience}</span>
                  <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                    Default capacity {draft.capacity || "—"}
                  </span>
                  <span className={`text-xs rounded-full px-2.5 py-1 ${draft.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {draft.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="font-medium">{family}</div>
                  <div>
                    Use this experience product as the reusable template for future sessions. Keep naming clear so operators can easily distinguish public, private, venue-specific, and event-style variants.
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                  <div className="space-y-3 rounded-lg border p-4 bg-slate-50">
                    <div>
                      <h4 className="font-semibold">Experience image</h4>
                      <p className="text-xs text-gray-500">Used in customer-facing experience listings when available.</p>
                    </div>
                    <div className="aspect-square w-full overflow-hidden rounded-lg border bg-white flex items-center justify-center text-xs text-gray-400">
                      {draft.imageUrl ? (
                        <img src={draft.imageUrl} alt={draft.name || p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>No image set</span>
                      )}
                    </div>
                    <input
                      className="border p-2 w-full bg-white"
                      placeholder="Image URL"
                      value={draft.imageUrl}
                      onChange={(e) => updateDraft(p.id, "imageUrl", e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 rounded-lg border p-4 bg-white">
                    <div>
                      <h4 className="font-semibold">Experience setup</h4>
                      <p className="text-xs text-gray-500">
                        These values define the reusable booking template. Sessions created later will inherit the general structure from here.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className="border p-2 w-full"
                        placeholder="Product key"
                        value={draft.productKey}
                        onChange={(e) => updateDraft(p.id, "productKey", e.target.value)}
                      />
                      <input
                        className="border p-2 w-full"
                        placeholder="Experience name"
                        value={draft.name}
                        onChange={(e) => updateDraft(p.id, "name", e.target.value)}
                      />
                      <input
                        className="border p-2 w-full"
                        placeholder="Price in USD"
                        value={draft.price}
                        onChange={(e) => updateDraft(p.id, "price", e.target.value)}
                      />
                      <input
                        className="border p-2 w-full"
                        placeholder="Default capacity"
                        value={draft.capacity}
                        onChange={(e) => updateDraft(p.id, "capacity", e.target.value)}
                      />
                      <input
                        className="border p-2 w-full"
                        placeholder="Currency"
                        value={draft.currency}
                        onChange={(e) => updateDraft(p.id, "currency", e.target.value)}
                      />
                    </div>

                    <textarea
                      className="border p-2 w-full min-h-[110px]"
                      placeholder="Description"
                      value={draft.description}
                      onChange={(e) => updateDraft(p.id, "description", e.target.value)}
                    />

                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div className="rounded-lg border p-3 bg-slate-50">
                        <div className="font-medium">Family</div>
                        <div className="text-muted-foreground">{family}</div>
                      </div>
                      <div className="rounded-lg border p-3 bg-slate-50">
                        <div className="font-medium">Audience</div>
                        <div className="text-muted-foreground">{audience}</div>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.active}
                        onChange={(e) => updateDraft(p.id, "active", e.target.checked)}
                      />
                      Active and available for future sessions
                    </label>

                    <div className="text-xs text-muted-foreground">
                      Experience product ID: {p.id}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                        onClick={() => saveItem(p)}
                        disabled={savingId === p.id || deletingId === p.id}
                      >
                        {savingId === p.id ? "Saving..." : "Save experience product"}
                      </button>
                      <button
                        className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                        onClick={() => deleteItem(p)}
                        disabled={savingId === p.id || deletingId === p.id}
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete experience product"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
