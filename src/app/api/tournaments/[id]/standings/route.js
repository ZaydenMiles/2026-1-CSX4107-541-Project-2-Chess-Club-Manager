import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import { assertObjectId, handler, json, notFound } from "@/lib/http";
import { computeStandings } from "@/lib/standings";

// GET /api/tournaments/:id/standings
export const GET = handler(async (req, { params }) => {
  assertObjectId(params.id);
  const tournament = await Tournament.findById(params.id).populate("playerIds", "name rating").lean();
  if (!tournament) throw notFound("Tournament");
  const matches = await Match.find({ tournamentId: tournament._id }, "whitePlayerId blackPlayerId result").lean();
  return json({ standings: computeStandings(tournament.playerIds, matches) });
});
