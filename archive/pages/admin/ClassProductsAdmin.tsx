// src/pages/admin/ClassProductsAdmin.tsx
// Admin interface for creating, editing, deleting class products.

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/publicApi";
import { Button } from "@/components/ui/button";

export default function ClassProductsAdmin() {
  // All products from server
  const [products, setProducts] = useState<any[]>([]);

  // Whether we are editing or creating
  const [editing, setEditing] = useState<any | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: 10,
    price: 0,
    currency: "USD",
    imageUrl: "",
    active: true,
  });

  // Load class products on page load
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await publicApi.get("/class-products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("ADMIN LOAD CLASS PRODUCTS ERROR", err);
    }
  }

  // Handle input changes
  function updateForm(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.type === "number"
        ? Number(e.target.value)
        : e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });
  }

  // Start editing an existing product
  function startEdit(p: any) {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description,
      capacity: p.capacity,
      price: p.price,
      currency: p.currency,
      imageUrl: p.imageUrl,
      active: p.active,
    });
  }

  // Reset form when finished editing
  function resetForm() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      capacity: 10,
      price: 0,
      currency: "USD",
      imageUrl: "",
      active: true,
    });
  }

  // Create or update product
  async function saveProduct() {
    try {
      if (editing) {
        // Update existing
        await publicApi.patch(`/class-products/${editing}`, form);
      } else {
        // Create new
        await publicApi.post("/class-products", form);
      }

      resetForm();
      loadProducts();
    } catch (err) {
      console.error("ADMIN SAVE CLASS PRODUCT ERROR", err);
    }
  }

  // Delete a product
  async function deleteProduct(id: number) {
    if (!confirm("Delete this class product?")) return;

    try {
      await publicApi.delete(`/class-products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("ADMIN DELETE CLASS PRODUCT ERROR", err);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Class Products (Admin)</h1>

      {/* Product Form */}
      <div className="border rounded p-4 mb-8 bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">
          {editing ? "Edit Class Product" : "Create New Class Product"}
        </h2>

        {/* Name */}
        <label className="block mb-2">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
          placeholder="SUP Lesson"
        />

        {/* Description */}
        <label className="block mb-2">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
          rows={3}
        />

        {/* Capacity */}
        <label className="block mb-2">Default Session Capacity</label>
        <input
          type="number"
          name="capacity"
          value={form.capacity}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
          min={1}
        />

        {/* Price */}
        <label className="block mb-2">Price (cents)</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
          min={0}
        />

        {/* Currency */}
        <label className="block mb-2">Currency</label>
        <input
          name="currency"
          value={form.currency}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
        />

        {/* Image URL */}
        <label className="block mb-2">Image URL</label>
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={updateForm}
          className="border p-2 w-full mb-4"
        />

        {/* Active toggle */}
        <label className="inline-flex items-center mb-4">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={updateForm}
            className="mr-2"
          />
          Active
        </label>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">
          <Button onClick={saveProduct}>
            {editing ? "Save Changes" : "Create"}
          </Button>

          {editing && (
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* List of existing products */}
      <h2 className="text-xl font-bold mb-4">Existing Class Products</h2>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">
                {p.capacity} seats · {p.price} {p.currency}
              </div>
              {!p.active && (
                <div className="text-xs text-red-600">Inactive</div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => startEdit(p)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => deleteProduct(p.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
