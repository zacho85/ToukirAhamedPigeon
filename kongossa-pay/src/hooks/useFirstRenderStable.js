import { useEffect, useRef, useState } from "react";

export function useFirstRenderStable() {
  const mounted = useRef(false);
  const [stable, setStable] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // Skip animation for the first strict-mode re-render
      return;
    }
    setStable(true);
  }, []);

  return stable;
}