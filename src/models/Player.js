import mongoose from "mongoose";
import { RATING_SOURCES, ROLES, SKILL_LEVELS } from "../lib/constants.js";

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "member" },
    studentYear: { type: Number, min: 1, max: 8 },
    skillLevel: { type: String, enum: SKILL_LEVELS, required: true },
    startingRatingSource: { type: String, enum: RATING_SOURCES, default: "skill-default" },
    // Rating assigned at registration. Current rating is always derived from this by replaying matches.
    startingRating: { type: Number, required: true, min: 0, max: 3500 },
    rating: { type: Number, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PlayerSchema.index({ name: "text" });

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema);
