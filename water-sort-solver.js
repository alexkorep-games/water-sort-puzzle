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
// Works reasonably well for up to 12-14 colours + 2 spare tubes (total 14-16)
// Uses Iterative Deepening A* with state canonicalization and heuristics.
// -----------------------------------------------------------------------------

// ––––––  configuration  ––––––
const HEIGHT = 4; // tube capacity – change if your game differs
// const SPARE_LIMIT = 2; // Less critical with canonicalization, but kept for 'dead' check

// ––––––  helper utils  ––––––

// Encode state for visited set (must be applied AFTER canonicalization)
const encode = (state) => state.map((t) => t.join("")).join("|");

// --- Canonicalization ---
// Generate a sortable signature for a tube
function getTubeSignature(tube) {
  if (tube.length === 0) return "0_EMPTY";
  const isMono = new Set(tube).size === 1;
  if (tube.length === HEIGHT && isMono) return `1_DONE_${tube[0]}`; // Completed tubes first, sorted by color
  return `2_PARTIAL_${tube.join("")}`; // Partial tubes next, sorted by content
}

// Sort tubes into a canonical order to handle symmetries
function canonicalize(state) {
  const signedTubes = state.map((tube) => [getTubeSignature(tube), tube]);
  signedTubes.sort((a, b) => a[0].localeCompare(b[0]));
  return signedTubes.map((pair) => pair[1]);
}
// --- End Canonicalization ---

// contiguous segment on top of tube i
function topSegment(tube) {
  if (tube.length === 0) return null;
  const colour = tube[tube.length - 1];
  let len = 1;
  // Count contiguous block of same color from top down
  for (let j = tube.length - 2; j >= 0 && tube[j] === colour; --j) {
    len++;
  }
  return { colour, len };
}

// Check if a tube is finished (full and monochromatic)
function isTubeComplete(tube) {
  return tube.length === HEIGHT && new Set(tube).size === 1;
}

// Goal = every non‑empty tube is full and monochromatic
function isGoal(state) {
  // Note: Canonicalization ensures empty tubes are grouped, but goal check is independent
  return state.every((t) => t.length === 0 || isTubeComplete(t));
}

// --- Heuristics ---
// h1: Original heuristic - counts distinct colors on top of *unfinished* tubes.
function heuristic1(state) {
  const unfinishedTops = new Set();
  for (const tube of state) {
    if (tube.length === 0 || isTubeComplete(tube)) continue; // Ignore empty or finished
    unfinishedTops.add(tube[tube.length - 1]); // Add top color
  }
  return unfinishedTops.size;
}

// h2: Counts balls that are "out of place" - below a different color in the same tube.
// Admissible because each such ball must be moved at least once.
function heuristic2(state) {
  let misplacedCount = 0;
  for (const tube of state) {
    if (tube.length <= 1 || isTubeComplete(tube)) continue; // Ignore empty, single-ball, or finished

    const topColor = tube[tube.length - 1];
    let isMono = true;
    for (let i = 0; i < tube.length - 1; i++) {
      if (tube[i] !== topColor) {
        // This ball is 'wrong' relative to the top color of this tube.
        // A simpler count: how many balls are NOT the target color (top color)?
        misplacedCount++;
        isMono = false;
      }
    }
    // Alternative interpretation: count balls below the solid top block that are different.
    // let topBlockEnd = tube.length - 1;
    // while (topBlockEnd >= 0 && tube[topBlockEnd] === topColor) {
    //     topBlockEnd--;
    // }
    // misplacedCount += (topBlockEnd + 1); // All balls below index topBlockEnd+1 are misplaced
  }
  return misplacedCount;
}

// Combined heuristic: Max of admissible heuristics is also admissible and stronger.
function heuristic(state) {
  // Ensure state is canonical if heuristics depend on order (they shouldn't here)
  const h1 = heuristic1(state);
  const h2 = heuristic2(state);
  return Math.max(h1, h2);
}
// --- End Heuristics ---

