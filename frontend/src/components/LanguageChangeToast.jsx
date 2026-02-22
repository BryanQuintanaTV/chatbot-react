import { useEffect, useState } from 'react';
import { LANGUAGES } from '../lib/constants';

// Eagerly load all SVG flag files from assets/images at build time (Vite).
// To support a new language, drop its <code>.svg into that folder and add
// the corresponding entry to LANGUAGES in lib/constants.js.
const flagModules = import.meta.glob('../assets/images/*.svg', { eager: true });

function getFlagSrc(flagCode) {
  if (!flagCode) return null;
  return flagModules[`../assets/images/${flagCode}.svg`]?.default ?? null;
}

const DURATION = 320; // ms per half of the animation
const HALF_X   = 60;  // px from start to centre
const END_X    = 120; // px from start to final resting place

/**
 * Language-change toast animation.
 *
 * Timeline:
 *  step 0 – flag sitting on the LEFT  (old language)
 *  step 1 – slides to centre + rotates to 90° edge-on  (ease-in, DURATION ms)
 *  step 2 – image swaps to new flag, slides to RIGHT + rotates back to 0°  (ease-out, DURATION ms)
 *  step 3 – language name fades in beside the flag
 *
 * Dynamic: driven entirely by LANGUAGES[] in lib/constants.js and the SVG
 * files in assets/images/.  Adding a language requires no changes here.
 */
export function LanguageFlagFlip({ fromLang, toLang }) {
  const [step, setStep] = useState(0);

  const fromCfg = LANGUAGES.find(l => l.value === fromLang);
  const toCfg   = LANGUAGES.find(l => l.value === toLang);

  const fromSrc = getFlagSrc(fromCfg?.flag);
  const toSrc   = getFlagSrc(toCfg?.flag);
  const label   = toCfg?.label ?? toLang;

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 80);                    // begin slide + spin
    const t2 = setTimeout(() => setStep(2), 80 + DURATION);         // swap image, continue
    const t3 = setTimeout(() => setStep(3), 80 + DURATION * 2 + 60); // show label
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Show old flag until the swap point (step 2), then new flag
  const flagSrc = step < 2 ? fromSrc : toSrc;
  const flagAlt = step < 2 ? (fromCfg?.label ?? fromLang) : label;

  // Horizontal position
  const translateX = step === 0 ? 0 : step === 1 ? HALF_X : END_X;

  // Y rotation: 0° → 90° (edge-on / invisible) → 0° (facing viewer again)
  const rotateY = step === 1 ? 90 : 0;

  // ease-in for the first half, ease-out for the second
  const easing     = step <= 1 ? 'ease-in' : 'ease-out';
  const transition = step === 0 ? 'none' : `transform ${DURATION}ms ${easing}`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 24,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Flag: slides horizontally while flipping on the Y axis */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          marginTop: -10, // vertical-centre: flag height is 20px
          transform: `translateX(${translateX}px)`,
          transition,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            transform: `perspective(200px) rotateY(${rotateY}deg)`,
            transition,
            willChange: 'transform',
          }}
        >
          {flagSrc ? (
            <img
              src={flagSrc}
              alt={flagAlt}
              style={{
                width: 28,
                height: 20,
                borderRadius: 2,
                display: 'block',
                objectFit: 'cover',
              }}
            />
          ) : (
            // Fallback if no SVG is found for this language
            <span style={{ fontSize: 16, lineHeight: '20px', display: 'block' }}>🌐</span>
          )}
        </div>
      </div>

      {/* Language name: fades in once the flag arrives on the right */}
      <div
        style={{
          position: 'absolute',
          left: END_X + 28 + 8, // right edge of flag + 8px gap
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: step >= 3 ? 1 : 0,
          transition: 'opacity 0.25s ease',
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}
