import { useEffect, useState } from "react";
import { fetchClassProducts } from "../../lib/classApi";
import ClassCard from "../../components/classes/ClassCard";

export default function ClassesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchClassProducts().then(setItems);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Classes & Events</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <ClassCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