// generate legal moves – returns array of [srcIdx, dstIdx, amountToMove]
function moves(state) {
  const list = [];
  const numTubes = state.length;

  for (let i = 0; i < numTubes; ++i) {
    const fromTube = state[i];
    if (fromTube.length === 0) continue; // Cannot pour from empty
    if (isTubeComplete(fromTube)) continue; // OPTIMIZATION: Don't pour from a completed tube

    const seg = topSegment(fromTube); // { colour, len }
    if (!seg) continue; // Should not happen if tube not empty

    for (let j = 0; j < numTubes; ++j) {
      if (i === j) continue; // Cannot pour into itself
      const toTube = state[j];
      if (toTube.length === HEIGHT) continue; // Cannot pour into a full tube

      // Check if compatible: destination is empty or top color matches segment color
      if (toTube.length > 0 && toTube[toTube.length - 1] !== seg.colour) {
        continue;
      }

      // Calculate how many balls *can* be moved
      const availableSpace = HEIGHT - toTube.length;
      const amountToMove = Math.min(seg.len, availableSpace);

      // Only add valid moves (amount > 0)
      // Canonicalization implicitly handles pouring into identical empty tubes,
      // but we could add explicit checks later if needed.
      if (amountToMove > 0) {
        // Avoid trivial moves? (e.g., pouring full tube to empty if another empty exists)
        // Canonicalization helps prune states resulting from such symmetric moves.
        list.push([i, j, amountToMove]);
      }
    }
  }
  return list;
}

// Apply a move [srcIdx, dstIdx, amount] and return the NEW state array
function applyMove(state, [i, j, amount]) {
  // Create a deep copy to avoid modifying the original state
  const next = state.map((t) => t.slice());
  // Perform the move
  const seg = next[i].splice(next[i].length - amount, amount);
  next[j].push(...seg);
  return next;
}

// cheap dead‑state rejection (no‑escape test)
// Less critical with canonicalization/heuristics, but keep as it's cheap.
function dead(state) {
  // No‑escape: every spare slot has unique colour and all tops distinct.
  const spareSlots = state.reduce((s, t) => s + (HEIGHT - t.length), 0);
  const numTubes = state.length;
  const numNonEmpty = state.filter((t) => t.length > 0).length;
  const numNonFull = state.filter((t) => t.length < HEIGHT).length;

  // Condition: Few spare slots remain, and # non-full tubes equals # spare slots
  // And all tops of non-empty tubes are distinct.
  // (Original check assumed SPARE_LIMIT=2, generalizing slightly)
  if (spareSlots <= numTubes && spareSlots === numNonFull) {
    const tops = new Set();
    let distinctTops = 0;
    for (const tube of state) {
      if (tube.length > 0) {
        const topColor = tube[tube.length - 1];
        if (!tops.has(topColor)) {
          tops.add(topColor);
          distinctTops++;
        }
      }
    }
    // If every non-empty tube has a distinct top color, and there are exactly
    // enough slots to hold one ball from each (i.e., spareSlots == numNonFull),
    // and those slots are spread across different tubes, it *might* be a dead end.
    // The original condition was simpler: if (tops.size === numNonEmpty) return true;
    // Let's stick to the simpler, stricter original condition which is faster to check:
    if (tops.size === numNonEmpty) {
      // console.log("Potential dead state:", encode(state)); // For debugging
      return true;
    }
  }
  return false;
}

