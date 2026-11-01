// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Develop "Detail" panel with its mask instance, and the
// sharpening stage. It was core's built-in `core.detail` until Safelight 3.2.0
// and keeps that panel id, so saved layouts and masks keep it where it was.

import { DETAIL_KEYS, DETAIL_MASK_PANEL, DetailPanel } from "./DetailPanel";
import { initRuntime } from "./rt";
import type { Line, SafelightAPI } from "./safelight";
import { sharpenStage } from "./stages";
import { detailCss } from "./styles";

export const PANEL_ID = "core.detail";
export const STYLESHEET_ID = "safelight.detail.styles";

/** The release line: this release's major version (vite.config.ts). */
export const LINE = __SAFELIGHT_LINE__ as Line;

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.registerStylesheet({ id: STYLESHEET_ID, css: detailCss(host.ui.tokens) });
  host.registerProcessingStage(sharpenStage(LINE));
  host.registerPanel({
    id: PANEL_ID,
    title: "Detail",
    component: DetailPanel,
    defaultDock: { module: "develop", direction: "right", order: 8, width: 280, height: 150 },
    onReset: () => void host.stores.useDevelopStore.getState().resetParams(DETAIL_KEYS, "Reset Detail"),
    mask: DETAIL_MASK_PANEL,
  });
}
