import { WebPlugin } from '@capacitor/core';

import type { ARMeasurePlugin } from './definitions';

export class ARMeasureWeb extends WebPlugin implements ARMeasurePlugin {
  async start(): Promise<{ started: boolean; platform: 'ios' | 'android' }> {
    throw new Error('ARMeasure is not available on web.');
  }

  async stop(): Promise<{ stopped: boolean }> {
    return { stopped: true };
  }

  async getCenterRaycastDistance(): Promise<{
    trackingState: 'not_started' | 'initializing' | 'tracking' | 'limited' | 'not_available' | 'error';
    distanceMeters: number | null;
    reason?: string;
  }> {
    return { trackingState: 'not_available', distanceMeters: null, reason: 'web' };
  }
}
