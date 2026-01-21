import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Workstation Generation Template", () => {
  it("should always hardcode the production TGU URL in core/generateWorkStation.js", () => {
    const generatorPath = path.resolve(
      process.cwd(),
      "core/generateWorkStation.js",
    );
    const content = fs.readFileSync(generatorPath, "utf-8");

    // 1. Verify the production URL is present
    const productionUrl = "https://great-unknown.onrender.com/graphql";
    expect(content).toContain(productionUrl);

    // 2. Extract the config file template string
    // We look for the fs.writeFileSync call that creates babyclara.config.js
    const configTemplateMatch = content.match(/BABYCLARA_TGU_URL:\s*"([^"]+)"/);

    expect(configTemplateMatch).not.toBeNull();
    const hardcodedUrl = configTemplateMatch[1];

    // 3. Assert it is exactly the production URL
    expect(hardcodedUrl).toBe(productionUrl);

    // 4. Ensure no dynamic logic or localhost is in the generated config portion
    // We expect the line to be exactly: BABYCLARA_TGU_URL: "https://great-unknown.onrender.com/graphql",
    expect(content).toContain(`BABYCLARA_TGU_URL: "${productionUrl}"`);
    expect(content).not.toMatch(/BABYCLARA_TGU_URL:.*localhost/);
  });

  it("should verify that the current babyclara.config.js is correctly configured for production", () => {
    const configPath = path.resolve(process.cwd(), "babyclara.config.js");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      // Local dev config can be dynamic, but it MUST have the production URL as a fallback
      expect(content).toContain("https://great-unknown.onrender.com/graphql");
    }
  });
});
