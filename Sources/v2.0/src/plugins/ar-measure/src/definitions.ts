export interface ARMeasurePlugin {
  /**
   * Initialize AR session and start tracking. Safe to call multiple times.
   */
  start(): Promise<{ started: boolean; platform: 'ios' | 'android' }>;

  /**
   * Stop AR session and release resources.
   */
  stop(): Promise<{ stopped: boolean }>;

  /**
   * Returns tracking status and (when available) distance in meters to the first surface
   * hit by a ray cast from the screen center.
   */
  getCenterRaycastDistance(): Promise<{
    trackingState: 'not_started' | 'initializing' | 'tracking' | 'limited' | 'not_available' | 'error';
    distanceMeters: number | null;
    /** Camera intrinsics (pixels). When present, enables pixel->meters conversion: meters ~= pixels * distance / fx */
    fx?: number;
    fy?: number;
    imageWidth?: number;
    imageHeight?: number;
    reason?: string;
  }>;
}
