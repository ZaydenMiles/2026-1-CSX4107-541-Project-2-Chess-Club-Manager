import Tournament from "@/models/Tournament";
import { handler, json, readBody } from "@/lib/http";
import { validateTournament } from "@/lib/validate";
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from "@/lib/constants";

// GET /api/tournaments?status=&format=&q=
export const GET = handler(async (req) => {
  const sp = req.nextUrl.searchParams;
  const filter = {};
  const status = sp.get("status");
  if (TOURNAMENT_STATUSES.includes(status)) filter.status = status;
  const format = sp.get("format");
  if (TOURNAMENT_FORMATS.includes(format)) filter.format = format;
  const q = sp.get("q")?.trim();
  if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

  const tournaments = await Tournament.find(filter).sort({ date: -1 }).lean();
  return json({ tournaments });
});

// POST /api/tournaments  (organizer)
export const POST = handler(
  async (req) => {
    const data = validateTournament(await readBody(req), { isCreate: true });
    const tournament = await Tournament.create(data);
    return json({ tournament }, 201);
  },
  { organizerOnly: true }
);
