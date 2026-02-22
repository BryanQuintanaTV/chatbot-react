/**
 * Coastal Teal Light Theme
 *
 * Background: #abd1c6
 * Headline: #001e1d
 * Sub headline: #0f3433
 * Card background: #004643
 * Highlight: #f9bc60
 * Tertiary: #e16162
 */

export default {
  id: 'coastal-teal',
  name: 'Coastal Teal',
  nameKey: 'themes.tealHeritage',
  type: 'light',
  variables: {
    // Base layout
    '--background': '170 38% 75%',         // #abd1c6
    '--foreground': '177 100% 6%',         // dark teal (main text)

    // Cards — light mint instead of dark teal for readability
    '--card': '170 30% 88%',               // light mint teal
    '--card-foreground': '177 100% 6%',    // dark text on light cards

    '--popover': '170 30% 88%',            // same as card
    '--popover-foreground': '177 100% 6%',

    // Primary (highlight buttons) — amber accent
    '--primary': '38 93% 68%',             // #f9bc60
    '--primary-foreground': '177 100% 6%', // dark text on amber

    // Secondary — distinct medium teal (was same as background)
    '--secondary': '170 28% 65%',          // medium teal
    '--secondary-foreground': '177 100% 6%',

    // Muted — slightly distinct from background
    '--muted': '170 28% 65%',
    '--muted-foreground': '174 57% 14%',   // #0f3433 (sub headline color)

    // Accent (hover states) — teal hover instead of amber
    '--accent': '170 28% 65%',
    '--accent-foreground': '177 100% 6%',

    // Destructive (alerts / errors)
    '--destructive': '0 68% 63%',          // #e16162
    '--destructive-foreground': '0 0% 98%',

    // Borders & inputs — darker for visibility against light teal background
    '--border': '170 32% 52%',
    '--input': '170 32% 52%',
    '--ring': '38 93% 68%',                // amber ring

    '--radius': '0.5rem',

    // Charts
    '--chart-1': '176 100% 14%',           // deep teal
    '--chart-2': '38 93% 68%',             // highlight amber
    '--chart-3': '0 68% 63%',              // tertiary red
    '--chart-4': '174 57% 14%',            // subheadline dark teal
    '--chart-5': '170 38% 75%',            // light teal
  },
};
