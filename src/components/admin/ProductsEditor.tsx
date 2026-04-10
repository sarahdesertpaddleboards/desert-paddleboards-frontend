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
  overrideId?: number | null;
  overrideName?: string | null;
  overrideDescription?: string | null;
  overridePrice?: number | null;
  digitalObjectKey?: string | null;
};

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

type DraftMap = Record<
  number,
  {
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
  }
>;

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
      return "Best for preset gift amounts customers can buy and redeem later.";
    case "digital":
      return "Best for downloadable items fulfilled through secure delivery after purchase.";
    case "physical":
      return "Best for merchandise or shippable physical items.";
    default:
      return "General catalog item.";
  }
}

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
      },
    ]),
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
    const res = await axios.get(`${ADMIN_API_BASE}/admin/store/products`, {
      withCredentials: true,
    });
    const items = Array.isArray(res.data) ? res.data : [];
    setProducts(items);
    setDrafts(buildDrafts(items));
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateDraft(id: number, field: keyof DraftMap[number], value: string | boolean) {
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
      toast.error("Base name, product key, and type are required");
      return;
    }

    const payload = {
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
    };

    try {
      setSaving(item.id);

      await axios.patch(`${ADMIN_API_BASE}/admin/store/products/${item.id}`, payload, {
        withCredentials: true,
      });

      if (!options?.quiet) {
        toast.success("Catalog item updated");
      }
      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setSaving(null);
    }
  }

  function resetDraft(item: CatalogItem) {
    setDrafts((current) => ({
      ...current,
      [item.id]: {
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
      },
    }));
  }

  async function toggleActive(item: CatalogItem, active: boolean) {
    setDrafts((current) => ({
      ...current,
      [item.id]: {
        ...current[item.id],
        active,
      },
    }));

    await saveProduct(item, { quiet: true });
    toast.success(active ? "Catalog item activated" : "Catalog item deactivated");
  }

  async function deleteProduct(item: CatalogItem) {
    const confirmed = window.confirm(`Delete catalog item "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeleting(item.id);
      await axios.delete(`${ADMIN_API_BASE}/admin/store/products/${item.id}`, {
        withCredentials: true,
      });
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

  const productCounts = useMemo(() => {
    const counts = {
      total: products.length,
      gift: 0,
      digital: 0,
      physical: 0,
      inactive: 0,
    };

    for (const product of products) {
      if ((product.type || "").toLowerCase() === "gift") counts.gift += 1;
      else if ((product.type || "").toLowerCase() === "digital") counts.digital += 1;
      else if ((product.type || "").toLowerCase() === "physical") counts.physical += 1;
      if (product.active === false) counts.inactive += 1;
    }

    return counts;
  }, [products]);

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
        const haystack = [
          product.name,
          product.productKey,
          product.description,
          product.overrideName,
          product.overrideDescription,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .sort((a, b) => {
        const typeOrder = { gift: 0, physical: 1, digital: 2 } as Record<string, number>;
        const aType = typeOrder[(a.type || "").toLowerCase()] ?? 99;
        const bType = typeOrder[(b.type || "").toLowerCase()] ?? 99;
        if (aType !== bType) return aType - bType;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [products, filter, search]);

  const groupedProducts = useMemo(() => {
    return {
      gifts: filteredProducts.filter((item) => (item.type || "").toLowerCase() === "gift"),
      physical: filteredProducts.filter((item) => (item.type || "").toLowerCase() === "physical"),
      digital: filteredProducts.filter((item) => (item.type || "").toLowerCase() === "digital"),
      other: filteredProducts.filter((item) => !["gift", "physical", "digital"].includes((item.type || "").toLowerCase())),
    };
  }, [filteredProducts]);

  if (loading) return <div>Loading catalog…</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Catalog</h2>
            <p className="text-muted-foreground max-w-3xl">
              Manage customer-facing store products including gift certificates, digital products, and merchandise. This is currently a lightweight catalog manager for product setup, live display fields, and digital fulfillment mapping.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((value) => !value)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {showCreateForm ? "Close" : "Add catalog item"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1">{productCounts.total} total</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{productCounts.physical} merchandise</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{productCounts.gift} gift certificates</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{productCounts.digital} digital</span>
          {productCounts.inactive > 0 ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">{productCounts.inactive} inactive</span>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            className="border rounded-lg px-3 py-2"
            placeholder="Search catalog by name, key, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All catalog items</option>
            <option value="gift">Gift certificates</option>
            <option value="physical">Merchandise</option>
            <option value="digital">Digital products</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
      </div>

      {showCreateForm && (
        <div className="border rounded-xl p-5 bg-slate-50 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Create catalog item</h3>
            <p className="text-sm text-muted-foreground">
              Add a new merchandise, digital product, or gift certificate item to the store catalog.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={newProduct.name}
                onChange={(e) => setNewProduct((current) => ({ ...current, name: e.target.value }))}
                placeholder="Blue Wave Experiences Paddleboard"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Product key</div>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={newProduct.productKey}
                onChange={(e) => setNewProduct((current) => ({ ...current, productKey: e.target.value }))}
                placeholder="blue-wave-experiences-paddleboard"
              />
              <div className="text-xs text-gray-500">Stable internal key used in links, checkout, and fulfillment.</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Type</div>
              <select
                className="border p-2 rounded w-full"
                value={newProduct.type}
                onChange={(e) => setNewProduct((current) => ({ ...current, type: e.target.value }))}
              >
                <option value="physical">Merchandise</option>
                <option value="digital">Digital product</option>
                <option value="gift">Gift certificate</option>
              </select>
              <div className="text-xs text-gray-500">{typeDescription(newProduct.type)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Price (USD)</div>
              <input
                type="number"
                step="0.01"
                className="border p-2 rounded w-full"
                value={newProduct.price}
                onChange={(e) => setNewProduct((current) => ({ ...current, price: e.target.value }))}
                placeholder="75.00"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Description</div>
            <textarea
              className="border p-2 rounded w-full min-h-[100px]"
              value={newProduct.description}
              onChange={(e) => setNewProduct((current) => ({ ...current, description: e.target.value }))}
              placeholder="Describe what the customer is buying and what they should expect."
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Image URL</div>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct((current) => ({ ...current, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
            <div className="text-xs text-gray-500">Optional product image used in listings and purchase pages.</div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newProduct.active}
              onChange={(e) => setNewProduct((current) => ({ ...current, active: e.target.checked }))}
            />
            Active and visible in the catalog
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={createProduct}
              disabled={creating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create catalog item"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewProduct(EMPTY_FORM);
              }}
              disabled={creating}
              className="rounded-lg border px-4 py-2 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {([
        { key: "gifts", title: "Gift certificates", items: groupedProducts.gifts },
        { key: "physical", title: "Merchandise", items: groupedProducts.physical },
        { key: "digital", title: "Digital products", items: groupedProducts.digital },
        { key: "other", title: "Other catalog items", items: groupedProducts.other },
      ] as const)
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div key={group.key} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <div className="text-sm text-muted-foreground">{group.items.length} item{group.items.length === 1 ? "" : "s"}</div>
            </div>

            <div className="space-y-4">
              {group.items.map((p) => {
                const visibleName = p.overrideName ?? p.name ?? `Product ${p.id}`;
                const visibleDescription = p.overrideDescription ?? p.description ?? "";
                const visiblePrice = typeof p.overridePrice === "number" ? p.overridePrice : p.price;
                const draft = drafts[p.id] ?? {
                  name: "",
                  description: "",
                  price: "",
                  type: "physical",
                  productKey: "",
                  imageUrl: "",
                  active: true,
                  overrideName: "",
                  overrideDescription: "",
                  overridePrice: "",
                  digitalObjectKey: "",
                };
                const isGift = draft.type === "gift";
                const isDigital = draft.type === "digital";
                const isPhysical = draft.type === "physical";

                return (
                  <div
                    key={p.id}
                    className="border rounded-xl p-5 space-y-5 bg-white shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-lg">{visibleName}</div>
                        <span className="text-xs rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                          {labelForType(p.type)}
                        </span>
                        {p.active === false ? (
                          <span className="text-xs rounded-full bg-red-50 px-2.5 py-1 text-red-600">Inactive</span>
                        ) : (
                          <span className="text-xs rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Active</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Product key: {p.productKey || "—"}</div>
                      <div className="text-sm text-muted-foreground">Current visible price: {formatMoney(visiblePrice)}</div>
                      {visibleDescription ? (
                        <div className="text-sm text-muted-foreground">{visibleDescription}</div>
                      ) : null}
                    </div>

                    <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-900">
                      <div className="font-medium">{labelForType(draft.type)}</div>
                      <div>{typeDescription(draft.type)}</div>
                      {isGift ? <div className="mt-2 text-xs">Tip: create one catalog item per preset gift amount, such as $50, $75, and $100.</div> : null}
                      {isDigital ? <div className="mt-2 text-xs">Tip: add a digital object key below so the purchase can map to the protected download file.</div> : null}
                      {isPhysical ? <div className="mt-2 text-xs">Shipping and inventory fields are not added yet, but this is where merchandise items belong.</div> : null}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                      <div className="space-y-3 rounded-lg border p-4 bg-slate-50">
                        <div>
                          <h3 className="font-semibold">Product image</h3>
                          <p className="text-xs text-gray-500">Shown alongside this catalog item in customer-facing surfaces when available.</p>
                        </div>
                        <div className="aspect-square w-full overflow-hidden rounded-lg border bg-white flex items-center justify-center text-xs text-gray-400">
                          {draft.imageUrl ? (
                            <img src={draft.imageUrl} alt={draft.name || visibleName} className="h-full w-full object-cover" />
                          ) : (
                            <span>No image set</span>
                          )}
                        </div>
                        <input
                          type="text"
                          className="border p-2 rounded w-full bg-white"
                          value={draft.imageUrl}
                          onChange={(e) => updateDraft(p.id, "imageUrl", e.target.value)}
                          disabled={saving === p.id}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                          <div>
                            <h3 className="font-semibold">Base product setup</h3>
                            <p className="text-xs text-gray-500">Core product data used by the catalog and checkout.</p>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Name</div>
                            <input
                              type="text"
                              className="border p-2 rounded w-full bg-white"
                              value={draft.name}
                              onChange={(e) => updateDraft(p.id, "name", e.target.value)}
                              disabled={saving === p.id}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Product key</div>
                            <input
                              type="text"
                              className="border p-2 rounded w-full bg-white"
                              value={draft.productKey}
                              onChange={(e) => updateDraft(p.id, "productKey", e.target.value)}
                              disabled={saving === p.id}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Type</div>
                              <select
                                className="border p-2 rounded w-full bg-white"
                                value={draft.type}
                                onChange={(e) => updateDraft(p.id, "type", e.target.value)}
                                disabled={saving === p.id}
                              >
                                <option value="physical">Merchandise</option>
                                <option value="digital">Digital product</option>
                                <option value="gift">Gift certificate</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-medium">Base price (USD)</div>
                              <input
                                type="number"
                                step="0.01"
                                className="border p-2 rounded w-full bg-white"
                                value={draft.price}
                                onChange={(e) => updateDraft(p.id, "price", e.target.value)}
                                disabled={saving === p.id}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Description</div>
                            <textarea
                              className="border p-2 rounded w-full min-h-[100px] bg-white"
                              value={draft.description}
                              onChange={(e) => updateDraft(p.id, "description", e.target.value)}
                              disabled={saving === p.id}
                            />
                          </div>

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={draft.active}
                              onChange={(e) => updateDraft(p.id, "active", e.target.checked)}
                              disabled={saving === p.id}
                            />
                            Active and visible in the catalog
                          </label>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4 bg-white">
                          <div>
                            <h3 className="font-semibold">Customer-facing display tweaks</h3>
                            <p className="text-xs text-gray-500">Optional values that let you change what customers see without replacing the base product data.</p>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Display name</div>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={draft.overrideName}
                              onChange={(e) => updateDraft(p.id, "overrideName", e.target.value)}
                              disabled={saving === p.id}
                              placeholder="Leave blank to use the base product name"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Display price</div>
                            <input
                              type="number"
                              step="0.01"
                              className="border p-2 rounded w-full"
                              value={draft.overridePrice}
                              onChange={(e) => updateDraft(p.id, "overridePrice", e.target.value)}
                              disabled={saving === p.id}
                              placeholder="Leave blank to use the base price"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Display description</div>
                            <textarea
                              className="border p-2 rounded w-full min-h-[100px]"
                              value={draft.overrideDescription}
                              onChange={(e) => updateDraft(p.id, "overrideDescription", e.target.value)}
                              disabled={saving === p.id}
                              placeholder="Leave blank to use the base product description"
                            />
                          </div>

                          {isDigital ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Digital object key</div>
                              <input
                                type="text"
                                className="border p-2 rounded w-full max-w-xl"
                                value={draft.digitalObjectKey}
                                onChange={(e) => updateDraft(p.id, "digitalObjectKey", e.target.value)}
                                disabled={saving === p.id}
                                placeholder="e.g. sonoran-echoes.zip"
                              />
                              <div className="text-xs text-gray-500">
                                Used for secure delivery after purchase. Leave blank for non-digital items.
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-md border border-dashed p-3 text-xs text-gray-500">
                              Digital object key is only needed for digital products.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => saveProduct(p)}
                        disabled={saving === p.id || deleting === p.id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {saving === p.id ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetDraft(p)}
                        disabled={saving === p.id || deleting === p.id}
                        className="rounded-lg border px-4 py-2 hover:bg-slate-100 disabled:opacity-60"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(p, !draft.active)}
                        disabled={saving === p.id || deleting === p.id}
                        className="rounded-lg border px-4 py-2 hover:bg-slate-100 disabled:opacity-60"
                      >
                        {draft.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p)}
                        disabled={saving === p.id || deleting === p.id}
                        className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deleting === p.id ? "Deleting..." : "Delete item"}
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Tip: prefer deactivating items you may want to keep for historical orders or future reuse. Delete only when you are sure the item should be removed completely.
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
          <div>Try clearing the filters, switching item type, or creating a new catalog item.</div>
        </div>
      ) : null}
    </div>
  );
}
