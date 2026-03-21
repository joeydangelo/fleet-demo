import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLEETGO_BACKGROUND } from "../constants/timing";
import { MONO, SYSTEM_FONT, SPRING_LAYOUT, SPRING_BOUNCE } from "../constants/theme";
import { TrafficLights } from "./shared";
import {
  getDashboardState,
  getStatusStyle,
  getVerdictStyle,
  getMergeBadge,
  DASHBOARD_VERSION,
  DASHBOARD_REFRESH_MS,
  COL_STATUS_ICON,
  COL_NAME,
  COL_STATUS,
  COL_REVIEW,
  COL_DURATION,
  COL_TMUX,
} from "../constants/dashboardData";
import type {
  AgentRow,
  MailEntry,
  MergeEntry as MergeEntryType,
  DashboardSnapshot,
} from "../constants/dashboardData";

// macOS Terminal.app dark profile colors
const TERM_BG = "#282828";
const TERM_TEXT = "#cccccc";
const TERM_DIM = "#808080";
const TITLE_BAR_BG = "#3d3d3d";
const TITLE_BAR_TEXT = "#cacaca";
const CURSOR_BLINK_FRAMES = 16;

// Dashboard layout
const GRID_WIDTH_CH = 72;
const HRULE_CHAR = "─";

// Typing timing
const COMMAND_TEXT = "fleet dashboard";
const TYPE_DELAY_SECONDS = 0.7;
const CHAR_FRAMES = 2;
const DASHBOARD_DELAY_FRAMES = 15;

function FolderIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      style={{ verticalAlign: "middle", marginRight: 5 }}
    >
      <defs>
        <linearGradient id="folderBack" x1="8" y1="0" x2="8" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#68CAFE" />
          <stop offset="100%" stopColor="#3B93D4" />
        </linearGradient>
        <linearGradient id="folderFront" x1="8" y1="3.5" x2="8" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7AD2FF" />
          <stop offset="100%" stopColor="#4AA3E0" />
        </linearGradient>
      </defs>
      <path
        d="M1.5 2C1.5 1.17 2.17 0.5 3 0.5H6.09C6.49 0.5 6.87 0.66 7.15 0.94L8.06 1.85C8.34 2.13 8.72 2.3 9.12 2.3H13C13.83 2.3 14.5 2.97 14.5 3.8V11.5C14.5 12.33 13.83 13 13 13H3C2.17 13 1.5 12.33 1.5 11.5V2Z"
        fill="url(#folderBack)"
      />
      <path
        d="M0.5 5C0.5 4.17 1.17 3.5 2 3.5H14C14.83 3.5 15.5 4.17 15.5 5V11.5C15.5 12.33 14.83 13 14 13H2C1.17 13 0.5 12.33 0.5 11.5V5Z"
        fill="url(#folderFront)"
      />
    </svg>
  );
}

function TerminalCursor(): React.ReactElement {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [0.8, 0, 0.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 15,
        backgroundColor: TERM_TEXT,
        verticalAlign: "text-bottom",
        marginLeft: 1,
        opacity,
      }}
    />
  );
}

/** Compute the local frame at which typing completes and the dashboard can appear. */
function computeDashboardStart(fps: number): number {
  const typeDelay = Math.round(fps * TYPE_DELAY_SECONDS);
  const typingDuration = COMMAND_TEXT.length * CHAR_FRAMES;
  return typeDelay + typingDuration + DASHBOARD_DELAY_FRAMES;
}

// ── Dashboard panels ─────────────────────────────────────────────────

function HRule(): React.ReactElement {
  return (
    <div style={{ color: TERM_DIM, whiteSpace: "pre" }}>
      {HRULE_CHAR.repeat(GRID_WIDTH_CH)}
    </div>
  );
}

function HeaderBar({ clockTime }: { clockTime: string }): React.ReactElement {
  const left = `fleet dashboard v${DASHBOARD_VERSION}`;
  const right = `${clockTime}  |  refresh: ${DASHBOARD_REFRESH_MS}ms`;
  const gap = Math.max(1, GRID_WIDTH_CH - left.length - right.length);

  return (
    <div style={{ display: "flex", whiteSpace: "pre" }}>
      <span style={{ color: TERM_TEXT, fontWeight: 700 }}>{left}</span>
      <span>{" ".repeat(gap)}</span>
      <span style={{ color: TERM_TEXT }}>{right}</span>
    </div>
  );
}

const COL_CELL: React.CSSProperties = {
  display: "inline-block",
  whiteSpace: "pre",
};

function AgentHeaderRow(): React.ReactElement {
  return (
    <div style={{ color: TERM_DIM, whiteSpace: "pre" }}>
      {"  "}
      <span style={{ ...COL_CELL, width: `${COL_STATUS_ICON}ch` }}>{"St"}</span>
      <span style={{ ...COL_CELL, width: `${COL_NAME}ch` }}>{"Name"}</span>
      <span style={{ ...COL_CELL, width: `${COL_STATUS}ch` }}>{"Status"}</span>
      <span style={{ ...COL_CELL, width: `${COL_REVIEW}ch` }}>{"Review"}</span>
      <span style={{ ...COL_CELL, width: `${COL_DURATION}ch` }}>{"Duration"}</span>
      <span style={{ ...COL_CELL, width: `${COL_TMUX}ch` }}>{"Tmux"}</span>
    </div>
  );
}

