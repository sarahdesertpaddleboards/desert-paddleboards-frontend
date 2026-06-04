import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ADMIN_API_BASE } from "@/lib/adminBase";

axios.defaults.withCredentials = true;

type CatalogItem = {
  id: number;
  productKey: string;
  type: string;
  name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  imageUrl?: string | null;
  active?: boolean | null;
  overrideName?: string | null;
  overrideDescription?: string | null;
  overridePrice?: number | null;
  digitalObjectKey?: string | null;
};

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  type: string;
  productKey: string;
  imageUrl: string;
  active: boolean;
  overrideName: string;
  overrideDescription: string;
  overridePrice: string;
  digitalObjectKey: string;
  lengthIn: string;
  widthIn: string;
  heightIn: string;
  weightOz: string;
  shippingNote: string;
};

type DraftMap = Record<number, ProductDraft>;

type NewProductForm = {
  productKey: string;
  name: string;
  type: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string;
  active: boolean;
};

const EMPTY_FORM: NewProductForm = {
  productKey: "",
  name: "",
  type: "physical",
  description: "",
  price: "",
  currency: "usd",
  imageUrl: "",
  active: true,
};

function formatMoney(cents?: number | null) {
  if (typeof cents !== "number") return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function labelForType(type?: string) {
  switch ((type || "").toLowerCase()) {
    case "gift":
      return "Gift certificate";
    case "digital":
      return "Digital product";
    case "physical":
      return "Merchandise";
    default:
      return "Store product";
  }
}

function typeDescription(type?: string) {
  switch ((type || "").toLowerCase()) {
    case "gift":
      return "Use this for gift certificates customers can buy and send to someone else.";
    case "digital":
      return "Use this for downloadable products delivered after purchase.";
    case "physical":
      return "Use this for merchandise or other physical items you may need to ship.";
    default:
      return "General store item.";
  }
}

function buildDrafts(items: CatalogItem[]): DraftMap {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      {
        name: item.name ?? "",
        description: item.description ?? "",
        price: typeof item.price === "number" ? (item.price / 100).toFixed(2) : "",
        type: item.type ?? "physical",
        productKey: item.productKey ?? "",
        imageUrl: item.imageUrl ?? "",
        active: item.active !== false,
        overrideName: item.overrideName ?? "",
        overrideDescription: item.overrideDescription ?? "",
        overridePrice: typeof item.overridePrice === "number" ? (item.overridePrice / 100).toFixed(2) : "",
        digitalObjectKey: item.digitalObjectKey ?? "",
        lengthIn: "",
        widthIn: "",
        heightIn: "",
        weightOz: "",
        shippingNote: "Contact us for shipping outside mainland US.",
      },
    ]),
  );
}

