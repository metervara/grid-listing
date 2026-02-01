import { findBestBlockSize } from './blockSize';
import type { GridConfig, GridItem, GridState } from './types';
import { createEvents } from './createEvents';

type ListEvents = {
  "scroll:start": void;
  "scroll:end": { aboveHeader: number | undefined; belowHeader: number | undefined };
  "initial:scroll:end": { aboveHeader: number | undefined; belowHeader: number | undefined };
  "grid:rebuild": GridState;
  "grid:clear": void;
  "grid:layout:change": { cols: number, rows: number };
};

export function createGridList(config: GridConfig) {

  const events = createEvents<ListEvents>();
  // === State as local variables ===
  const gridEl = config.gridEl;
  const measureViewportEl = config.measureViewportEl ?? null;

  const desiredBlockSize = config.desiredBlockSize ?? { width: 400, height: 300 };
  const gap = config.gap ?? 10;

  const fadeOutDurationMs = config.fadeOutDurationMs ?? 200;

  const staggerStepMs = config.staggerStepMs ?? 75;
  const fadeStaggerStepMs = config.fadeStaggerStepMs ?? 50;

  const initialResizeDelayFrames = config.initialResizeDelayFrames ?? 2;
  const initialScrollDelayMs = config.initialScrollDelayMs ?? 1750;

  const additionalSpacerRows: boolean = config.additionalSpacerRows ?? false;

  let items: GridItem[] = [];

  let hasDoneInitialScrollUpdate = false;
  let hasDoneInitialResize = false;
  let resizeDebounceTimer: number | null = null;
  let fadeOutTimer: number | null = null;

  let state: GridState;
  let headerRowIndex = 0;

  let supportsScrollEnd: boolean;
  let scrollEndTimeoutId: number | null = null;
  let scrollEndTimeoutMs = 100;
  let isScrolling = false;

  // Handler for popstate (needs to be stored for cleanup)
  function onPopstate() {
    fadeOutBlocksThen(() => onResizeImmediate());
  }

  // === Helper functions ===
  function syncCssVars() {
    const root = document.documentElement.style;
    root.setProperty('--block-gap', `${gap}px`);
    root.setProperty('--fade-out-duration', `${fadeOutDurationMs}ms`);
    // Start header fade-in slightly before initial scroll triggers
    const headerFadeLeadMs = 250;
    const headerFadeDelayMs = Math.max(0, initialScrollDelayMs - headerFadeLeadMs);
    root.setProperty('--header-fade-delay', `${headerFadeDelayMs}ms`);
  }

  function delayFrames(frames: number, callback: () => void) {
    if (frames <= 0) {
      callback();
      return;
    }
    requestAnimationFrame(() => delayFrames(frames - 1, callback));
  }

  function setLayout(width: number, height: number) {
    const prevCol = state?.cols || -1;
    const prevRow = state?.rows || -1;
    state = findBestBlockSize(width, height, desiredBlockSize.width, desiredBlockSize.height, gap);
    headerRowIndex = 1;
    const root = document.documentElement.style;
    root.setProperty('--block-width', `${state.width}px`);
    root.setProperty('--block-height', `${state.height}px`);
    root.setProperty('--cols', String(state.cols));
    root.setProperty('--rows', String(state.rows));
    root.setProperty('--block-gap', `${gap}px`);
    root.setProperty('--header-row', `${headerRowIndex}`);

    if(prevCol !== state?.cols || prevRow !== state?.rows) {
      events.emit("grid:layout:change", { cols: state.cols, rows: state.rows });
    }
  }

  function rebuildGrid() {
    if (!state) return;
    gridEl.innerHTML = '';
    const spacerBlock = document.createElement('div');
    spacerBlock.className = 'row-spacer col-0';
    gridEl.appendChild(spacerBlock);

    items.forEach((item, index) => {
      const row = Math.floor(index / state.cols);
      const column = index % state.cols;
      const card = createCard(item);
      card.dataset.row = `${row}`;
      card.dataset.column = `${column}`;
      card.classList.add(`row-${row}`);
      card.classList.add(`col-${column}`);

      const isEvenRow = (row % 2) === 0;
      const delayIndex = isEvenRow ? column : (state.cols - 1 - column);
      const transformDelayMs = delayIndex * staggerStepMs;
      const fadeDelayMs = index * fadeStaggerStepMs;
      card.style.transitionDelay = `${transformDelayMs}ms`;
      card.style.setProperty('--fade-delay', `${fadeDelayMs}ms`);
      card.classList.add('fade-in');
      gridEl.appendChild(card);
    });

    let totalRows = Math.ceil(items.length / state.cols) + 1;
    // Add additional spacer rows if there are more rows below the header than the grid has rows
    // This is to allow all rows to 'cone into contact' with the header row, and become active rows. 
    // Active rows are used to trigger the mini descritions to appear (External implementation)
    if(additionalSpacerRows) {
      const visibleRowsBelowHeader = state.rows - (headerRowIndex + 1);
      const additionalSpacerRowsCount = Math.max(0, visibleRowsBelowHeader - 1);
      for (let i = 0; i < additionalSpacerRowsCount; i++) {
        const spacerBlock = document.createElement('div');
        spacerBlock.className = `row-spacer col-${i + totalRows}`;
        gridEl.appendChild(spacerBlock);
      }
      totalRows += additionalSpacerRowsCount; // +1 for the header row
    }

    for (let i = 0; i < totalRows; i++) {
      const snapBlock = document.createElement('div');
      snapBlock.className = 'snap-block';
      snapBlock.dataset.row = `${i}`;
      snapBlock.style.top = `${i * (state.height + gap)}px`;
      gridEl.appendChild(snapBlock);
    }

    events.emit("grid:rebuild", state);
    isScrolling = false;
  }

  function createCard(item: GridItem): HTMLDivElement {
    const title = item.title;
    const thumbnails = Array.isArray(item.thumbnails) ? item.thumbnails : [];
    const primaryThumb = thumbnails[0];
    const tags = (item.tags || []).sort((a, b) => a.localeCompare(b));
    const card = document.createElement('div');
    card.className = 'block';
    card.innerHTML = `
      ${primaryThumb ? `<div class="media"><img class="thumb" src="${primaryThumb}" alt="${title}"></div>` : ''}
      <div class="content block-border">
        <div class="info">
          <h3>${title}</h3>
          </div>
          <div class="tags">
            ${tags.map(t => `<div class="tag" data-tag="${t}">${t}</div>`).join('')}
          </div>
      </div>
      <svg class="checker-border" xmlns="http://www.w3.org/2000/svg">
        <rect class="dash black" />
        <rect class="dash white" />
      </svg>
    `;
    if (item.href) {
      card.addEventListener('click', () => {
        window.location.href = item.href!;
      });
    }
    
    return card;
  }

  /* Gets 'active rows' - rows that are visible above and below the header */
  // TODO: Only return rows that are on screen / viewport (So if the header is at the top, then tehre will be no active rows above the header)
  function getActiveRows() {
    const rowSpan = state.height + gap;
    const scrolledRows = Math.round(gridEl.scrollTop / rowSpan);
    const lastRow = scrolledRows + state.rows - 2; // we subtract one for index starting at 0 and one for teh headerrow
    const headerAbsoluteRow = scrolledRows + headerRowIndex;
    // console.log(`top row: ${scrolledRows}, last row: ${lastRow}`);

    return {
      aboveHeader: headerAbsoluteRow - 1 >= scrolledRows && headerAbsoluteRow - 1 <= lastRow ? headerAbsoluteRow - 1 : undefined,
      belowHeader: headerAbsoluteRow >= scrolledRows && headerAbsoluteRow <= lastRow ? headerAbsoluteRow : undefined,
      // belowHeader: headerAbsoluteRow, // + 1 // +1 omitted here since header row is not an actual row
    };
  }

  // === Event handlers ===
  function applyInitialScrollUpdate() {
    updateAboveHeaderClasses();
    hasDoneInitialScrollUpdate = true;
    setTimeout(() => {
      const activeRows = getActiveRows();
      events.emit("initial:scroll:end", activeRows);
    }, 500); // Should be same as --duration in css vars + stagger 
  }

  function onScroll() {
    if(!isScrolling) {
      events.emit("scroll:start", undefined);
    }
    isScrolling = true;
    updateAboveHeaderClasses();
    // hasDoneInitialScrollUpdate = true;
  }

  function onScrollEnd() {
    if(isScrolling) {
      const activeRows = getActiveRows();
      events.emit("scroll:end", activeRows);
    }
    isScrolling = false;
  }
  
  function onScrollEndFallback() {
    // if(isScrolling) return;
    // isScrolling = true;
    if(scrollEndTimeoutId) window.clearTimeout(scrollEndTimeoutId);
    scrollEndTimeoutId = window.setTimeout(() => {
      onScrollEnd();
    }, scrollEndTimeoutMs);
  }

  function onResizeImmediate() {
    const rect = measureViewportEl?.getBoundingClientRect();
    if (!rect) {
      console.warn('[grid] measureViewport element not found');
      return;
    }

    // Pass 1: use viewport rect
    setLayout(rect.width, rect.height);
    rebuildGrid();
    if (hasDoneInitialScrollUpdate) updateAboveHeaderClasses();

    // Pass 2: recompute with client width if vertical scrollbar appears
    if (gridEl && gridEl.scrollHeight > gridEl.clientHeight) {
      setLayout(gridEl.clientWidth, rect.height);
      rebuildGrid();
      if (hasDoneInitialScrollUpdate) updateAboveHeaderClasses();
    }

    if (!hasDoneInitialResize) {
      hasDoneInitialResize = true;
      document.body.classList.add('layout-ready');
    }

    if (hasDoneInitialScrollUpdate) {
      setTimeout(() => {
        events.emit("initial:scroll:end", getActiveRows());
      }, 500);
    }
  }

  function onWindowResize() {
    const rect = measureViewportEl?.getBoundingClientRect();
    if (!rect) return;

    // Clear grid here
    if (gridEl.hasChildNodes()) {
      gridEl.innerHTML = '';
      events.emit("grid:clear", undefined);
    }

    // Update layout
    setLayout(rect.width, rect.height);

    if (resizeDebounceTimer !== null) {
      window.clearTimeout(resizeDebounceTimer);
    }
    resizeDebounceTimer = window.setTimeout(() => {
      rebuildGrid();
      if (hasDoneInitialScrollUpdate) updateAboveHeaderClasses();
      if (gridEl && gridEl.scrollHeight > gridEl.clientHeight) {
        setLayout(gridEl.clientWidth, rect.height);
        rebuildGrid();
        if (hasDoneInitialScrollUpdate) updateAboveHeaderClasses();
      }
      resizeDebounceTimer = null;
      if (hasDoneInitialScrollUpdate) {
        setTimeout(() => {
          events.emit("initial:scroll:end", getActiveRows());
        }, 500);
      }
    }, 400);
  }

  function updateAboveHeaderClasses() {
    if (!state) return;
    const rowSpan = state.height + gap;
    const scrolledRows = Math.round(gridEl.scrollTop / rowSpan);
    const headerAbsoluteRow = scrolledRows + headerRowIndex;
    const blocks = gridEl.querySelectorAll<HTMLDivElement>('.block');
    blocks.forEach(b => {
      const row = parseInt(b.dataset.row || '0', 10);
      if (row < headerAbsoluteRow) {
        b.classList.add('above-header');
      } else {
        b.classList.remove('above-header');
      }
    });
  }

  function fadeOutBlocksThen(callback: () => void) {
    const blocks = Array.from(gridEl.querySelectorAll<HTMLDivElement>('.block'));
    if (blocks.length === 0) { callback(); return; }

    if (fadeOutTimer !== null) {
      window.clearTimeout(fadeOutTimer);
      fadeOutTimer = null;
    }

    let maxDelay = 0;
    blocks.forEach(b => {
      const row = parseInt(b.dataset.row || '0', 10);
      const col = parseInt(b.dataset.column || '0', 10);
      const isEvenRow = (row % 2) === 0;
      const delayIndex = isEvenRow ? col : (state.cols - 1 - col);
      const fadeDelayMs = delayIndex * fadeStaggerStepMs;
      b.style.setProperty('--fade-delay', `${fadeDelayMs}ms`);
      b.classList.add('fade-out');
      if (fadeDelayMs > maxDelay) maxDelay = fadeDelayMs;
    });

    const total = maxDelay + fadeOutDurationMs + 20;
    fadeOutTimer = window.setTimeout(() => {
      fadeOutTimer = null;
      callback();
    }, total);
  }

  // === Public API ===
  function init() {

    // Set CSS variables that must be in sync with JS
    syncCssVars();

    // Listeners
    gridEl.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('popstate', onPopstate);

    supportsScrollEnd = 'onscrollend' in window;

    if(supportsScrollEnd) {
      gridEl.addEventListener('scrollend', onScrollEnd);
    } else {
      gridEl.addEventListener('scroll', onScrollEndFallback, { passive: true });
    }
  }

  function destroy() {
    events.clear();

    gridEl.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('popstate', onPopstate);

    if(supportsScrollEnd) {
      gridEl.removeEventListener('scrollend', onScrollEnd);
    } else {
      if(scrollEndTimeoutId) window.clearTimeout(scrollEndTimeoutId);
      gridEl.removeEventListener('scroll', onScrollEndFallback);
    }
    // Clear any pending timers
    if (resizeDebounceTimer !== null) {
      window.clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = null;
    }
    if (fadeOutTimer !== null) {
      window.clearTimeout(fadeOutTimer);
      fadeOutTimer = null;
    }
  }

  function setItems(newItems: GridItem[]) {
    items = newItems;
    
    delayFrames(initialResizeDelayFrames, () => onResizeImmediate());
    window.setTimeout(applyInitialScrollUpdate, initialScrollDelayMs);
  }

  function getLayout() {
    return state;
  }

  return { init, destroy, setItems, events, getLayout };
}

// Type export for consumers
export type GridListInstance = ReturnType<typeof createGridList>;
