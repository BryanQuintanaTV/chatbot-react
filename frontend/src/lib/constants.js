// Carreras del Tecnológico Nacional de México Campus Chihuahua II
// Career values (keys for translations)
export const CAREER_VALUES = [
  'ingenieria-industrial',
  'ingenieria-diseno-industrial',
  'ingenieria-sistemas-computacionales',
  'ingenieria-gestion-empresarial',
  'licenciatura-administracion',
  'arquitectura',
];

// Function to get translated careers
export const getTecnmCareers = (t) => {
  return CAREER_VALUES.map((value) => ({
    value,
    label: t(`careers.${value}`),
  }));
};

export const SCHOOL_NAME = 'Tecnológico Nacional de México Campus Chihuahua II';

// Languages supported
export const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];
