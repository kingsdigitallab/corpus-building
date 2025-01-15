import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { convertMuseumsToTei } from "./museums.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("convertMuseumsToTei", () => {
  const testInputPath = path.join(__dirname, "test-museums.csv");
  const testOutputPath = path.join(__dirname, "test-museums.xml");

  beforeEach(async () => {
    // Create a test CSV file
    const testCsv = `Name,Description,Type,Latitude,Longitude,Town,Province,Country,Address,Pleiades or other URI,URI
Test Museum,A test museum,MUSEUM,12.345,67.890,TestTown,TestRegion,TestCountry,123 Test St,,http://test.museum/001`;
    await fs.writeFile(testInputPath, testCsv);
  });

  afterEach(async () => {
    // Clean up test files
    await Promise.all([
      fs.unlink(testInputPath).catch(() => {}),
      fs.unlink(testOutputPath).catch(() => {}),
    ]);
  });

  it("should convert CSV to TEI XML format", async () => {
    await convertMuseumsToTei(testInputPath, testOutputPath);

    const xmlContent = await fs.readFile(testOutputPath, "utf-8");

    expect(xmlContent).toContain('<TEI xmlns="http://www.tei-c.org/ns/1.0"');
    expect(xmlContent).toContain(
      "<title>ISicily museums authority list</title>"
    );
    expect(xmlContent).toContain(
      '<orgName ref="http://test.museum/001">Test Museum</orgName>'
    );
    expect(xmlContent).toContain("<settlement>TestTown</settlement>");
    expect(xmlContent).toContain("<geo>12.345, 67.890</geo>");
  });
});
