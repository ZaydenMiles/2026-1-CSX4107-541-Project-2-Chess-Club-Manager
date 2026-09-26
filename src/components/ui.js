"use client";

import Link from "next/link";
import { useState } from "react";
import { capitalize, formatResult } from "@/lib/format";
import { useAuth } from "./AuthProvider";

export function PageHeader({ title, eyebrow, lede, back, actions, monogram }) {
  return (
    <div className="page-head">
      <div>
        {back && (
          <Link href={back.href} className="back-link">
            {back.label}
          </Link>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <div className="title-row">
          {monogram}
          <h1>{title}</h1>
        </div>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export function Loading({ label = "Loading..." }) {
  return <p className="loading">{label}</p>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="notice notice-error" role="alert">
      {error.message || String(error)}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

const TILE_COLOURS = ["#1f2d5c", "#2f5d9a", "#4a5670", "#6b2f4a", "#a88230", "#2f6b55"];

function initials(name = "") {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Coloured square with initials. The colour is stable for a given seed.
export function Monogram({ name, seed, size = "" }) {
  const key = String(seed ?? name);
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span className={`monogram ${size}`} style={{ background: TILE_COLOURS[hash % TILE_COLOURS.length] }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={`tag dot status-${status}`}>{capitalize(status)}</span>;
}

export function SkillBadge({ level }) {
  return <span className="tag">{capitalize(level)}</span>;
}

export function Tag({ children, className = "" }) {
  return <span className={`tag ${className}`}>{children}</span>;
}

export function ResultBadge({ result }) {
  const cls = result === "1-0" ? "white-win" : result === "0-1" ? "black-win" : "draw";
  return <span className={`result ${cls}`}>{formatResult(result)}</span>;
}

// Player name that links to the profile when the viewer may open it:
// organizers can open any profile, members only their own.
export function PlayerLink({ player, id, name, className = "plain-link", textClassName = "" }) {
  const { user, isOrganizer } = useAuth();
  const playerId = String(player?._id ?? id ?? "");
  const playerName = player?.name ?? name;
  if (!playerId || !playerName) return <span className="muted">Deleted player</span>;
  if (!isOrganizer && user?.id !== playerId) return <span className={textClassName}>{playerName}</span>;
  return (
    <Link href={`/players/${playerId}`} className={className}>
      {playerName}
    </Link>
  );
}

// A delete button that asks for confirmation first.
export function DeleteButton({ onDelete, confirmText, label = "Delete", className = "" }) {
  const [busy, setBusy] = useState(false);
  async function click() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button type="button" className={`btn btn-danger ${className}`} onClick={click} disabled={busy}>
      {busy ? "Deleting..." : label}
    </button>
  );
}
