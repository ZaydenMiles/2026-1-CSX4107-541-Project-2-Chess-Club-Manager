"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

// Hides organizer-only pages from members. The API enforces the same rule.
export default function OrganizerOnly({ children }) {
  const { isOrganizer } = useAuth();
  if (!isOrganizer) {
    return (
      <div className="gate">
        <span className="eyebrow">Organizers only</span>
        <h1>This page is for club officers.</h1>
        <p>Your account can view everything but cannot change records. Ask an organizer if something needs updating.</p>
        <Link href="/" className="btn">Back to overview</Link>
      </div>
    );
  }
  return children;
}
