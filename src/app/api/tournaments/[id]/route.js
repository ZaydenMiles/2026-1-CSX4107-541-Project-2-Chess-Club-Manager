import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import { assertObjectId, handler, json, notFound, readBody } from "@/lib/http";
import { validateTournament } from "@/lib/validate";
import { computeStandings } from "@/lib/standings";
import { recalculateAllRatings } from "@/lib/ratings";

// GET /api/tournaments/:id  Tournament with participants, matches and standings.
export const GET = handler(async (req, { params }) => {
  assertObjectId(params.id);
  const tournament = await Tournament.findById(params.id)
    .populate("playerIds", "name rating skillLevel")
    .lean();
  if (!tournament) throw notFound("Tournament");

  const matches = await Match.find({ tournamentId: tournament._id })
    .populate("whitePlayerId", "name rating")
    .populate("blackPlayerId", "name rating")
    .sort({ round: 1, playedAt: 1, createdAt: 1 })
    .lean();

  const players = tournament.playerIds;
  return json({ tournament, players, matches, standings: computeStandings(players, matches) });
});

// PUT /api/tournaments/:id  (organizer)
export const PUT = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    const data = validateTournament(await readBody(req), { isCreate: false });
    const tournament = await Tournament.findByIdAndUpdate(params.id, data, { returnDocument: "after", runValidators: true });
    if (!tournament) throw notFound("Tournament");
    return json({ tournament });
  },
  { organizerOnly: true }
);

// DELETE /api/tournaments/:id  (organizer) Deletes the tournament and all of its matches.
export const DELETE = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    const tournament = await Tournament.findByIdAndDelete(params.id);
    if (!tournament) throw notFound("Tournament");
    const { deletedCount } = await Match.deleteMany({ tournamentId: tournament._id });
    if (deletedCount) await recalculateAllRatings();
    return json({ ok: true, deletedMatches: deletedCount });
  },
  { organizerOnly: true }
);
