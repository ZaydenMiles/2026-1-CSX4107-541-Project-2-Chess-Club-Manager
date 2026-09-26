"use client";

import { useState } from "react";
import { Field, ErrorBox } from "./ui";
import { SKILL_DEFAULT_RATING, SKILL_LEVELS } from "@/lib/constants";
import { capitalize } from "@/lib/format";

/*
 * mode: "register" (self sign-up), "create" (organizer adds a player), "edit" (organizer edits).
 */
export default function PlayerForm({ mode, initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    password: "",
    role: initial?.role ?? "member",
    studentYear: initial?.studentYear ?? "",
    skillLevel: initial?.skillLevel ?? "beginner",
    startingRatingSource: initial?.startingRatingSource ?? "skill-default",
    manualRating: initial?.startingRatingSource === "manual-entry" ? initial.startingRating : "",
  }));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isManual = form.startingRatingSource === "manual-entry";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError(null);
    try {
      const body = { ...form };
      if (mode === "register") delete body.role;
      if (mode === "edit" && !body.password) delete body.password;
      await onSubmit(body);
    } catch (err) {
      setErrors(err.details || {});
      setError(err);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <ErrorBox error={error} />
      <div className="grid-2">
        <Field label="Full name" error={errors.name} htmlFor="name">
          <input id="name" value={form.name} onChange={set("name")} required autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <input id="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </Field>
        <Field
          label={mode === "edit" ? "New password" : "Password"}
          error={errors.password}
          hint={mode === "edit" ? "Leave blank to keep the current password." : "At least 6 characters."}
          htmlFor="password"
        >
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Student year" error={errors.studentYear} hint="Optional" htmlFor="studentYear">
          <input id="studentYear" type="number" min="1" max="8" value={form.studentYear} onChange={set("studentYear")} />
        </Field>
        <Field label="Skill level" error={errors.skillLevel} htmlFor="skillLevel">
          <select id="skillLevel" value={form.skillLevel} onChange={set("skillLevel")}>
            {SKILL_LEVELS.map((s) => (
              <option key={s} value={s}>
                {capitalize(s)} ({SKILL_DEFAULT_RATING[s]})
              </option>
            ))}
          </select>
        </Field>
        {mode !== "register" && (
          <Field label="Role" error={errors.role} htmlFor="role">
            <select id="role" value={form.role} onChange={set("role")}>
              <option value="member">Member (read-only)</option>
              <option value="organizer">Organizer (full access)</option>
            </select>
          </Field>
        )}
      </div>

      <fieldset className="rating-source">
        <legend>Starting rating</legend>
        <label className="radio">
          <input
            type="radio"
            name="source"
            checked={!isManual}
            onChange={() => setForm((f) => ({ ...f, startingRatingSource: "skill-default" }))}
          />
          Use skill level default <strong>({SKILL_DEFAULT_RATING[form.skillLevel]})</strong>
        </label>
        <label className="radio">
          <input
            type="radio"
            name="source"
            checked={isManual}
            onChange={() => setForm((f) => ({ ...f, startingRatingSource: "manual-entry" }))}
          />
          Enter an existing rating (e.g. Chess.com, Lichess)
        </label>
        {isManual && (
          <Field label="Rating" error={errors.manualRating} htmlFor="manualRating">
            <input
              id="manualRating"
              type="number"
              min="100"
              max="3500"
              value={form.manualRating}
              onChange={set("manualRating")}
              placeholder="e.g. 1350"
            />
          </Field>
        )}
        {mode === "edit" && (
          <small className="hint">Changing the starting rating recalculates this player&apos;s rating from all recorded matches.</small>
        )}
      </fieldset>

      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
