import { GridList, GridItem } from '@metervara/grid-listing';
import '@metervara/grid-listing/styles';
import gridManifest from 'virtual:grid-manifest';

const gridEl = document.getElementById('grid')!;
const headerEl = document.getElementById('header')!;
const measureEl = document.getElementById('measure')!;

const grid = new GridList({
  gridEl,
  headerEl,
  measureViewportEl: measureEl,
  desiredBlockSize: { width: 400, height: 300 },
  gap: 10,
});

grid.init();

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
