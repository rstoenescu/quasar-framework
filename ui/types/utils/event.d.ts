// Allow using `passive` and `notPassive` with `removeEventListener`
// See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
// See https://github.com/quasarframework/quasar/pull/5729#issuecomment-559588257
interface RemoveEventListenerFix {
  capture: undefined;
}

export interface ListenOpts {
  hasPassive: boolean;
  passive: undefined | ({ passive: true } & RemoveEventListenerFix);
  notPassive: undefined | ({ passive: false } & RemoveEventListenerFix);
  passiveCapture: true | { passive: true; capture: true };
  notPassiveCapture: true | { passive: false; capture: true };
}

export namespace event {
  const listenOpts: ListenOpts;
  function leftClick(evt: MouseEvent): boolean;
  function middleClick(evt: MouseEvent): boolean;
  function rightClick(evt: MouseEvent): boolean;
  function position(evt: TouchEvent): { top: number; left: number };
  function getEventPath(evt: Event): EventTarget[];
  function eventOnAncestors(evt: Event, el: Element | null | undefined): boolean;
  function getMouseWheelDistance(evt: WheelEvent): { x: number; y: number };
  function stop(evt: Event): void;
  function prevent(evt: Event): void;
  function stopAndPrevent(evt: Event): void;
  function preventDraggable(el: Element, status: boolean): void;
  function create(name: string, opts?: EventInit): Event;
}
