// Per-phase option Y positions (measured from container top)
// Phase 0: single-line question + description after opt 1, 3 options
const P0_OPT1_Y = 68;
const P0_OPT2_Y = 108;
const P0_OPT3_Y = 128;

// Phase 1: single-line question, 3 options, no descriptions
const P1_OPT1_Y = 68;
const P1_OPT2_Y = 88;
const P1_OPT3_Y = 108;

// Phase 2: summary (2 items) + submit button
const P2_SUBMIT_Y = 118;

// X position for cursor on the › marker area
const OPT_X = 28;

// --- AskUserQuestion phases ---
export const PHASE_DURATIONS = [65, 70, 65];
export const PHASE_STARTS = [0, 65, 135];

export type CursorKeyframe = { frame: number; x: number; y: number };

// Cursor paths — cursor tip lands right on the option text
export const CURSOR_PATHS: CursorKeyframe[][] = [
  // Phase 0: Algorithm — enters, drifts to opt 2, hesitates, goes back to opt 1
  [
    { frame: 0, x: 200, y: 15 },
    { frame: 14, x: 80, y: P0_OPT2_Y },       // moves toward option 2
    { frame: 26, x: 75, y: P0_OPT3_Y },       // continues to option 3
    { frame: 38, x: OPT_X, y: P0_OPT1_Y },     // moves up to option 1
    { frame: 50, x: OPT_X, y: P0_OPT1_Y },     // holds on option 1
    { frame: 55, x: OPT_X, y: P0_OPT1_Y },     // click
  ],
  // Phase 1: Check scope — goes to opt 1, drifts to opt 3, comes back to opt 1
  [
    { frame: 0, x: 200, y: 20 },
    { frame: 14, x: OPT_X + 10, y: P1_OPT1_Y },  // option 1
    { frame: 28, x: 60, y: P1_OPT2_Y },           // drifts to opt 2
    { frame: 38, x: 70, y: P1_OPT3_Y },           // continues to opt 3
    { frame: 50, x: OPT_X, y: P1_OPT1_Y },        // comes back to opt 1
    { frame: 58, x: OPT_X, y: P1_OPT1_Y },        // click
  ],
  // Phase 2: Submit — direct to submit button
  [
    { frame: 0, x: 180, y: 20 },
    { frame: 18, x: OPT_X + 5, y: P2_SUBMIT_Y },  // moves to submit
    { frame: 35, x: OPT_X, y: P2_SUBMIT_Y },       // settles
    { frame: 50, x: OPT_X, y: P2_SUBMIT_Y },       // click
  ],
];

// Per-phase option Y positions for hit-testing
const PHASE_OPT_POSITIONS: number[][] = [
  [P0_OPT1_Y, P0_OPT2_Y, P0_OPT3_Y],
  [P1_OPT1_Y, P1_OPT2_Y, P1_OPT3_Y],
  [P2_SUBMIT_Y],
];

// Hit-test: which option is the cursor closest to?
export const getHoveredOption = (
  y: number,
  phase: number,
): number | null => {
  const threshold = 14;
  const opts = PHASE_OPT_POSITIONS[phase];

  for (let i = 0; i < opts.length; i++) {
    const extra = phase === 2 ? 6 : 0;
    if (Math.abs(y - opts[i]) < threshold + extra) return i;
  }
  return null;
};
