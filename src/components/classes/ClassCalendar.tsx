// src/components/classes/ClassCalendar.tsx
// Month/day picker for browsing available sessions

export default function ClassCalendar({ selectedDate, onChange }: any) {
    return (
      <div className="flex items-center gap-4 my-6">
        <label className="font-medium">Select date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
    );
  }
  