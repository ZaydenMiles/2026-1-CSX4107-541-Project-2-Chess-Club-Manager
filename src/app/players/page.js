"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrganizerOnly from "@/components/OrganizerOnly";
import { useApi } from "@/components/useApi";
import { Empty, ErrorBox, Loading, Monogram, PageHeader, Tag } from "@/components/ui";
import { SKILL_DEFAULT_RATING, SKILL_LEVELS } from "@/lib/constants";
import { capitalize, formatDate } from "@/lib/format";

const EMPTY_FILTERS = { skillLevel: "", minRating: "", maxRating: "" };

function PlayerBrowser() {
  const params = useSearchParams();
  const [draft, setDraft] = useState(params.get("q") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState("rating");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [range, setRange] = useState({ minRating: "", maxRating: "" });

  const qs = new URLSearchParams(
    Object.entries({ q, sort, ...filters }).filter(([, v]) => v !== "")
  ).toString();
  const { data, error, loading } = useApi(`/players?${qs}`);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const hasFilters = Object.values(filters).some(Boolean) || q;

  function clearAll() {
    setFilters(EMPTY_FILTERS);
    setRange({ minRating: "", maxRating: "" });
    setDraft("");
    setQ("");
  }

  function applyRange(e) {
    e.preventDefault();
    setFilters((f) => ({ ...f, ...range }));
  }

  return (
    <>
      <form
        className="searchbar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft.trim());
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search players by name" aria-label="Search players by name" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort order">
          <option value="rating">Highest rated</option>
          <option value="name">Name, A to Z</option>
          <option value="joined">Newest members</option>
        </select>
        <button className="btn btn-primary">Search players</button>
      </form>

      <div className="browse">
        <aside className="refine" aria-label="Filters">
          <div className="refine-head">
            <strong>Refine results</strong>
            {hasFilters && <button type="button" onClick={clearAll}>Clear all</button>}
          </div>

          <div className="refine-group">
            <h4>Skill level</h4>
            <label className="refine-option">
              <input type="radio" name="skill" checked={!filters.skillLevel} onChange={() => setFilter("skillLevel", "")} />
              Any level
            </label>
            {SKILL_LEVELS.map((s) => (
              <label key={s} className="refine-option">
                <input type="radio" name="skill" checked={filters.skillLevel === s} onChange={() => setFilter("skillLevel", s)} />
                {capitalize(s)} <span className="muted small">(starts at {SKILL_DEFAULT_RATING[s]})</span>
              </label>
            ))}
          </div>

          <div className="refine-group">
            <h4>Rating</h4>
            <form className="refine-range" onSubmit={applyRange}>
              <input
                type="number"
                placeholder="Min"
                value={range.minRating}
                onChange={(e) => setRange((r) => ({ ...r, minRating: e.target.value }))}
                aria-label="Minimum rating"
              />
              <span className="muted">to</span>
              <input
                type="number"
                placeholder="Max"
                value={range.maxRating}
                onChange={(e) => setRange((r) => ({ ...r, maxRating: e.target.value }))}
                aria-label="Maximum rating"
              />
              <button className="btn btn-sm">Go</button>
            </form>
          </div>

        </aside>

        <section>
          <div className="results-head">
            <h2>{data ? `${data.players.length} ${data.players.length === 1 ? "player" : "players"} found` : "Players"}</h2>
            <Link href="/players/new" className="text-link">+ Register a player</Link>
          </div>
          <ErrorBox error={error} />
          {loading && !data && <Loading />}
          {data &&
            (data.players.length === 0 ? (
              <Empty>No players match those filters.</Empty>
            ) : (
              <ul className="rows">
                {data.players.map((p) => (
                  <li key={p._id}>
                    <Monogram name={p.name} seed={p._id} />
                    <div className="row-body">
                      <Link href={`/players/${p._id}`} className="title-link row-title">{p.name}</Link>
                      <div className="row-meta">
                        {p.studentYear && <span>Year {p.studentYear}</span>}
                        <span>Joined {formatDate(p.joinedAt)}</span>
                        <span>{p.email}</span>
                      </div>
                      <div className="row-tags">
                        <Tag>{capitalize(p.skillLevel)}</Tag>
                        {p.role === "organizer" && <Tag className="role-organizer">Organizer</Tag>}
                        {p.startingRatingSource === "manual-entry" && <Tag>Imported rating</Tag>}
                      </div>
                    </div>
                    <div className="row-aside">
                      <span className="big">{p.rating}</span>
                      <small>Rating</small>
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

export default function PlayersPage() {
  return (
    <OrganizerOnly>
      <PageHeader title="Players" lede="Everyone registered with the club, with their current rating." />
      <Suspense>
        <PlayerBrowser />
      </Suspense>
    </OrganizerOnly>
  );
}
