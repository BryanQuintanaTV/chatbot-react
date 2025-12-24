import { useCallback, useEffect, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export const AnimatedThemeToggler = ({
  className,
  variant = "ghost",
  size = "default",
  duration = 400,
  showText = false,
  text = "Toggle theme",
  ...props
}) => {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef(null)

  const isDark = theme === "dark"

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    const newTheme = isDark ? "light" : "dark"

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme)
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

    document.documentElement.animate({
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ],
    }, {
      duration,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    })
  }, [isDark, duration, setTheme])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}>
      {isDark ? <Sun className={showText ? "h-4 w-4 mr-2" : ""} /> : <Moon className={showText ? "h-4 w-4 mr-2" : ""} />}
      {showText ? (
        <span>{text}</span>
      ) : (
        <span className="sr-only">Toggle theme</span>
      )}
    </button>
  );
}
