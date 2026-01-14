import { useEffect, useState } from "react";
import { fetchSessions } from "@/lib/classApi";
import { useLocation } from "wouter";

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetchSessions().then(setSessions);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Desert Paddleboards</h1>

      <h2 className="text-2xl font-semibold mb-4">Upcoming Classes</h2>

      {sessions.length === 0 ? (
        <p>No sessions available.</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s: any) => (
            <div
              key={s.id}
              className="p-4 border rounded cursor-pointer"
              onClick={() => navigate(`/sessions/${s.id}`)}
            >
              {new Date(s.date).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
