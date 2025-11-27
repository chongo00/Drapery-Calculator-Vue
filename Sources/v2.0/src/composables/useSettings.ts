import { reactive, watch } from 'vue';

export type RipplefoldFullnessMap = {
  "60": number;
  "80": number;
  "100": number;
  "120": number;
};

export interface AppSettings {
  widthMargin: number;
  easeAllowance: number;
  rfSnapSeparation: number;
  ripplefoldFullness: RipplefoldFullnessMap;
  railroadStrict: boolean;
  fabricWidthOptions: number[];
}

const STORAGE_KEY = 'appSettingsV1';

const baseDefaults: AppSettings = {
  widthMargin: 10,
  easeAllowance: 2,
  rfSnapSeparation: 4.25,
  ripplefoldFullness: {
    "60": 1.8,
    "80": 2.0,
    "100": 2.2,
    "120": 2.4
  },
  railroadStrict: true,
  fabricWidthOptions: [54, 108, 110, 118]
};

const cloneSettings = (source: AppSettings): AppSettings => ({
  widthMargin: source.widthMargin,
  easeAllowance: source.easeAllowance,
  rfSnapSeparation: source.rfSnapSeparation,
  ripplefoldFullness: { ...source.ripplefoldFullness },
  railroadStrict: source.railroadStrict,
  fabricWidthOptions: [...source.fabricWidthOptions]
});

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSettings(baseDefaults);
    const parsed = JSON.parse(raw);
    const defaults = cloneSettings(baseDefaults);

    if (typeof parsed.widthMargin === 'number') defaults.widthMargin = parsed.widthMargin;
    if (typeof parsed.easeAllowance === 'number') defaults.easeAllowance = parsed.easeAllowance;
    if (typeof parsed.rfSnapSeparation === 'number') defaults.rfSnapSeparation = parsed.rfSnapSeparation;
    if (typeof parsed.railroadStrict === 'boolean') defaults.railroadStrict = parsed.railroadStrict;

    if (parsed.ripplefoldFullness) {
      for (const key of Object.keys(defaults.ripplefoldFullness) as (keyof RipplefoldFullnessMap)[]) {
        const value = parseFloat(String(parsed.ripplefoldFullness[key]));
        if (!Number.isNaN(value) && value > 0) {
          defaults.ripplefoldFullness[key] = value;
        }
      }
    }

    if (Array.isArray(parsed.fabricWidthOptions)) {
      const parsedWidths: number[] = [];
      for (const entry of parsed.fabricWidthOptions as unknown[]) {
        const value = Number(entry);
        if (Number.isFinite(value)) {
          const truncated = Math.trunc(value);
          if (truncated > 0) {
            parsedWidths.push(truncated);
          }
        }
      }
      const unique = Array.from(new Set(parsedWidths)).sort((a, b) => a - b);
      if (unique.length) {
        defaults.fabricWidthOptions = unique;
      }
    }

    return defaults;
  } catch {
    return cloneSettings(baseDefaults);
  }
}

const state = reactive<AppSettings>(loadSettings());

watch(state, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  } catch (e) {
    console.warn('Failed to persist settings', e);
  }
}, { deep: true });

export function useSettings() {
  const reset = () => {
    const defaults = cloneSettings(baseDefaults);
    Object.assign(state, defaults);
  };

  return { state, reset, defaultSettings: cloneSettings(baseDefaults) };
}
