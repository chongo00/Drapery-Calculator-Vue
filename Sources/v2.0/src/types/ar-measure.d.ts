declare module '@blindsbook/ar-measure' {
  export const ARMeasure: {
    start(): Promise<void>;
    stop(): Promise<void>;
    getCenterRaycastDistance(): Promise<{
      distanceMeters: number;
      fx?: number;
      fy?: number;
    } | null>;
  };
}

