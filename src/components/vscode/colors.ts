import { type SpecLineStyle } from "../../constants/specContent";
import { type YamlLineStyle } from "../../constants/yamlContent";

export { SYSTEM_FONT } from "../../constants/theme";

export const SPEC_COLORS: Record<SpecLineStyle, string> = {
  frontmatter: "#ce9178",
  h1: "#569cd6",
  h2: "#569cd6",
  body: "#d4d4d4",
  blank: "transparent",
  list: "#d4d4d4",
  codeblock: "#808080",
  "code-key": "#9cdcfe",
  "code-value": "#ce9178",
};

export const YAML_COLORS: Record<YamlLineStyle, string> = {
  comment: "#6a9955",
  key: "#9cdcfe",
  "key-value": "#9cdcfe",
  "list-item": "#ce9178",
  "prompt-body": "#ce9178",
  blank: "transparent",
};

// YAML inline colors for structured line rendering
export const YAML_KEY_COLOR = "#9cdcfe";
export const YAML_COLON_COLOR = "#d4d4d4";
export const YAML_STRING_COLOR = "#ce9178";
export const YAML_PIPE_COLOR = "#a074c4";

export function specFontWeight(style: SpecLineStyle): number {
  if (style === "h1") return 700;
  if (style === "h2") return 600;
  return 400;
}

export const STATUS_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
