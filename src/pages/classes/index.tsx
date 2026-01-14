import { useEffect, useState } from "react";
import { fetchClassProducts } from "@/lib/classApi";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function ClassesPage() {
  const [items, setItems] = useState([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetchClassProducts().then(setItems);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Classes</h1>

      <div className="grid gap-4">
        {items.map((c: any) => (
          <Card key={c.id} onClick={() => navigate(`/classes/${c.id}`)}>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-bold">{c.name}</h2>
              <p>{c.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
