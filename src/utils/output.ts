import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/** Directory (relative to the current working directory) for generated files. */
export const OUTPUT_DIR = "output";

/**
 * Writes `contents` to `<OUTPUT_DIR>/<filename>`, creating the directory if needed.
 *
 * @param filename Name of the file to write inside the output directory.
 * @param contents UTF-8 text to write.
 * @returns The relative path of the written file.
 */
export async function writeOutputFile(filename: string, contents: string): Promise<string> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = join(OUTPUT_DIR, filename);
  await writeFile(filePath, contents, "utf8");
  return filePath;
};