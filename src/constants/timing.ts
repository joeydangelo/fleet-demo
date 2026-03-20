// --- Timing constants (in frames at 30fps) ---
export const PROMPT_START = 15;
export const PROMPT_TEXT = "Add rate limiting across all API endpoints";
export const PROMPT_END = PROMPT_START + 3;
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
export const TIMER_START = SPEC_WRITE_START + 30;
