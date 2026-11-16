// The AI coach: a small isometric robot, drawn by hand so it costs no requests.
// It sets itself apart from the pawn mark that speaks the checked lesson notes.
// state: "idle" blinks, "thinking" glances about with a pulsing antenna,
// "speaking" moves its mouth and lights its speaker, "sleeping" dozes while the
// model is unavailable. Animations live in globals.css.
export type BotState = "idle" | "thinking" | "speaking" | "sleeping";

export default function AiCoachAvatar({
  state = "idle",
  className = "size-10",
}: {
  state?: BotState;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`ai-bot ${className}`}
      data-state={state}
      role="img"
      aria-label={state === "idle" ? "AI coach" : `AI coach, ${state}`}
    >
      <ellipse cx="24" cy="44.5" rx="12" ry="2.2" fill="#000" opacity="0.25" />
      <g className="bot-body">
        {/* the cube's three faces: lit top, front-right screen, shaded left */}
        <polygon points="24,10 39,18.5 24,27 9,18.5" fill="#ffc24d" />
        <polygon points="9,18.5 24,27 24,44 9,35.5" fill="#c98504" />
        <polygon points="24,27 39,18.5 39,35.5 24,44" fill="#ffb020" />
        <circle cx="24" cy="18.5" r="1.8" fill="#c98504" />
        {/* antenna, rising from the middle of the top face */}
        <line
          x1="24"
          y1="18.5"
          x2="24"
          y2="7.5"
          stroke="#c98504"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle
          className="bot-antenna"
          cx="24"
          cy="5.6"
          r="2.4"
          fill="#79d160"
        />
        {/* left face: a round speaker that lights up while talking */}
        <g transform="matrix(1 0.5667 0 1 9 18.5)">
          <circle cx="7.5" cy="8.5" r="3.6" fill="#2a1d06" />
          <circle
            className="bot-speaker"
            cx="7.5"
            cy="8.5"
            r="1.7"
            fill="#79d160"
          />
        </g>
        {/* right face: the screen with eyes and a mouth */}
        <g transform="matrix(1 -0.5667 0 1 24 27)">
          <rect
            x="1.8"
            y="2.4"
            width="11.4"
            height="12.2"
            rx="2.2"
            fill="#1d1916"
          />
          <g className="bot-eyes">
            <circle
              className="bot-eye"
              cx="5.3"
              cy="6.8"
              r="1.75"
              fill="#79d160"
            />
            <circle
              className="bot-eye"
              cx="9.7"
              cy="6.8"
              r="1.75"
              fill="#79d160"
            />
          </g>
          <g fill="#79d160">
            <rect
              className="bot-mouth"
              x="4.4"
              y="10.9"
              width="1.4"
              height="1.4"
              rx="0.7"
            />
            <rect
              className="bot-mouth"
              x="6.8"
              y="10.9"
              width="1.4"
              height="1.4"
              rx="0.7"
            />
            <rect
              className="bot-mouth"
              x="9.2"
              y="10.9"
              width="1.4"
              height="1.4"
              rx="0.7"
            />
          </g>
        </g>
      </g>
      {state === "sleeping" && (
        <text
          className="bot-z"
          x="34"
          y="10"
          fill="#c2b4a5"
          fontSize="8"
          fontWeight="900"
        >
          z
        </text>
      )}
    </svg>
  );
}
