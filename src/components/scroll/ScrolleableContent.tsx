import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export function ScrollableContent({
  children,
  isCollapsed,
}: {
  children: React.ReactNode;
  isCollapsed: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const overflowExists = container.scrollHeight > container.clientHeight;
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 1;
      setShowScrollButton(overflowExists && !isAtBottom);
    };

    container.addEventListener("scroll", checkScroll);

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    checkScroll();

    return () => {
      container.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [isCollapsed]);

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="relative h-full w-full overflow-y-auto scrollbar-hide"
      ref={containerRef}
    >
      <div className="flex flex-col p-2 gap-4">{children}</div>

      {showScrollButton && !isCollapsed && (
        <div className="sticky bottom-[-0.5rem] left-0 w-full pointer-events-none">
          <div className="h-12 bg-gradient-to-t from-white via-white/50 to-transparent w-full flex justify-center items-end">
            <button
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
              title="Scroll to bottom"
              className="mb-2 rounded-full bg-default-200 p-1.5 pointer-events-auto hover:bg-default-300"
            >
              <ChevronDownIcon className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
