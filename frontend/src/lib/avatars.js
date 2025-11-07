// Predefined avatar options for users
export const PREDEFINED_AVATARS = [
  {
    id: 'avatar-1',
    type: 'gradient',
    gradient: 'from-blue-500 to-cyan-500',
    initial: true,
  },
  {
    id: 'avatar-2',
    type: 'gradient',
    gradient: 'from-purple-500 to-pink-500',
    initial: true,
  },
  {
    id: 'avatar-3',
    type: 'gradient',
    gradient: 'from-green-500 to-emerald-500',
    initial: true,
  },
  {
    id: 'avatar-4',
    type: 'gradient',
    gradient: 'from-orange-500 to-red-500',
    initial: true,
  },
  {
    id: 'avatar-5',
    type: 'gradient',
    gradient: 'from-indigo-500 to-blue-500',
    initial: true,
  },
  {
    id: 'avatar-6',
    type: 'gradient',
    gradient: 'from-pink-500 to-rose-500',
    initial: true,
  },
  {
    id: 'avatar-7',
    type: 'gradient',
    gradient: 'from-yellow-500 to-orange-500',
    initial: true,
  },
  {
    id: 'avatar-8',
    type: 'gradient',
    gradient: 'from-teal-500 to-cyan-500',
    initial: true,
  },
];

/**
 * Get avatar URL or gradient based on user's avatar setting
 * @param {Object} user - User object with avatar property
 * @returns {Object} - { type: 'url' | 'gradient' | 'initials', value: string }
 */
export function getAvatarDisplay(user) {
  if (!user) {
    return { type: 'initials', value: 'U' };
  }

  // If user has a custom uploaded avatar (URL from MinIO)
  if (user.avatar && user.avatar.startsWith('http')) {
    return { type: 'url', value: user.avatar };
  }

  // If user selected a predefined avatar
  if (user.avatar && user.avatar.startsWith('avatar-')) {
    const predefined = PREDEFINED_AVATARS.find(a => a.id === user.avatar);
    if (predefined) {
      return { type: 'gradient', value: predefined.gradient };
    }
  }

  // Default to initials
  return { type: 'initials', value: getUserInitials(user.name) };
}

/**
 * Get user initials from name
 * @param {string} name - User's full name
 * @returns {string} - User's initials
 */
export function getUserInitials(name) {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
}
