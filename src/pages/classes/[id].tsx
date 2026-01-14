// src/pages/classes/[id].tsx

import { useEffect, useState } from "react";
import { fetchClassProduct, fetchSessionsForClass } from "@/lib/classApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";

export default function ClassesDetailPage() {
  const [match, params] = useRoute("/classes/:id");
  const classId = Number(params?.id);

  const [classItem, setClassItem] = useState<any>(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [, navigate] = useLocation();

  // Load class + sessions
  useEffect(() => {
    if (!classId) return;

    Promise.all([
      fetchClassProduct(classId),
      fetchSessionsForClass(classId)
    ])
      .then(([cls, sess]) => {
        setClassItem(cls);
        setSessions(sess);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="p-8">Loading class…</div>;
  if (!classItem) return <div className="p-8">Class not found</div>;

  return (
    <div className="p-8 mx-auto max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold">{classItem.name}</h1>
      <p>{classItem.description}</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Upcoming Sessions</h2>

      {sessions.length === 0 && <p>No upcoming sessions.</p>}

      <div className="space-y-4">
        {sessions.map((s: any) => (
          <Card key={s.id}>
            <CardContent className="p-6 space-y-3">
              <div className="font-semibold">
                {new Date(s.startTime).toLocaleString()}
              </div>

              <Button onClick={() => navigate(`/sessions/${s.id}`)}>
                Book This Session
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
