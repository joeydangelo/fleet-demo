import { loadFont as loadNotoMono } from "@remotion/google-fonts/NotoSansMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSans";

const { fontFamily: notoMono } = loadNotoMono("normal", {
  weights: ["400", "700"],
});
const { fontFamily: notoSans } = loadNotoSans("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const MONO = `${notoMono}, monospace`;
export const SYSTEM_FONT = `${notoSans}, sans-serif`;

// Colors matching Claude CLI light theme
export const GREEN = "#7fa887";
export const BLUE = "#6a9bcc";
export const GRAY = "#999";
export const DIM = "#bbb";
export const TEXT = "#3d3d3d";
export const BOLD_TEXT = "#222";
export const ORANGE = "#d97757";

// Terminal layout
export const TOOL_INDENT = 22;

// Spring configs
export const SPRING_BOUNCE = { damping: 18, stiffness: 120, mass: 0.8 };
export const SPRING_LAYOUT = { damping: 200 };

// AskUserQuestion light-theme colors
export const AUQ_BG = "#f2f0ec";
export const AUQ_BORDER = "#d4d0ca";
export const AUQ_TEXT = "#3d3d3d";
export const AUQ_DIM = "#999";
export const AUQ_SELECTED = "#788c5d";
export const AUQ_TAB_ACTIVE_BORDER = "#6a9bcc";
export const AUQ_HOVER = "#e8e5df";