function ProductImagePreview({ src, alt }: { src?: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  const cleanSrc = (src || "").trim();
  const showImage = cleanSrc && !broken;

  return (
    <div className="aspect-square w-full overflow-hidden rounded-lg border bg-white flex items-center justify-center text-xs text-gray-400">
      {showImage ? (
        <img src={cleanSrc} alt={alt} className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <span>{cleanSrc ? "Image unavailable" : "No image set"}</span>
      )}
    </div>
  );
}

export default function ProductsEditor() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductForm>(EMPTY_FORM);
  const [filter, setFilter] = useState<"all" | "physical" | "gift" | "digital" | "inactive">("all");
  const [search, setSearch] = useState("");

  async function loadProducts() {
    const res = await axios.get(`${ADMIN_API_BASE}/admin/store/products`, { withCredentials: true });
    const items = Array.isArray(res.data) ? res.data : [];
    setProducts(items);
    setDrafts(buildDrafts(items));
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateDraft(id: number, field: keyof ProductDraft, value: string | boolean) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function saveProduct(item: CatalogItem, options?: { quiet?: boolean }) {
    const draft = drafts[item.id];
    if (!draft) return;

    const basePrice = draft.price.trim() === "" ? null : Math.round(parseFloat(draft.price) * 100);
    const overridePrice = draft.overridePrice.trim() === "" ? null : Math.round(parseFloat(draft.overridePrice) * 100);

    if (basePrice === null || !Number.isFinite(basePrice)) {
      toast.error("Base price must be a valid number");
      return;
    }
    if (overridePrice !== null && !Number.isFinite(overridePrice)) {
      toast.error("Display price must be a valid number");
      return;
    }
    if (!draft.name.trim() || !draft.productKey.trim() || !draft.type.trim()) {
      toast.error("Name, product key, and type are required");
      return;
    }

    try {
      setSaving(item.id);
      await axios.patch(
        `${ADMIN_API_BASE}/admin/store/products/${item.id}`,
        {
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          price: basePrice,
          type: draft.type.trim(),
          productKey: draft.productKey.trim(),
          imageUrl: draft.imageUrl.trim() || null,
          active: draft.active,
          overrideName: draft.overrideName.trim() || null,
          overrideDescription: draft.overrideDescription.trim() || null,
          overridePrice,
          digitalObjectKey: draft.digitalObjectKey.trim() || null,
        },
        { withCredentials: true },
      );
      if (!options?.quiet) toast.success("Catalog item updated");
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setSaving(null);
    }
  }

  async function toggleActive(item: CatalogItem, active: boolean) {
    setDrafts((current) => ({ ...current, [item.id]: { ...current[item.id], active } }));
    await saveProduct(item, { quiet: true });
    toast.success(active ? "Catalog item activated" : "Catalog item deactivated");
  }

  async function deleteProduct(item: CatalogItem) {
    const confirmed = window.confirm(`Delete catalog item "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeleting(item.id);
      await axios.delete(`${ADMIN_API_BASE}/admin/store/products/${item.id}`, { withCredentials: true });
      toast.success("Catalog item deleted");
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  async function createProduct() {
    const price = Number(newProduct.price);
    if (!newProduct.productKey.trim() || !newProduct.name.trim() || !newProduct.type.trim() || !Number.isFinite(price)) {
      toast.error("Name, product key, type, and price are required");
      return;
    }

    try {
      setCreating(true);
      await axios.post(
        `${ADMIN_API_BASE}/admin/store/products`,
        {
          productKey: newProduct.productKey.trim(),
          name: newProduct.name.trim(),
          type: newProduct.type.trim(),
          description: newProduct.description.trim() || null,
          price: Math.round(price * 100),
          currency: newProduct.currency.trim() || "usd",
          imageUrl: newProduct.imageUrl.trim() || null,
          active: newProduct.active,
        },
        { withCredentials: true },
      );
      toast.success("Catalog item created");
      setNewProduct(EMPTY_FORM);
      setShowCreateForm(false);
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Create failed");
    } finally {
      setCreating(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter((product) => {
        if (filter === "inactive") return product.active === false;
        if (filter !== "all") return (product.type || "").toLowerCase() === filter;
        return true;
      })
      .filter((product) => {
        if (!query) return true;
        return [product.name, product.productKey, product.description, product.overrideName, product.overrideDescription]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [products, filter, search]);

  const groupedProducts = useMemo(() => ({
    gifts: filteredProducts.filter((item) => (item.type || "").toLowerCase() === "gift"),
    physical: filteredProducts.filter((item) => (item.type || "").toLowerCase() === "physical"),
    digital: filteredProducts.filter((item) => (item.type || "").toLowerCase() === "digital"),
  }), [filteredProducts]);

  if (loading) return <div>Loading catalog…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Catalog</h2>
        <button type="button" onClick={() => setShowCreateForm((value) => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          {showCreateForm ? "Close" : "Add catalog item"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input type="text" className="border rounded-lg px-3 py-2" placeholder="Search catalog" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border rounded-lg px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All items</option>
          <option value="gift">Gift certificates</option>
          <option value="physical">Merchandise</option>
          <option value="digital">Digital products</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {showCreateForm && (
        <div className="border rounded-xl p-5 bg-slate-50 space-y-4">
          <h3 className="text-lg font-semibold">Create catalog item</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="border p-2 rounded w-full" value={newProduct.name} onChange={(e) => setNewProduct((c) => ({ ...c, name: e.target.value }))} placeholder="Name" />
            <input className="border p-2 rounded w-full" value={newProduct.productKey} onChange={(e) => setNewProduct((c) => ({ ...c, productKey: e.target.value }))} placeholder="Product key" />
            <select className="border p-2 rounded w-full" value={newProduct.type} onChange={(e) => setNewProduct((c) => ({ ...c, type: e.target.value }))}>
              <option value="physical">Merchandise</option>
              <option value="digital">Digital product</option>
              <option value="gift">Gift certificate</option>
            </select>
            <input type="number" step="0.01" className="border p-2 rounded w-full" value={newProduct.price} onChange={(e) => setNewProduct((c) => ({ ...c, price: e.target.value }))} placeholder="Price (USD)" />
          </div>
          <textarea className="border p-2 rounded w-full min-h-[100px]" value={newProduct.description} onChange={(e) => setNewProduct((c) => ({ ...c, description: e.target.value }))} placeholder="Description" />
          <input className="border p-2 rounded w-full" value={newProduct.imageUrl} onChange={(e) => setNewProduct((c) => ({ ...c, imageUrl: e.target.value }))} placeholder="Image URL (optional)" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newProduct.active} onChange={(e) => setNewProduct((c) => ({ ...c, active: e.target.checked }))} />Active</label>
          <div className="flex gap-3">
            <button type="button" onClick={createProduct} disabled={creating} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">{creating ? "Creating..." : "Create catalog item"}</button>
            <button type="button" onClick={() => { setShowCreateForm(false); setNewProduct(EMPTY_FORM); }} disabled={creating} className="rounded-lg border px-4 py-2 hover:bg-slate-100 disabled:opacity-60">Cancel</button>
          </div>
        </div>
      )}

      {([
        { key: "gifts", title: "Gift certificates", items: groupedProducts.gifts },
        { key: "physical", title: "Merchandise", items: groupedProducts.physical },
        { key: "digital", title: "Digital products", items: groupedProducts.digital },
      ] as const)
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div key={group.key} className="space-y-4">
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <div className="space-y-4">
              {group.items.map((p) => {
                const draft = drafts[p.id];
                const visibleName = p.overrideName ?? p.name;
                const visibleDescription = p.overrideDescription ?? p.description ?? "";
                const visiblePrice = typeof p.overridePrice === "number" ? p.overridePrice : p.price;
                const isDigital = draft.type === "digital";
                const isPhysical = draft.type === "physical";

                return (
                  <div key={p.id} className="border rounded-xl p-5 space-y-5 bg-white shadow-sm">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-lg">{visibleName}</div>
                        <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{labelForType(draft.type)}</span>
                        <span className={`text-xs rounded-full px-2.5 py-1 ${draft.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{draft.active ? "Active" : "Inactive"}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">${(visiblePrice / 100).toFixed(2)}</div>
                      {visibleDescription ? <div className="text-sm text-muted-foreground">{visibleDescription}</div> : null}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                      <div className="space-y-3 rounded-lg border p-4 bg-slate-50">
                        <div>
                          <h3 className="font-semibold">Image</h3>
                        </div>
                        <ProductImagePreview src={draft.imageUrl} alt={draft.name || visibleName} />
                        <input className="border p-2 rounded w-full bg-white" value={draft.imageUrl} onChange={(e) => updateDraft(p.id, "imageUrl", e.target.value)} placeholder="Image URL" />
                      </div>

                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                          <h3 className="font-semibold">Product setup</h3>
                          <input className="border p-2 rounded w-full bg-white" value={draft.name} onChange={(e) => updateDraft(p.id, "name", e.target.value)} placeholder="Name" />
                          <input className="border p-2 rounded w-full bg-white" value={draft.productKey} onChange={(e) => updateDraft(p.id, "productKey", e.target.value)} placeholder="Product key" />
                          <div className="grid gap-4 md:grid-cols-2">
                            <select className="border p-2 rounded w-full bg-white" value={draft.type} onChange={(e) => updateDraft(p.id, "type", e.target.value)}>
                              <option value="physical">Merchandise</option>
                              <option value="digital">Digital product</option>
                              <option value="gift">Gift certificate</option>
                            </select>
                            <input type="number" step="0.01" className="border p-2 rounded w-full bg-white" value={draft.price} onChange={(e) => updateDraft(p.id, "price", e.target.value)} placeholder="Price (USD)" />
                          </div>
                          <textarea className="border p-2 rounded w-full min-h-[100px] bg-white" value={draft.description} onChange={(e) => updateDraft(p.id, "description", e.target.value)} placeholder="Description" />
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => updateDraft(p.id, "active", e.target.checked)} />Active</label>

                          {isPhysical ? (
                            <div className="space-y-3 rounded-lg border bg-white p-3">
                              <div>
                                <div className="font-medium">Shipping details</div>
                                <div className="text-xs text-muted-foreground">These fields prepare for shipping cost logic later.</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input className="border p-2 rounded w-full" value={draft.lengthIn} onChange={(e) => updateDraft(p.id, "lengthIn", e.target.value)} placeholder="Length (in)" />
                                <input className="border p-2 rounded w-full" value={draft.widthIn} onChange={(e) => updateDraft(p.id, "widthIn", e.target.value)} placeholder="Width (in)" />
                                <input className="border p-2 rounded w-full" value={draft.heightIn} onChange={(e) => updateDraft(p.id, "heightIn", e.target.value)} placeholder="Height (in)" />
                                <input className="border p-2 rounded w-full" value={draft.weightOz} onChange={(e) => updateDraft(p.id, "weightOz", e.target.value)} placeholder="Weight (oz)" />
                              </div>
                              <input className="border p-2 rounded w-full" value={draft.shippingNote} onChange={(e) => updateDraft(p.id, "shippingNote", e.target.value)} placeholder="Shipping note" />
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-4 rounded-lg border p-4 bg-white">
                          <h3 className="font-semibold">Customer-facing text</h3>
                          <input className="border p-2 rounded w-full" value={draft.overrideName} onChange={(e) => updateDraft(p.id, "overrideName", e.target.value)} placeholder="Display name (optional)" />
                          <input type="number" step="0.01" className="border p-2 rounded w-full" value={draft.overridePrice} onChange={(e) => updateDraft(p.id, "overridePrice", e.target.value)} placeholder="Display price (optional)" />
                          <textarea className="border p-2 rounded w-full min-h-[100px]" value={draft.overrideDescription} onChange={(e) => updateDraft(p.id, "overrideDescription", e.target.value)} placeholder="Display description (optional)" />

                          {isDigital ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Download file reference</div>
                              <input className="border p-2 rounded w-full" value={draft.digitalObjectKey} onChange={(e) => updateDraft(p.id, "digitalObjectKey", e.target.value)} placeholder="e.g. sound-journey.zip" />
                              <div className="text-xs text-gray-500">This connects the product to the file that should be delivered after purchase.</div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => saveProduct(p)} disabled={saving === p.id || deleting === p.id} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">{saving === p.id ? "Saving..." : "Save changes"}</button>
                      <button type="button" onClick={() => toggleActive(p, !draft.active)} disabled={saving === p.id || deleting === p.id} className="rounded-lg border px-4 py-2 hover:bg-slate-100 disabled:opacity-60">{draft.active ? "Deactivate" : "Activate"}</button>
                      <button type="button" onClick={() => deleteProduct(p)} disabled={saving === p.id || deleting === p.id} className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60">{deleting === p.id ? "Deleting..." : "Delete item"}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground space-y-2">
          <div>No catalog items match the current search/filter.</div>
          <div>Try clearing the filters or creating a new catalog item.</div>
        </div>
      ) : null}
    </div>
  );
}
