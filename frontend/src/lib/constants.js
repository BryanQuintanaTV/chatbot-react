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

/**
 * TecNM academic vacation periods (month is 1-based).
 * Semester/career editing is only allowed during these windows so students
 * can confirm whether they advanced a semester or changed majors.
 *
 * Winter break:  Dec 15 – Jan 15
 * Summer break:  Jun 20 – Aug 15
 */
const VACATION_PERIODS = [
  { startMonth: 12, startDay: 15, endMonth: 1, endDay: 15 },  // winter
  { startMonth: 6,  startDay: 20, endMonth: 8, endDay: 15 },  // summer
];

export function isVacationPeriod(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const day   = date.getDate();

  for (const p of VACATION_PERIODS) {
    if (p.startMonth <= p.endMonth) {
      // Same-year range (e.g. Jun 20 – Aug 15)
      if (
        (month > p.startMonth || (month === p.startMonth && day >= p.startDay)) &&
        (month < p.endMonth  || (month === p.endMonth  && day <= p.endDay))
      ) return true;
    } else {
      // Cross-year range (e.g. Dec 15 – Jan 15)
      if (
        (month > p.startMonth || (month === p.startMonth && day >= p.startDay)) ||
        (month < p.endMonth   || (month === p.endMonth   && day <= p.endDay))
      ) return true;
    }
  }
  return false;
}

// Languages supported
export const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];
