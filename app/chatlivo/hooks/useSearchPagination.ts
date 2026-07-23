import { useState, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce"; // or inline debounce

interface UseSearchPaginationOptions {
  debounceMs?: number;
}

export function useSearchPagination({ debounceMs = 400 }: UseSearchPaginationOptions = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, debounceMs);

  // Infinite scroll ref
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildScrollHandler = useCallback(
    (fetchNextPage: () => void, hasNextPage: boolean, isFetchingNextPage: boolean) => () => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [],
  );

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,  // ← pass this to API
    scrollRef,
    buildScrollHandler,
  };
}