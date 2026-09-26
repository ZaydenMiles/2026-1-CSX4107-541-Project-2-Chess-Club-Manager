import { HttpError } from "./http.js";
import {
  MATCH_RESULTS,
  RATING_SOURCES,
  ROLES,
  SKILL_DEFAULT_RATING,
  SKILL_LEVELS,
  TOURNAMENT_FORMATS,
  TOURNAMENT_STATUSES,
} from "./constants.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

function fail(errors) {
  if (Object.keys(errors).length) throw new HttpError(400, "Please fix the highlighted fields.", errors);
}

/*
 * Validates player input. On create, password and rating fields are required.
 * On update, any omitted field keeps its current value.
 * `allowRole` controls whether the caller may set the role (organizers only).
 */
export function validatePlayer(body, { isCreate, allowRole }) {
  const errors = {};
  const out = {};

  if (isCreate || body.name !== undefined) {
    out.name = str(body.name);
    if (!out.name) errors.name = "Name is required.";
    else if (out.name.length > 80) errors.name = "Name is too long.";
  }
  if (isCreate || body.email !== undefined) {
    out.email = str(body.email).toLowerCase();
    if (!EMAIL_RE.test(out.email)) errors.email = "Enter a valid email address.";
  }
  if (isCreate || (body.password !== undefined && body.password !== "")) {
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    out.password = password;
  }
  if (body.studentYear !== undefined && body.studentYear !== "" && body.studentYear !== null) {
    const y = Number(body.studentYear);
    if (!Number.isInteger(y) || y < 1 || y > 8) errors.studentYear = "Student year must be between 1 and 8.";
    else out.studentYear = y;
  } else if (body.studentYear === "" || body.studentYear === null) {
    out.studentYear = undefined;
  }
  if (isCreate || body.skillLevel !== undefined) {
    if (!SKILL_LEVELS.includes(body.skillLevel)) errors.skillLevel = "Choose a skill level.";
    else out.skillLevel = body.skillLevel;
  }
  if (allowRole && body.role !== undefined) {
    if (!ROLES.includes(body.role)) errors.role = "Invalid role.";
    else out.role = body.role;
  }

  if (isCreate || body.startingRatingSource !== undefined) {
    const source = body.startingRatingSource ?? "skill-default";
    if (!RATING_SOURCES.includes(source)) errors.startingRatingSource = "Invalid rating source.";
    else out.startingRatingSource = source;
    if (source === "manual-entry") {
      const r = Number(body.manualRating);
      if (body.manualRating === "" || !Number.isFinite(r) || r < 100 || r > 3500) {
        errors.manualRating = "Enter a rating between 100 and 3500.";
      } else {
        out.startingRating = Math.round(r);
      }
    }
  }

  fail(errors);
  return out;
}

// Fills in the starting rating from the skill level when the skill-default source is used.
export function resolveStartingRating(data) {
  if (data.startingRatingSource === "skill-default" && data.skillLevel) {
    data.startingRating = SKILL_DEFAULT_RATING[data.skillLevel];
  }
  return data;
}

export function validateTournament(body, { isCreate }) {
  const errors = {};
  const out = {};

  if (isCreate || body.name !== undefined) {
    out.name = str(body.name);
    if (!out.name) errors.name = "Name is required.";
  }
  if (body.description !== undefined) out.description = str(body.description);
  if (isCreate || body.format !== undefined) {
    if (!TOURNAMENT_FORMATS.includes(body.format)) errors.format = "Choose a format.";
    else out.format = body.format;
  }
  if (isCreate || body.timeControl !== undefined) {
    out.timeControl = str(body.timeControl);
    if (!out.timeControl) errors.timeControl = "Time control is required.";
  }
  if (isCreate || body.date !== undefined) {
    const d = new Date(body.date);
    if (!body.date || Number.isNaN(d.getTime())) errors.date = "Enter a valid date.";
    else out.date = d;
  }
  if (isCreate || body.location !== undefined) {
    out.location = str(body.location);
    if (!out.location) errors.location = "Location is required.";
  }
  if (body.status !== undefined) {
    if (!TOURNAMENT_STATUSES.includes(body.status)) errors.status = "Invalid status.";
    else out.status = body.status;
  }

  fail(errors);
  return out;
}

export function validateMatch(body, { isCreate }) {
  const errors = {};
  const out = {};

  for (const key of ["tournamentId", "whitePlayerId", "blackPlayerId"]) {
    if (isCreate || body[key] !== undefined) {
      if (!str(body[key])) errors[key] = "Required.";
      else out[key] = str(body[key]);
    }
  }
  if (isCreate || body.round !== undefined) {
    const r = Number(body.round);
    if (!Number.isInteger(r) || r < 1 || r > 99) errors.round = "Round must be a whole number from 1 to 99.";
    else out.round = r;
  }
  if (isCreate || body.result !== undefined) {
    // Accept the ASCII form as well, since "½" is awkward to type in API clients.
    const result = body.result === "1/2-1/2" ? "½-½" : body.result;
    if (!MATCH_RESULTS.includes(result)) errors.result = "Choose a result.";
    else out.result = result;
  }
  if (body.opening !== undefined) out.opening = str(body.opening);
  if (body.playedAt !== undefined && body.playedAt !== "") {
    const d = new Date(body.playedAt);
    if (Number.isNaN(d.getTime())) errors.playedAt = "Enter a valid date.";
    else out.playedAt = d;
  }

  fail(errors);
  return out;
}
