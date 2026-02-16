import { sileo } from 'sileo';

/**
 * Responsive notification wrapper around sileo.
 * - Mobile (< 768px): top-center (great for Dynamic Island on iPhone 14 Pro+)
 * - Desktop (>= 768px): top-right
 */
const getPosition = () =>
  typeof window !== 'undefined' && window.innerWidth < 768
    ? 'top-center'
    : 'top-right';

export const notify = {
  success: (opts) => sileo.success({ ...opts, position: getPosition() }),
  error: (opts) => sileo.error({ ...opts, position: getPosition() }),
  warning: (opts) => sileo.warning({ ...opts, position: getPosition() }),
  info: (opts) => sileo.info({ ...opts, position: getPosition() }),
  show: (opts) => sileo.show({ ...opts, position: getPosition() }),
  action: (opts) => sileo.action({ ...opts, position: getPosition() }),
  promise: (promise, opts) => sileo.promise(promise, { ...opts, position: getPosition() }),
  dismiss: (id) => sileo.dismiss(id),
  clear: (position) => sileo.clear(position),
};
