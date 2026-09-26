import bcrypt from "bcryptjs";
import Player from "@/models/Player";
import { handler, json, readBody } from "@/lib/http";
import { resolveStartingRating, validatePlayer } from "@/lib/validate";
import { SKILL_LEVELS } from "@/lib/constants";

const SORTS = {
  rating: { rating: -1, name: 1 },
  name: { name: 1 },
  joined: { joinedAt: -1 },
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/players?q=&skillLevel=&minRating=&maxRating=&sort=rating|name|joined  (organizer)
export const GET = handler(
  async (req) => {
    const sp = req.nextUrl.searchParams;
    const filter = {};
    const q = sp.get("q")?.trim();
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
    const skill = sp.get("skillLevel");
    if (SKILL_LEVELS.includes(skill)) filter.skillLevel = skill;
    const min = Number(sp.get("minRating"));
    const max = Number(sp.get("maxRating"));
    if (sp.get("minRating") && Number.isFinite(min)) filter.rating = { ...filter.rating, $gte: min };
    if (sp.get("maxRating") && Number.isFinite(max)) filter.rating = { ...filter.rating, $lte: max };

    const sort = SORTS[sp.get("sort")] ?? SORTS.rating;
    const players = await Player.find(filter).sort(sort).lean();
    return json({ players });
  },
  { organizerOnly: true }
);

// POST /api/players  (organizer) Register a new club member.
export const POST = handler(
  async (req) => {
    const body = await readBody(req);
    const data = resolveStartingRating(validatePlayer(body, { isCreate: true, allowRole: true }));
    const { password, ...fields } = data;
    const player = await Player.create({
      ...fields,
      rating: fields.startingRating,
      passwordHash: await bcrypt.hash(password, 10),
    });
    const { passwordHash, ...safe } = player.toObject();
    return json({ player: safe }, 201);
  },
  { organizerOnly: true }
);

