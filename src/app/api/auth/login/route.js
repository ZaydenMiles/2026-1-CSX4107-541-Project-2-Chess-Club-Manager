import bcrypt from "bcryptjs";
import Player from "@/models/Player";
import { handler, HttpError, json, readBody } from "@/lib/http";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

// POST /api/auth/login  { email, password }
export const POST = handler(
  async (req) => {
    const { email, password } = await readBody(req);
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      throw new HttpError(400, "Email and password are required.");
    }
    const player = await Player.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    const ok = player && (await bcrypt.compare(password, player.passwordHash));
    if (!ok) throw new HttpError(401, "Incorrect email or password.");

    const res = json({ user: { id: String(player._id), name: player.name, role: player.role } });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(player._id), sessionCookieOptions());
    return res;
  },
  { auth: false }
);
