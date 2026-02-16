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
    '--foreground': '177 100% 6%',         // #00837e (main headline text)

    // Cards
    '--card': '176 100% 14%',              // #004643
    '--card-foreground': '60 100% 100%',   // #fffffe (card heading text)

    '--popover': '176 100% 14%',
    '--popover-foreground': '60 100% 100%',

    // Primary (highlight buttons)
    '--primary': '38 93% 68%',             // #f9bc60
    '--primary-foreground': '177 100% 6%', // dark text on orange

    // Secondary surfaces
    '--secondary': '170 38% 75%',          // #abd1c6
    '--secondary-foreground': '177 100% 6%',

    // Muted / sub headline tone
    '--muted': '170 38% 70%',
    '--muted-foreground': '174 57% 14%',   // #0f3433 (sub headline color)

    // Accent (hover states)
    '--accent': '38 93% 68%',
    '--accent-foreground': '177 100% 6%',

    // Destructive (alerts / errors)
    '--destructive': '0 68% 63%',          // #e16162
    '--destructive-foreground': '60 100% 100%',

    // Borders & inputs
    '--border': '170 30% 60%',
    '--input': '170 30% 60%',
    '--ring': '38 93% 68%',

    '--radius': '0.5rem',

    // Charts mapped to palette
    '--chart-1': '176 100% 14%',           // deep teal
    '--chart-2': '38 93% 68%',             // highlight orange
    '--chart-3': '0 68% 63%',              // tertiary red
    '--chart-4': '174 57% 14%',            // subheadline dark teal
    '--chart-5': '170 38% 75%',            // light teal
  },
};
