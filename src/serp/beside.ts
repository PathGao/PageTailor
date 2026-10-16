import type { SerpSite } from "./site";

/** The AI overview at its content width (764 text + 260 sources + 80 padding), and the narrowest it still reads well. */
const AI_WANT = 1104;
const AI_MIN = 820;

/**
 * On wide screens the first results move up beside the AI overview, so the columns next to it are not left empty.
 *
 * The overview itself must not move: Google's "Show more" stops working once its module is moved or anything is
 * added inside it (tested live 2026-10-14). So the overview stays where it is and only its width changes, through
 * CSS; a new container ([data-pt-beside]) goes right after it in the results area, and results move into that.
 * Results survive the move (their "About this result" menu still opens).
 *
 * The overview takes k result columns: the most that stay within its content width (wider opens a gap inside it),
 * at least AI_MIN, leaving one or more for the results. It covers R rows of ordinary cards, so R x (cols - k) results
 * go beside it. If fewer results come before the first full-row block, it stays above the results instead (kept for
 * that column layout, so the page does not toggle). Once results are beside it, they stay when the user expands it,
 * and more follow if it grows. Everything goes back when the grid is off (narrow window) or the preset is turned off.
 */
export function resultsBesideAi(s: SerpSite) {
  let box: HTMLElement | null = null;
  const moved: { el: HTMLElement; parent: Node; next: Node | null }[] = [];
  let key = "";
  let kept = "";
  let declined = "";

  const putBack = (n: number) => {
    // Last moved first: an item's saved next sibling may itself have been moved after it.
    while (moved.length > n) {
      const m = moved.pop()!;
      m.parent.insertBefore(m.el, m.next && m.next.parentNode === m.parent ? m.next : null);
    }
  };
  const restore = () => {
    putBack(0);
    box?.remove();
    box = null;
    const area = document.querySelector<HTMLElement>(s.area);
    for (const v of ["--pt-ai-w", "--pt-beside-gap", "--pt-side-cols"]) area?.style.removeProperty(v);
  };

  /** Called by the grid on each layout pass; returns the list items that are still in the list. */
  const layout = (list: HTMLElement, items: HTMLElement[], contentHeight: (e: HTMLElement) => number): HTMLElement[] => {
    const area = document.querySelector<HTMLElement>(s.area);
    const ai = document.querySelector<HTMLElement>("[data-pt-top]:has([data-pt-ai])");
    const st = getComputedStyle(list);
    const tracks = st.gridTemplateColumns.split(" ").filter(Boolean).map(parseFloat);
    const gap = parseFloat(st.columnGap) || 0;
    const width = (n: number) => n * tracks[0]! + (n - 1) * gap;
    let k = 0;
    if (area && ai && st.display === "grid" && tracks.length >= 2) {
      for (let n = tracks.length - 1; n >= 1; n--) {
        if (width(n) <= AI_WANT + 40 && width(n) >= AI_MIN) {
          k = n;
          break;
        }
      }
    }
    const next = `${tracks.length}:${k}:${Math.round(tracks[0] ?? 0)}`;
    if (next !== key) restore();
    key = next;
    if (!k || key === declined) {
      restore();
      return items;
    }
    const side = tracks.length - k;
    area!.style.setProperty("--pt-ai-w", `${width(k)}px`);
    area!.style.setProperty("--pt-beside-gap", `${gap}px`);
    area!.style.setProperty("--pt-side-cols", String(side));
    if (!box) {
      box = document.createElement("div");
      box.dataset.ptBeside = "";
      ai!.after(box);
    }

    // Results that can sit beside it: plain cards from the start of the list, up to the first full-row block.
    const plain: HTMLElement[] = [];
    for (const e of items) {
      if (moved.some((m) => m.el === e)) continue;
      const es = getComputedStyle(e);
      if (es.display === "none") continue;
      if ((es.gridColumnStart === "1" && es.gridColumnEnd === "-1") || e.hasAttribute("data-pt-wide") || !e.querySelector(s.hasTitle)) break;
      plain.push(e);
    }
    const cards = [...moved.map((m) => m.el), ...plain];
    const heights = cards.map(contentHeight).sort((a, b) => a - b);
    const card = heights[Math.floor(heights.length / 2)] ?? 0;
    const aiCard = ai!.querySelector<HTMLElement>("[data-pt-top-card]") ?? ai!;
    const rows = card ? Math.max(1, Math.round((aiCard.getBoundingClientRect().height + gap) / (card + gap))) : 1;
    const need = rows * side;
    if (kept !== key && cards.length < need) {
      declined = key;
      restore();
      return items;
    }
    kept = key;
    const target = Math.min(need, cards.length);
    putBack(target);
    for (const el of plain) {
      if (moved.length >= target) break;
      moved.push({ el, parent: el.parentNode!, next: el.nextSibling });
      box!.append(el);
    }
    return items.filter((e) => !moved.some((m) => m.el === e));
  };

  return { layout, restore };
}
