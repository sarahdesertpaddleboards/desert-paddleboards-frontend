// src/components/classes/ClassCard.tsx
// Displays a single class product overview

import { Link } from "react-router-dom";

export default function ClassCard({ item }: { item: any }) {
  return (
    <Link to={`/classes/${item.id}`} className="block border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
      )}

      <h3 className="text-xl font-semibold">{item.name}</h3>

      <p className="text-gray-600 text-sm mt-2">
        {item.description?.slice(0, 120)}...
      </p>

      <div className="mt-3 font-bold">
        ${(item.price / 100).toFixed(2)}
      </div>
    </Link>
  );
}
