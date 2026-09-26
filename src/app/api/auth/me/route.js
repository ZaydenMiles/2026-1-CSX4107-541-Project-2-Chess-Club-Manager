import { handler, json } from "@/lib/http";

// GET /api/auth/me  Returns the logged-in user.
export const GET = handler(async (req, { user }) => json({ user }));
