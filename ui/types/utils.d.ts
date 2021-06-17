import { LooseDictionary } from './ts-helpers'

export * from './utils/date';
export * from './utils/colors';
export * from './utils/dom';
export * from './utils/format';
export * from './utils/scroll';
export * from './utils/event';

// others utils
export function copyToClipboard(text: string): Promise<void>;
export function debounce<F extends (...args: any[]) => any>(
  fn: F,
  wait?: number,
  immediate?: boolean
): F & { cancel(): void };
export function debouncedRef<T extends LooseDictionary, K extends keyof T>(vm: T, prop: K, wait?: number): {
  value: T[K],
  destroy: () => void
};
export function exportFile(
  fileName: string,
  rawData: BlobPart,
  mimeType?: string
): true | Error;
export function extend<R>(deep: boolean, target: any, ...sources: any[]): R;
export function extend<R>(target: object, ...sources: any[]): R;
export function openURL<F extends (...args: any[]) => any>(
  url: string,
  reject?: F,
  windowFeatures?: Object,
): void;
export function throttle<F extends (...args: any[]) => any>(
  fn: F,
  limit: number
): F;
export function uid(): string;

interface MorphOptions {
  from: Element | string | (() => Element | null | undefined);
  to?: Element | string | (() => Element | null | undefined);
  onToggle?: () => void;
  waitFor?: number | 'transitionend' | Promise<any>;

  duration?: number;
  easing?: string;
  delay?: number;
  fill?: string;

  style?: string | Partial<CSSStyleDeclaration>;
  classes?: string;

  resize?: boolean;
  useCSS?: boolean;
  hideFromClone?: boolean;
  keepToClone?: boolean;

  tween?: boolean;
  tweenFromOpacity?: number;
  tweenToOpacity?: number;

  onEnd?: (direction: 'to' | 'from', aborted: boolean) => void;
}

export function morph(options: MorphOptions): (abort?: boolean) => boolean;
