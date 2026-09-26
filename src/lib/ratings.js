import Match from "../models/Match.js";
import Player from "../models/Player.js";
import { eloChange } from "./elo.js";

/*
 * Rebuilds every player's rating from their starting rating by replaying all matches
 * in the order they were played. Called after any match is created, edited or deleted
 * (and after a player's starting rating changes), so edits and deletions are always
 * reflected correctly, including in the rating changes stored on later matches.
 */
export async function recalculateAllRatings() {
  const players = await Player.find({}, { startingRating: 1 }).lean();
  const ratings = new Map(players.map((p) => [String(p._id), p.startingRating]));

  const matches = await Match.find({}, { whitePlayerId: 1, blackPlayerId: 1, result: 1 })
    .sort({ playedAt: 1, createdAt: 1, _id: 1 })
    .lean();

  const matchOps = [];
  for (const m of matches) {
    const w = String(m.whitePlayerId);
    const b = String(m.blackPlayerId);
    if (!ratings.has(w) || !ratings.has(b)) continue;
    const change = eloChange(ratings.get(w), ratings.get(b), m.result);
    ratings.set(w, ratings.get(w) + change.white);
    ratings.set(b, ratings.get(b) + change.black);
    matchOps.push({
      updateOne: {
        filter: { _id: m._id },
        update: { $set: { ratingChangeWhite: change.white, ratingChangeBlack: change.black } },
      },
    });
  }

  const playerOps = [...ratings].map(([id, rating]) => ({
    updateOne: { filter: { _id: id }, update: { $set: { rating } } },
  }));

  if (matchOps.length) await Match.bulkWrite(matchOps, { timestamps: false });
  if (playerOps.length) await Player.bulkWrite(playerOps, { timestamps: false });
}
