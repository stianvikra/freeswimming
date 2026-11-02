// @vitest-environment node

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

describe("Hooks lint baseline during React Compiler migration", () => {
  it("still rejects conditional Hooks and reports missing effect dependencies", async () => {
    const eslint = new ESLint();
    const [result] = await eslint.lintText(
      `import { useEffect, useState } from "react";
       export default function HookFixture({ enabled, value }: { enabled: boolean; value: string }) {
         if (enabled) useState(0);
         useEffect(() => { console.log(value); }, []);
         return null;
       }`,
      { filePath: "components/__lint-fixtures__/HookFixture.tsx" }
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "react-hooks/rules-of-hooks", severity: 2 }),
        expect.objectContaining({ ruleId: "react-hooks/exhaustive-deps", severity: 1 }),
      ])
    );
  });
});
