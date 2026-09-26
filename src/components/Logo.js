import Link from "next/link";

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      &#9822;
    </span>
  );
}

export default function Logo() {
  return (
    <>
      <Link href="/" className="logo" aria-label="Chess Club Manager home">
        <LogoMark />
        <span className="logo-text">
          <b>Chess Club</b>
          <span>Manager</span>
        </span>
      </Link>
      <span className="logo-divider" aria-hidden="true" />
      <span className="logo-sub">
        University
        <br />
        Chess Society
      </span>
    </>
  );
}
