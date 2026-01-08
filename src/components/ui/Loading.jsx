"use client";

export default function AuthLoadingScreen({ text = "Loading..." }) {
  return (
    <div className="auth-loader-backdrop">
      <div className="auth-loader-card">
        <div className="spinner"></div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
}
