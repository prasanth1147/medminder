// Remove the platform-injected "Made in Bolt" badge/watermark. The previous
// version used a generic "bottom-right floating widget" heuristic that also
// matched the app's own fixed-bottom-right Add Medicine button and modal
// backdrop, breaking Add Medicine. This version only targets elements that
// explicitly look like the Bolt badge — known id/class substrings, links to
// bolt.new, or iframes with badge/bolt hints — so it never touches app UI.
// Safe to no-op when the platform stops injecting anything.

const BADGE_TEXT_RE = /made\s*in\s*bolt/i;
const HOST_RE = /bolt\.new/i;

function hideEl(el: HTMLElement): void {
  el.style.setProperty('display', 'none', 'important');
  el.style.setProperty('visibility', 'hidden', 'important');
  el.style.setProperty('opacity', '0', 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
}

function isExplicitlyBadge(el: Element): boolean {
  const hints = [
    el.id,
    el.className && typeof el.className === 'string' ? el.className : '',
    el.getAttribute('data-ai-badge') || '',
    el.getAttribute('aria-label') || '',
  ].join(' ').toLowerCase();
  return (
    /ai-badge|ai-watermark|bolt-badge|bolt-watermark|made-in-bolt/.test(hints)
  );
}

function isBoltLink(el: Element): boolean {
  if (!(el instanceof HTMLAnchorElement)) return false;
  return HOST_RE.test(el.href || '');
}

function isBadgeText(el: Element): boolean {
  if (el.childElementCount !== 0) return false;
  const text = (el.textContent || '').trim();
  return text.length <= 40 && BADGE_TEXT_RE.test(text);
}

function stripIframeBadge(f: HTMLIFrameElement): void {
  const hints = [f.id, f.className, f.title, f.getAttribute('aria-label') || '', f.src || ''].join(' ');
  if (BADGE_TEXT_RE.test(hints) || HOST_RE.test(hints) || /ai-badge|ai-watermark|bolt-badge|bolt-watermark|made-in-bolt/.test(hints)) {
    hideEl(f);
  }
}

function sweep(): void {
  // Anchors pointing at bolt.new (the badge links there).
  document.querySelectorAll('a').forEach((a) => {
    if (isBoltLink(a)) hideEl(a);
  });
  // Elements with explicit badge id/class names.
  document.querySelectorAll('[id],[class]').forEach((el) => {
    if (isExplicitlyBadge(el)) hideEl(el);
  });
  // Leaf text nodes that literally say "Made in Bolt".
  document.querySelectorAll('*').forEach((el) => {
    if (isBadgeText(el)) hideEl(el);
  });
  // Any iframe the platform injected as a badge.
  document.querySelectorAll('iframe').forEach(stripIframeBadge);
}

export function startHidingBadge(): () => void {
  let stopped = false;

  const run = () => {
    if (stopped) return;
    sweep();
    window.setTimeout(run, 1000);
  };

  sweep();
  const observer = new MutationObserver(() => sweep());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'href', 'src'],
  });

  run();

  return () => {
    stopped = true;
    observer.disconnect();
  };
}
