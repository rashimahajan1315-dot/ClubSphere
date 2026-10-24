import { useState } from "react";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

const identities = [
  { match: /cod|tech|program|computer|developer/i, mark: "</>", tone: "logo-tech" },
  { match: /dance|cultur/i, mark: "✦", tone: "logo-dance" },
  { match: /photo|camera|film/i, mark: "◉", tone: "logo-photo" },
  { match: /robot|engineer|maker/i, mark: "⚙", tone: "logo-robot" },
  { match: /music|sing|band/i, mark: "♫", tone: "logo-music" },
  { match: /liter|book|write|poet/i, mark: "✎", tone: "logo-literary" },
  { match: /sport|athlet|fitness/i, mark: "★", tone: "logo-sport" },
  { match: /debate|public speak|mun/i, mark: "❝", tone: "logo-debate" },
  { match: /social|service|volunteer|help/i, mark: "♡", tone: "logo-social" },
];

export function resolveClubLogo(club) {
  const raw = club?.logo || club?.logo_url || club?.image || club?.image_url || club?.cover_image;
  if (!raw || typeof raw !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  return `${API_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

export default function ClubLogo({ club, size = "normal" }) {
  const [failed, setFailed] = useState(false);
  const name = club?.name || "Campus club";
  const identity = identities.find((item) => item.match.test(`${name} ${club?.category || ""}`));
  const src = resolveClubLogo(club);
  const showImage = Boolean(src && !failed);

  return (
    <div className={`club-logo ${identity?.tone || "logo-default"} club-logo-${size}`} aria-label={`${name} logo`}>
      {showImage ? (
        <img src={src} alt={`${name} logo`} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{identity?.mark || name.trim().charAt(0).toUpperCase() || "C"}</span>
      )}
    </div>
  );
}
