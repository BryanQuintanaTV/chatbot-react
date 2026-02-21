import { useEffect, useState } from 'react';

const FLAG_DATA = {
  en: { flag: '🇺🇸', label: 'English' },
  es: { flag: '🇲🇽', label: 'Español' },
};

export function LanguageChangeToast({ fromLang, toLang }) {
  const [flipped, setFlipped] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  const from = FLAG_DATA[fromLang] || { flag: '🌐', label: fromLang };
  const to = FLAG_DATA[toLang] || { flag: '🌐', label: toLang };

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 250);
    const t2 = setTimeout(() => setTextVisible(true), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      minWidth: 180,
      fontFamily: 'inherit',
    }}>

      {/* 3D flip card */}
      <div style={{ perspective: '500px', width: 42, height: 32, flexShrink: 0 }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front — from flag */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {from.flag}
          </div>
          {/* Back — to flag */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {to.flag}
          </div>
        </div>
      </div>

      {/* Text */}
      <div style={{
        opacity: textVisible ? 1 : 0,
        transform: textVisible ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <div style={{
          fontWeight: 600,
          fontSize: 14,
          color: 'hsl(var(--foreground))',
          lineHeight: 1.2,
        }}>
          {to.label}
        </div>
        <div style={{
          fontSize: 11,
          color: 'hsl(var(--muted-foreground))',
          marginTop: 1,
        }}>
          {to.flag} Idioma cambiado
        </div>
      </div>
    </div>
  );
}
