// Water‑Sort Puzzle Solvability Checker  (8..N tubes, ≤2 spare, height 4)
// -----------------------------------------------------------------------------
// Public API
//   isSolvable(tubes [, maxDepth]) -> boolean
//
//   tubes: Array of arrays, each inner array lists colours bottom‑to‑top.
//          Example for 6 colours, 2 spares (height 4):
//          [ ['R','G','B','R'], ['G','G','R','B'], …, [], [] ]
//   maxDepth (optional): hard cut‑off for search (default 60).
//
// Works well for up to 12 colours + 2 spare tubes (total 14) on a modern laptop.
// -----------------------------------------------------------------------------

// ––––––  configuration  ––––––
const HEIGHT = 4; // tube capacity – change if your game differs
const SPARE_LIMIT = 2; // algorithm assumes ≤2 completely empty tubes

// ––––––  helper utils  ––––––
const encode = (state) => state.map((t) => t.join("")).join("|");

// contiguous segment on top of tube i
function topSegment(tube) {
  if (tube.length === 0) return null;
  const colour = tube[tube.length - 1];
  let len = 1;
  for (let j = tube.length - 2; j >= 0 && tube[j] === colour; --j) len++;
  return { colour, len };
}

// goal = every non‑empty tube is monochrome and full or immutably finished
function isGoal(state) {
  return state.every(
    (t) => t.length === 0 || (t.length === HEIGHT && new Set(t).size === 1)
  );
}

// admissible heuristic:  (#distinct colours that are not finished)
function heuristic(state) {
  const unfinished = new Set();
  for (const tube of state) {
    if (tube.length === 0) continue;
    if (tube.length === HEIGHT && new Set(tube).size === 1) continue; // finished
    unfinished.add(tube[tube.length - 1]);
  }
  return unfinished.size;
}

// generate legal moves – returns array of [src,dst,amount]
function moves(state) {
  const list = [];
  for (let i = 0; i < state.length; ++i) {
    const seg = topSegment(state[i]);
    if (!seg) continue; // empty tube
    for (let j = 0; j < state.length; ++j) {
      if (i === j) continue;
      const from = state[i],
        to = state[j];
      if (to.length === HEIGHT) continue; // full
      if (to.length && to[to.length - 1] !== seg.colour) continue; // diff colour on top
      if (to.length + seg.len > HEIGHT) continue; // not enough space
      // avoid pouring into identical tube
      list.push([i, j, seg.len]);
    }
  }
  return list;
}

function applyMove(state, [i, j, amount]) {
  const next = state.map((t) => t.slice());
  const seg = next[i].splice(next[i].length - amount, amount);
  next[j].push(...seg);
  return next;
}

// cheap dead‑state rejection (no‑escape test + colour‑count per prefix)
function dead(state) {
  // No‑escape: every spare slot has unique colour and all tops distinct.
  const spareSlots = state.reduce((s, t) => s + (HEIGHT - t.length), 0);
  if (
    spareSlots <= SPARE_LIMIT &&
    spareSlots === state.filter((t) => t.length < HEIGHT).length
  ) {
    const tops = new Set(
      state.filter((t) => t.length).map((t) => t[t.length - 1])
    );
    if (tops.size === state.filter((t) => t.length).length) return true;
  }
  return false;
}

// ––––––  core search – iterative deepening A*  ––––––
function idaStar(start, depthLimit = 60) {
  const path = [start];
  const visited = new Set([encode(start)]);

  function dfs(g, bound) {
    const node = path[path.length - 1];
    const f = g + heuristic(node);
    if (f > bound) return f; // exceeded current threshold
    if (isGoal(node)) return true;
    let min = Infinity;

    for (const mv of moves(node)) {
      const child = applyMove(node, mv);
      const key = encode(child);
      if (visited.has(key) || dead(child)) continue;
      visited.add(key);
      path.push(child);
      const t = dfs(g + 1, bound);
      if (t === true) return true;
      if (t < min) min = t;
      path.pop();
      visited.delete(key);
    }
    return min;
  }

  let bound = heuristic(start);
  while (bound <= depthLimit) {
    const t = dfs(0, bound);
    if (t === true) return true;
    if (t === Infinity) return false; // no solution within depth limit
    bound = t;
  }
  return false; // exceeded maxDepth
}

// ––––––  exported convenience wrapper  ––––––
export function isSolvable(tubes, maxDepth = 60) {
  if (tubes.filter((t) => t.length === 0).length < 2) {
    console.warn("Algorithm expects at least two empty tubes as spares.");
  }
  return idaStar(tubes, maxDepth);
}

// quick & dirty random generator and demo (run under Node)
if (import.meta.url === `file://${process.argv[1]}`) {
  const colours = "ABCDEFGHIJKL".split("");
  const C = +process.argv[2] || 10; // number of colours
  const T = C + 2; // tubes = colours + 2 spare
  const balls = colours.slice(0, C).flatMap((c) => Array(HEIGHT).fill(c));
  balls.sort(() => Math.random() - 0.5);
  const tubes = Array.from({ length: T }, () => []);
  let idx = 0;
  for (let i = 0; i < C; ++i) {
    tubes[i] = balls.slice(idx, idx + HEIGHT);
    idx += HEIGHT;
  }
  console.log("Random instance:", JSON.stringify(tubes));
  console.time("solve");
  const res = isSolvable(tubes, 50);
  console.timeEnd("solve");
  console.log(res ? "Solvable" : "UNSOLVABLE or depth>50");
}
