import { useEffect, useCallback } from "react";

interface IUseInfiniteScrollParams {
  onLoadMore: () => void;
  hasNext: boolean;
  isFetchingMore: boolean;
  threshold?: number;
}

const getScrollParent = (): HTMLElement | Window => {
  const selectors = ["main", "[data-scroll]", ".overflow-y-auto", ".overflow-y-scroll"];
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement;
    if (el && el.scrollHeight > el.clientHeight) return el;
  }
  return window;
};

export const useInfiniteScroll = ({
  onLoadMore,
  hasNext,
  isFetchingMore,
  threshold = 300,
}: IUseInfiniteScrollParams) => {
  const handleScroll = useCallback((e: Event) => {
    if (isFetchingMore || !hasNext) return;

    // const target = (e.target === document ? document.documentElement : e.target) as HTMLElement;
    const target =
e.currentTarget as HTMLElement;
    const distanceFromBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);

    if (distanceFromBottom <= threshold) onLoadMore();
  }, [onLoadMore, hasNext, isFetchingMore, threshold]);

  useEffect(() => {
    const scrollParent = getScrollParent();
    scrollParent.addEventListener("scroll", handleScroll as EventListener, { passive: true });
    return () => scrollParent.removeEventListener("scroll", handleScroll as EventListener);
  }, [handleScroll]);
};