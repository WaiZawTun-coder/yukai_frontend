"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or may have been removed",
}) {
  const router = useRouter();
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="glow" />

        <h1 className="error-code">404</h1>
        <h2 className="title">{title}</h2>

        <p className="description">{message}</p>

        <div className="actions">
          <Link href="/" className="btn primary">
            Go Home
          </Link>

          <button className="btn ghost" onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
