# @blindsbook/ar-measure

ARKit/ARCore raycast distance for measurement

## Install

To use npm

```bash
npm install @blindsbook/ar-measure
````

To use yarn

```bash
yarn add @blindsbook/ar-measure
```

Sync native files

```bash
npx cap sync
```

## API

<docgen-index>

* [`start()`](#start)
* [`stop()`](#stop)
* [`getCenterRaycastDistance()`](#getcenterraycastdistance)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### start()

```typescript
start() => Promise<{ started: boolean; platform: 'ios' | 'android'; }>
```

Initialize AR session and start tracking. Safe to call multiple times.

**Returns:** <code>Promise&lt;{ started: boolean; platform: 'ios' | 'android'; }&gt;</code>

--------------------


### stop()

```typescript
stop() => Promise<{ stopped: boolean; }>
```

Stop AR session and release resources.

**Returns:** <code>Promise&lt;{ stopped: boolean; }&gt;</code>

--------------------


### getCenterRaycastDistance()

```typescript
getCenterRaycastDistance() => Promise<{ trackingState: 'not_started' | 'initializing' | 'tracking' | 'limited' | 'not_available' | 'error'; distanceMeters: number | null; fx?: number; fy?: number; imageWidth?: number; imageHeight?: number; reason?: string; }>
```

Returns tracking status and (when available) distance in meters to the first surface
hit by a ray cast from the screen center.

**Returns:** <code>Promise&lt;{ trackingState: 'error' | 'not_started' | 'initializing' | 'tracking' | 'limited' | 'not_available'; distanceMeters: number | null; fx?: number; fy?: number; imageWidth?: number; imageHeight?: number; reason?: string; }&gt;</code>

--------------------

</docgen-api>
