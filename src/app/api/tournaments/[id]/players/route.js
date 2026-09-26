import Tournament from "@/models/Tournament";
import Player from "@/models/Player";
import { assertObjectId, handler, HttpError, json, notFound, readBody } from "@/lib/http";

// POST /api/tournaments/:id/players  (organizer) { playerId }  Register a player.
export const POST = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    const { playerId } = await readBody(req);
    assertObjectId(playerId, "player");
    const tournament = await Tournament.findById(params.id);
    if (!tournament) throw notFound("Tournament");
    if (["completed", "cancelled"].includes(tournament.status)) {
      throw new HttpError(400, `Cannot register players in a ${tournament.status} tournament.`);
    }
    if (!(await Player.exists({ _id: playerId }))) throw notFound("Player");
    if (tournament.playerIds.some((id) => String(id) === playerId)) {
      throw new HttpError(409, "Player is already registered.");
    }
    tournament.playerIds.push(playerId);
    await tournament.save();
    return json({ tournament }, 201);
  },
  { organizerOnly: true }
);
