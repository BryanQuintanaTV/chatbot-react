/**
 * IP Whitelist Utilities
 * Handles IP whitelisting for maintenance mode bypass
 */

/**
 * Parse whitelist IPs from environment variable
 * Expects comma-separated list of IPs, IP ranges (CIDR), or wildcards
 *
 * Examples:
 * - "192.168.1.1,10.0.0.5"
 * - "192.168.1.0/24" (CIDR notation)
 * - "192.168.1.*" (wildcard)
 *
 * @returns {string[]} Array of whitelisted IP patterns
 */
export function getWhitelistedIPs() {
  const whitelist = import.meta.env.VITE_MAINTENANCE_WHITELIST_IPS || '';

  if (!whitelist || whitelist.trim() === '') {
    return [];
  }

  return whitelist
    .split(',')
    .map(ip => ip.trim())
    .filter(ip => ip.length > 0);
}

/**
 * Check if an IP matches a pattern with wildcard support
 *
 * @param {string} ip - Client IP address
 * @param {string} pattern - IP pattern (can include wildcards like 192.168.1.*)
 * @returns {boolean} True if IP matches pattern
 */
function matchesWildcard(ip, pattern) {
  if (pattern === '*') return true;

  const ipParts = ip.split('.');
  const patternParts = pattern.split('.');

  if (ipParts.length !== 4 || patternParts.length !== 4) {
    return false;
  }

  for (let i = 0; i < 4; i++) {
    if (patternParts[i] === '*') continue;
    if (ipParts[i] !== patternParts[i]) return false;
  }

  return true;
}

/**
 * Check if an IP is within a CIDR range
 *
 * @param {string} ip - Client IP address
 * @param {string} cidr - CIDR notation (e.g., "192.168.1.0/24")
 * @returns {boolean} True if IP is within range
 */
function matchesCIDR(ip, cidr) {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  const rangeNum = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Check if a client IP is whitelisted
 *
 * @param {string} clientIP - Client IP address to check
 * @returns {boolean} True if IP is whitelisted
 */
export function isIPWhitelisted(clientIP) {
  if (!clientIP) return false;

  const whitelist = getWhitelistedIPs();

  if (whitelist.length === 0) return false;

  // Check against each pattern in whitelist
  for (const pattern of whitelist) {
    // Exact match
    if (pattern === clientIP) {
      return true;
    }

    // CIDR notation
    if (pattern.includes('/')) {
      try {
        if (matchesCIDR(clientIP, pattern)) {
          return true;
        }
      } catch (err) {
        console.warn(`Invalid CIDR pattern: ${pattern}`, err);
      }
    }

    // Wildcard pattern
    if (pattern.includes('*')) {
      if (matchesWildcard(clientIP, pattern)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if maintenance bypass is enabled via localStorage
 * Useful for development/testing purposes
 *
 * @returns {boolean} True if bypass is enabled in localStorage
 */
export function isMaintenanceBypassEnabled() {
  try {
    return localStorage.getItem('bypass-maintenance') === 'true';
  } catch {
    return false;
  }
}

/**
 * Set maintenance bypass in localStorage
 * For development/testing only
 *
 * @param {boolean} enabled - Whether to enable bypass
 */
export function setMaintenanceBypass(enabled) {
  try {
    if (enabled) {
      localStorage.setItem('bypass-maintenance', 'true');
    } else {
      localStorage.removeItem('bypass-maintenance');
    }
  } catch (err) {
    console.error('Failed to set maintenance bypass:', err);
  }
}
