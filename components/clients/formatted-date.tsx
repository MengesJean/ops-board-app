"use client";

import { useSyncExternalStore } from "react";

type FormattedDateProps = {
  iso: string;
};

// Empty subscribe — we only care about the initial server vs. client snapshot.
function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

// Render a timezone-sensitive date without hydration mismatches.
// On the server (and the very first client render) we emit the YYYY-MM-DD
// slice of the ISO string — identical everywhere. Once hydrated, the client
// snapshot flips to `true` and the formatter takes over. `useSyncExternalStore`
// avoids the setState-in-effect anti-pattern that the React lint rules flag.
export function FormattedDate({ iso }: FormattedDateProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  let label = iso.slice(0, 10);
  if (mounted) {
    try {
      label = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      // fall back to the ISO slice
    }
  }

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
