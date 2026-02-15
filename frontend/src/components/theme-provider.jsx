import { createContext, useContext, useEffect, useMemo, useState } from "react"
import themes, { getDefaultThemeByType } from "@/themes"

const ThemeProviderContext = createContext({
  theme: "system",
  resolvedTheme: null,
  themes: [],
  setTheme: () => null,
  toggleTheme: () => null,
})

/**
 * Multi-theme provider with auto-discovery support.
 *
 * Supports any number of themes defined in /src/themes/.
 * Each theme specifies its type ('light' | 'dark') which controls
 * Tailwind's dark: utilities via the .dark class on <html>.
 *
 * Special theme ID: "system" — automatically resolves to the default
 * light or dark theme based on the user's OS preference.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "tec-bot-theme",
  ...props
}) {
  // Track system dark mode preference
  const [systemIsDark, setSystemIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  const [themeId, setThemeIdState] = useState(() => {
    const stored = localStorage.getItem(storageKey)

    // Migrate legacy values
    if (stored === "dark") {
      const defaultDark = getDefaultThemeByType("dark")
      localStorage.setItem(storageKey, defaultDark.id)
      return defaultDark.id
    }

    return stored || defaultTheme
  })

  // Listen for system color scheme changes
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e) => setSystemIsDark(e.matches)
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  // Resolve "system" to an actual theme, or find the selected theme
  const resolvedTheme = useMemo(() => {
    if (themeId === "system") {
      return systemIsDark
        ? getDefaultThemeByType("dark")
        : getDefaultThemeByType("light")
    }
    return themes.find((t) => t.id === themeId) || getDefaultThemeByType("light")
  }, [themeId, systemIsDark])

  // Apply theme: set CSS variables + dark/light class
  useEffect(() => {
    if (!resolvedTheme) return

    const root = document.documentElement

    // Apply all CSS custom properties
    Object.entries(resolvedTheme.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Set Tailwind dark mode class
    if (resolvedTheme.type === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }

    // Set data attribute for optional CSS selectors
    root.setAttribute("data-theme", resolvedTheme.id)
  }, [resolvedTheme])

  const setTheme = (newThemeId) => {
    localStorage.setItem(storageKey, newThemeId)
    setThemeIdState(newThemeId)
  }

  // Toggle between the default light and dark themes
  const toggleTheme = () => {
    if (!resolvedTheme) return
    if (resolvedTheme.type === "dark") {
      setTheme(getDefaultThemeByType("light").id)
    } else {
      setTheme(getDefaultThemeByType("dark").id)
    }
  }

  const value = {
    theme: themeId,
    resolvedTheme,
    themes,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
