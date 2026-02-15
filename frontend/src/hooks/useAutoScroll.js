import { useEffect, useRef, useCallback, useState } from 'react';

const SCROLL_THRESHOLD = 50;

/**
 * Auto-scrolls the nearest scrollable ancestor of the observed content
 * whenever content grows (new messages, streaming tokens, etc.).
 *
 * Returns: { scrollContentRef, scrollToBottom, showScrollButton }
 */
function useAutoScroll() {
  const scrollContentRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUp = useRef(false);
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

  // Auto-scroll when content grows (new messages, streaming tokens)
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const el = getContainer();
      if (!el || userScrolledUp.current) return;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });

    if (scrollContentRef.current) {
      resizeObserver.observe(scrollContentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [getContainer]);

  // Track user scroll: if they scroll up, stop auto-scrolling;
  // if they scroll back to bottom, re-enable it.
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    let prevScrollTop = container.scrollTop;

    function onScroll() {
      const currentTop = container.scrollTop;
      const atBottom = isNearBottom(container);

      if (currentTop < prevScrollTop && !atBottom) {
        // User scrolled up
        userScrolledUp.current = true;
      } else if (atBottom) {
        // Back at bottom
        userScrolledUp.current = false;
      }

      setShowScrollButton(!atBottom);
      prevScrollTop = currentTop;
    }

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [getContainer, isNearBottom]);

  // Imperative scroll — call after the user sends a message
  const scrollToBottom = useCallback(() => {
    userScrolledUp.current = false;
    setShowScrollButton(false);
    const el = getContainer();
    if (el) {
      // Double-rAF to ensure React has committed the new DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        });
      });
    }
  }, [getContainer]);

  return { scrollContentRef, scrollToBottom, showScrollButton };
}

export default useAutoScroll;
