import { Link } from "wouter";

/**
 * SessionCard
 * Shows a single upcoming session for a class.
 * Handles date + time formatting and links to the session detail page.
 */
export default function SessionCard({ session }: { session: any }) {
  // convert the ISO string to a readable JS Date
  const start = new Date(session.startTime);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      {/* Time */}
      <p className="font-semibold text-lg">
        {start.toLocaleDateString()} —{" "}
        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>

      {/* Capacity info */}
      <p className="text-gray-600 text-sm mb-3">
        {session.seatsAvailable} of {session.seatsTotal} seats remaining
      </p>

      {/* CTA */}
      <Link href={`/sessions/${session.id}`}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          View Session
        </button>
      </Link>
    </div>
  );
}
