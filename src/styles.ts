// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The look core gave the Detail panel with Tailwind utilities, as plain CSS
// (the app's Tailwind build never scans an extension). `:where()` drops every
// rule to zero specificity, so a stylesheet that restyles the panel wins over
// them. The group headings take the theme's muted text colour. The
// `html.sl-larger-text` and `html.sl-title-headings` rules repeat core's
// Accessibility rules for 10 px, uppercase and widely tracked text.

import type { UiTokens } from "./safelight";

const P = "safelight-detail";

export const cls = {
  groups: `${P}-groups`,
  heading: `${P}-heading`,
  sliders: `${P}-sliders`,
} as const;

export function detailCss(t: UiTokens): string {
  return `
:where(.${cls.groups} > :not(:last-child)) { margin-block: 0 0.25rem; }
:where(.${cls.heading}) { padding: 0.5rem 0.5rem 0.125rem; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${t.textMuted}; }
:where(.${cls.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
html.sl-larger-text .${cls.heading} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${cls.heading} { text-transform: capitalize !important; }
`;
}
