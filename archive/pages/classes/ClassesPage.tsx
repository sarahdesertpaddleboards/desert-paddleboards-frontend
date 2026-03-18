// src/pages/classes/ClassesPage.tsx
// Lists all available class products in a grid

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/publicApi";
import ClassCard from "@/components/classes/ClassCard";

export default function ClassesPage() {
  // Store all class products returned from API
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all class products
    async function load() {
      try {
        const res = await publicApi.get("/class-products"); // backend endpoint
        setClasses(res.data || []);
      } catch (err) {
        console.error("CLASS PRODUCTS ERROR", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading classes…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Classes & Activities</h1>

      {/* If no classes published */}
      {classes.length === 0 && (
        <div>No classes available right now.</div>
      )}

      {/* Grid of class products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {classes.map((p) => (
          <ClassCard key={p.id} cls={p} />
        ))}
      </div>
    </div>
  );
}
