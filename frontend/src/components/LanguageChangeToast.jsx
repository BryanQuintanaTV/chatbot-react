import { useEffect, useState } from 'react';
import { LANGUAGES } from '../lib/constants';

// Eagerly load all SVG flag files from assets/images at build time (Vite).
// To support a new language, drop its <flag>.svg there and add the entry to LANGUAGES.
const flagModules = import.meta.glob('../assets/images/*.svg', { eager: true });

function getFlagSrc(flagCode) {
  if (!flagCode) return null;
  return flagModules[`../assets/images/${flagCode}.svg`]?.default ?? null;
}

const DURATION  = 350; // ms per half of the animation
const CIRCLE_D  = 30;  // circle diameter in px
const END_X     = 78;  // px: circle's final left-edge position (text lives to its left)
const HALF_X    = Math.round(END_X / 2);

/**
 * Language-change toast animation.
 *
 * Timeline:
 *  step 0 – circle (old flag) sitting on the LEFT
 *  step 1 – slides to centre + spins 180°  (ease-in, DURATION ms)
 *  step 2 – image swaps at 180° (flag upside-down → invisible swap),
 *            continues to RIGHT + finishes 360° spin  (ease-out, DURATION ms)
 *  step 3 – language name fades in to the LEFT of the circle
 *
 * Dynamic: driven by LANGUAGES[] in lib/constants.js + SVGs in assets/images/.
 */
export function LanguageFlagFlip({ fromLang, toLang }) {
  const [step, setStep] = useState(0);

  const fromCfg = LANGUAGES.find(l => l.value === fromLang);
  const toCfg   = LANGUAGES.find(l => l.value === toLang);

  const fromSrc = getFlagSrc(fromCfg?.flag);
  const toSrc   = getFlagSrc(toCfg?.flag);
  const label   = toCfg?.label ?? toLang;

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 80);                      // begin spin+slide
    const t2 = setTimeout(() => setStep(2), 80 + DURATION);           // swap image, finish
    const t3 = setTimeout(() => setStep(3), 80 + DURATION * 2 + 60); // show label
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Show old flag until the upside-down swap point, then new flag
  const flagSrc = step < 2 ? fromSrc : toSrc;
  const flagAlt = step < 2 ? (fromCfg?.label ?? fromLang) : label;

  const translateX = step === 0 ? 0 : step === 1 ? HALF_X : END_X;
  // Full 360° spin: 0 → 180 (first half) → 360 (second half, after image swap)
  const rotateZ    = step === 0 ? 0 : step === 1 ? 180 : 360;

  const easing     = step <= 1 ? 'ease-in' : 'ease-out';
  const transition = step === 0 ? 'none' : `transform ${DURATION}ms ${easing}`;

  // Total container width: text area + gap (8px) + circle
  const CONTAINER_W = END_X + CIRCLE_D;

  return (
    <div
      style={{
        position: 'relative',
        width: CONTAINER_W,
        height: CIRCLE_D,
        flexShrink: 0,
      }}
    >
      {/* Language name: fades in on the LEFT once the flag arrives on the right */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: END_X - 8, // fills the space left of the gap before the circle
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: step >= 3 ? 1 : 0,
          transition: 'opacity 0.25s ease',
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          lineHeight: 1,
          textAlign: 'right', // flush against the circle
          color: 'currentColor',
        }}
      >
        {label}
      </div>

      {/* Flag circle: rolls from left (START) to right (END_X) with a full 360° Z-spin */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          marginTop: -(CIRCLE_D / 2),
          width: CIRCLE_D,
          height: CIRCLE_D,
          borderRadius: '50%',
          overflow: 'hidden',
          transform: `translateX(${translateX}px) rotateZ(${rotateZ}deg)`,
          transition,
          willChange: 'transform',
        }}
      >
        {flagSrc ? (
          <img
            src={flagSrc}
            alt={flagAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🌐
          </span>
        )}
      </div>
    </div>
  );
}
