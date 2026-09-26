export const ROLES = ["organizer", "member"];

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];

// Starting rating assigned by skill level when no manual rating is entered.
export const SKILL_DEFAULT_RATING = {
  beginner: 400,
  intermediate: 800,
  advanced: 1200,
};

export const RATING_SOURCES = ["skill-default", "manual-entry"];

export const TOURNAMENT_FORMATS = ["swiss", "round-robin", "knockout"];

export const TOURNAMENT_STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];

export const MATCH_RESULTS = ["1-0", "0-1", "½-½"];

export const RESULT_LABELS = {
  "1-0": "1-0",
  "0-1": "0-1",
  "½-½": "½-½",
};

export const FORMAT_LABELS = {
  swiss: "Swiss",
  "round-robin": "Round Robin",
  knockout: "Knockout",
};

export const K_FACTOR = 32;
