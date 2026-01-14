// src/pages/classes/index.tsx

import { useEffect, useState } from "react";
import { fetchClassProducts } from "@/lib/classApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ClassesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  // Load class types (e.g. Morning Paddle 101)
  useEffect(() => {
    fetchClassProducts()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading classes…</div>;

  return (
    <div className="p-8 mx-auto max-w-4xl space-y-6">
      <h1 className="text-4xl font-bold mb-4">Classes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p>{item.description}</p>

              <div className="text-lg font-semibold">
                ${(item.price / 100).toFixed(2)}
              </div>

              <Button onClick={() => navigate(`/classes/${item.id}`)}>
                View Sessions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
