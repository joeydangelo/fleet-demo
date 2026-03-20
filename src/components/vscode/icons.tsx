import React from "react";

export const MarkdownIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M6 2h4v6h3l-5 6-5-6h3V2z" fill="#519aba" />
  </svg>
);

export const YamlIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="7" y="2" width="2" height="8" rx="1" fill="#a074c4" />
    <rect x="7" y="12" width="2" height="2" rx="1" fill="#a074c4" />
  </svg>
);

export const TitleBarIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d={d} stroke="#808080" strokeWidth="1" fill="none" />
  </svg>
);

export const TabBarIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d={d} stroke="#888" strokeWidth="1" fill="none" />
  </svg>
);

export const BreadcrumbChevron: React.FC = () => (
  <span style={{ color: "#666", fontSize: 10, margin: "0 1px" }}>{"\u203a"}</span>
);

export const GitBranchIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="4" r="2" stroke="#fff" strokeWidth="1.5" fill="none" />
    <circle cx="6" cy="12" r="2" stroke="#fff" strokeWidth="1.5" fill="none" />
    <line x1="6" y1="6" x2="6" y2="10" stroke="#fff" strokeWidth="1.5" />
    <path d="M8 12h2c1 0 2-1 2-2V6" stroke="#fff" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="4" r="2" stroke="#fff" strokeWidth="1.5" fill="none" />
  </svg>
);
