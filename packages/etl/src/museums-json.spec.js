import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { convertMuseumsToJson } from "./museums-json.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("convertMuseumsToJson", () => {
  const testInputPath = path.join(__dirname, "test-museums.xml");
  const testOutputPath = path.join(__dirname, "test-museums.json");

  beforeEach(async () => {
    // Create a test XML file
    const testXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xml:lang="en">
    <text>
        <body>
            <listOrg>
                <org type="museum">
                    <orgName ref="http://test.museum/001">Test Museum</orgName>
                    <desc>A test museum</desc>
                    <location>
                        <settlement>TestTown</settlement>
                        <region>TestRegion</region>
                        <country>TestCountry</country>
                        <address><addrLine>123 Test St</addrLine></address>
                        <geo>12.345, 67.890</geo>
                    </location>
                </org>
            </listOrg>
        </body>
    </text>
</TEI>`;
    await fs.writeFile(testInputPath, testXml);
  });

  afterEach(async () => {
    // Clean up test files
    await Promise.all([
      fs.unlink(testInputPath).catch(() => {}),
      fs.unlink(testOutputPath).catch(() => {}),
    ]);
  });

  it("should convert TEI XML to JSON format", async () => {
    await convertMuseumsToJson(testInputPath, testOutputPath);

    const jsonContent = JSON.parse(await fs.readFile(testOutputPath, "utf-8"));

    expect(jsonContent).toEqual([
      {
        type: "museum",
        name: "Test Museum",
        uri: "http://test.museum/001",
        description: "A test museum",
        location: {
          settlement: "TestTown",
          region: "TestRegion",
          country: "TestCountry",
          address: "123 Test St",
          geo: {
            lat: 12.345,
            lon: 67.89,
          },
        },
      },
    ]);
  });
});
