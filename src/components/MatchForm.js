"use client";

import { useState } from "react";
import { ErrorBox, Field } from "./ui";
import { useApi } from "./useApi";
import { MATCH_RESULTS } from "@/lib/constants";
import { formatResult, toDateInput } from "@/lib/format";

const RESULT_TEXT = { "1-0": "White wins", "0-1": "Black wins", "½-½": "Draw" };

export default function MatchForm({ initial, defaultTournament, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => ({
    tournamentId: initial?.tournamentId?._id ?? initial?.tournamentId ?? defaultTournament ?? "",
    round: initial?.round ?? 1,
    whitePlayerId: initial?.whitePlayerId?._id ?? "",
    blackPlayerId: initial?.blackPlayerId?._id ?? "",
    result: initial?.result ?? "1-0",
    opening: initial?.opening ?? "",
    playedAt: toDateInput(initial?.playedAt ?? new Date()),
  }));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const tournaments = useApi("/tournaments");
  const detail = useApi(form.tournamentId ? `/tournaments/${form.tournamentId}` : null);
  const players = form.tournamentId ? (detail.data?.players ?? []) : [];
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function changeTournament(e) {
    setForm((f) => ({ ...f, tournamentId: e.target.value, whitePlayerId: "", blackPlayerId: "" }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setErrors(err.details || {});
      setError(err);
      setBusy(false);
    }
  }

  const selectable = (tournaments.data?.tournaments ?? []).filter(
    (t) => t.status !== "cancelled" || t._id === form.tournamentId
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <ErrorBox error={error} />
      <div className="grid-2">
        <Field label="Tournament" error={errors.tournamentId} htmlFor="tournamentId">
          <select id="tournamentId" value={form.tournamentId} onChange={changeTournament}>
            <option value="">Select a tournament</option>
            {selectable.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Round" error={errors.round} htmlFor="round">
          <input id="round" type="number" min="1" max="99" value={form.round} onChange={set("round")} />
        </Field>
        <Field label="White" error={errors.whitePlayerId} htmlFor="whitePlayerId">
          <select id="whitePlayerId" value={form.whitePlayerId} onChange={set("whitePlayerId")} disabled={!form.tournamentId}>
            <option value="">{form.tournamentId ? "Select white" : "Choose a tournament first"}</option>
            {players.map((p) => (
              <option key={p._id} value={p._id} disabled={p._id === form.blackPlayerId}>
                {p.name} ({p.rating})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Black" error={errors.blackPlayerId} htmlFor="blackPlayerId">
          <select id="blackPlayerId" value={form.blackPlayerId} onChange={set("blackPlayerId")} disabled={!form.tournamentId}>
            <option value="">{form.tournamentId ? "Select black" : "Choose a tournament first"}</option>
            {players.map((p) => (
              <option key={p._id} value={p._id} disabled={p._id === form.whitePlayerId}>
                {p.name} ({p.rating})
              </option>
            ))}
          </select>
        </Field>
      </div>
      {form.tournamentId && detail.data && players.length < 2 && (
        <p className="notice">This tournament needs at least two registered players before a match can be recorded.</p>
      )}

      <Field label="Result" error={errors.result}>
        <div className="segmented">
          {MATCH_RESULTS.map((r) => (
            <label key={r} className={form.result === r ? "selected" : ""}>
              <input type="radio" name="result" value={r} checked={form.result === r} onChange={set("result")} />
              <strong>{formatResult(r)}</strong>
              <span>{RESULT_TEXT[r]}</span>
            </label>
          ))}
        </div>
      </Field>

      <div className="grid-2">
        <Field label="Opening" error={errors.opening} hint="Optional" htmlFor="opening">
          <input id="opening" value={form.opening} onChange={set("opening")} placeholder="e.g. Sicilian Defence" />
        </Field>
        <Field label="Date played" error={errors.playedAt} htmlFor="playedAt">
          <input id="playedAt" type="date" value={form.playedAt} onChange={set("playedAt")} />
        </Field>
      </div>
      <p className="small muted">Saving updates both players&apos; ratings immediately (Elo, K = 32).</p>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
