export type GridItem = {
  id?: string;
  title?: string;
  description?: string;
  short?: string;
  tags?: string[];
  thumbnail?: string; // full or relative URL
  href?: string; // if provided, clicking the card navigates here
  group?: string;
};

/** Custom card renderer. Return a div with class "block"; layout classes and click handling are applied by the grid. */
export type RenderCardFn = (item: GridItem) => HTMLDivElement;

export type GridConfig = {
  gridEl: HTMLElement;
  measureViewportEl?: HTMLElement | null;

  // Layout
  desiredBlockSize?: { width: number; height: number };
  gap?: number;

  // Timing that must be shared between JS and CSS
  // Keep this here only if also used in JS timings.
  fadeOutDurationMs?: number; // maps to --fade-out-duration

  // Staggers
  staggerStepMs?: number; // transform stagger between columns
  fadeStaggerStepMs?: number; // fade stagger between items

  // Init delays
  initialResizeDelayFrames?: number;
  initialScrollDelayMs?: number;

  // Additional spacer rows - if all rows should cone into contact with the header row, to display information there
  additionalSpacerRows?: boolean;

  /** Custom card renderer. If provided, this is used instead of the default card markup (media, title, tags). */
  renderCard?: RenderCardFn;
};

export type GridState = {
  cols: number;
  rows: number;
  width: number;
  height: number;
};
