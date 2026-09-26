import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import { SESSION_COOKIE, verifySessionToken } from "./session.js";
import Player from "../models/Player.js";

/*
 * Returns the logged-in player (without passwordHash) or null.
 * The role is always read from the database, so role changes take effect immediately.
 */
export async function getCurrentUser() {
  const store = await cookies();
  const payload = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload?.sub || !mongoose.isValidObjectId(payload.sub)) return null;
  await connectDB();
  const player = await Player.findById(payload.sub).lean();
  if (!player) return null;
  return {
    id: String(player._id),
    name: player.name,
    email: player.email,
    role: player.role,
  };
}
