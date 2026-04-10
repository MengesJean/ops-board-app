"use client";

import { useEffect, useState } from "react";

type FormattedDateProps = {
  iso: string;
};

// Render a timezone-sensitive date without hydration mismatches.
// The first render (server + initial client) outputs the YYYY-MM-DD slice
// of the ISO string — identical everywhere. After mount, the client swaps
// it for a locale/timezone-aware version.
export function FormattedDate({ iso }: FormattedDateProps) {
  const fallback = iso.slice(0, 10);
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    try {
      const formatted = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
      setLabel(formatted);
    } catch {
      setLabel(fallback);
    }
  }, [iso, fallback]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
