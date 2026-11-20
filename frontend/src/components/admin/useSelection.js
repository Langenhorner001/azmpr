import { useCallback, useEffect, useState } from "react";

export default function useSelection(items) {
  const [selected, setSelected] = useState(() => new Set());

  // Drop ids that no longer exist (e.g. moved to trash)
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(items.map((i) => i.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((rows) => {
    setSelected((prev) => {
      const all = rows.length > 0 && rows.every((r) => prev.has(r.id));
      return all ? new Set() : new Set(rows.map((r) => r.id));
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, toggleAll, clear };
}
