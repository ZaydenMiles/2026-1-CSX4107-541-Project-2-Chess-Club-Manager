import { FORMAT_LABELS, RESULT_LABELS } from "./constants.js";

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// yyyy-mm-dd for <input type="date">
export function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatResult(result) {
  return RESULT_LABELS[result] ?? result;
}

export function formatFormat(format) {
  return FORMAT_LABELS[format] ?? format;
}

export function formatPoints(points) {
  return Number.isInteger(points) ? String(points) : `${Math.floor(points) || ""}½`;
}

export function signed(n) {
  if (n > 0) return `+${n}`;
  return String(n);
}

export function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : "";
}
