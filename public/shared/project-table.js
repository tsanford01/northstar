// Projects table model shared by the browser and the API: the columns, how each one is read,
// and multi-column sorting. Pure functions only, so the same rules apply on both sides.

export const COLUMNS = [
  { id: 'id', label: 'ID', type: 'text', value: (p) => p.projectId || '' },
  { id: 'name', label: 'Name', type: 'text', value: (p) => p.name || '' },
  { id: 'team', label: 'Team', type: 'enum', value: (p) => p.team || '' },
  { id: 'status', label: 'Status', type: 'enum', value: (p) => p.status || '' },
  { id: 'impact', label: 'Impact', type: 'number', value: (p) => p.impact },
  { id: 'urgency', label: 'Urgency', type: 'number', value: (p) => p.urgency },
  { id: 'confidence', label: 'Confidence', type: 'number', value: (p) => p.confidence },
  { id: 'effort', label: 'Effort', type: 'number', value: (p) => p.effort },
  { id: 'people', label: 'People', type: 'number', value: (p) => p.capacity },
  { id: 'score', label: 'Score', type: 'number', value: (p) => p.score },
  { id: 'cards', label: 'Cards', type: 'number', value: (p) => p.cardCount || 0 },
  { id: 'decisions', label: 'Open decisions', type: 'number', value: (p) => p.openDecisionCount || 0 },
  { id: 'updated', label: 'Updated', type: 'date', value: (p) => p.updatedAt || '' },
];

export const COLUMN_IDS = COLUMNS.map((column) => column.id);
const byId = new Map(COLUMNS.map((column) => [column.id, column]));

export function column(id) {
  return byId.get(id);
}

// Highest priority first, as the list has always been ordered.
export const DEFAULT_SORT = [{ column: 'score', direction: 'desc' }, { column: 'updated', direction: 'desc' }];
export const DEFAULT_COLUMNS = COLUMN_IDS;
// Narrow screens start with what fits: name, status and score.
export const MOBILE_COLUMNS = ['name', 'status', 'score'];

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const isEmpty = (value) => value === '' || value === null || value === undefined;

function compareValues(type, a, b) {
  if (type === 'number') return Number(a) - Number(b);
  if (type === 'date') return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
  return collator.compare(String(a), String(b));
}

// sorts: [{ column, direction: 'asc' | 'desc' }], first entry first. Empty values sort last in
// either direction; ties fall back to the project id so the order is stable.
export function sortProjects(projects, sorts = DEFAULT_SORT) {
  const keys = normalizeSorts(sorts).map((sort) => ({ ...sort, def: byId.get(sort.column) }));
  return projects
    .map((project) => ({ project, values: keys.map((key) => key.def.value(project)) }))
    .sort((a, b) => {
      for (let index = 0; index < keys.length; index += 1) {
        const va = a.values[index];
        const vb = b.values[index];
        if (isEmpty(va) || isEmpty(vb)) {
          if (isEmpty(va) !== isEmpty(vb)) return isEmpty(va) ? 1 : -1;
          continue;
        }
        const order = compareValues(keys[index].def.type, va, vb);
        if (order) return keys[index].direction === 'desc' ? -order : order;
      }
      return (a.project.id || 0) - (b.project.id || 0);
    })
    .map((entry) => entry.project);
}

export function normalizeSorts(sorts) {
  const seen = new Set();
  return (Array.isArray(sorts) ? sorts : []).filter((sort) => {
    if (!sort || !byId.has(sort.column) || seen.has(sort.column)) return false;
    seen.add(sort.column);
    return true;
  }).map((sort) => ({ column: sort.column, direction: sort.direction === 'desc' ? 'desc' : 'asc' }));
}

// A header click. Plain click: sort by that column alone, flipping asc/desc if it already leads.
// Shift-click: add it as the next key, flip it if present, keep the rest.
export function toggleSort(sorts, columnId, { add = false } = {}) {
  const current = normalizeSorts(sorts);
  const existing = current.find((sort) => sort.column === columnId);
  const firstDirection = byId.get(columnId)?.type === 'text' || byId.get(columnId)?.type === 'enum' ? 'asc' : 'desc';
  if (!add) {
    if (current.length && current[0].column === columnId) return [{ column: columnId, direction: current[0].direction === 'asc' ? 'desc' : 'asc' }];
    return [{ column: columnId, direction: firstDirection }];
  }
  if (existing) return current.map((sort) => (sort.column === columnId ? { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' } : sort));
  return [...current, { column: columnId, direction: firstDirection }];
}

// "score:desc,name:asc" <-> [{ column, direction }]
export function parseSort(text) {
  if (!text) return [];
  return normalizeSorts(String(text).split(',').map((part) => {
    const [columnId, direction = 'asc'] = part.trim().split(':');
    return { column: columnId, direction };
  }));
}

export function formatSort(sorts) {
  return normalizeSorts(sorts).map((sort) => `${sort.column}:${sort.direction}`).join(',');
}

export function ariaSort(sorts, columnId) {
  const sort = normalizeSorts(sorts).find((item) => item.column === columnId);
  return sort ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
}

export function visibleColumns(ids) {
  const wanted = new Set((ids || []).filter((id) => byId.has(id)));
  if (!wanted.size) return COLUMNS;
  return COLUMNS.filter((item) => wanted.has(item.id));
}
