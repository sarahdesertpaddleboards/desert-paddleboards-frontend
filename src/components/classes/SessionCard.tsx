// src/components/classes/SessionCard.tsx
// Shows a session (date/time/availability)

import { Link } from "react-router-dom";

export default function SessionCard({ session }: { session: any }) {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="block border rounded-lg p-4 shadow-sm hover:shadow-md transition"
    >
      <h4 className="text-lg font-semibold">
        {start.toLocaleDateString()} at {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </h4>

      <p className="text-gray-600 text-sm mt-2">
        Ends: {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>

      <div className="mt-3">
        Seats left: <strong>{session.seatsAvailable}</strong>
      </div>
    </Link>
  );
}
