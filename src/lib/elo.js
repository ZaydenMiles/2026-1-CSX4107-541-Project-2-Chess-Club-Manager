import { K_FACTOR } from "./constants.js";

// Expected score for a player rated `ra` against a player rated `rb`.
export function expectedScore(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

// Score for white given a result string. Black's score is 1 minus this.
export function whiteScore(result) {
  if (result === "1-0") return 1;
  if (result === "0-1") return 0;
  return 0.5;
}

// Returns the rounded rating changes for both players.
export function eloChange(whiteRating, blackRating, result, k = K_FACTOR) {
  const sw = whiteScore(result);
  const ew = expectedScore(whiteRating, blackRating);
  const eb = expectedScore(blackRating, whiteRating);
  return {
    white: Math.round(k * (sw - ew)),
    black: Math.round(k * (1 - sw - eb)),
  };
}
