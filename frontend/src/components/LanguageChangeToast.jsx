import { useEffect, useState } from 'react';

const FLAGS = {
  en: '🇺🇸',
  es: '🇲🇽',
};

/** Flag that flips 3D from `fromLang` to `toLang` — used as sileo toast icon. */
export function LanguageFlagFlip({ fromLang, toLang }) {
  const [flipped, setFlipped] = useState(false);

  const fromFlag = FLAGS[fromLang] || '🌐';
  const toFlag = FLAGS[toLang] || '🌐';

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ perspective: '200px', width: 22, height: 22, flexShrink: 0 }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1,
        }}>
          {fromFlag}
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1,
        }}>
          {toFlag}
        </div>
      </div>
    </div>
  );
}
