import { whiteScore } from "./elo.js";

/*
 * Builds a tournament standings table.
 * players: registered players ({ _id, name, rating })
 * matches: matches in this tournament
 * Win = 1, draw = 0.5, loss = 0. Ties on points are broken by current rating.
 */
export function computeStandings(players, matches) {
  const rows = new Map(
    players.map((p) => [
      String(p._id),
      { playerId: String(p._id), name: p.name, rating: p.rating, played: 0, wins: 0, draws: 0, losses: 0, points: 0 },
    ])
  );

  const apply = (id, score) => {
    const row = rows.get(String(id));
    if (!row) return;
    row.played += 1;
    row.points += score;
    if (score === 1) row.wins += 1;
    else if (score === 0) row.losses += 1;
    else row.draws += 1;
  };

  for (const m of matches) {
    const sw = whiteScore(m.result);
    apply(m.whitePlayerId?._id ?? m.whitePlayerId, sw);
    apply(m.blackPlayerId?._id ?? m.blackPlayerId, 1 - sw);
  }

  return [...rows.values()]
    .sort((a, b) => b.points - a.points || b.rating - a.rating || a.name.localeCompare(b.name))
    .map((row, i) => ({ rank: i + 1, ...row }));
}