// ── Spring configs ────────────────────────────────────────────────────

/** Status icon + text: smooth crossfade on status change. */
function AgentRowView({
  agent,
  dashFrame,
  fps,
}: {
  agent: AgentRow;
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const style = getStatusStyle(agent.status);
  const verdictStyle = getVerdictStyle(agent.verdict);
  const nameDisplay = agent.name.length > 15
    ? agent.name.slice(0, 15) + "…"
    : agent.name;

  // Fade-in on status transition (~10 frames)
  // Skip for pending/booting — same icon and color, no visual change
  const skipTransition = agent.status === "pending" || agent.status === "booting";
  const statusAge = dashFrame - agent.statusStartFrame;
  const statusOpacity = skipTransition
    ? 1
    : interpolate(statusAge, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Verdict: same crossfade as status
  const verdictAge = agent.verdictFrame > 0 ? dashFrame - agent.verdictFrame : -1;
  const verdictOpacity = verdictAge >= 0
    ? interpolate(verdictAge, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div style={{ whiteSpace: "pre" }}>
      {"  "}
      <span style={{ ...COL_CELL, width: `${COL_STATUS_ICON}ch`, opacity: statusOpacity }}>
        <span style={{ color: style.color }}>{style.icon}</span>
      </span>
      <span style={{ ...COL_CELL, width: `${COL_NAME}ch`, color: TERM_TEXT }}>{nameDisplay}</span>
      <span style={{ ...COL_CELL, width: `${COL_STATUS}ch`, color: style.color, opacity: statusOpacity }}>
        {agent.status}
      </span>
      <span style={{ ...COL_CELL, width: `${COL_REVIEW}ch` }}>
        {verdictStyle ? (
          <span style={{ color: verdictStyle.color, opacity: verdictOpacity }}>
            {verdictStyle.label}
          </span>
        ) : null}
      </span>
      <span style={{ ...COL_CELL, width: `${COL_DURATION}ch`, color: TERM_TEXT }}>{agent.duration}</span>
      <span style={{ ...COL_CELL, width: `${COL_TMUX}ch` }}>
        {agent.tmuxAlive && <span style={{ color: "#55b45a" }}>●</span>}
      </span>
    </div>
  );
}

function AgentsPanel({
  agents,
  dashFrame,
  fps,
}: {
  agents: AgentRow[];
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  return (
    <div style={{ paddingLeft: 4, paddingRight: 4 }}>
      <div style={{ color: TERM_TEXT, fontWeight: 700 }}>
        Agents ({agents.length})
      </div>
      <AgentHeaderRow />
      {agents.map((agent) => (
        <AgentRowView key={agent.name} agent={agent} dashFrame={dashFrame} fps={fps} />
      ))}
    </div>
  );
}

/** Mail: each message slides in from left + fades. */
function MailPanel({
  mail,
  dashFrame,
  fps,
}: {
  mail: MailEntry[];
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  return (
    <div style={{ width: "50%", paddingLeft: 4, overflow: "hidden" }}>
      <div style={{ color: TERM_TEXT, fontWeight: 700 }}>
        Mail ({mail.length})
      </div>
      {mail.length === 0 && (
        <div style={{ color: TERM_DIM }}>No messages</div>
      )}
      {mail.map((entry, i) => (
        <MailRowView key={entry.appearFrame} entry={entry} dashFrame={dashFrame} fps={fps} />
      ))}
    </div>
  );
}

function MailRowView({
  entry,
  dashFrame,
  fps,
}: {
  entry: MailEntry;
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const age = Math.max(0, dashFrame - entry.appearFrame);
  const entrance = spring({
    frame: age,
    fps,
    config: SPRING_LAYOUT,
  });
  const slideX = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div style={{
      whiteSpace: "pre",
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: TERM_TEXT,
      opacity: entrance,
      transform: `translateX(${slideX}px)`,
    }}>
      <span style={{ color: TERM_DIM }}>{entry.prefix}</span>{" "}
      {entry.message}{" "}
      <span style={{ color: TERM_DIM }}>({entry.relativeTime})</span>
    </div>
  );
}

/** Merge queue: entries fade + slide in, badge crossfades on status change. */
function MergeQueuePanel({
  merges,
  dashFrame,
  fps,
}: {
  merges: MergeEntryType[];
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  return (
    <div style={{ width: "50%", paddingLeft: 8, overflow: "hidden" }}>
      <div style={{ color: TERM_TEXT, fontWeight: 700 }}>
        Merge Queue ({merges.length})
      </div>
      {merges.length === 0 && (
        <div style={{ color: TERM_DIM }}>No merges</div>
      )}
      {merges.map((entry) => (
        <MergeRowView key={entry.taskName} entry={entry} dashFrame={dashFrame} fps={fps} />
      ))}
    </div>
  );
}

function MergeRowView({
  entry,
  dashFrame,
  fps,
}: {
  entry: MergeEntryType;
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const badge = getMergeBadge(entry.status);

  // Row entrance: slide in from left
  const rowAge = Math.max(0, dashFrame - entry.appearFrame);
  const rowEntrance = spring({
    frame: rowAge,
    fps,
    config: SPRING_LAYOUT,
  });
  const slideX = interpolate(rowEntrance, [0, 1], [-20, 0]);

  // Badge crossfade when status changes (pending → merged)
  // Only animate if the status changed after the row first appeared
  const statusChanged = entry.statusChangeFrame > entry.appearFrame;
  const badgeAge = Math.max(0, dashFrame - entry.statusChangeFrame);
  const badgeOpacity = statusChanged
    ? interpolate(badgeAge, [0, 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <div style={{
      display: "flex",
      whiteSpace: "pre",
      gap: 8,
      opacity: rowEntrance,
      transform: `translateX(${slideX}px)`,
    }}>
      <span style={{ width: "10ch", color: badge.color, opacity: badgeOpacity }}>
        {badge.label}
      </span>
      <span style={{ width: "15ch", color: TERM_TEXT }}>{entry.taskName}</span>
      <span style={{ color: TERM_DIM }}>{entry.target}</span>
    </div>
  );
}

function DashboardView({
  dashFrame,
  fps,
}: {
  dashFrame: number;
  fps: number;
}): React.ReactElement {
  const entrance = spring({
    frame: dashFrame,
    fps,
    config: SPRING_LAYOUT,
  });

  const state: DashboardSnapshot = getDashboardState(dashFrame, fps);

  return (
    <div style={{ opacity: entrance, marginTop: 8, fontSize: 12, lineHeight: 1.5, width: "100%", overflow: "hidden" }}>
      <HeaderBar clockTime={state.clockTime} />
      <HRule />
      <AgentsPanel agents={state.agents} dashFrame={dashFrame} fps={fps} />
      <HRule />
      <div style={{ display: "flex", width: "100%" }}>
        <MailPanel mail={state.mail} dashFrame={dashFrame} fps={fps} />
        <MergeQueuePanel merges={state.merges} dashFrame={dashFrame} fps={fps} />
      </div>
    </div>
  );
}

// ── Main components ──────────────────────────────────────────────────

function TerminalPrompt({
  frame,
  fps,
}: {
  frame: number;
  fps: number;
}): React.ReactElement {
  const promptSpring = spring({
    frame,
    fps,
    config: SPRING_BOUNCE,
  });

  const typeDelay = Math.round(fps * TYPE_DELAY_SECONDS);
  const typeFrame = frame - typeDelay;
  const charsTyped = typeFrame > 0
    ? Math.min(Math.floor(typeFrame / CHAR_FRAMES), COMMAND_TEXT.length)
    : 0;
  const typedText = COMMAND_TEXT.slice(0, charsTyped);
  const doneTyping = charsTyped >= COMMAND_TEXT.length;

  const dashboardStart = computeDashboardStart(fps);
  const dashFrame = frame - dashboardStart;
  const showDashboard = dashFrame >= 0;

  // Alternate screen buffer: prompt vanishes once dashboard takes over
  if (showDashboard) {
    return <DashboardView dashFrame={dashFrame} fps={fps} />;
  }

  return (
    <div style={{ opacity: promptSpring }}>
      <div>
        <span style={{ color: TERM_TEXT }}>joey@Joeys-MacBook-Pro fleet</span>
        <span style={{ color: TERM_DIM }}> % </span>
        <span style={{ color: TERM_TEXT }}>{typedText}</span>
        {!doneTyping && <TerminalCursor />}
      </div>
    </div>
  );
}

export const MacTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - FLEETGO_BACKGROUND;
  if (localFrame < 0) return null;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: SPRING_LAYOUT,
  });

  const translateX = interpolate(entrance, [0, 1], [60, 0]);

  return (
    <div
      style={{
        width: 580,
        height: 580,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 12px 24px -8px rgba(0, 0, 0, 0.25)",
        opacity: entrance,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 28,
          backgroundColor: TITLE_BAR_BG,
          display: "flex",
          alignItems: "center",
          paddingLeft: 10,
          paddingRight: 10,
          flexShrink: 0,
        }}
      >
        <TrafficLights />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: TITLE_BAR_TEXT,
            fontSize: 13,
            fontFamily: SYSTEM_FONT,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FolderIcon />
          fleet — -zsh — 71×25
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Terminal content */}
      <div
        style={{
          flex: 1,
          backgroundColor: TERM_BG,
          padding: 12,
          paddingTop: 8,
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.6,
          color: TERM_TEXT,
          overflow: "hidden",
        }}
      >
        <TerminalPrompt frame={localFrame} fps={fps} />
      </div>
    </div>
  );
};
