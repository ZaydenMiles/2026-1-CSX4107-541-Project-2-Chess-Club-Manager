import bcrypt from "bcryptjs";
import Player from "@/models/Player";
import Match from "@/models/Match";
import Tournament from "@/models/Tournament";
import { assertObjectId, handler, HttpError, json, notFound, readBody } from "@/lib/http";
import { resolveStartingRating, validatePlayer } from "@/lib/validate";
import { recalculateAllRatings } from "@/lib/ratings";
import { whiteScore } from "@/lib/elo";

// GET /api/players/:id  Player profile with match history and W/D/L record.
// Organizers can view any player. Members can only view their own profile.
export const GET = handler(async (req, { params, user }) => {
  assertObjectId(params.id);
  if (user.role !== "organizer" && user.id !== params.id) {
    throw new HttpError(403, "Members can only view their own profile.");
  }
  const player = await Player.findById(params.id).lean();
  if (!player) throw notFound("Player");

  const matches = await Match.find({ $or: [{ whitePlayerId: player._id }, { blackPlayerId: player._id }] })
    .populate("whitePlayerId", "name rating")
    .populate("blackPlayerId", "name rating")
    .populate("tournamentId", "name")
    .sort({ playedAt: -1, createdAt: -1 })
    .lean();

  const record = { played: 0, wins: 0, draws: 0, losses: 0 };
  for (const m of matches) {
    const isWhite = String(m.whitePlayerId?._id) === params.id;
    const score = isWhite ? whiteScore(m.result) : 1 - whiteScore(m.result);
    record.played += 1;
    if (score === 1) record.wins += 1;
    else if (score === 0) record.losses += 1;
    else record.draws += 1;
  }

  const tournaments = await Tournament.find({ playerIds: player._id }, "name date status format")
    .sort({ date: -1 })
    .lean();

  return json({ player, record, matches, tournaments });
});

// PUT /api/players/:id  (organizer) Update a player.
export const PUT = handler(
  async (req, { params, user }) => {
    assertObjectId(params.id);
    const player = await Player.findById(params.id);
    if (!player) throw notFound("Player");

    const body = await readBody(req);
    const data = validatePlayer(body, { isCreate: false, allowRole: true });

    if (params.id === user.id && data.role && data.role !== "organizer") {
      throw new HttpError(400, "You cannot remove your own organizer role.");
    }

    const { password, ...fields } = data;
    const merged = resolveStartingRating({
      skillLevel: fields.skillLevel ?? player.skillLevel,
      startingRatingSource: fields.startingRatingSource ?? player.startingRatingSource,
      startingRating: fields.startingRating ?? player.startingRating,
    });
    const ratingChanged = merged.startingRating !== player.startingRating;

    player.set({ ...fields, startingRating: merged.startingRating });
    if (password) player.passwordHash = await bcrypt.hash(password, 10);
    await player.save();

    if (ratingChanged) await recalculateAllRatings();

    const updated = await Player.findById(params.id).lean();
    return json({ player: updated });
  },
  { organizerOnly: true }
);

// DELETE /api/players/:id  (organizer) Remove a player, their matches and tournament registrations.
export const DELETE = handler(
  async (req, { params, user }) => {
    assertObjectId(params.id);
    if (params.id === user.id) throw new HttpError(400, "You cannot delete your own account.");
    const player = await Player.findByIdAndDelete(params.id);
    if (!player) throw notFound("Player");

    const { deletedCount } = await Match.deleteMany({
      $or: [{ whitePlayerId: player._id }, { blackPlayerId: player._id }],
    });
    await Tournament.updateMany({ playerIds: player._id }, { $pull: { playerIds: player._id } });
    if (deletedCount) await recalculateAllRatings();

    return json({ ok: true, deletedMatches: deletedCount });
  },
  { organizerOnly: true }
);
