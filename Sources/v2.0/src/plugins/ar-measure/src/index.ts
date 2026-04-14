import { registerPlugin } from '@capacitor/core';

import type { ARMeasurePlugin } from './definitions';

const ARMeasure = registerPlugin<ARMeasurePlugin>('ARMeasure', {
  web: () => import('./web').then((m) => new m.ARMeasureWeb()),
});

export * from './definitions';
export { ARMeasure };
