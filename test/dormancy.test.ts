// Sharpening declares no dormantWhen, on purpose. Its block also runs at
// amount 0 while core's Alt/Ctrl-drag preview (uSharpenViz) is on, to draw the
// preview. That switch is a uniform of core's program, not of this stage, so a
// rule on the amount alone would blank the preview whenever it is opened at 0.

import { describe, expect, it } from "vitest";
import { sharpenStage } from "../src/stages";

describe("dormantWhen", () => {
  it.each([1, 2, 3] as const)("is not declared on line %i", (line) => {
    expect(sharpenStage(line)).not.toHaveProperty("dormantWhen");
  });
});
