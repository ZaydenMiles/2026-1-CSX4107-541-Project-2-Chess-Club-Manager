import mongoose from "mongoose";
import Match from "@/models/Match";
import { handler, json, readBody } from "@/lib/http";
import { validateMatch } from "@/lib/validate";
import { assertMatchContext } from "@/lib/matchContext";
import { recalculateAllRatings } from "@/lib/ratings";

// GET /api/matches?tournament=&round=&player=&limit=  (organizer)
export const GET = handler(
  async (req) => {
    const sp = req.nextUrl.searchParams;
    const filter = {};
    const tournament = sp.get("tournament");
    if (tournament && mongoose.isValidObjectId(tournament)) filter.tournamentId = tournament;
    const round = Number(sp.get("round"));
    if (sp.get("round") && Number.isInteger(round)) filter.round = round;
    const player = sp.get("player");
    if (player && mongoose.isValidObjectId(player)) {
      filter.$or = [{ whitePlayerId: player }, { blackPlayerId: player }];
    }
    const limit = Math.min(Number(sp.get("limit")) || 500, 500);

    const matches = await Match.find(filter)
      .populate("whitePlayerId", "name rating")
      .populate("blackPlayerId", "name rating")
      .populate("tournamentId", "name")
      .sort({ playedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return json({ matches });
  },
  { organizerOnly: true }
);

// POST /api/matches  (organizer) Record a result. Ratings update immediately.
export const POST = handler(
  async (req) => {
    const data = validateMatch(await readBody(req), { isCreate: true });
    await assertMatchContext(data);
    const match = await Match.create(data);
    await recalculateAllRatings();
    const saved = await Match.findById(match._id).lean();
    return json({ match: saved }, 201);
  },
  { organizerOnly: true }
);
