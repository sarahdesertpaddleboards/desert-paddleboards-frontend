export function formatInTimeZone(value: string, timeZone?: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleString([], {
    timeZone: timeZone || undefined,
    ...options,
  });
}

export function formatSessionDateHeading(value: string, timeZone?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming sessions";
  return date.toLocaleDateString([], {
    timeZone: timeZone || undefined,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatSessionTimeRange(startValue: string, endValue: string, timeZone?: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime())) return "TBA";
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleTimeString([], {
      timeZone: timeZone || undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return `${start.toLocaleTimeString([], {
    timeZone: timeZone || undefined,
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString([], {
    timeZone: timeZone || undefined,
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
