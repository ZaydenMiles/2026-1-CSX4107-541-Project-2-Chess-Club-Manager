"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useApi } from "@/components/useApi";
import { Empty, ErrorBox, Loading, Monogram, PageHeader, StatusBadge, Tag } from "@/components/ui";
import { TOURNAMENT_FORMATS, TOURNAMENT_STATUSES } from "@/lib/constants";
import { capitalize, formatDate, formatFormat } from "@/lib/format";

export default function TournamentsPage() {
  const { isOrganizer } = useAuth();
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState("");
  const qs = new URLSearchParams(Object.entries({ q, status, format }).filter(([, v]) => v)).toString();
  const { data, error, loading } = useApi(`/tournaments?${qs}`);

  function clearAll() {
    setDraft("");
    setQ("");
    setStatus("");
    setFormat("");
  }

  return (
    <>
      <PageHeader title="Tournaments" lede="Past, current and upcoming club events. Open one to see its standings and pairings." />

      <form
        className="searchbar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft.trim());
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search by tournament name" aria-label="Search by tournament name" />
        <button className="btn btn-primary">Search</button>
      </form>

      <div className="browse">
        <aside className="refine" aria-label="Filters">
          <div className="refine-head">
            <strong>Refine results</strong>
            {(status || format || q) && <button type="button" onClick={clearAll}>Clear all</button>}
          </div>
          <div className="refine-group">
            <h4>Status</h4>
            <label className="refine-option">
              <input type="radio" name="status" checked={!status} onChange={() => setStatus("")} />
              Any status
            </label>
            {TOURNAMENT_STATUSES.map((s) => (
              <label key={s} className="refine-option">
                <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} />
                {capitalize(s)}
              </label>
            ))}
          </div>
          <div className="refine-group">
            <h4>Format</h4>
            <label className="refine-option">
              <input type="radio" name="format" checked={!format} onChange={() => setFormat("")} />
              Any format
            </label>
            {TOURNAMENT_FORMATS.map((f) => (
              <label key={f} className="refine-option">
                <input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} />
                {formatFormat(f)}
              </label>
            ))}
          </div>
        </aside>

        <section>
          <div className="results-head">
            <h2>
              {data
                ? `${data.tournaments.length} ${data.tournaments.length === 1 ? "tournament" : "tournaments"}`
                : "Tournaments"}
            </h2>
            {isOrganizer && <Link href="/tournaments/new" className="text-link">+ New tournament</Link>}
          </div>
          <ErrorBox error={error} />
          {loading && !data && <Loading />}
          {data &&
            (data.tournaments.length === 0 ? (
              <Empty>No tournaments match those filters.</Empty>
            ) : (
              <ul className="rows">
                {data.tournaments.map((t) => (
                  <li key={t._id}>
                    <Monogram name={t.name} seed={t.format + t._id} />
                    <div className="row-body">
                      <Link href={`/tournaments/${t._id}`} className="title-link row-title">{t.name}</Link>
                      <div className="row-meta">
                        <span>{formatDate(t.date)}</span>
                        <span>{formatFormat(t.format)}</span>
                        <span>{t.timeControl}</span>
                        <span>{t.location}</span>
                      </div>
                      <div className="row-tags">
                        <StatusBadge status={t.status} />
                        <Tag>{t.playerIds.length} players</Tag>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ))}
        </section>
      </div>
    </>
  );
}