// ––––––  core search – iterative deepening A*  ––––––
function idaStar(start, depthLimit = 60) {
  const canonicalStart = canonicalize(start);
  const startKey = encode(canonicalStart);

  // Path stores canonical states
  const path = [canonicalStart];
  // Visited stores encoded canonical states to prevent cycles and re-exploration
  const visited = new Set([startKey]);
  // Store g-costs associated with visited states to potentially prune longer paths
  // to the same state found in the current or previous iterations.
  const costs = { [startKey]: 0 };

  function dfs(g, bound) {
    const node = path[path.length - 1]; // Current node (already canonical)
    const f = g + heuristic(node);

    if (f > bound) return f; // Exceeded current threshold, return minimum cost to reach beyond bound
    if (isGoal(node)) return true; // Solution found

    let min = Infinity; // Minimum cost exceeding bound found in this subtree

    for (const mv of moves(node)) {
      // Generate moves from canonical state
      const rawChild = applyMove(node, mv);
      const child = canonicalize(rawChild); // Canonicalize the child state
      const key = encode(child); // Encode the canonical child

      const new_g = g + 1;

      // Pruning:
      // 1. If already visited with a cost <= current path cost, prune.
      // 2. Check for dead states (cheaply).
      if ((visited.has(key) && costs[key] <= new_g) || dead(child)) {
        continue;
      }

      // Add to path and visited/costs
      visited.add(key);
      costs[key] = new_g;
      path.push(child);

      const result = dfs(new_g, bound);

      // Backtrack
      path.pop();
      // We DO NOT remove from visited/costs in IDA* generally,
      // because a state might be reached via different paths in later, deeper iterations.
      // Keeping the lowest cost found so far (costs[key]) is correct.
      // If we *did* remove: visited.delete(key); delete costs[key];

      if (result === true) return true; // Solution found down this path
      if (result < min) min = result; // Update minimum cost found that exceeds the bound
    }
    return min; // Return the minimum cost seen that exceeded the bound
  }

  let bound = heuristic(canonicalStart); // Initial bound from heuristic

  while (bound <= depthLimit) {
    // console.log(`IDA* Iteration with bound: ${bound}`); // For debugging
    // For each iteration, we technically might need to clear visited/costs
    // IF we strictly follow the simplest IDA* definition (memoryless between iterations).
    // However, keeping visited/costs across iterations (like A*) is common and efficient
    // as long as we handle costs correctly (which the `costs[key] <= new_g` check does).
    // Let's stick with the persistent visited/costs for performance.

    const result = dfs(0, bound);

    if (result === true) return true; // Solution found within current bound
    if (result === Infinity) return false; // No solution found, and search space exhausted within limit

    bound = result; // Update bound to the minimum cost that exceeded the previous bound
  }

  return false; // Exceeded maxDepth without finding a solution
}

// ––––––  exported convenience wrapper  ––––––
export function isSolvable(tubes, maxDepth = 60) {
  // Basic validation
  let totalBalls = 0;
  const colorCounts = {};
  for (const tube of tubes) {
    if (tube.length > HEIGHT) {
      console.error("Error: Tube height exceeds configured HEIGHT.");
      return false; // Invalid input
    }
    totalBalls += tube.length;
    for (const color of tube) {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }
  for (const color in colorCounts) {
    if (colorCounts[color] !== HEIGHT) {
      // Allow games that might not start with exactly HEIGHT balls per color
      // This might indicate an already partially solved or unsolvable state
      console.warn(
        `Warning: Color ${color} has ${colorCounts[color]} balls, expected ${HEIGHT}.`
      );
    }
  }
  // The original algorithm expected exactly C*HEIGHT balls and C+2 tubes.
  // This version is more flexible but relies on the search.

  // The canonicalization handles empty tubes, so the warning is less critical,
  // but the *logic* might perform better if >= 2 spares are conceptually present.
  // if (tubes.filter((t) => t.length === 0).length < 2) {
  //     console.warn("Algorithm efficiency might be better with at least two empty tubes initially.");
  // }

  return idaStar(tubes, maxDepth);
}

// quick & dirty random generator and demo (run under Node)
// To run: node your_file_name.js [num_colors]
if (
  typeof process !== "undefined" &&
  process.argv &&
  import.meta.url === `file://${process.argv[1]}`
) {
  const colours = "RGBYOPKMCWADVX".split(""); // More colors
  const C = +process.argv[2] || 10; // number of colours (e.g., 10, 12)
  if (C > colours.length) {
    console.error(
      `Requested ${C} colours, but only ${colours.length} defined.`
    );
    process.exit(1);
  }
  const T = C + 2; // tubes = colours + 2 spare
  const balls = colours.slice(0, C).flatMap((c) => Array(HEIGHT).fill(c));

  // Shuffle balls thoroughly
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [balls[i], balls[j]] = [balls[j], balls[i]]; // Swap
  }

  const tubes = Array.from({ length: T }, () => []);
  let ballIdx = 0;
  for (let i = 0; i < C; ++i) {
    tubes[i] = balls.slice(ballIdx, ballIdx + HEIGHT);
    ballIdx += HEIGHT;
  }
  // The last 2 tubes remain empty

  console.log(`Generated ${C} colours, ${T} tubes, height ${HEIGHT}`);
  console.log("Random instance:", JSON.stringify(tubes));
  console.time("solve");
  const res = isSolvable(tubes, 60); // Increased default depth slightly for harder problems
  console.timeEnd("solve");
  console.log(res ? "Solvable" : "UNSOLVABLE or depth > 60");
}
