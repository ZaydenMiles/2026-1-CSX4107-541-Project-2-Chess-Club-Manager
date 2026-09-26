import Player from "@/models/Player";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import { handler, json } from "@/lib/http";

// GET /api/dashboard  Summary for the home page.
export const GET = handler(async () => {
  const [counts, upcoming, topPlayers, recentMatches] = await Promise.all([
    Promise.all([Player.countDocuments(), Tournament.countDocuments(), Match.countDocuments()]),
    Tournament.find({ status: "upcoming" })
      .sort({ date: 1 })
      .limit(5)
      .lean(),
    Player.find({}, "name rating skillLevel").sort({ rating: -1, name: 1 }).limit(5).lean(),
    Match.find()
      .populate("whitePlayerId", "name")
      .populate("blackPlayerId", "name")
      .populate("tournamentId", "name")
      .sort({ playedAt: -1, createdAt: -1 })
      .limit(6)
      .lean(),
  ]);
  const [players, tournaments, matches] = counts;
  return json({ stats: { players, tournaments, matches }, upcoming, topPlayers, recentMatches });
});
