import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import { assertObjectId, handler, HttpError, json, notFound } from "@/lib/http";

// DELETE /api/tournaments/:id/players/:playerId  (organizer) Unregister a player.
export const DELETE = handler(
  async (req, { params }) => {
    assertObjectId(params.id);
    assertObjectId(params.playerId, "player");
    const hasMatches = await Match.exists({
      tournamentId: params.id,
      $or: [{ whitePlayerId: params.playerId }, { blackPlayerId: params.playerId }],
    });
    if (hasMatches) {
      throw new HttpError(409, "This player has recorded matches in this tournament. Delete those matches first.");
    }
    const tournament = await Tournament.findByIdAndUpdate(
      params.id,
      { $pull: { playerIds: params.playerId } },
      { returnDocument: "after" }
    );
    if (!tournament) throw notFound("Tournament");
    return json({ tournament });
  },
  { organizerOnly: true }
);
