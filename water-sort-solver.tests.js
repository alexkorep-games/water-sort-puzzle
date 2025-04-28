// water-sort-solver.tests.js
// Simple console.log based unit checks for water-sort-solver
// Run with:  node water-sort-solver.tests.js

import { isSolvable } from "./water-sort-solver.js";

const HEIGHT = 4;

function assertEqual(name, got, expected) {
  if (got === expected) {
    console.log(`✅  ${name}: PASS`);
  } else {
    console.log(`❌  ${name}: FAIL  (got ${got}, expected ${expected})`);
  }
}

function makeSolved(colours) {
  const tubes = [];
  for (let i = 0; i < colours; ++i) {
    const c = String.fromCharCode(65 + i); // A, B, C ...
    tubes.push(Array(HEIGHT).fill(c));
  }
  // two empty spares
  tubes.push([]);
  tubes.push([]);
  return tubes;
}

function makeRandom(colours) {
  const balls = [];
  for (let i = 0; i < colours; ++i) {
    const c = String.fromCharCode(65 + i);
    for (let j = 0; j < HEIGHT; ++j) balls.push(c);
  }
  // shuffle Fisher–Yates
  for (let k = balls.length - 1; k > 0; --k) {
    const r = Math.floor(Math.random() * (k + 1));
    [balls[k], balls[r]] = [balls[r], balls[k]];
  }
  const tubes = [];
  let idx = 0;
  for (let i = 0; i < colours; ++i) {
    tubes.push(balls.slice(idx, idx + HEIGHT));
    idx += HEIGHT;
  }
  tubes.push([]);
  tubes.push([]);
  return tubes;
}

// Test 1: Already solved state (6 colours)
{
  const tubes = makeSolved(6);
  const res = isSolvable(tubes);
  assertEqual("Solved state should be solvable", res, true);
}

// Test 2: Random 6‑colour instance should always be solvable
{
  const tubes = makeRandom(6);
  const res = isSolvable(tubes, 40);
  assertEqual("Random 6‑colour instance", res, true);
}

// Test 3: Random 10‑colour instance (stress‑test)
{
  const tubes = makeRandom(10);
  const res = isSolvable(tubes, 80);
  assertEqual("Random 10‑colour instance", res, true);
}

// Test 4: Depth cut‑off – same instance but too small maxDepth should return false
{
  const tubes = makeRandom(10);
  const res = isSolvable(tubes, 10); // deliberately tiny limit
  assertEqual("Depth cut‑off triggers unsolved", res, false);
}
