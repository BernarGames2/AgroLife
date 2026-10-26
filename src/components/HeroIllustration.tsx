/**
 * Ilustração aérea de uma lavoura com linhas de plantio, estrada, mata
 * e pontos de monitoramento — inteiramente em SVG, sem imagens externas.
 */
const points: Array<[number, number, boolean?]> = [
  [129, 87, true],
  [191, 48],
  [251, 70],
  [60, 117],
  [144, 168],
  [225, 164],
  [101, 234],
  [320, 201],
  [284, 262, true],
];

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 360" className={className} role="img" aria-labelledby="hero-title">
      <title id="hero-title">Vista aérea de uma lavoura com pontos de monitoramento</title>
      <defs>
        <linearGradient id="hero-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5f8f2e" />
          <stop offset="0.45" stopColor="#2f5f23" />
          <stop offset="1" stopColor="#1e4419" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="0.05" cy="0.05" r="0.75">
          <stop offset="0" stopColor="#f4e27a" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#d9c95a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#d9c95a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
        <pattern id="hero-rows" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-58)">
          <rect width="11" height="11" fill="#1d3b18" />
          <circle cx="2.5" cy="5.5" r="3.4" fill="#3f7a2c" />
          <circle cx="8" cy="5.4" r="3.2" fill="#4b8a33" />
          <circle cx="1.8" cy="4.4" r="1.5" fill="#86b852" opacity="0.65" />
          <circle cx="7.4" cy="4.3" r="1.3" fill="#9cc65c" opacity="0.6" />
        </pattern>
        <pattern id="hero-trees" width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#2c5a1f" />
          <circle cx="7" cy="8" r="8" fill="#3f7a2a" />
          <circle cx="19" cy="15" r="9" fill="#4e8c34" />
          <circle cx="8" cy="21" r="7" fill="#376f26" />
          <circle cx="5" cy="5" r="3" fill="#8fbf5a" opacity="0.6" />
          <circle cx="16" cy="11" r="3.5" fill="#a5cc66" opacity="0.5" />
        </pattern>
        <filter id="hero-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id="hero-field">
          <polygon points="0,0 372,0 560,250 560,360 0,360" />
        </clipPath>
      </defs>

      <rect width="560" height="360" fill="url(#hero-base)" />

      {/* Lavoura */}
      <g clipPath="url(#hero-field)">
        <rect width="560" height="360" fill="url(#hero-rows)" />
        <rect width="560" height="360" fill="url(#hero-base)" opacity="0.35" style={{ mixBlendMode: "overlay" }} />
        {/* Área com falhas de emergência */}
        <path d="M238 236c22-14 58-10 74 6s8 44-16 52-62 2-72-14-8-30 14-44z" fill="#6b5a3a" opacity="0.55" />
        <path d="M60 60c14-8 34-6 42 4s2 24-12 28-34 0-38-10 0-16 8-22z" fill="#6b5a3a" opacity="0.35" />
      </g>

      {/* Estrada */}
      <polygon points="372,0 404,0 560,206 560,250" fill="#b59a72" />
      <polygon points="378,0 400,0 560,212 560,240" fill="#c9b08a" />
      <path d="M384 0 560 224M394 0 560 218" stroke="#a38a63" strokeWidth="1.2" opacity="0.7" />

      {/* Mata além da estrada */}
      <polygon points="404,0 560,0 560,206" fill="url(#hero-trees)" />
      <circle cx="505" cy="92" r="30" fill="#4f8d35" />
      <circle cx="530" cy="70" r="24" fill="#5c9a3c" />
      <circle cx="488" cy="70" r="18" fill="#6aa646" opacity="0.9" />
      <circle cx="512" cy="80" r="10" fill="#a5cf6a" opacity="0.5" />

      {/* Grade de monitoramento */}
      <g stroke="#fff" strokeOpacity="0.28" strokeWidth="0.8" fill="none" clipPath="url(#hero-field)">
        <path d="M-20 120 360 -40M-40 250 400 70M-20 380 470 170" />
        <path d="M40 -20 240 380M180 -20 380 360" />
      </g>

      {/* Pontos de monitoramento */}
      <g fill="#fff">
        {points.map(([x, y, highlight], i) =>
          highlight ? (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="14" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2">
                <animate attributeName="r" values="6;18;6" dur="3s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle r="8" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
              <circle r="4" />
            </g>
          ) : (
            <circle key={i} cx={x} cy={y} r="3" opacity="0.9" />
          ),
        )}
      </g>

      <rect width="560" height="360" fill="url(#hero-sun)" />
      <rect width="560" height="360" filter="url(#hero-grain)" opacity="0.18" />
      <rect width="560" height="360" fill="url(#hero-vignette)" />
    </svg>
  );
}
