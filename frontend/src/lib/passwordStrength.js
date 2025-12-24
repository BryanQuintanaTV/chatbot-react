/**
 * Password strength calculator
 * Returns an object with strength level (0-3) and checks
 */

export function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      level: 'weak',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
      },
      percentage: 0,
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const percentage = (score / 5) * 100;

  let level = 'weak';
  if (score >= 4) level = 'strong';
  else if (score >= 3) level = 'medium';

  return {
    score,
    level,
    checks,
    percentage,
  };
}

export function isPasswordStrong(password) {
  const strength = calculatePasswordStrength(password);
  return strength.score >= 4;
}
