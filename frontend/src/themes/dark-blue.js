/**
 * Dark Blue Theme
 *
 * Base color: #111727 (HSL: 224 39% 11%)
 * A deep navy-blue dark theme with blue accent colors.
 *
 * To create a new theme, copy this file and modify the values.
 * The theme will be auto-discovered by the theme system.
 */
export default {
  id: 'dark-blue',
  name: 'Dark Blue',
  nameKey: 'themes.darkBlue',
  type: 'dark',
  variables: {
    '--background': '224 39% 11%',          // #111727 - main background
    '--foreground': '213 31% 91%',          // #E2E8F0 - primary text
    '--card': '224 33% 15%',                // #1A2236 - card surfaces
    '--card-foreground': '213 31% 91%',     // #E2E8F0
    '--popover': '224 33% 15%',             // #1A2236 - popover surfaces
    '--popover-foreground': '213 31% 91%',  // #E2E8F0
    '--primary': '217 91% 60%',             // #3B82F6 - blue accent
    '--primary-foreground': '0 0% 100%',    // #FFFFFF
    '--secondary': '222 47% 17%',           // #172033 - secondary surfaces
    '--secondary-foreground': '213 31% 91%',// #E2E8F0
    '--muted': '222 47% 17%',              // #172033 - muted surfaces
    '--muted-foreground': '215 20% 65%',    // #94A3B8 - muted text
    '--accent': '222 35% 20%',              // #1F2D42 - hover/accent surfaces
    '--accent-foreground': '213 31% 91%',   // #E2E8F0
    '--destructive': '0 84% 60%',           // #EF4444 - error red
    '--destructive-foreground': '0 0% 98%', // #FAFAFA
    '--border': '222 28% 22%',              // #283044 - subtle borders
    '--input': '222 28% 22%',               // #283044 - input borders
    '--ring': '217 91% 60%',               // #3B82F6 - focus ring (matches primary)
    '--radius': '0.5rem',
    '--chart-1': '217 91% 60%',             // Blue
    '--chart-2': '160 60% 45%',             // Teal
    '--chart-3': '30 80% 55%',              // Orange
    '--chart-4': '280 65% 60%',             // Purple
    '--chart-5': '340 75% 55%',             // Pink
  },
};
