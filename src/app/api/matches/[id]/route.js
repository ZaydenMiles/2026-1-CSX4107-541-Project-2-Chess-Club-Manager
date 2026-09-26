import Match from "@/models/Match";
import { assertObjectId, handler, json, notFound, readBody } from "@/lib/http";
import { validateMatch } from "@/lib/validate";
import { assertMatchContext } from "@/lib/matchContext";
import { recalculateAllRatings } from "@/lib/ratings";

// GET /api/matches/:id  (organizer)
export const GET = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    const match = await Match.findById(params.id)
      .populate("whitePlayerId", "name rating")
      .populate("blackPlayerId", "name rating")
      .populate("tournamentId", "name")
      .lean();
    if (!match) throw notFound("Match");
    return json({ match });
  },
  { organizerOnly: true }
);

// PUT /api/matches/:id  (organizer) Edit a result. All ratings are recalculated.
export const PUT = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    const match = await Match.findById(params.id);
    if (!match) throw notFound("Match");
    const data = validateMatch(await readBody(req), { isCreate: false });
    await assertMatchContext({
      tournamentId: data.tournamentId ?? match.tournamentId,
      whitePlayerId: data.whitePlayerId ?? match.whitePlayerId,
      blackPlayerId: data.blackPlayerId ?? match.blackPlayerId,
    });
    match.set(data);
    await match.save();
    await recalculateAllRatings();
    return json({ match: await Match.findById(params.id).lean() });
  },
  { organizerOnly: true }
);

// DELETE /api/matches/:id  (organizer) Remove a result. Rating changes are reversed.
export const DELETE = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    const match = await Match.findByIdAndDelete(params.id);
    if (!match) throw notFound("Match");
    await recalculateAllRatings();
    return json({ ok: true });
  },
  { organizerOnly: true }
);
