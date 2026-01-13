import { Link } from "wouter";

interface ClassCardProps {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function ClassCard({ id, name, description, imageUrl }: ClassCardProps) {
  return (
    <Link href={`/classes/${id}`}>
      <div className="cursor-pointer rounded-xl border p-4 shadow-sm hover:shadow-md transition-all bg-white">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}

        <h2 className="text-xl font-bold mb-1">{name}</h2>

        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
