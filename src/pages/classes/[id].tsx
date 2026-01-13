import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { fetchClassProduct, fetchSessionsForClass } from "../../lib/classApi";
import SessionCard from "../../components/classes/SessionCard";

export default function ClassDetailPage() {
  const { id } = useParams();
  const classId = Number(id);

  const [item, setItem] = useState<any>(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchClassProduct(classId).then(setItem);
    fetchSessionsForClass(classId).then(setSessions);
  }, [classId]);

  if (!item) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{item.name}</h1>

      <p className="text-gray-600 mb-8">{item.description}</p>

      <h2 className="text-xl font-semibold mb-3">Available Sessions</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {sessions.map((s: any) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}
