/*
 * Seeds the database with an organizer account and sample data.
 *   npm run seed            (uses .env.local)
 *   npm run seed -- --reset (clears existing players, tournaments and matches first)
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Player from "../src/models/Player.js";
import Tournament from "../src/models/Tournament.js";
import Match from "../src/models/Match.js";
import { recalculateAllRatings } from "../src/lib/ratings.js";
import { SKILL_DEFAULT_RATING } from "../src/lib/constants.js";

const reset = process.argv.includes("--reset");

const PLAYERS = [
  { name: "Club Organizer", email: "organizer@chessclub.test", password: "organizer123", role: "organizer", skillLevel: "advanced", studentYear: 4 },
  { name: "Member Demo", email: "member@chessclub.test", password: "member123", skillLevel: "intermediate", studentYear: 2 },
  { name: "Aung Kyaw", email: "aung@chessclub.test", skillLevel: "advanced", manual: 1450, studentYear: 3 },
  { name: "Mia Chen", email: "mia@chessclub.test", skillLevel: "advanced", studentYear: 4 },
  { name: "Daniel Park", email: "daniel@chessclub.test", skillLevel: "intermediate", manual: 1010, studentYear: 2 },
  { name: "Sofia Rossi", email: "sofia@chessclub.test", skillLevel: "intermediate", studentYear: 1 },
  { name: "Nara Suksawat", email: "nara@chessclub.test", skillLevel: "beginner", studentYear: 1 },
  { name: "Leo Martins", email: "leo@chessclub.test", skillLevel: "beginner", studentYear: 2 },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(18, 0, 0, 0);
  return d;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);

  if (reset) {
    await Promise.all([Player.deleteMany({}), Tournament.deleteMany({}), Match.deleteMany({})]);
    console.log("Cleared existing data.");
  } else if (await Player.exists({})) {
    console.log("Database already has players. Run with --reset to replace them.");
    await mongoose.disconnect();
    return;
  }

  const defaultHash = await bcrypt.hash("player123", 10);
  const players = [];
  for (const [i, p] of PLAYERS.entries()) {
    const startingRating = p.manual ?? SKILL_DEFAULT_RATING[p.skillLevel];
    players.push(
      await Player.create({
        name: p.name,
        email: p.email,
        passwordHash: p.password ? await bcrypt.hash(p.password, 10) : defaultHash,
        role: p.role ?? "member",
        studentYear: p.studentYear,
        skillLevel: p.skillLevel,
        startingRatingSource: p.manual ? "manual-entry" : "skill-default",
        startingRating,
        rating: startingRating,
        joinedAt: daysFromNow(-120 + i * 5),
      })
    );
  }
  const [org, member, aung, mia, daniel, sofia, nara, leo] = players;

  const autumn = await Tournament.create({
    name: "Autumn Rapid Championship",
    description: "Season opener. Four rounds of rapid chess, Swiss pairings.",
    format: "swiss",
    timeControl: "Rapid 15+10",
    date: daysFromNow(-40),
    location: "Student Union, Room 204",
    status: "completed",
    playerIds: [org, member, aung, mia, daniel, sofia].map((p) => p._id),
  });
  const blitz = await Tournament.create({
    name: "Friday Blitz Night",
    description: "Casual round robin blitz. Everyone plays everyone.",
    format: "round-robin",
    timeControl: "Blitz 5+0",
    date: daysFromNow(-2),
    location: "Library Cafe",
    status: "ongoing",
    playerIds: [member, daniel, sofia, nara, leo].map((p) => p._id),
  });
  await Tournament.create({
    name: "Inter-Faculty Knockout Cup",
    description: "Single elimination cup. Registration open until the week before.",
    format: "knockout",
    timeControl: "Rapid 10+0",
    date: daysFromNow(14),
    location: "Main Hall",
    status: "upcoming",
    playerIds: [org, aung, mia, daniel].map((p) => p._id),
  });
  await Tournament.create({
    name: "Beginner Welcome Swiss",
    description: "A friendly event for new members.",
    format: "swiss",
    timeControl: "Rapid 15+10",
    date: daysFromNow(28),
    location: "Student Union, Room 204",
    status: "upcoming",
    playerIds: [nara, leo, sofia].map((p) => p._id),
  });

  const games = [
    // Autumn Rapid Championship
    [autumn, 1, aung, member, "1-0", "Queen's Gambit Declined", -40],
    [autumn, 1, mia, daniel, "1-0", "Sicilian Defence", -40],
    [autumn, 1, org, sofia, "½-½", "Italian Game", -40],
    [autumn, 2, daniel, aung, "0-1", "King's Indian Defence", -39],
    [autumn, 2, sofia, mia, "0-1", "French Defence", -39],
    [autumn, 2, member, org, "½-½", "London System", -39],
    [autumn, 3, aung, mia, "½-½", "Ruy Lopez", -38],
    [autumn, 3, org, daniel, "1-0", "Caro-Kann Defence", -38],
    [autumn, 3, member, sofia, "1-0", "Scandinavian Defence", -38],
    [autumn, 4, mia, org, "1-0", "English Opening", -37],
    [autumn, 4, sofia, aung, "0-1", "Pirc Defence", -37],
    [autumn, 4, daniel, member, "½-½", "Slav Defence", -37],
    // Friday Blitz Night
    [blitz, 1, member, nara, "1-0", "Italian Game", -2],
    [blitz, 1, daniel, leo, "1-0", "Sicilian Defence", -2],
    [blitz, 2, sofia, daniel, "½-½", "Queen's Gambit Accepted", -2],
    [blitz, 2, leo, nara, "0-1", "Scotch Game", -2],
    [blitz, 3, nara, sofia, "1-0", "Vienna Game", -2],
  ];
  for (const [t, round, white, black, result, opening, day] of games) {
    await Match.create({
      tournamentId: t._id,
      round,
      whitePlayerId: white._id,
      blackPlayerId: black._id,
      result,
      opening,
      playedAt: daysFromNow(day),
    });
  }

  await recalculateAllRatings();
  console.log(`Seeded ${players.length} players, 4 tournaments and ${games.length} matches.`);
  console.log("Organizer login: organizer@chessclub.test / organizer123");
  console.log("Member login:    member@chessclub.test / member123");
  console.log("Other sample players use the password player123");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
