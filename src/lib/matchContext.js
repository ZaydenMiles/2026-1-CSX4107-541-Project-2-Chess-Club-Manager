import Tournament from "@/models/Tournament";
import { HttpError, notFound } from "@/lib/http";
import mongoose from "mongoose";

// Checks that both players are different and registered in the tournament.
export async function assertMatchContext({ tournamentId, whitePlayerId, blackPlayerId }) {
  for (const [label, id] of [["tournament", tournamentId], ["white player", whitePlayerId], ["black player", blackPlayerId]]) {
    if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Invalid ${label}.`);
  }
  if (String(whitePlayerId) === String(blackPlayerId)) {
    throw new HttpError(400, "White and black must be different players.", { blackPlayerId: "Pick a different player." });
  }
  const tournament = await Tournament.findById(tournamentId).lean();
  if (!tournament) throw notFound("Tournament");
  if (tournament.status === "cancelled") throw new HttpError(400, "Cannot record matches in a cancelled tournament.");
  const registered = new Set(tournament.playerIds.map(String));
  const errors = {};
  if (!registered.has(String(whitePlayerId))) errors.whitePlayerId = "Not registered in this tournament.";
  if (!registered.has(String(blackPlayerId))) errors.blackPlayerId = "Not registered in this tournament.";
  if (Object.keys(errors).length) throw new HttpError(400, "Both players must be registered in the tournament.", errors);
}
