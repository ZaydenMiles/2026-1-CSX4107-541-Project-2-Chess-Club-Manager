import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import { getCurrentUser } from "./auth.js";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

/*
 * Wraps a route handler: connects to the database, enforces authentication
 * (and the organizer role when `organizerOnly` is set), and turns thrown
 * errors into JSON responses.
 */
export function handler(fn, { auth = true, organizerOnly = false } = {}) {
  return async (req, ctx) => {
    try {
      await connectDB();
      let user = null;
      if (auth || organizerOnly) {
        user = await getCurrentUser();
        if (!user) throw new HttpError(401, "You must be logged in.");
        if (organizerOnly && user.role !== "organizer") {
          throw new HttpError(403, "Only organizers can perform this action.");
        }
      }
      const params = ctx?.params ? await ctx.params : {};
      return await fn(req, { params, user });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

function errorResponse(err) {
  if (err instanceof HttpError) {
    return json({ error: err.message, details: err.details }, err.status);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return json({ error: "Validation failed.", details }, 400);
  }
  if (err instanceof mongoose.Error.CastError) {
    return json({ error: `Invalid value for ${err.path}.` }, 400);
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
    return json({ error: `That ${field} is already in use.` }, 409);
  }
  console.error(err);
  return json({ error: "Something went wrong on the server." }, 500);
}

export async function readBody(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

export function assertObjectId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Invalid ${label}.`);
}

export function notFound(what) {
  return new HttpError(404, `${what} not found.`);
}
