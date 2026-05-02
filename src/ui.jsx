// Premium self-contained gradient avatar — zero API calls, instant render
const GRADIENT_PALETTES = [
  ["#6366f1","#a855f7"],  // indigo → purple
  ["#3b82f6","#06b6d4"],  // blue → cyan
  ["#8b5cf6","#ec4899"],  // violet → pink
  ["#10b981","#3b82f6"],  // emerald → blue
  ["#f59e0b","#ef4444"],  // amber → red
  ["#06b6d4","#6366f1"],  // cyan → indigo
  ["#ec4899","#f59e0b"],  // pink → amber
  ["#14b8a6","#8b5cf6"],  // teal → violet
];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function getInitials(user) {
  const name = user?.name || user?.email || "?";
  if (user?.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ user, size = 32 }) {
  const seed = user?.name || user?.email || String(user?.id || user?._id || "user");
  const hash = hashCode(seed);
  const [colorA, colorB] = GRADIENT_PALETTES[hash % GRADIENT_PALETTES.length];
  const angle = (hash % 8) * 45;
  const initials = getInitials(user);
  const fontSize = Math.round(size * 0.36);
  const gradId = `ag-${hash}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ borderRadius: "50%", display: "block", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 0 0 2px #fff" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%"
          gradientTransform={`rotate(${angle}, 0.5, 0.5)`}>
          <stop offset="0%" stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
        <clipPath id={`clip-${gradId}`}>
          <circle cx={size/2} cy={size/2} r={size/2} />
        </clipPath>
      </defs>
      <circle cx={size/2} cy={size/2} r={size/2} fill={`url(#${gradId})`} />
      {/* Subtle inner noise/texture overlay */}
      <circle cx={size/2} cy={size/2} r={size/2} fill="rgba(255,255,255,0.08)" />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Outfit', system-ui, sans-serif"
        fill="#ffffff"
        style={{ userSelect: "none", letterSpacing: "0.5px", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
      >
        {initials}
      </text>
    </svg>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="btn btn-sm" style={{border:"none",padding:"4px 8px"}} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

export function Badge({ type }) {
  const map = {
    "To Do":"badge-todo","In Progress":"badge-progress","Done":"badge-done",
    "High":"badge-high","Medium":"badge-medium","Low":"badge-low",
    "Admin":"badge-admin","Member":"badge-member",
  };
  return <span className={`badge ${map[type]||"badge-member"}`}>{type}</span>;
}

export function ProgressBar({ value }) {
  return <div className="prog-bar"><div className="prog-fill" style={{width:`${value}%`}}/></div>;
}

export function ErrorBox({ msg }) {
  return msg ? <div className="error-box">{msg}</div> : null;
}
