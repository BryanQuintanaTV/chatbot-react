/**
 * Theme Registry — Auto-discovers all theme files in this directory.
 *
 * HOW TO ADD A NEW THEME:
 * 1. Create a new .js file in this folder (e.g. dark-purple.js)
 * 2. Export a default object with: id, name, nameKey, type, variables
 *    (see light.js or dark-blue.js for the full structure)
 * 3. The theme will be automatically detected and available in the selector.
 *
 * Theme file structure:
 * export default {
 *   id: 'my-theme',             // unique identifier
 *   name: 'My Theme',           // display name (fallback)
 *   nameKey: 'themes.myTheme',  // i18n translation key
 *   type: 'light' | 'dark',     // controls Tailwind dark: utilities
 *   variables: {                 // CSS custom properties (HSL values)
 *     '--background': '0 0% 100%',
 *     '--foreground': '0 0% 3.9%',
 *     // ... all required variables
 *   },
 * };
 */

// Auto-discover all theme files using Vite's import.meta.glob
const themeModules = import.meta.glob('./*.js', { eager: true });

const themes = Object.entries(themeModules)
  .filter(([path]) => !path.endsWith('index.js'))
  .map(([, module]) => module.default)
  .filter((theme) => theme && theme.id && theme.type && theme.variables);

// Sort: light themes first, then dark themes
themes.sort((a, b) => {
  if (a.type === b.type) return 0;
  return a.type === 'light' ? -1 : 1;
});

export default themes;

/**
 * Get the default theme for a given type.
 */
export function getDefaultThemeByType(type) {
  return themes.find((t) => t.type === type) || themes[0];
}
