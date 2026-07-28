export interface FocusRef {
  current: HTMLElement | null;
}

export function focusIfConnected(element: HTMLElement | null): boolean {
  if (
    !element ||
    !element.isConnected ||
    element.matches(":disabled") ||
    element.hidden ||
    Boolean(element.closest("[hidden]")) ||
    element.getAttribute("aria-hidden") === "true"
  ) {
    return false;
  }

  element.focus();
  return document.activeElement === element;
}

export function focusRefIfConnected(ref?: FocusRef | null): boolean {
  return focusIfConnected(ref?.current ?? null);
}
