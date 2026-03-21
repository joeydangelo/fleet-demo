// --- Timing constants (in frames at 30fps) ---
export const PROMPT_START = 15;
const PROMPT_END = PROMPT_START + 3;
export const SUBMIT_FRAME = PROMPT_END + 20;

// Phase timings (after submit)
export const SKILL_START = SUBMIT_FRAME + 20;
export const BASH_ASSESS_START = SKILL_START + 35;
export const BASH_GUIDELINES_START = BASH_ASSESS_START + 30;
export const SCOUTS_START = BASH_GUIDELINES_START + 30;

// Staggered scout completion
export const SCOUT1_DONE = SCOUTS_START + 45;
export const SCOUT2_DONE = SCOUT1_DONE + 20;
export const SCOUT3_DONE = SCOUT2_DONE + 25;
export const ALL_SCOUTS_DONE = SCOUT3_DONE + 10;

export const ASSESSMENT_START = ALL_SCOUTS_DONE + 15;
export const BASH_WRITESPEC_START = ASSESSMENT_START + 90;
export const BASH_SPECDESIGN_START = BASH_WRITESPEC_START + 25;
export const BASH_TEMPLATE_START = BASH_SPECDESIGN_START + 25;

// AskUserQuestion — much longer for human-in-the-loop feel
export const ASK_USER_START = BASH_TEMPLATE_START + 30;
export const ASK_USER_END = ASK_USER_START + 200; // ~6.7 seconds (2 questions + submit)

export const SPEC_WRITE_START = ASK_USER_END + 20;

// Editor opens right after Write line; summary + timer appear while spec scrolls
export const TERMINAL_REPOSITION_START = SPEC_WRITE_START + 8;
export const SPEC_EDITOR_START = TERMINAL_REPOSITION_START + 15;
export const SPEC_SUMMARY_START = SPEC_EDITOR_START + 20;
export const TIMER1_START = SPEC_SUMMARY_START + 40;

// User approves shortly after spec finishes scrolling
export const SECOND_PROMPT_START = TIMER1_START + 15;
export const SECOND_PROMPT_SUBMIT = SECOND_PROMPT_START + 35;

export const BASH_DECOMPOSE_START = SECOND_PROMPT_SUBMIT + 20;
export const BASH_TASKSPLIT_START = BASH_DECOMPOSE_START + 25;
export const BASH_FLEETYAML_START = BASH_TASKSPLIT_START + 25;

export const YAML_WRITE_START = BASH_FLEETYAML_START + 25;
export const FINAL_SUMMARY_START = YAML_WRITE_START + 15;
export const TIMER2_START = FINAL_SUMMARY_START + 55;

// Phase 3: user kicks off fleet go
export const THIRD_PROMPT_START = TIMER2_START + 15;
export const THIRD_PROMPT_SUBMIT = THIRD_PROMPT_START + 25;

// Editor exits and terminal recenters before user types fleet go prompt
export const EDITOR_EXIT_START = THIRD_PROMPT_START - 15;

export const BASH_FLEETGO_START = THIRD_PROMPT_SUBMIT + 12;
export const FLEETGO_BACKGROUND = BASH_FLEETGO_START + 95;

// Post-background: dashboard progression, then completion cascade
// Dashboard runs ~22s (660 frames) showing full agent lifecycle
export const FLEETGO_COMPLETE = FLEETGO_BACKGROUND + 660;
export const BASH_GITLOG_START = FLEETGO_COMPLETE + 35;
export const BASH_TEST_START = BASH_GITLOG_START + 30;
export const FINAL_MESSAGE_START = BASH_TEST_START + 30;
export const TIMER3_START = FINAL_MESSAGE_START + 45;
export const BG_COMPLETE = TIMER3_START + 20;

// ── Dashboard phase offsets (relative to FLEETGO_BACKGROUND) ─────────
// These control the agent lifecycle progression in the MacTerminal
export const DASH_TYPING_DONE = 66; // ~2.2s for typing "fleet dashboard"
export const DASH_INK_START = 81; // typing done + 15 frame delay before Ink renders
export const DASH_AGENTS_BOOT = 30; // agents appear as booting
export const DASH_MW_WORKING = 80; // middleware starts working
export const DASH_CFG_WORKING = 110; // config starts working
export const DASH_MAIL_1 = 130; // first inter-agent mail
export const DASH_MAIL_2 = 180; // second mail

// Broadcast prompt — user messages agents mid-build from CLI
export const BROADCAST_PROMPT_START = FLEETGO_BACKGROUND + 200; // absolute frame
export const BROADCAST_PROMPT_SUBMIT = BROADCAST_PROMPT_START + 60;
export const BROADCAST_RESPONSE_START = BROADCAST_PROMPT_SUBMIT + 15;
export const DASH_BROADCAST = 209; // broadcast appears in dashboard mail (~0.5s after CLI response)

export const DASH_MAIL_3 = 240; // third mail (reply)
export const DASH_MAIL_4 = 285; // middleware announces submitting for review
export const DASH_MW_REVIEW = 300; // middleware enters review
export const DASH_MW_DONE = 360; // middleware done + PASS
export const DASH_MERGE_MW = 400; // middleware merged (skip pending, show merged directly)
export const DASH_MAIL_5 = 440; // config announces submitting for review
export const DASH_CFG_REVIEW = 470; // config enters review
export const DASH_CFG_DONE = 520; // config done + PASS
export const DASH_MERGE_CFG = 550; // config merged
export const DASH_ALL_MERGED = DASH_MERGE_CFG; // both merged

// Outro — everything scales down and disappears
export const OUTRO_START = BG_COMPLETE + 20;
