import test from "node:test";
import assert from "node:assert/strict";
import { eloChange, expectedScore, whiteScore } from "../src/lib/elo.js";

test("expected score is 0.5 for equal ratings", () => {
  assert.equal(expectedScore(800, 800), 0.5);
});

test("expected scores of two players add up to 1", () => {
  const sum = expectedScore(1200, 800) + expectedScore(800, 1200);
  assert.ok(Math.abs(sum - 1) < 1e-12);
});

test("a 400 point favourite is expected to score about 0.91", () => {
  assert.ok(Math.abs(expectedScore(1200, 800) - 0.9091) < 0.001);
});

test("whiteScore maps results to scores", () => {
  assert.equal(whiteScore("1-0"), 1);
  assert.equal(whiteScore("0-1"), 0);
  assert.equal(whiteScore("½-½"), 0.5);
});

test("a win between equal players moves 16 points each way", () => {
  assert.deepEqual(eloChange(800, 800, "1-0"), { white: 16, black: -16 });
});

test("a draw between equal players changes nothing", () => {
  const { white, black } = eloChange(800, 800, "½-½");
  assert.equal(white + 0, 0);
  assert.equal(black + 0, 0);
});

test("an underdog win gains almost the full K factor", () => {
  assert.deepEqual(eloChange(400, 1500, "1-0"), { white: 32, black: -32 });
});

test("a draw moves the lower rated player up and the higher down", () => {
  const { white, black } = eloChange(400, 1500, "½-½");
  assert.equal(white, 16);
  assert.equal(black, -16);
});

test("black winning mirrors white winning", () => {
  const a = eloChange(1000, 900, "1-0");
  const b = eloChange(900, 1000, "0-1");
  assert.equal(a.white, b.black);
  assert.equal(a.black, b.white);
});

test("rating changes are whole numbers", () => {
  const { white, black } = eloChange(1013, 987, "1-0");
  assert.ok(Number.isInteger(white));
  assert.ok(Number.isInteger(black));
});
