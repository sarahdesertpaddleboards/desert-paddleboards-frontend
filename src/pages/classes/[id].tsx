import { useEffect, useState } from "react";
import { fetchClassProduct, fetchSessions } from "@/lib/classApi";
import { useRoute, useLocation } from "wouter";

export default function ClassDetail() {
  const [match, params] = useRoute("/classes/:id");
  const classId = Number(params?.id);
  const [, navigate] = useLocation();

  const [item, setItem] = useState<any>(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchClassProduct(classId).then(setItem);
    fetchSessions().then(list =>
      setSessions(list.filter(s => s.classId === classId))
    );
  }, [classId]);

  if (!item) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{item.name}</h1>
      <p>{item.description}</p>

      <h2 className="text-xl font-semibold mt-6">Upcoming Sessions</h2>

      {sessions.map(s => (
        <div
          key={s.id}
          className="p-4 border rounded cursor-pointer"
          onClick={() => navigate(`/sessions/${s.id}`)}
        >
          {new Date(s.date).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
