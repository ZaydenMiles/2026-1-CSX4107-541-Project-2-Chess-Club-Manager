import mongoose from "mongoose";
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from "../lib/constants.js";

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    format: { type: String, enum: TOURNAMENT_FORMATS, required: true },
    timeControl: { type: String, required: true, trim: true, maxlength: 40 },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: TOURNAMENT_STATUSES, default: "upcoming" },
    playerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  },
  { timestamps: true }
);

export default mongoose.models.Tournament || mongoose.model("Tournament", TournamentSchema);
