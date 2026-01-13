// src/components/admin/classes/ClassCalendar.tsx
// Simple grouped-by-date calendar view for class sessions

export default function ClassCalendar({
    sessions,
    products,
    onSelectSession,
  }: {
    sessions: any[];
    products: any[];
    onSelectSession: (session: any) => void;
  }) {
    // Group sessions by YYYY-MM-DD
    const groups: Record<string, any[]> = {};
  
    sessions.forEach((s) => {
      const day = new Date(s.startTime).toISOString().split("T")[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(s);
    });
  
    return (
      <div className="border rounded p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
  
        {Object.keys(groups).length === 0 && (
          <div className="text-gray-500">No sessions scheduled.</div>
        )}
  
        {/* Each date block */}
        <div className="space-y-6">
          {Object.entries(groups).map(([day, list]) => (
            <div key={day}>
              <h3 className="text-lg font-semibold mb-2">{day}</h3>
  
              <div className="space-y-2">
                {list.map((s) => {
                  const product = products.find(
                    (p) => p.id === s.classProductId
                  );
  
                  return (
                    <div
                      key={s.id}
                      onClick={() => onSelectSession(s)}
                      className="cursor-pointer border p-3 bg-white rounded hover:bg-gray-100"
                    >
                      <div className="font-medium">
                        {product?.name || "Unknown Class"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(s.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {new Date(s.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.seatsAvailable} available
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  