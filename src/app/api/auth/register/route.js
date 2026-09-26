import bcrypt from "bcryptjs";
import Player from "@/models/Player";
import { handler, json, readBody } from "@/lib/http";
import { resolveStartingRating, validatePlayer } from "@/lib/validate";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

// POST /api/auth/register  Self sign-up. New accounts are always members.
export const POST = handler(
  async (req) => {
    const body = await readBody(req);
    const data = resolveStartingRating(validatePlayer(body, { isCreate: true, allowRole: false }));
    const { password, ...fields } = data;
    const player = await Player.create({
      ...fields,
      role: "member",
      rating: fields.startingRating,
      passwordHash: await bcrypt.hash(password, 10),
    });

    const res = json({ user: { id: String(player._id), name: player.name, role: player.role } }, 201);
    res.cookies.set(SESSION_COOKIE, await createSessionToken(player._id), sessionCookieOptions());
    return res;
  },
  { auth: false }
);
