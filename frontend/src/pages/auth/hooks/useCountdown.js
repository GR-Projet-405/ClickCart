import { useEffect, useState } from "react";

/**
 * Seconds remaining until `target` (Date, ISO string or epoch ms); 0 when reached or when target is empty.
 */
export default function useCountdown(target) {
  const targetMs = target ? new Date(target).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetMs) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [targetMs]);

  if (!targetMs) return 0;
  return Math.max(0, Math.ceil((targetMs - now) / 1000));
}

/** 125 -> "02:05" */
export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
