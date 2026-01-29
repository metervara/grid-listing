import { createGridList, GridItem } from '@metervara/grid-listing';
import '@metervara/grid-listing/styles';
import gridManifest from 'virtual:grid-manifest';

const gridEl = document.getElementById('grid')!;
const headerEl = document.getElementById('header')!;
const measureEl = document.getElementById('measure')!;

const grid = createGridList({
  gridEl,
  measureViewportEl: measureEl,
  desiredBlockSize: { width: 400, height: 300 },
  gap: 10,
  additionalSpacerRows: true,
});

const getActiveItems = (aboveHeader: number | undefined, belowHeader: number | undefined) => {
  const layout = grid.getLayout();
  return items.filter((item, index) => {
    const row = Math.floor(index / layout.cols);
    return row === aboveHeader || row === belowHeader;
  });
};

grid.init();
grid.events.on("scroll:start", () => {
  console.log("Scrolling started");
});
grid.events.on("scroll:end", ({ aboveHeader, belowHeader }) => {
  console.log("Scrolling ended");
  // console.log("Scrolling ended", { aboveHeader, belowHeader }, grid.getLayout());

  const activeItems = getActiveItems(aboveHeader, belowHeader);
  console.log(`Active items: "${activeItems.map((item) => item.title).join(", ")}"`);
});

grid.events.on("initial:scroll:end", ({ aboveHeader, belowHeader }) => {
  console.log("Initial scroll ended");
  // console.log("Initial scroll ended", { aboveHeader, belowHeader }, grid.getLayout());

  const activeItems = getActiveItems(aboveHeader, belowHeader);
  console.log(`Active items: "${activeItems.map((item) => item.title).join(", ")}"`);
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
