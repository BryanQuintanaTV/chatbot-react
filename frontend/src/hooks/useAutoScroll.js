import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';

const SCROLL_THRESHOLD = 30;

/**
 * Auto-scrolls the nearest scrollable ancestor of the observed content
 * whenever content grows (new messages, streaming tokens, etc.).
 *
 * - Disables auto-scroll when the user scrolls up.
 * - Re-enables when the user scrolls back near the bottom.
 * - `active` controls whether scroll-tracking is on (pass `isLoading`).
 *
 * Returns: { scrollContentRef, scrollToBottom }
 *   - scrollContentRef: attach to the messages wrapper
 *   - scrollToBottom: call imperatively after sending a message
 */
function useAutoScroll(active) {
  const scrollContentRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isDisabled = useRef(false);
  const prevScrollTop = useRef(0);

  // Resolve the scrollable parent once on mount
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
    const container = getContainer();

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

  // Track user scroll to disable/re-enable auto-scroll
  useLayoutEffect(() => {
    const container = getContainer();
    if (!container) return;

    if (!active) {
      isDisabled.current = true;
      return;
    }

    // When active flips to true (user just sent a message), re-enable
    isDisabled.current = false;
    prevScrollTop.current = container.scrollTop;

    function onScroll() {
      const el = container;
      const currentTop = el.scrollTop;

      if (
        !isDisabled.current &&
        currentTop < prevScrollTop.current &&
        !isNearBottom(el)
      ) {
        // User scrolled up → disable
        isDisabled.current = true;
      } else if (isDisabled.current && isNearBottom(el)) {
        // User scrolled back to bottom → re-enable
        isDisabled.current = false;
      }

      prevScrollTop.current = currentTop;
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [active, getContainer, isNearBottom]);

  // Imperative scroll for when user sends a new message
  const scrollToBottom = useCallback(() => {
    isDisabled.current = false;
    const el = getContainer();
    if (el) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [getContainer]);

  return { scrollContentRef, scrollToBottom };
}

export default useAutoScroll;
