import mongoose from "mongoose";
import { MATCH_RESULTS } from "../lib/constants.js";

const MatchSchema = new mongoose.Schema(
  {
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    whitePlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    blackPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    round: { type: Number, required: true, min: 1 },
    result: { type: String, enum: MATCH_RESULTS, required: true },
    ratingChangeWhite: { type: Number, default: 0 },
    ratingChangeBlack: { type: Number, default: 0 },
    opening: { type: String, trim: true, maxlength: 120, default: "" },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
