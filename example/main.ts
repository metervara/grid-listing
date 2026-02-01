import { createGridList, GridItem } from '@metervara/grid-listing';
import '@metervara/grid-listing/styles';
import gridManifest from 'virtual:grid-manifest';

const gridEl = document.getElementById('grid')!;
const headerEl = document.getElementById('header')!;
const gapContainerEl = document.getElementById('gap-container')!;
const measureEl = document.getElementById('measure')!;

let gapContainerBlocks: HTMLDivElement[] = [];
const gap = 10;

const grid = createGridList({
  gridEl,
  measureViewportEl: measureEl,
  desiredBlockSize: { width: 400, height: 300 },
  gap,
  additionalSpacerRows: true,
});

const getActiveItems = (aboveHeader: number | undefined, belowHeader: number | undefined) => {
  const layout = grid.getLayout();
  return items.filter((item, index) => {
    const row = Math.floor(index / layout.cols);
    return row === aboveHeader || row === belowHeader;
  });
};

const updateInfoBlockContent = (items: GridItem[]) => {
  console.log("UPDATE BLOCK CONTENT");
  // console.log(`update info for active items: "${items.map((item) => item.title).join(", ")}"`);

  gapContainerBlocks.forEach((block, index) => {
    block.innerHTML = '';
    const topIndex = index;
    const bottomIndex = index + grid.getLayout().cols;
    if(topIndex < items.length) {
      const topItem = items[topIndex];
      block.appendChild(createInfoItem(topItem, topIndex, 'top'));
    }
    if(bottomIndex < items.length) {
      const bottomItem = items[bottomIndex];
      block.appendChild(createInfoItem(bottomItem, topIndex, 'bottom'));
    }
  });
}

const createInfoItem = (item: GridItem, index: number, classNames: string = '') => {
  const itemEl = document.createElement('div');
  itemEl.className = `info-item ${classNames}`;
  itemEl.style.setProperty('--info-item-in-delay', `${index * 75}ms`);
  itemEl.innerHTML = `
  <h3 class="info-item-title">${item.title}</h3>
  <p class="info-item-description">${item.description}</p>`;
  return itemEl;
}

grid.init();
grid.events.on("scroll:start", () => {
  console.log("Scrolling started, CLEAR BLOCKS");
  gapContainerEl.classList.remove('show-info');
});

grid.events.on("grid:clear", () => {
  console.log("Grid clear, CLEAR BLOCKS");
  gapContainerEl.classList.remove('show-info');
});

grid.events.on("grid:rebuild", (state) => {
  // console.log("Grid rebuild", state);
});

grid.events.on("grid:layout:change", ({cols, rows}) => {
  // console.log("Grid layout change", cols, rows);
  console.log("Grid layout change, CLEAR BLOCKS");
  gapContainerBlocks.forEach(block => {
    block.remove();
  });
  gapContainerBlocks = [];
  gapContainerEl.innerHTML = '';

  for(let i = 0; i < cols; i++) {
    const block = document.createElement('div');
    block.className = 'block';
    gapContainerBlocks.push(block);
    gapContainerEl.appendChild(block);
  }
});

// Double RAF to ensure items are rendered at correct position before they get animation class
const showInfoAfterPaint = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => gapContainerEl.classList.add('show-info'));
  });
};

grid.events.on("scroll:end", ({ aboveHeader, belowHeader }) => {
  console.log("Scrolling ended");
  
  const state = grid.getLayout();
  const snap = state.height + gap;
  const scrollTop = gridEl.scrollTop;

  const ratio = scrollTop / snap;
  const fractional = Math.abs(ratio - Math.round(ratio));

  const EPSILON = 0.01; // ratio-based tolerance (~1% of a snap)
  const scrollIsAlignedToGrid = fractional < EPSILON;

  if(scrollIsAlignedToGrid) {
    const activeItems = getActiveItems(aboveHeader, belowHeader);
    updateInfoBlockContent(activeItems);
    showInfoAfterPaint();
  }
});

grid.events.on("initial:scroll:end", ({ aboveHeader, belowHeader }) => {
  console.log("Initial scroll ended");

  const activeItems = getActiveItems(aboveHeader, belowHeader);
  updateInfoBlockContent(activeItems);
  showInfoAfterPaint();
});

// Convert manifest items to grid items
const items: GridItem[] = gridManifest.items.map((item) => ({
  id: item.path,
  title: item.title ?? item.name,
  description: item.description,
  tags: item.tags,
  thumbnails: item.thumbnail ? [`/projects/${item.path}/${item.thumbnail}`] : undefined,
  href: item.href,
  group: item.group,
}));

grid.setItems(items);
