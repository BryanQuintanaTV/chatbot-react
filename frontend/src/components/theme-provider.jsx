import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  ...props
}) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Determine the actual theme to apply
    let themeToApply = theme

    if (theme === "system") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
    }

    // Only update DOM if the theme is different from current state
    // This prevents FOUC by avoiding unnecessary class removals
    const currentTheme = root.classList.contains("dark") ? "dark" : "light"

    if (currentTheme !== themeToApply) {
      root.classList.remove("light", "dark")
      root.classList.add(themeToApply)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme)
      setThemeState(newTheme)
    },
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
