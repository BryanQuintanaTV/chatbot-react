import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';

const SCROLL_THRESHOLD = 30;

/**
 * Auto-scrolls the nearest scrollable ancestor of the observed content
 * whenever content grows (new messages, streaming tokens, etc.).
 *
 * Returns: { scrollContentRef, scrollToBottom, showScrollButton }
 */
function useAutoScroll(active) {
  const scrollContentRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isDisabled = useRef(false);
  const prevScrollTop = useRef(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const getContainer = useCallback(() => {
    if (scrollContainerRef.current) return scrollContainerRef.current;
    if (!scrollContentRef.current) return null;
    const parent = scrollContentRef.current.closest('.overflow-y-auto');
    if (parent) {
      scrollContainerRef.current = parent;
      return parent;
    }
    return null;
  }, []);

  const isNearBottom = useCallback((el) => {
    return el.scrollHeight - el.clientHeight - el.scrollTop <= SCROLL_THRESHOLD;
  }, []);

  // Observe the content element for size changes and auto-scroll
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const el = getContainer();
      if (!el || isDisabled.current) return;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });

    if (scrollContentRef.current) {
      resizeObserver.observe(scrollContentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [getContainer]);

  // Track user scroll to disable/re-enable auto-scroll + show button
  useLayoutEffect(() => {
    const container = getContainer();
    if (!container) return;

    if (!active) {
      isDisabled.current = true;
      return;
    }

    isDisabled.current = false;
    prevScrollTop.current = container.scrollTop;

    function onScroll() {
      const el = container;
      const currentTop = el.scrollTop;
      const atBottom = isNearBottom(el);

      if (!isDisabled.current && currentTop < prevScrollTop.current && !atBottom) {
        isDisabled.current = true;
      } else if (isDisabled.current && atBottom) {
        isDisabled.current = false;
      }

      setShowScrollButton(!atBottom);
      prevScrollTop.current = currentTop;
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [active, getContainer, isNearBottom]);

  const scrollToBottom = useCallback(() => {
    isDisabled.current = false;
    setShowScrollButton(false);
    const el = getContainer();
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [getContainer]);

  return { scrollContentRef, scrollToBottom, showScrollButton };
}

export default useAutoScroll;
