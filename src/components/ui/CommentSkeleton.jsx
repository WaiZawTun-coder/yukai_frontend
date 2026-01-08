"use client";

import { useMemo } from "react";

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function CommentSkeleton({ count = 3 }) {
  const skeletons = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      nameWidth: getRandom(60, 110),
      timeWidth: getRandom(40, 70),
      textLine1: getRandom(70, 100),
      textLine2: getRandom(40, 80),
    }));
  }, [count]);

  return (
    <>
      {skeletons.map((s, i) => (
        <div key={i} className="skeleton-comment-item skeleton-comment">
          <div className="comment-avatar skeleton-box" />

          <div className="comment-body">
            <div className="comment-header">
              <span
                className="skeleton-line"
                style={{ width: `${s.nameWidth}px` }}
              />
              <span
                className="skeleton-line"
                style={{ width: `${s.timeWidth}px` }}
              />
            </div>

            <div
              className="skeleton-line skeleton-text"
              style={{ width: `${s.textLine1}%` }}
            />
            <div
              className="skeleton-line skeleton-text"
              style={{ width: `${s.textLine2}%` }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
