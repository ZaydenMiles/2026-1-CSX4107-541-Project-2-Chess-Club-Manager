import test from "node:test";
import assert from "node:assert/strict";
import { computeStandings } from "../src/lib/standings.js";

const players = [
  { _id: "a", name: "Alice", rating: 900 },
  { _id: "b", name: "Bob", rating: 1000 },
  { _id: "c", name: "Cara", rating: 800 },
];

const match = (white, black, result) => ({ whitePlayerId: white, blackPlayerId: black, result });

test("players with no matches appear with zero points", () => {
  const rows = computeStandings(players, []);
  assert.equal(rows.length, 3);
  assert.ok(rows.every((r) => r.played === 0 && r.points === 0));
});

test("win gives 1 point, loss 0, draw 0.5", () => {
  const rows = computeStandings(players, [match("a", "b", "1-0"), match("b", "c", "½-½")]);
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.equal(by.Alice.points, 1);
  assert.equal(by.Bob.points, 0.5);
  assert.equal(by.Cara.points, 0.5);
  assert.equal(by.Alice.wins, 1);
  assert.equal(by.Bob.losses, 1);
  assert.equal(by.Bob.draws, 1);
  assert.equal(by.Bob.played, 2);
});

test("players are ranked by points, highest first", () => {
  const rows = computeStandings(players, [match("c", "a", "1-0"), match("c", "b", "1-0")]);
  assert.equal(rows[0].name, "Cara");
  assert.equal(rows[0].rank, 1);
  assert.equal(rows[0].points, 2);
});

test("equal points are ranked by higher current rating", () => {
  const rows = computeStandings(players, [match("a", "b", "½-½")]);
  assert.equal(rows[0].name, "Bob");
  assert.equal(rows[1].name, "Alice");
  assert.equal(rows[2].name, "Cara");
});

test("ranks run from 1 in order", () => {
  const rows = computeStandings(players, [match("a", "b", "1-0")]);
  assert.deepEqual(rows.map((r) => r.rank), [1, 2, 3]);
});

test("matches with populated player documents are counted", () => {
  const populated = {
    whitePlayerId: { _id: "a", name: "Alice" },
    blackPlayerId: { _id: "b", name: "Bob" },
    result: "0-1",
  };
  const rows = computeStandings(players, [populated]);
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.equal(by.Bob.points, 1);
  assert.equal(by.Alice.points, 0);
});

test("results for players who are not registered are ignored", () => {
  const rows = computeStandings(players, [match("a", "zzz", "1-0")]);
  assert.equal(rows.length, 3);
  assert.equal(rows.find((r) => r.name === "Alice").points, 1);
});
