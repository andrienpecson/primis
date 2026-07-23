import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const OUTPUT_DIR = "output";

export async function writeOutputFile(filename: string, contents: string): Promise<string> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = join(OUTPUT_DIR, filename);
  await writeFile(filePath, contents, "utf8");
  return filePath;
};