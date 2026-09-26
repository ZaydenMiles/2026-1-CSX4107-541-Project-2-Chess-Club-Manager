"use client";

import { useState } from "react";
import { ErrorBox, Field } from "./ui";
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from "@/lib/constants";
import { capitalize, formatFormat, toDateInput } from "@/lib/format";

const TIME_CONTROLS = ["Bullet 1+0", "Blitz 3+2", "Blitz 5+0", "Rapid 10+0", "Rapid 15+10", "Classical 30+0"];

export default function TournamentForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    format: initial?.format ?? "swiss",
    timeControl: initial?.timeControl ?? "Rapid 15+10",
    date: toDateInput(initial?.date ?? new Date()),
    location: initial?.location ?? "",
    status: initial?.status ?? "upcoming",
  }));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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

  return (
    <form className="form" onSubmit={submit} noValidate>
      <ErrorBox error={error} />
      <Field label="Tournament name" error={errors.name} htmlFor="name">
        <input id="name" value={form.name} onChange={set("name")} placeholder="e.g. Spring Rapid Open" />
      </Field>
      <Field label="Description" error={errors.description} hint="Optional" htmlFor="description">
        <textarea id="description" rows={3} value={form.description} onChange={set("description")} />
      </Field>
      <div className="grid-2">
        <Field label="Format" error={errors.format} htmlFor="format">
          <select id="format" value={form.format} onChange={set("format")}>
            {TOURNAMENT_FORMATS.map((f) => (
              <option key={f} value={f}>{formatFormat(f)}</option>
            ))}
          </select>
        </Field>
        <Field label="Time control" error={errors.timeControl} hint="Pick one or type your own" htmlFor="timeControl">
          <input id="timeControl" list="time-controls" value={form.timeControl} onChange={set("timeControl")} />
          <datalist id="time-controls">
            {TIME_CONTROLS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <Field label="Date" error={errors.date} htmlFor="date">
          <input id="date" type="date" value={form.date} onChange={set("date")} />
        </Field>
        <Field label="Location" error={errors.location} htmlFor="location">
          <input id="location" value={form.location} onChange={set("location")} placeholder="e.g. Student Union, Room 204" />
        </Field>
        <Field label="Status" error={errors.status} htmlFor="status">
          <select id="status" value={form.status} onChange={set("status")}>
            {TOURNAMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
